"""
matchECGeralFromRF.py
=====================
Fase A alternativa: busca CNPJs das entidades do ECGeral.ts diretamente
nos arquivos CSV abertos da Receita Federal (DadosReceita/Empresas*).

Fluxo:
  1. Lê os 10 arquivos Empresas, filtra por natureza jurídica e keywords
  2. Faz matching fuzzy entre ECGeral.ts e a base RF filtrada
  3. Para os melhores matches, calcula CNPJ completo e valida via API RF
  4. Gera ecgeral_candidatos.json e ecgeral_revisao.md

Uso:
  python scripts/matchECGeralFromRF.py              # processa tudo
  python scripts/matchECGeralFromRF.py --top=3      # top-3 candidatos por entidade
  python scripts/matchECGeralFromRF.py --test=20    # testa com 20 primeiras ECGeral

Requisitos: Python 3.8+, sem dependências externas
"""

import csv, json, re, unicodedata, os, sys, urllib.request, time, argparse
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from collections import defaultdict

# ── Configuração ──────────────────────────────────────────────────────────────

BASE_DIR       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DADOS_DIR      = os.path.join(BASE_DIR, 'DadosReceita')
OUTPUT_DIR     = os.path.join(BASE_DIR, 'scripts', 'ecgeral-output')
ECGERAL_PATH   = os.path.join(BASE_DIR, 'src', 'data', 'ECGeral.ts')
CANDIDATOS_OUT = os.path.join(OUTPUT_DIR, 'ecgeral_candidatos.json')
REVISAO_OUT    = os.path.join(OUTPUT_DIR, 'ecgeral_revisao.md')

# Naturezas jurídicas relevantes para associações/entidades de classe
NATUREZAS_ALVO = {
    '3999',  # Associação Privada
    '3131',  # Fundação ou Associação Doméstica sem fins lucrativos
    '3034',  # OSCIP
    '3085',  # Associação sem fins lucrativos com natureza educacional
    '3069',  # Fundação privada
    '3220',  # Organização Religiosa
    '4014',  # Serviço Social Autônomo
    '3271',  # Organização Social (OS)
}

# Keywords para filtro inicial dos 45M de linhas
KEYWORDS_ENGENHARIA = [
    'ENGENHEIRO', 'ENGENHARIA', 'ENGENHEIROS',
    'ARQUITETO', 'ARQUITETURA', 'ARQUITETOS',
    'AGRONOMO', 'AGRONOMIA', 'AGRONOMOS', 'AGRONOMO',
    'GEOLOGO', 'GEOLOGIA', 'GEOLOGOS',
    'QUIMICO', 'QUIMICA',
    'FLORESTAL', 'FLORESTAIS',
    'BIOMEDICO', 'BIOMEDICA',
    'MECANICO', 'MECANICA',
    'ELETRICO', 'ELETRICA', 'ELETRICISTA',
    'CIVIL', 'CARTOGRAFO', 'CARTOGRAFIA',
    'PETROLEO', 'MINERACAO', 'MINERIO',
    'SANITARIO', 'SANITARISTA', 'AMBIENTAL',
    'TECNOLOGO', 'TECNICO', 'TECNICOS',
    'GEOGRAFO', 'GEOGRAFIA',
    'METEOROLOGI', 'METEOROLOG',
    'SEGURANCA DO TRABALHO',
    'PESCA', 'AQUICULTURA',
    'PROFISSIONAIS DE ENGENHARIA',
    'INSTITUTO DE ENGENHARIA',
    'CLUBE DE ENGENHARIA',
    'SOCIEDADE DE ENGENHARIA',
    'FEDERACAO',
    'SINDICATO',
]

TIPOS_ENTIDADE = ['ASSOC', 'INST', 'SOC', 'CLUB', 'FED', 'SIND', 'CONSELHO', 'FUND', 'CENTRO', 'LIGA']

# ── Normalização ──────────────────────────────────────────────────────────────

STOPWORDS = {
    'associacao','dos','das','do','da','de','e','a','o','em','no','na',
    'nos','nas','ao','aos','as','um','uma','uns','umas',
    'engenheiros','arquitetos','agronomos','agronomia','engenharia',
    'arquitetura','regional','brasileira','brasileiro','brasil','nacional',
    'profissional','profissionais','tecnicos','tecnologos','geologos',
    'instituto','sociedade','clube','federacao','sindicato','conselho',
    'associacao','fundacao','centro','uniao','liga','nucleo','secao',
    'departamento','capitulo','representacao','grupo','entidade',
    'classe','engenharia','tecnica','tecnico','civil','mecanica',
    'eletrica','quimica','florestal','ambiental','sanitaria',
    'sr','sra','ltda','eireli','mei','sa','ss','epp','me','oc',
}

def normalizar(s: str) -> str:
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.upper().strip()

def tokenizar(s: str) -> set:
    norm = normalizar(s).lower()
    tokens = re.split(r'[\s\-/,\.;:]+', norm)
    return {t for t in tokens if len(t) > 2 and t not in STOPWORDS}

def similaridade(a: str, b: str) -> float:
    ta = tokenizar(a)
    tb = tokenizar(b)
    if not ta or not tb:
        return 0.0
    inter = len(ta & tb)
    return inter / max(len(ta), len(tb))

# ── Cálculo de dígitos verificadores CNPJ ────────────────────────────────────

def calcular_dv(raiz: str, ordem: str = '0001') -> str:
    """Calcula os 2 dígitos verificadores do CNPJ a partir da raiz (8d) + ordem (4d)."""
    n = (raiz.zfill(8) + ordem.zfill(4))[:12]

    w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(n[i]) * w1[i] for i in range(12))
    r = soma % 11
    d1 = 0 if r < 2 else 11 - r

    n13 = n + str(d1)
    w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(n13[i]) * w2[i] for i in range(13))
    r = soma % 11
    d2 = 0 if r < 2 else 11 - r

    return str(d1) + str(d2)

def cnpj_completo(raiz: str, ordem: str = '0001') -> str:
    dv = calcular_dv(raiz, ordem)
    return raiz.zfill(8) + ordem.zfill(4) + dv

# ── Validação RF ──────────────────────────────────────────────────────────────

def validar_rf(cnpj: str, tentativas_max: int = 3) -> dict | None:
    url = f'https://publica.cnpj.ws/cnpj/{cnpj}'
    for tentativa in range(tentativas_max):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as r:
                if r.status != 200:
                    return None
                data = json.loads(r.read().decode('utf-8'))
            est = data.get('estabelecimento', {})
            cidade = (est.get('cidade') or {}).get('nome', '')
            uf = (est.get('estado') or {}).get('sigla', '')
            if not cidade or not uf:
                return None
            rs = data.get('razao_social', '')
            def tc(s):
                l = {'de','da','do','das','dos','e','a','o','em','no','na'}
                return ' '.join(w.capitalize() if i==0 or w.lower() not in l else w.lower()
                               for i, w in enumerate(s.lower().split()))
            return {
                'razao_social': rs,
                'municipio': tc(cidade),
                'uf': uf,
                'situacao': (est.get('situacao_cadastral') or '').strip(),
                'ibge_id': str((est.get('cidade') or {}).get('ibge_id', '')),
            }
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 3 * (tentativa + 1)  # backoff: 3s, 6s, 9s
                time.sleep(wait)
                continue
            return None
        except Exception:
            return None
    return None

# ── Parser ECGeral.ts ─────────────────────────────────────────────────────────

def parse_ecgeral() -> list[dict]:
    with open(ECGERAL_PATH, encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'const rawCsv = `([\s\S]*?)`;', content)
    if not m:
        raise ValueError('rawCsv não encontrado em ECGeral.ts')
    entries = []
    for line in m.group(1).split('\n')[1:]:
        if not line.strip():
            continue
        parts = line.split(';')
        if len(parts) < 7:
            continue
        tipo  = parts[4].strip()
        sigla = parts[5].strip()
        denom = parts[6].strip().strip('"').split('\n')[0].strip()
        orig  = parts[2].strip()
        uf_m  = re.search(r'Crea-([A-Z]{2})', orig)
        uf    = uf_m.group(1) if uf_m else ''
        if tipo in ('EC', 'IES') and denom and sigla:
            entries.append({'sigla': sigla, 'denominacao': denom, 'origem': orig, 'tipo': tipo, 'uf_crea': uf})
    return entries

# ── Carrega e indexa base RF ──────────────────────────────────────────────────

def carregar_base_rf() -> list[tuple[str, str, str]]:
    """Retorna lista de (cnpj_raiz, razao_social_norm, razao_social_orig)."""
    # Cache: após o primeiro carregamento (~8 min), salva em disco para reuso instantâneo
    cache_path = os.path.join(OUTPUT_DIR, 'rf_base_cache.json')
    if os.path.exists(cache_path):
        print('Usando base RF em cache (carregamento instantâneo)...')
        with open(cache_path, encoding='utf-8') as f:
            dados = json.load(f)
        resultado = [tuple(d) for d in dados]
        print(f'  Base RF carregada: {len(resultado):,} registros\n')
        return resultado

    print('Carregando base RF pela primeira vez (pode levar ~8 min)...')
    resultado = []

    for i in range(10):
        pasta = os.path.join(DADOS_DIR, f'Empresas{i}')
        if not os.path.isdir(pasta):
            continue
        arquivos = [f for f in os.listdir(pasta) if f.upper().endswith('.CSV')]
        if not arquivos:
            continue
        caminho = os.path.join(pasta, arquivos[0])
        print(f'  Lendo Empresas{i}...', end=' ', flush=True)
        count = 0
        encontrados = 0
        try:
            with open(caminho, encoding='latin-1', errors='replace') as f:
                for linha in f:
                    count += 1
                    parts = linha.strip().split(';')
                    if len(parts) < 3:
                        continue
                    raiz = parts[0].strip('"').zfill(8)
                    razao = parts[1].strip('"')
                    nj = parts[2].strip('"')

                    razao_norm = normalizar(razao)

                    # Filtra por natureza jurídica OU por keywords de engenharia/entidade de classe
                    tem_nj = nj in NATUREZAS_ALVO
                    tem_keyword = any(kw in razao_norm for kw in KEYWORDS_ENGENHARIA)
                    tem_tipo = any(t in razao_norm for t in TIPOS_ENTIDADE)

                    if (tem_nj and tem_tipo) or (tem_nj and tem_keyword) or (not tem_nj and tem_keyword and tem_tipo):
                        resultado.append((raiz, razao_norm, razao))
                        encontrados += 1
        except Exception as e:
            print(f'Erro: {e}')
            continue
        print(f'{count:,} linhas, {encontrados:,} candidatas')

    print(f'\nBase RF filtrada: {len(resultado):,} registros')
    # Salva cache para próximas execuções
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False)
    print(f'Cache salvo em {cache_path} (próximas execuções serão instantâneas)\n')
    return resultado

# ── Matching ──────────────────────────────────────────────────────────────────

def encontrar_matches(ecgeral: list[dict], base_rf: list[tuple], top_n: int = 3) -> list[dict]:
    """Para cada entrada ECGeral, retorna os top_n matches da base RF."""
    print(f'\nFazendo matching de {len(ecgeral)} entidades ECGeral contra {len(base_rf):,} registros RF...')
    resultados = []

    for idx, entry in enumerate(ecgeral):
        if (idx + 1) % 100 == 0:
            print(f'  {idx+1}/{len(ecgeral)}...', flush=True)

        denom = entry['denominacao']
        uf_crea = entry['uf_crea']

        # Calcula similaridade contra todos os registros RF
        scores = []
        for raiz, razao_norm, razao_orig in base_rf:
            sim = similaridade(denom, razao_orig)
            if sim > 0.25:  # threshold mínimo
                scores.append((sim, raiz, razao_orig))

        # Ordena por similaridade e aplica boost se UF da RF bate com CREA
        scores.sort(key=lambda x: -x[0])
        top = scores[:top_n * 2]  # pega mais para filtrar por UF depois

        candidatos = []
        for sim, raiz, razao_orig in top[:top_n]:
            # Tenta os dois códigos de ordem mais comuns (0001 cobre >99% dos casos)
            cnpjs_tentativas = [cnpj_completo(raiz, f'{o:04d}') for o in range(1, 3)]
            candidatos.append({
                'cnpj_raiz': raiz,
                'cnpj_calculado': cnpj_completo(raiz),  # 0001 como padrão
                'cnpj_tentativas': cnpjs_tentativas,
                'razao_social_rf_local': razao_orig,
                'similaridade': round(sim, 3),
            })

        resultados.append({
            'idx': idx,
            'sigla': entry['sigla'],
            'denominacao': denom,
            'origem': entry['origem'],
            'tipo': entry['tipo'],
            'uf_crea': uf_crea,
            'candidatos': candidatos,
        })

    return resultados

# ── Validação RF e geração de candidatos finais ───────────────────────────────

def validar_e_finalizar(matches: list[dict], delay: float = 0.35) -> list[dict]:
    """Valida o melhor candidato de cada entidade via API RF."""
    print(f'\nValidando CNPJs via RF API (1 requisição por entidade, ~{len(matches)*delay/60:.1f} min)...')

    finais = []
    for i, m in enumerate(matches):
        entry_info = f"[{i+1}/{len(matches)}] {m['sigla']} — {m['denominacao'][:40]}"

        if not m['candidatos']:
            print(f'  {entry_info} -> sem candidatos')
            finais.append(_sem_match(m))
            continue

        # Tenta validar o melhor candidato — testa múltiplos códigos de ordem
        melhor = m['candidatos'][0]
        tentativas = melhor.get('cnpj_tentativas', [melhor['cnpj_calculado']])

        print(f'  {entry_info} (sim={melhor["similaridade"]:.2f})... ', end='', flush=True)
        rf = None
        cnpj_valido = None
        for cnpj_t in tentativas:
            rf = validar_rf(cnpj_t)
            time.sleep(delay)   # delay completo entre cada tentativa
            if rf:
                cnpj_valido = cnpj_t
                break
        cnpj = cnpj_valido or melhor['cnpj_calculado']

        if rf:
            sim_final = similaridade(m['denominacao'], rf['razao_social'])
            uf_ok = m['uf_crea'] and rf['uf'] and m['uf_crea'] == rf['uf']

            if uf_ok and sim_final >= 0.5:
                confianca = 'Alta'
            elif uf_ok or sim_final >= 0.35:
                confianca = 'Média'
            else:
                confianca = 'Baixa'

            aprovado = True if confianca == 'Alta' else (None if confianca == 'Média' else False)

            print(f'{confianca} -> {rf["razao_social"][:45]} [{rf["uf"]}]')
            finais.append({
                **_base(m),
                'cnpj_sugerido': cnpj,
                'razao_social_rf': rf['razao_social'],
                'municipio_rf': rf['municipio'],
                'uf_rf': rf['uf'],
                'situacao_rf': rf['situacao'],
                'similaridade_nome': round(sim_final, 3),
                'confianca': confianca,
                'aprovado': aprovado,
                'observacao': f'RF match (sim={sim_final:.2f}, UF_ok={uf_ok})',
            })
        else:
            print('RF inválido — tentando próximo candidato...')
            # Tenta os outros candidatos
            encontrou = False
            for candidato in m['candidatos'][1:]:
                rf2 = validar_rf(candidato['cnpj_calculado'])
                time.sleep(delay)
                if rf2:
                    sim2 = similaridade(m['denominacao'], rf2['razao_social'])
                    uf_ok2 = m['uf_crea'] and rf2['uf'] and m['uf_crea'] == rf2['uf']
                    confianca = 'Alta' if (uf_ok2 and sim2 >= 0.5) else ('Média' if (uf_ok2 or sim2 >= 0.35) else 'Baixa')
                    aprovado = True if confianca == 'Alta' else (None if confianca == 'Média' else False)
                    print(f'    -> {confianca}: {rf2["razao_social"][:45]}')
                    finais.append({
                        **_base(m),
                        'cnpj_sugerido': candidato['cnpj_calculado'],
                        'razao_social_rf': rf2['razao_social'],
                        'municipio_rf': rf2['municipio'],
                        'uf_rf': rf2['uf'],
                        'situacao_rf': rf2['situacao'],
                        'similaridade_nome': round(sim2, 3),
                        'confianca': confianca,
                        'aprovado': aprovado,
                        'observacao': f'RF match candidato alternativo (sim={sim2:.2f})',
                    })
                    encontrou = True
                    break
            if not encontrou:
                print(f'    -> Nao encontrado')
                finais.append(_sem_match(m))

    return finais

def _base(m: dict) -> dict:
    return {k: m[k] for k in ['sigla','denominacao','origem','tipo','uf_crea']}

def _sem_match(m: dict) -> dict:
    return {
        **_base(m),
        'cnpj_sugerido': None,
        'razao_social_rf': None,
        'municipio_rf': None,
        'uf_rf': None,
        'situacao_rf': None,
        'similaridade_nome': 0.0,
        'confianca': 'Não encontrado',
        'aprovado': False,
        'observacao': 'Sem match na base RF com similaridade suficiente',
    }

# ── Geração do documento de revisão ──────────────────────────────────────────

def gerar_revisao(candidatos: list[dict], total_ecgeral: int) -> str:
    alta   = [c for c in candidatos if c['confianca'] == 'Alta']
    media  = [c for c in candidatos if c['confianca'] == 'Média']
    baixa  = [c for c in candidatos if c['confianca'] == 'Baixa']
    nao_enc= [c for c in candidatos if c['confianca'] == 'Não encontrado']

    def tbl(rows, show_ap=False):
        h = '| Sigla | Nome | CREA | CNPJ | Razão Social RF | Mun/UF | Sit | Sim |'
        if show_ap: h += ' Aprovado |'
        sep = '|---|---|---|---|---|---|---|---|'
        if show_ap: sep += '---|'
        lines = []
        for c in rows:
            cnpj = c['cnpj_sugerido'] or '—'
            if cnpj != '—':
                cnpj = f'{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}'
            rs  = (c['razao_social_rf'] or '—')[:45]
            mun = f'{c["municipio_rf"]}/{c["uf_rf"]}' if c['municipio_rf'] else '—'
            sit = c['situacao_rf'] or '—'
            ap  = '✅' if c['aprovado'] is True else ('❌' if c['aprovado'] is False else '⏳')
            row = f'| {c["sigla"]} | {c["denominacao"][:45]} | {c["origem"]} | `{cnpj}` | {rs} | {mun} | {sit} | {c["similaridade_nome"]:.2f} |'
            if show_ap: row += f' {ap} |'
            lines.append(row)
        return '\n'.join([h, sep] + lines)

    return f"""# Revisão ECGeral — Correspondências CNPJ (via Base RF)

**Gerado:** {time.strftime('%d/%m/%Y')} | **Método:** Matching local na base RF da Receita Federal
**ECGeral processados:** {len(candidatos)} de {total_ecgeral}
**Alta confiança:** {len(alta)} ✅ | **Média:** {len(media)} ⏳ | **Baixa:** {len(baixa)} ⏳ | **Não encontrado:** {len(nao_enc)} ❌

---

## Como revisar

1. **Alta** — pré-aprovados (`aprovado: true`). Revise se quiser confirmar.
2. **Média/Baixa** — abra `ecgeral_candidatos.json` e defina `"aprovado": true` ou `false`.
3. Quando pronto: `npx tsx scripts/importECGeralValidados.ts --apply`

---

## ✅ Alta Confiança — {len(alta)} entidades

{tbl(alta) if alta else '_Nenhuma._'}

---

## ⚠️ Média Confiança — {len(media)} entidades

{tbl(media, True) if media else '_Nenhuma._'}

---

## 🔍 Baixa Confiança — {len(baixa)} entidades

{tbl(baixa, True) if baixa else '_Nenhuma._'}

---

## ❌ Não encontrado — {len(nao_enc)} entidades

{tbl(nao_enc) if nao_enc else '_Nenhuma._'}
"""

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Matching ECGeral vs Receita Federal')
    parser.add_argument('--top', type=int, default=3, help='Top candidatos por entidade (padrão: 3)')
    parser.add_argument('--test', type=int, default=0, help='Testar com N primeiras entidades')
    parser.add_argument('--skip-api', action='store_true', help='Pula validação RF (só matching local)')
    args = parser.parse_args()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. Carrega ECGeral
    ecgeral = parse_ecgeral()
    print(f'ECGeral: {len(ecgeral)} entidades')
    if args.test > 0:
        ecgeral = ecgeral[:args.test]
        print(f'Modo teste: usando {len(ecgeral)} entidades')

    # 2. Carrega base RF
    base_rf = carregar_base_rf()

    # 3. Matching
    matches = encontrar_matches(ecgeral, base_rf, top_n=args.top)

    # 4. Validação RF
    if args.skip_api:
        candidatos = [_sem_match(m) if not m['candidatos'] else {
            **_base(m),
            'cnpj_sugerido': m['candidatos'][0]['cnpj_calculado'],
            'razao_social_rf': m['candidatos'][0]['razao_social_rf_local'],
            'municipio_rf': None, 'uf_rf': None, 'situacao_rf': None,
            'similaridade_nome': m['candidatos'][0]['similaridade'],
            'confianca': 'Não validado (--skip-api)', 'aprovado': None,
            'observacao': 'Sem validação RF'
        } for m in matches]
    else:
        candidatos = validar_e_finalizar(matches)

    # 5. Salva artefatos
    with open(CANDIDATOS_OUT, 'w', encoding='utf-8') as f:
        json.dump(candidatos, f, ensure_ascii=False, indent=2)

    with open(REVISAO_OUT, 'w', encoding='utf-8') as f:
        f.write(gerar_revisao(candidatos, len(parse_ecgeral())))

    # Resumo
    alta   = sum(1 for c in candidatos if c['confianca'] == 'Alta')
    media  = sum(1 for c in candidatos if c['confianca'] == 'Média')
    baixa  = sum(1 for c in candidatos if c['confianca'] == 'Baixa')
    nao_enc= sum(1 for c in candidatos if c['confianca'] == 'Não encontrado')

    print(f'\n=== Resultado ===')
    print(f'Alta:          {alta}')
    print(f'Média:         {media}')
    print(f'Baixa:         {baixa}')
    print(f'Não encontrado:{nao_enc}')
    print(f'\nArtefatos em: scripts/ecgeral-output/')

if __name__ == '__main__':
    main()

// Gerado automaticamente por scripts/extractAbrangencias.ts — NÃO EDITAR MANUALMENTE
// Fonte: public/data/fomento2026.csv + Gemini gemini-3-flash-preview + API IBGE

export type TipoAbrangencia = 'municipal' | 'regional' | 'estadual' | 'nacional' | 'indeterminado';

export interface MunicipioAbrangencia {
  municipio: string;
  uf: string;
  codigoIbge?: string;
}

export interface AbrangenciaEntidade {
  cnpj: string;
  tipo: TipoAbrangencia;
  municipios: MunicipioAbrangencia[];
}

const ABRANGENCIAS: AbrangenciaEntidade[] = [
  { cnpj: '51870541000101', tipo: 'regional', municipios: [{ municipio: 'Mogi Guaçu', uf: 'SP', codigoIbge: '3530706' }] },
  { cnpj: '61712147000107', tipo: 'municipal', municipios: [{ municipio: 'Mogi Mirim', uf: 'SP', codigoIbge: '3530805' }] },
  { cnpj: '18241317000185', tipo: 'municipal', municipios: [{ municipio: 'Maringá', uf: 'PR', codigoIbge: '4115200' }] },
  { cnpj: '83080077000146', tipo: 'municipal', municipios: [{ municipio: 'Lages', uf: 'SC', codigoIbge: '4209300' }] },
  { cnpj: '51918381000123', tipo: 'municipal', municipios: [{ municipio: 'Mogi Mirim', uf: 'SP', codigoIbge: '3530805' }] },
  { cnpj: '51101830000146', tipo: 'regional', municipios: [{ municipio: 'Penápolis', uf: 'SP', codigoIbge: '3537305' }] },
  { cnpj: '49842578000184', tipo: 'municipal', municipios: [{ municipio: 'Adamantina', uf: 'SP', codigoIbge: '3500105' }] },
  { cnpj: '51902617000133', tipo: 'municipal', municipios: [{ municipio: 'Espírito Santo de Pinhal', uf: 'SP', codigoIbge: '3515186' }] },
  { cnpj: '46314464000173', tipo: 'municipal', municipios: [{ municipio: 'Rio Claro', uf: 'SP', codigoIbge: '3543907' }] },
  { cnpj: '78305224000107', tipo: 'municipal', municipios: [{ municipio: 'Londrina', uf: 'PR', codigoIbge: '4113700' }] },
  { cnpj: '50508134000196', tipo: 'municipal', municipios: [{ municipio: 'Barretos', uf: 'SP', codigoIbge: '3505500' }] },
  { cnpj: '86961919000167', tipo: 'municipal', municipios: [{ municipio: 'Nova Veneza', uf: 'SC', codigoIbge: '4211603' }] },
  { cnpj: '68323054000121', tipo: 'municipal', municipios: [{ municipio: 'São Joaquim da Barra', uf: 'SP', codigoIbge: '3549409' }] },
  { cnpj: '28711489000129', tipo: 'municipal', municipios: [{ municipio: 'Casimiro de Abreu', uf: 'RJ', codigoIbge: '3301306' }] },
  { cnpj: '54346606000102', tipo: 'municipal', municipios: [{ municipio: 'Bertioga', uf: 'SP', codigoIbge: '3506359' }] },
  { cnpj: '51521870000147', tipo: 'municipal', municipios: [{ municipio: 'São Manuel', uf: 'SP', codigoIbge: '3550100' }] },
  { cnpj: '09255901000107', tipo: 'municipal', municipios: [{ municipio: 'Curitiba', uf: 'PR', codigoIbge: '4106902' }] },
  { cnpj: '05199815000165', tipo: 'municipal', municipios: [{ municipio: 'Belém', uf: 'PA', codigoIbge: '1501402' }] },
  { cnpj: '03538637000124', tipo: 'municipal', municipios: [{ municipio: 'Artur Nogueira', uf: 'SP', codigoIbge: '3503802' }] },
  { cnpj: '09084077000161', tipo: 'municipal', municipios: [{ municipio: 'Japurá', uf: 'AM', codigoIbge: '1302108' }] },
  { cnpj: '04532701000122', tipo: 'municipal', municipios: [{ municipio: 'Japurá', uf: 'AM', codigoIbge: '1302108' }] },
  { cnpj: '51901049000156', tipo: 'municipal', municipios: [{ municipio: 'Sumaré', uf: 'SP', codigoIbge: '3552403' }] },
  { cnpj: '49889488000149', tipo: 'municipal', municipios: [{ municipio: 'Lins', uf: 'SP', codigoIbge: '3527108' }] },
  { cnpj: '00460081000102', tipo: 'municipal', municipios: [{ municipio: 'Maringá', uf: 'PR', codigoIbge: '4115200' }] },
  { cnpj: '52346152000144', tipo: 'municipal', municipios: [{ municipio: 'Atibaia', uf: 'SP', codigoIbge: '3504107' }] },
  { cnpj: '79255725000180', tipo: 'municipal', municipios: [{ municipio: 'Tubarão', uf: 'SC', codigoIbge: '4218707' }] },
  { cnpj: '44645166000130', tipo: 'municipal', municipios: [{ municipio: 'Jundiaí', uf: 'SP', codigoIbge: '3525904' }] },
  { cnpj: '51107548000176', tipo: 'municipal', municipios: [{ municipio: 'Buritama', uf: 'SP', codigoIbge: '3508108' }, { municipio: 'Turiúba', uf: 'SP', codigoIbge: '3555208' }] },
  { cnpj: '82666199000156', tipo: 'municipal', municipios: [{ municipio: 'Blumenau', uf: 'SC', codigoIbge: '4202404' }] },
  { cnpj: '76715408000101', tipo: 'regional', municipios: [{ municipio: 'Alto Paraná', uf: 'PR', codigoIbge: '4100608' }, { municipio: 'Amaporã', uf: 'PR', codigoIbge: '4100905' }, { municipio: 'Cruzeiro do Sul', uf: 'PR', codigoIbge: '4106704' }, { municipio: 'Diamante do Norte', uf: 'PR', codigoIbge: '4107108' }, { municipio: 'Guairaçá', uf: 'PR', codigoIbge: '4108908' }] },
  { cnpj: '24862757000152', tipo: 'municipal', municipios: [{ municipio: 'Teresópolis de Goiás', uf: 'GO' }] },
  { cnpj: '33945015000181', tipo: 'municipal', municipios: [{ municipio: 'Rio de Janeiro', uf: 'RJ', codigoIbge: '3304557' }] },
  { cnpj: '18519751000184', tipo: 'municipal', municipios: [{ municipio: 'Pará De Minas', uf: 'MG', codigoIbge: '3147105' }] },
  { cnpj: '55357099000175', tipo: 'municipal', municipios: [{ municipio: 'Santa Bárbara d\'Oeste', uf: 'SP', codigoIbge: '3545803' }] },
  { cnpj: '51821288000104', tipo: 'municipal', municipios: [{ municipio: 'Franca', uf: 'SP', codigoIbge: '3516200' }] },
  { cnpj: '22267312000107', tipo: 'municipal', municipios: [{ municipio: 'Irineópolis', uf: 'SC', codigoIbge: '4207908' }] },
  { cnpj: '51855021000120', tipo: 'regional', municipios: [{ municipio: 'Votuporanga', uf: 'SP', codigoIbge: '3557105' }] },
  { cnpj: '00854137000103', tipo: 'nacional', municipios: [] },
  { cnpj: '04350121000114', tipo: 'municipal', municipios: [{ municipio: 'Belém', uf: 'PA', codigoIbge: '1501402' }] },
  { cnpj: '51325736000170', tipo: 'municipal', municipios: [{ municipio: 'Araras', uf: 'SP', codigoIbge: '3503307' }] },
  { cnpj: '45103496000167', tipo: 'regional', municipios: [{ municipio: 'São José do Rio Preto', uf: 'SP', codigoIbge: '3549805' }, { municipio: 'Guapiaçu', uf: 'SP', codigoIbge: '3517505' }, { municipio: 'Cedral', uf: 'SP', codigoIbge: '3511300' }] },
  { cnpj: '48647382000176', tipo: 'regional', municipios: [{ municipio: 'Bragança Paulista', uf: 'SP', codigoIbge: '3507605' }] },
  { cnpj: '59754515000120', tipo: 'regional', municipios: [{ municipio: 'Pereira Barreto', uf: 'SP', codigoIbge: '3537404' }] },
  { cnpj: '03860786000105', tipo: 'regional', municipios: [{ municipio: 'Taguatinga', uf: 'DF' }, { municipio: 'Ceilândia', uf: 'DF' }] },
  { cnpj: '57715484000172', tipo: 'regional', municipios: [{ municipio: 'Itápolis', uf: 'SP', codigoIbge: '3522703' }] },
  { cnpj: '44860666000195', tipo: 'municipal', municipios: [{ municipio: 'Presidente Prudente', uf: 'SP', codigoIbge: '3541406' }] },
  { cnpj: '48020424000144', tipo: 'municipal', municipios: [{ municipio: 'São Carlos', uf: 'SP', codigoIbge: '3548906' }] },
  { cnpj: '54354600000187', tipo: 'municipal', municipios: [{ municipio: 'Mongaguá', uf: 'SP', codigoIbge: '3531100' }] },
  { cnpj: '48676388000171', tipo: 'municipal', municipios: [{ municipio: 'Santo Antônio da Platina', uf: 'PR', codigoIbge: '4124103' }] },
  { cnpj: '83932483000190', tipo: 'municipal', municipios: [{ municipio: 'Florianópolis', uf: 'SC', codigoIbge: '4205407' }] },
  { cnpj: '82603655000119', tipo: 'municipal', municipios: [{ municipio: 'Joinville', uf: 'SC', codigoIbge: '4209102' }] },
  { cnpj: '09940750000118', tipo: 'municipal', municipios: [{ municipio: 'Garanhuns', uf: 'PE', codigoIbge: '2606002' }] },
  { cnpj: '08038132000114', tipo: 'regional', municipios: [{ municipio: 'Florianópolis', uf: 'SC', codigoIbge: '4205407' }] },
  { cnpj: '51899235000106', tipo: 'municipal', municipios: [{ municipio: 'São João da Boa Vista', uf: 'SP', codigoIbge: '3549102' }] },
  { cnpj: '51055010000165', tipo: 'municipal', municipios: [{ municipio: 'Americana', uf: 'SP', codigoIbge: '3501608' }] },
  { cnpj: '55751812000160', tipo: 'municipal', municipios: [{ municipio: 'Castilho', uf: 'SP', codigoIbge: '3511003' }] },
  { cnpj: '51104644000160', tipo: 'municipal', municipios: [{ municipio: 'Ilha Solteira', uf: 'SP', codigoIbge: '3520442' }] },
  { cnpj: '08803152000134', tipo: 'municipal', municipios: [{ municipio: 'Montes Claros', uf: 'MG', codigoIbge: '3143302' }] },
  { cnpj: '15923220000164', tipo: 'municipal', municipios: [{ municipio: 'Campo Grande', uf: 'MS', codigoIbge: '5002704' }] },
  { cnpj: '46940797000108', tipo: 'regional', municipios: [{ municipio: 'Ribeirão Preto', uf: 'SP', codigoIbge: '3543402' }] },
  { cnpj: '51308062000104', tipo: 'municipal', municipios: [{ municipio: 'Morungaba', uf: 'SP', codigoIbge: '3532009' }] },
  { cnpj: '50447838000104', tipo: 'indeterminado', municipios: [] },
  { cnpj: '49985039000102', tipo: 'regional', municipios: [{ municipio: 'Catanduva', uf: 'SP', codigoIbge: '3511102' }] },
  { cnpj: '20734158000100', tipo: 'regional', municipios: [{ municipio: 'Patos De Minas', uf: 'MG', codigoIbge: '3148004' }] },
  { cnpj: '44192060000129', tipo: 'regional', municipios: [] },
  { cnpj: '18515395000120', tipo: 'municipal', municipios: [{ municipio: 'Uberaba', uf: 'MG', codigoIbge: '3170107' }] },
  { cnpj: '79886032000196', tipo: 'municipal', municipios: [{ municipio: 'Florianópolis', uf: 'SC', codigoIbge: '4205407' }] },
  { cnpj: '49609613000110', tipo: 'regional', municipios: [{ municipio: 'São José do Rio Pardo', uf: 'SP', codigoIbge: '3549706' }] },
  { cnpj: '44757060000129', tipo: 'municipal', municipios: [{ municipio: 'Limeira', uf: 'SP', codigoIbge: '3526902' }] },
  { cnpj: '48896997000136', tipo: 'municipal', municipios: [{ municipio: 'Osasco', uf: 'SP', codigoIbge: '3534401' }] },
  { cnpj: '10997642000160', tipo: 'municipal', municipios: [{ municipio: 'Enéas Marques', uf: 'PR', codigoIbge: '4107405' }] },
  { cnpj: '08493330000178', tipo: 'municipal', municipios: [{ municipio: 'Guamaré', uf: 'RN', codigoIbge: '2404507' }] },
  { cnpj: '41778861000182', tipo: 'municipal', municipios: [{ municipio: 'São Lourenço', uf: 'MG', codigoIbge: '3163706' }] },
  { cnpj: '54407911000167', tipo: 'municipal', municipios: [{ municipio: 'Piracicaba', uf: 'SP', codigoIbge: '3538709' }] },
  { cnpj: '28707693000176', tipo: 'municipal', municipios: [{ municipio: 'Rio de Janeiro', uf: 'RJ', codigoIbge: '3304557' }] },
  { cnpj: '11422246000178', tipo: 'indeterminado', municipios: [] },
  { cnpj: '07449663000137', tipo: 'regional', municipios: [{ municipio: 'São João da Canabrava', uf: 'PI', codigoIbge: '2209856' }, { municipio: 'Santo Antônio de Lisboa', uf: 'PI', codigoIbge: '2209401' }, { municipio: 'São Luís do Piauí', uf: 'PI', codigoIbge: '2210375' }, { municipio: 'Picos', uf: 'PI', codigoIbge: '2208007' }] },
  { cnpj: '08988107000100', tipo: 'municipal', municipios: [{ municipio: 'Pitimbu', uf: 'PB', codigoIbge: '2511905' }] },
  { cnpj: '06100452000121', tipo: 'municipal', municipios: [{ municipio: 'Promissão', uf: 'SP', codigoIbge: '3541604' }] },
  { cnpj: '17413196000149', tipo: 'municipal', municipios: [{ municipio: 'Itajubá', uf: 'MG', codigoIbge: '3132404' }] },
  { cnpj: '24809667000106', tipo: 'municipal', municipios: [{ municipio: 'Itumbiara', uf: 'GO', codigoIbge: '5211503' }] },
  { cnpj: '48673198000109', tipo: 'municipal', municipios: [{ municipio: 'Ubatuba', uf: 'SP', codigoIbge: '3555406' }] },
  { cnpj: '47654025000172', tipo: 'municipal', municipios: [{ municipio: 'Mogi das Cruzes', uf: 'SP', codigoIbge: '3530607' }] },
  { cnpj: '03247823000104', tipo: 'municipal', municipios: [{ municipio: 'Barueri', uf: 'SP', codigoIbge: '3505708' }] },
  { cnpj: '03598723000122', tipo: 'municipal', municipios: [{ municipio: 'Urucará', uf: 'AM', codigoIbge: '1304302' }] },
  { cnpj: '48279673000159', tipo: 'municipal', municipios: [{ municipio: 'Pindamonhangaba', uf: 'SP', codigoIbge: '3538006' }] },
  { cnpj: '15539734000110', tipo: 'municipal', municipios: [{ municipio: 'Santana de Parnaíba', uf: 'SP', codigoIbge: '3547304' }, { municipio: 'Cajamar', uf: 'SP', codigoIbge: '3509205' }] },
  { cnpj: '00831655000101', tipo: 'municipal', municipios: [{ municipio: 'Itapira', uf: 'SP', codigoIbge: '3522604' }] },
  { cnpj: '32237587000143', tipo: 'regional', municipios: [{ municipio: 'Teutônia', uf: 'RS', codigoIbge: '4321451' }] },
  { cnpj: '55670491000170', tipo: 'regional', municipios: [{ municipio: 'Cubatão', uf: 'SP', codigoIbge: '3513504' }] },
  { cnpj: '49899321000169', tipo: 'municipal', municipios: [{ municipio: 'Assis', uf: 'SP', codigoIbge: '3504008' }] },
  { cnpj: '50216951000170', tipo: 'municipal', municipios: [{ municipio: 'Poá', uf: 'SP', codigoIbge: '3539806' }] },
  { cnpj: '51410801000166', tipo: 'municipal', municipios: [{ municipio: 'Pirassununga', uf: 'SP', codigoIbge: '3539301' }] },
  { cnpj: '61755260000161', tipo: 'municipal', municipios: [{ municipio: 'Silvânia', uf: 'GO', codigoIbge: '5220603' }] },
  { cnpj: '42788174000100', tipo: 'municipal', municipios: [{ municipio: 'Belo Horizonte', uf: 'MG', codigoIbge: '3106200' }] },
  { cnpj: '04102397000183', tipo: 'nacional', municipios: [] },
  { cnpj: '26694476000163', tipo: 'estadual', municipios: [] },
  { cnpj: '05549191000169', tipo: 'regional', municipios: [{ municipio: 'Ferreira Gomes', uf: 'AP', codigoIbge: '1600238' }, { municipio: 'Porto Grande', uf: 'AP', codigoIbge: '1600535' }, { municipio: 'Pedra Branca do Amapari', uf: 'AP', codigoIbge: '1600154' }, { municipio: 'Serra do Navio', uf: 'AP', codigoIbge: '1600055' }] },
  { cnpj: '24355377000121', tipo: 'municipal', municipios: [{ municipio: 'Boituva', uf: 'SP', codigoIbge: '3507001' }] },
  { cnpj: '02517337000104', tipo: 'municipal', municipios: [{ municipio: 'Andradas', uf: 'MG', codigoIbge: '3102605' }] },
  { cnpj: '08449597000168', tipo: 'municipal', municipios: [{ municipio: 'Guamaré', uf: 'RN', codigoIbge: '2404507' }] },
  { cnpj: '27373125000113', tipo: 'municipal', municipios: [{ municipio: 'Itapemirim', uf: 'ES', codigoIbge: '3202801' }] },
  { cnpj: '57057317000181', tipo: 'municipal', municipios: [{ municipio: 'Salto', uf: 'SP', codigoIbge: '3545209' }] },
  { cnpj: '22413676000140', tipo: 'municipal', municipios: [{ municipio: 'Vitória de Santo Antão', uf: 'PE', codigoIbge: '2616407' }] },
  { cnpj: '37062886000108', tipo: 'municipal', municipios: [{ municipio: 'Parnaíba', uf: 'PI', codigoIbge: '2207702' }] },
  { cnpj: '17408345000181', tipo: 'regional', municipios: [{ municipio: 'Varginha', uf: 'MG', codigoIbge: '3170701' }] },
  { cnpj: '03113186000183', tipo: 'regional', municipios: [] },
];

export const abrangenciasMap = new Map<string, AbrangenciaEntidade>(
  ABRANGENCIAS.map(a => [a.cnpj, a])
);

const normalizarCNPJ = (cnpj: string): string =>
  cnpj.replace(/\D/g, '').padStart(14, '0');

export function getAbrangenciaByCNPJ(cnpj: string): AbrangenciaEntidade | undefined {
  return abrangenciasMap.get(normalizarCNPJ(cnpj));
}

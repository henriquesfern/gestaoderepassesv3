/**
 * Utilitários de sanitização e normalização de dados para consistência do dashboard.
 * Criados para mitigar problemas relacionados a CNPJs mal formatados, aspas indesejadas,
 * divergências de siglas/estados e caracteres problemáticos (ex: crases em vez de aspas).
 */

const stateMap: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
  'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
  'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
  'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
  'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
  'SE': 'Sergipe', 'TO': 'Tocantins'
};

// Mapa reverso pré-computado para consultas ágeis de nome para sigla ignorando acentuação
const reverseStateMap: Record<string, string> = Object.entries(stateMap).reduce(
  (acc, [acronym, fullName]) => {
    acc[fullName.toUpperCase()] = acronym;
    // Garante fallback sem acentos (Ex: SAO PAULO)
    const unaccented = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    acc[unaccented] = acronym;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Limpa strings removendo aspas extras (simples e duplas),
 * substituindo crases por apóstrofos e removendo espaços em branco excedentes.
 */
export function normalizeString(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '';
  
  let cleanText = String(text).trim();
  
  // Remove aspas duplas no início e fim
  if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
    cleanText = cleanText.substring(1, cleanText.length - 1);
  }
  // Remove aspas simples no início e fim
  if (cleanText.startsWith("'") && cleanText.endsWith("'")) {
    cleanText = cleanText.substring(1, cleanText.length - 1);
  }

  return cleanText
    .replace(/`/g, "'")           // Substitui crases (`) por aspas simples (')
    .trim();
}

/**
 * Padroniza um CNPJ (ou CPF) garantindo que contenha apenas números.
 * Se for reconhecido como um CNPJ potencial, preenche com zeros à esquerda
 * até garantir exatamente 14 dígitos.
 */
export function normalizeCNPJ(cnpj: string | number | null | undefined): string {
  if (cnpj === null || cnpj === undefined) return '';
  
  // Converte para string e executa clean-up de tudo que não for dígito
  const onlyNumbers = String(cnpj).replace(/\D/g, '');
  
  if (!onlyNumbers) return '';
  
  // Para CNPJs desformatados pelas planilhas, força o padStart para 14 dígitos.
  // Evitamos alterar códigos muito curtos que possam ser intencionalmente não-CNPJs 
  // caso o campo misture identificadores, mas focamos em números com 13/14 dígitos.
  return onlyNumbers.padStart(14, '0');
}

/**
 * Formata uma string de CNPJ (exclusivamente números) para o formato XX.XXX.XXX/XXXX-XX.
 */
export function formatCNPJ(cnpjStr: string | null | undefined): string {
  if (!cnpjStr) return '';
  const onlyNumbers = cnpjStr.replace(/\D/g, '');
  if (onlyNumbers.length !== 14) return cnpjStr; // Returns as is if not 14 digits
  
  return onlyNumbers.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Retorna o nome por extenso de um estado baseando-se na sua sigla (UF).
 * Se o parâmetro passado já for o nome completo, retorna-o formatado.
 */
export function getStateFullName(ufOrName: string | null | undefined): string {
  if (!ufOrName) return '';
  
  const cleanInput = ufOrName.trim().toUpperCase();
  
  // Verifica se é uma sigla direta
  if (cleanInput.length === 2 && stateMap[cleanInput]) {
    return stateMap[cleanInput];
  }

  // Verifica se o texto de entrada foi digitado por extenso (mesmo sem acento)
  const acronym = reverseStateMap[cleanInput];
  if (acronym && stateMap[acronym]) {
    return stateMap[acronym];
  }

  // Falha silenciosa limpa: devolve a string original sanitizada caso não reconheça
  return normalizeString(ufOrName);
}

/**
 * Retorna a sigla de um estado (UF) baseando-se no seu nome por extenso.
 * Se já for uma sigla válida, retorna a própria.
 */
export function getStateAcronym(fullNameOrUF: string | null | undefined): string {
  if (!fullNameOrUF) return '';
  
  const cleanInput = fullNameOrUF.trim().toUpperCase();
  
  // Pode já ser a UF oficial
  if (cleanInput.length === 2 && stateMap[cleanInput]) {
    return cleanInput;
  }
  
  // Buscar a UF correspondente no dicionário
  return reverseStateMap[cleanInput] || cleanInput;
}

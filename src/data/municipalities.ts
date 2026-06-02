export const CITIES_COORDS = [
  // Já existentes (busca por substring no nome da entidade)
  { name: 'MOGI GUACU', label: 'Mogi Guaçu', lat: -22.3688, lng: -46.9427 },
  { name: 'MOGI MIRIM', label: 'Mogi Mirim', lat: -22.4332, lng: -46.9582 },
  { name: 'RIO CLARO', label: 'Rio Claro', lat: -22.4116, lng: -47.5614 },
  { name: 'PENAPOLIS', label: 'Penápolis', lat: -21.4191, lng: -50.0766 },
  { name: 'LONDRINA', label: 'Londrina', lat: -23.3103, lng: -51.1628 },
  { name: 'BARRETOS', label: 'Barretos', lat: -20.5573, lng: -48.5678 },
  { name: 'BERTIOGA', label: 'Bertioga', lat: -23.8504, lng: -46.1387 },
  { name: 'SUMARE', label: 'Sumaré', lat: -22.8223, lng: -47.2675 },
  { name: 'ANAPOLIS', label: 'Anápolis', lat: -16.3267, lng: -48.9528 },
  { name: 'JUNDIAI', label: 'Jundiaí', lat: -23.1857, lng: -46.8978 },
  { name: 'BIRIGUI', label: 'Birigui', lat: -21.2882, lng: -50.3400 },
  { name: 'ATIBAIA', label: 'Atibaia', lat: -23.1180, lng: -46.5501 },
  { name: 'PARANAVAI', label: 'Paranavaí', lat: -23.0785, lng: -52.4607 },
  { name: 'PARA DE MINAS', label: 'Pará de Minas', lat: -19.8601, lng: -44.6047 },
  { name: 'FRANCA', label: 'Franca', lat: -20.5385, lng: -47.3995 },
  { name: 'SANTA BARBARA DOESTE', label: "Santa Bárbara d'Oeste", lat: -22.7554, lng: -47.4144 },
  { name: 'ARARAS', label: 'Araras', lat: -22.3571, lng: -47.3846 },
  { name: 'S CARLOS', label: 'São Carlos', lat: -22.0163, lng: -47.8920 },
  { name: 'MONGAGUA', label: 'Mongaguá', lat: -24.0934, lng: -46.6200 },
  { name: 'PEREIRA BARRETO', label: 'Pereira Barreto', lat: -20.6387, lng: -51.1093 },
  { name: 'JOINVILLE', label: 'Joinville', lat: -26.3045, lng: -48.8487 },
  { name: 'RIB PRETO', label: 'Ribeirão Preto', lat: -21.1775, lng: -47.8103 },
  { name: 'GUARATINGUETA', label: 'Guaratinguetá', lat: -22.8122, lng: -45.1917 },
  { name: 'ILHA SOLTEIRA', label: 'Ilha Solteira', lat: -20.4326, lng: -51.3431 },
  { name: 'ITATIBA', label: 'Itatiba', lat: -23.0064, lng: -46.8375 },
  { name: 'PATOS DE MINAS', label: 'Patos de Minas', lat: -18.5888, lng: -46.5147 },
  { name: 'CATANDUVA', label: 'Catanduva', lat: -21.1352, lng: -48.9742 },
  { name: 'LIMEIRA', label: 'Limeira', lat: -22.5645, lng: -47.4017 },
  { name: 'OSASCO', label: 'Osasco', lat: -23.5329, lng: -46.7915 },
  { name: 'PROMISSAO', label: 'Promissão', lat: -21.5367, lng: -49.8580 },
  { name: 'ITAJUBA', label: 'Itajubá', lat: -22.4253, lng: -45.4528 },
  { name: 'ITUMBIARA', label: 'Itumbiara', lat: -18.4216, lng: -49.2155 },
  { name: 'UBATUBA', label: 'Ubatuba', lat: -23.4332, lng: -45.0834 },
  { name: 'ITAPIRA', label: 'Itapira', lat: -22.4357, lng: -46.8207 },
  { name: 'CAJAMAR', label: 'Cajamar', lat: -23.3541, lng: -46.8833 },
  { name: 'PINDAMONHANGABA', label: 'Pindamonhangaba', lat: -22.9234, lng: -45.4589 },
  { name: 'CUBATAO', label: 'Cubatão', lat: -23.8858, lng: -46.4250 },
  { name: 'ANDRADAS', label: 'Andradas', lat: -22.0658, lng: -46.5683 },
  { name: 'CAPAO BONITO', label: 'Capão Bonito', lat: -24.0063, lng: -48.3494 },
  { name: 'SALTO', label: 'Salto', lat: -23.2006, lng: -47.2882 },
  // Cidades adicionadas via dados de localização das entidades (CNPJ-based)
  { name: 'FLORIANOPOLIS', label: 'Florianópolis', lat: -27.5954, lng: -48.5480 },
  { name: 'RIO DE JANEIRO', label: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'SAO LOURENCO', label: 'São Lourenço', lat: -22.1151, lng: -45.0531 },
  { name: 'CAMPO GRANDE', label: 'Campo Grande', lat: -20.4697, lng: -54.6201 },
  { name: 'SANTO ANDRE', label: 'Santo André', lat: -23.6639, lng: -46.5383 },
  { name: 'PARNAIBA', label: 'Parnaíba', lat: -2.9039, lng: -41.7769 },
  { name: 'BELO HORIZONTE', label: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 },
  { name: 'BARUERI', label: 'Barueri', lat: -23.5109, lng: -46.8765 },
  { name: 'PIRACICABA', label: 'Piracicaba', lat: -22.7253, lng: -47.6492 },
  { name: 'ASSIS', label: 'Assis', lat: -22.6614, lng: -50.4122 },
  { name: 'TERESINA', label: 'Teresina', lat: -5.0920, lng: -42.8034 },
  { name: 'POA', label: 'Poá', lat: -23.5260, lng: -46.3428 },
  { name: 'RECIFE', label: 'Recife', lat: -8.0539, lng: -34.8811 },
  { name: 'SAO JOSE DO RIO PARDO', label: 'São José do Rio Pardo', lat: -21.5983, lng: -46.8901 },
  { name: 'VOTUPORANGA', label: 'Votuporanga', lat: -20.4239, lng: -49.9736 },
  { name: 'NATAL', label: 'Natal', lat: -5.7945, lng: -35.2110 },
  { name: 'BRASILIA', label: 'Brasília', lat: -15.7939, lng: -47.8828 },
  { name: 'UBERABA', label: 'Uberaba', lat: -19.7489, lng: -47.9312 },
  { name: 'SAO JOAQUIM DA BARRA', label: 'São Joaquim da Barra', lat: -20.5838, lng: -47.8543 },
  { name: 'SAO JOSE DO RIO PRETO', label: 'São José do Rio Preto', lat: -20.8115, lng: -49.3758 },
  { name: 'PIRASSUNUNGA', label: 'Pirassununga', lat: -21.9984, lng: -47.4253 },
  { name: 'MACAPA', label: 'Macapá', lat: 0.0356, lng: -51.0705 },
  { name: 'ANDRADINA', label: 'Andradina', lat: -20.8968, lng: -51.3793 },
  { name: 'SAO JOAO DA BOA VISTA', label: 'São João da Boa Vista', lat: -21.9693, lng: -46.7955 },
  { name: 'ITAPOLIS', label: 'Itápolis', lat: -21.5916, lng: -48.8124 },
  { name: 'BRAGANCA PAULISTA', label: 'Bragança Paulista', lat: -22.9519, lng: -46.5424 },
  { name: 'MANAUS', label: 'Manaus', lat: -3.1190, lng: -60.0217 },
  { name: 'VARGINHA', label: 'Varginha', lat: -21.5517, lng: -45.4303 },
  { name: 'LAGES', label: 'Lages', lat: -27.8156, lng: -50.3261 },
  { name: 'PRESIDENTE PRUDENTE', label: 'Presidente Prudente', lat: -22.1203, lng: -51.3882 },
  { name: 'SAO MANUEL', label: 'São Manuel', lat: -22.7333, lng: -48.5701 },
  { name: 'ADAMANTINA', label: 'Adamantina', lat: -21.6885, lng: -51.0741 },
  { name: 'MARINGA', label: 'Maringá', lat: -23.4273, lng: -51.9375 },
  { name: 'LAJEADO', label: 'Lajeado', lat: -29.4664, lng: -51.9613 },
  { name: 'ESPIRITO SANTO DO PINHAL', label: 'Espírito Santo do Pinhal', lat: -22.1841, lng: -46.7455 },
  { name: 'XANXERE', label: 'Xanxerê', lat: -26.8784, lng: -52.4062 },
  { name: 'ARTUR NOGUEIRA', label: 'Artur Nogueira', lat: -22.5727, lng: -47.1717 },
  { name: 'CANOINHAS', label: 'Canoinhas', lat: -26.1803, lng: -50.3922 },
  { name: 'CASCAVEL', label: 'Cascavel', lat: -24.9578, lng: -53.4596 },
  { name: 'RIO DO SUL', label: 'Rio do Sul', lat: -27.2172, lng: -49.6417 },
  { name: 'BLUMENAU', label: 'Blumenau', lat: -26.9194, lng: -49.0661 },
  { name: 'ARARANGUA', label: 'Araranguá', lat: -28.9352, lng: -49.4817 },
  { name: 'SANTO ANTONIO DA PLATINA', label: 'Santo Antônio da Platina', lat: -23.3042, lng: -50.0700 },
  { name: 'BELEM', label: 'Belém', lat: -1.4558, lng: -48.5044 },
  { name: 'MOGI DAS CRUZES', label: 'Mogi das Cruzes', lat: -23.5224, lng: -46.1860 },
  { name: 'CURITIBA', label: 'Curitiba', lat: -25.4290, lng: -49.2671 },
  { name: 'AMERICANA', label: 'Americana', lat: -22.7416, lng: -47.3320 },
  { name: 'JOAO PESSOA', label: 'João Pessoa', lat: -7.1153, lng: -34.8641 },
  { name: 'VITORIA', label: 'Vitória', lat: -20.3155, lng: -40.3128 },
  { name: 'LINS', label: 'Lins', lat: -21.6797, lng: -49.7439 },
  { name: 'SAO CARLOS', label: 'São Carlos', lat: -22.0163, lng: -47.8920 },
  { name: 'RIBEIRAO PRETO', label: 'Ribeirão Preto', lat: -21.1775, lng: -47.8103 },
];

const normalizar = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();

/** Busca por substring no nome da entidade (compatibilidade legada). */
export const getCityCoords = (entidadeName: string) => {
  if (!entidadeName) return null;
  const normName = entidadeName.toUpperCase();
  for (const city of CITIES_COORDS) {
    if (normName.includes(city.name)) {
      return city;
    }
  }
  return null;
};

/** Busca pelo nome exato da cidade (sem acentos, case-insensitive). */
export const getCityCoordsExact = (cidadeNome: string) => {
  if (!cidadeNome) return null;
  const normInput = normalizar(cidadeNome);
  for (const city of CITIES_COORDS) {
    if (normalizar(city.label) === normInput || city.name === normInput) {
      return city;
    }
  }
  return null;
};

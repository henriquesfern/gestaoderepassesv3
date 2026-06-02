export const BRAZIL_STATES_GEOJSON_URL = '/maps/brazil-states.geojson';
export const BRAZIL_MUNICIPIOS_ABRANGENCIA_URL = '/maps/brazil-municipios-abrangencia.geojson';

export async function loadBrazilStatesGeoJson() {
  const response = await fetch(BRAZIL_STATES_GEOJSON_URL);

  if (!response.ok) {
    throw new Error(`Falha ao carregar mapa do Brasil: HTTP ${response.status}`);
  }

  return response.json();
}

let _abrangenciaGeoCache: any = null;

export async function loadAbrangenciaGeoJson() {
  if (_abrangenciaGeoCache) return _abrangenciaGeoCache;
  const response = await fetch(BRAZIL_MUNICIPIOS_ABRANGENCIA_URL);
  if (!response.ok) {
    throw new Error(`Falha ao carregar municípios de abrangência: HTTP ${response.status}`);
  }
  _abrangenciaGeoCache = await response.json();
  return _abrangenciaGeoCache;
}

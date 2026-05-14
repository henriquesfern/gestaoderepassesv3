export const BRAZIL_STATES_GEOJSON_URL = '/maps/brazil-states.geojson';

export async function loadBrazilStatesGeoJson() {
  const response = await fetch(BRAZIL_STATES_GEOJSON_URL);

  if (!response.ok) {
    throw new Error(`Falha ao carregar mapa do Brasil: HTTP ${response.status}`);
  }

  return response.json();
}

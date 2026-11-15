/*
 * Índice Oceánico de El Niño (ONI) — NOAA Climate Prediction Center.
 * Fuente: https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt (columna ANOM, °C), leído el 14-nov-2026.
 * No es un dato de NASA: es de NOAA (gobierno de EE. UU.). Se usa solo para agrupar las campañas, no entra en el puntaje.
 *
 * ndj[año] = anomalía del trimestre nov–dic–ene que empieza en ese año, es decir, en pleno ciclo de la soja
 * de la campaña año–(año+1). Ejemplo: ndj[2021] es NDJ 2021–22.
 * Clasificación simple usada en la app (SUPUESTO declarado): El Niño si ≥ +0,5; La Niña si ≤ −0,5; neutro en el resto.
 * NOAA exige además 5 trimestres seguidos para declarar un episodio; aquí se usa un solo trimestre.
 */
window.ENSO_ONI = {
  source: 'NOAA Climate Prediction Center, Oceanic Niño Index (ONI)',
  url: 'https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt',
  fetched: '2026-11-14',
  season: 'NDJ',
  threshold: 0.5,
  ndj: {
    2001: -0.32, 2002: 1.08, 2003: 0.29, 2004: 0.71, 2005: -0.82, 2006: 0.88, 2007: -1.72, 2008: -0.79, 2009: 1.50,
    2010: -1.48, 2011: -0.92, 2012: -0.03, 2013: -0.11, 2014: 0.80, 2015: 2.59, 2016: -0.37, 2017: -0.76, 2018: 1.05,
    2019: 0.75, 2020: -1.06, 2021: -0.83, 2022: -0.70, 2023: 1.99, 2024: -0.43, 2025: -0.60
  },
  // Último trimestre publicado al leer el archivo (observado, no pronóstico).
  latest: { season: 'ASO', year: 2026, anom: 2.46 }
};

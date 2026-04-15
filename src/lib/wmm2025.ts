// WMM2025 Coefficients - World Magnetic Model 2025
// Source: NOAA NCEI official WMM2025
// Reference epoch: 2025.0
// Valid until: 2030.0

export interface WMMCoefficient {
  n: number;  // degree
  m: number;  // order
  g: number;  // Gauss coefficient g (nT)
  h: number;  // Gauss coefficient h (nT)
  gDot: number; // secular variation g (nT/year)
  hDot: number; // secular variation h (nT/year)
}

// WMM2025 main field coefficients and secular variation
// Format: n, m, gnm, hnm, gdot, hdot
export const WMM2025_COEFFICIENTS: WMMCoefficient[] = [
  { n: 1, m: 0, g: -29351.8, h: 0.0, gDot: 12.0, hDot: 0.0 },
  { n: 1, m: 1, g: -1410.8, h: 4545.4, gDot: 9.7, hDot: -21.5 },
  { n: 2, m: 0, g: -2556.6, h: 0.0, gDot: -11.6, hDot: 0.0 },
  { n: 2, m: 1, g: 2951.1, h: -3133.6, gDot: -5.2, hDot: -27.7 },
  { n: 2, m: 2, g: 1649.3, h: -815.1, gDot: -8.0, hDot: -12.1 },
  { n: 3, m: 0, g: 1361.0, h: 0.0, gDot: -1.3, hDot: 0.0 },
  { n: 3, m: 1, g: -2404.1, h: -56.6, gDot: -4.2, hDot: 4.0 },
  { n: 3, m: 2, g: 1243.8, h: 237.5, gDot: 0.4, hDot: -0.3 },
  { n: 3, m: 3, g: 453.6, h: -549.5, gDot: -15.6, hDot: -4.1 },
  { n: 4, m: 0, g: 895.0, h: 0.0, gDot: -1.6, hDot: 0.0 },
  { n: 4, m: 1, g: 799.5, h: 278.6, gDot: -2.4, hDot: -1.1 },
  { n: 4, m: 2, g: 55.7, h: -133.9, gDot: -6.0, hDot: 4.1 },
  { n: 4, m: 3, g: -281.1, h: 212.0, gDot: 5.6, hDot: 1.6 },
  { n: 4, m: 4, g: 12.1, h: -375.6, gDot: -7.0, hDot: -4.4 },
  { n: 5, m: 0, g: -233.2, h: 0.0, gDot: 0.6, hDot: 0.0 },
  { n: 5, m: 1, g: 368.9, h: 45.4, gDot: 1.4, hDot: -0.5 },
  { n: 5, m: 2, g: 187.2, h: 220.2, gDot: 0.0, hDot: 2.2 },
  { n: 5, m: 3, g: -138.7, h: -122.9, gDot: 0.6, hDot: 0.4 },
  { n: 5, m: 4, g: -142.0, h: 43.0, gDot: 2.2, hDot: 1.7 },
  { n: 5, m: 5, g: 20.9, h: 106.1, gDot: 0.9, hDot: 1.9 },
  { n: 6, m: 0, g: 64.4, h: 0.0, gDot: -0.2, hDot: 0.0 },
  { n: 6, m: 1, g: 63.8, h: -18.4, gDot: -0.4, hDot: 0.3 },
  { n: 6, m: 2, g: 76.9, h: 16.8, gDot: 0.9, hDot: -1.6 },
  { n: 6, m: 3, g: -115.7, h: 48.8, gDot: 1.2, hDot: -0.4 },
  { n: 6, m: 4, g: -40.9, h: -59.8, gDot: -0.9, hDot: 0.9 },
  { n: 6, m: 5, g: 14.9, h: 10.9, gDot: 0.3, hDot: 0.7 },
  { n: 6, m: 6, g: -60.7, h: 72.7, gDot: 0.9, hDot: 0.9 },
  { n: 7, m: 0, g: 79.5, h: 0.0, gDot: -0.0, hDot: 0.0 },
  { n: 7, m: 1, g: -77.0, h: -48.9, gDot: -0.1, hDot: 0.6 },
  { n: 7, m: 2, g: -8.8, h: -14.4, gDot: -0.1, hDot: 0.5 },
  { n: 7, m: 3, g: 59.3, h: -1.0, gDot: 0.5, hDot: -0.8 },
  { n: 7, m: 4, g: 15.8, h: 23.4, gDot: -0.1, hDot: 0.0 },
  { n: 7, m: 5, g: 2.5, h: -7.4, gDot: -0.8, hDot: -1.0 },
  { n: 7, m: 6, g: -11.1, h: -25.1, gDot: -0.8, hDot: 0.6 },
  { n: 7, m: 7, g: 14.2, h: -2.3, gDot: 0.8, hDot: -0.2 },
  { n: 8, m: 0, g: 23.2, h: 0.0, gDot: -0.1, hDot: 0.0 },
  { n: 8, m: 1, g: 10.8, h: 7.1, gDot: 0.2, hDot: -0.2 },
  { n: 8, m: 2, g: -17.5, h: -12.6, gDot: 0.0, hDot: 0.5 },
  { n: 8, m: 3, g: 2.0, h: 11.4, gDot: 0.5, hDot: -0.4 },
  { n: 8, m: 4, g: -21.7, h: -9.7, gDot: -0.1, hDot: 0.4 },
  { n: 8, m: 5, g: 16.9, h: 12.7, gDot: 0.3, hDot: -0.5 },
  { n: 8, m: 6, g: 15.0, h: 0.7, gDot: 0.2, hDot: -0.6 },
  { n: 8, m: 7, g: -16.8, h: -5.2, gDot: -0.0, hDot: 0.3 },
  { n: 8, m: 8, g: 0.9, h: 3.9, gDot: 0.2, hDot: 0.2 },
  { n: 9, m: 0, g: 4.6, h: 0.0, gDot: -0.0, hDot: 0.0 },
  { n: 9, m: 1, g: 7.8, h: -24.8, gDot: -0.1, hDot: -0.3 },
  { n: 9, m: 2, g: 3.0, h: 12.2, gDot: 0.1, hDot: 0.3 },
  { n: 9, m: 3, g: -0.2, h: 8.3, gDot: 0.3, hDot: -0.3 },
  { n: 9, m: 4, g: -2.5, h: -3.3, gDot: -0.3, hDot: 0.3 },
  { n: 9, m: 5, g: -13.1, h: -5.2, gDot: 0.0, hDot: 0.2 },
  { n: 9, m: 6, g: 2.4, h: 7.2, gDot: 0.3, hDot: -0.1 },
  { n: 9, m: 7, g: 8.6, h: -0.6, gDot: -0.1, hDot: -0.2 },
  { n: 9, m: 8, g: -8.7, h: 0.8, gDot: 0.1, hDot: 0.4 },
  { n: 9, m: 9, g: -12.9, h: 10.0, gDot: -0.1, hDot: 0.1 },
  { n: 10, m: 0, g: -1.3, h: 0.0, gDot: 0.1, hDot: 0.0 },
  { n: 10, m: 1, g: -6.4, h: 3.3, gDot: 0.0, hDot: 0.0 },
  { n: 10, m: 2, g: 0.2, h: 0.0, gDot: 0.1, hDot: -0.0 },
  { n: 10, m: 3, g: 2.0, h: 2.4, gDot: 0.1, hDot: -0.2 },
  { n: 10, m: 4, g: -1.0, h: 5.3, gDot: -0.0, hDot: 0.1 },
  { n: 10, m: 5, g: -0.6, h: -9.1, gDot: -0.3, hDot: -0.1 },
  { n: 10, m: 6, g: -0.9, h: 0.4, gDot: 0.0, hDot: 0.1 },
  { n: 10, m: 7, g: 1.5, h: -4.2, gDot: -0.1, hDot: 0.0 },
  { n: 10, m: 8, g: 0.9, h: -3.8, gDot: -0.1, hDot: -0.1 },
  { n: 10, m: 9, g: -2.7, h: 0.9, gDot: -0.0, hDot: 0.2 },
  { n: 10, m: 10, g: -3.9, h: -9.1, gDot: -0.0, hDot: -0.0 },
  { n: 11, m: 0, g: 2.9, h: 0.0, gDot: 0.0, hDot: 0.0 },
  { n: 11, m: 1, g: -1.5, h: 0.0, gDot: -0.0, hDot: -0.0 },
  { n: 11, m: 2, g: -2.5, h: 2.9, gDot: 0.0, hDot: 0.1 },
  { n: 11, m: 3, g: 2.4, h: -0.6, gDot: 0.0, hDot: -0.0 },
  { n: 11, m: 4, g: -0.6, h: 0.2, gDot: 0.0, hDot: 0.1 },
  { n: 11, m: 5, g: -0.1, h: 0.5, gDot: -0.1, hDot: -0.0 },
  { n: 11, m: 6, g: -0.6, h: -0.3, gDot: 0.0, hDot: -0.0 },
  { n: 11, m: 7, g: -0.1, h: -1.2, gDot: -0.0, hDot: 0.1 },
  { n: 11, m: 8, g: 1.1, h: -1.7, gDot: -0.1, hDot: -0.0 },
  { n: 11, m: 9, g: -1.0, h: -2.9, gDot: -0.1, hDot: 0.0 },
  { n: 11, m: 10, g: -0.2, h: -1.8, gDot: -0.1, hDot: 0.0 },
  { n: 11, m: 11, g: 2.6, h: -2.3, gDot: -0.1, hDot: 0.0 },
  { n: 12, m: 0, g: -2.0, h: 0.0, gDot: 0.0, hDot: 0.0 },
  { n: 12, m: 1, g: -0.2, h: -1.3, gDot: 0.0, hDot: -0.0 },
  { n: 12, m: 2, g: 0.3, h: 0.7, gDot: -0.0, hDot: 0.0 },
  { n: 12, m: 3, g: 1.2, h: 1.0, gDot: -0.0, hDot: -0.1 },
  { n: 12, m: 4, g: -1.3, h: -1.4, gDot: -0.0, hDot: 0.1 },
  { n: 12, m: 5, g: 0.6, h: -0.0, gDot: -0.0, hDot: -0.0 },
  { n: 12, m: 6, g: 0.6, h: 0.6, gDot: 0.1, hDot: -0.0 },
  { n: 12, m: 7, g: 0.5, h: -0.1, gDot: -0.0, hDot: -0.0 },
  { n: 12, m: 8, g: -0.1, h: 0.8, gDot: 0.0, hDot: 0.0 },
  { n: 12, m: 9, g: -0.4, h: 0.1, gDot: 0.0, hDot: -0.0 },
  { n: 12, m: 10, g: -0.2, h: -1.0, gDot: -0.1, hDot: -0.0 },
  { n: 12, m: 11, g: -1.3, h: 0.1, gDot: -0.0, hDot: 0.0 },
  { n: 12, m: 12, g: -0.7, h: 0.2, gDot: -0.1, hDot: -0.1 },
];

// WMM2025 reference epoch
export const WMM_EPOCH = 2025.0;

// WGS-84 Ellipsoid parameters
export const WGS84_A = 6378.137;      // Semi-major axis (km)
export const WGS84_B = 6356.7523142;  // Semi-minor axis (km)
export const WGS84_F = 1 / 298.257223563; // Flattening
export const WGS84_E2 = 2 * WGS84_F - WGS84_F * WGS84_F; // Eccentricity squared

// Mean Earth radius for spherical harmonic calculations (km)
export const EARTH_RADIUS_KM = 6371.2;

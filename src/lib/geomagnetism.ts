/**
 * Geomagnetic Field Calculator using WMM2025
 * NOAA NCEI compliant implementation
 * Includes: Geodetic→Geocentric conversion, proper spherical harmonics
 */

import { 
  WMM2025_COEFFICIENTS, 
  WMM_EPOCH, 
  EARTH_RADIUS_KM,
  WGS84_A,
  WGS84_E2 
} from './wmm2025';

export interface GeoCoordinates {
  latitude: number;  // decimal degrees (geodetic/GPS), positive = North
  longitude: number; // decimal degrees, positive = East
  altitude?: number; // km above WGS84 ellipsoid (default: 0 for sea level)
}

export interface MagneticField {
  declination: number;   // magnetic variation in degrees (East = positive)
  inclination: number;   // dip angle in degrees
  intensity: number;     // total field strength in nT
  horizontalIntensity: number; // H component in nT
  northComponent: number; // X component in nT
  eastComponent: number;  // Y component in nT
  verticalComponent: number; // Z component in nT (positive down)
  annualChange: number;  // annual change in declination (degrees/year)
}

/**
 * Convert geodetic latitude to geocentric latitude
 * Required for WMM spherical harmonic calculations
 * @param latGeodetic Geodetic latitude in degrees
 * @param altitude Altitude in km above WGS84 ellipsoid
 * @returns Geocentric latitude in radians
 */
function geodeticToGeocentric(latGeodetic: number, altitude: number): { 
  latGeocentric: number; 
  radius: number;
} {
  const latRad = latGeodetic * Math.PI / 180;
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  
  // Radius of curvature in the prime vertical
  const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
  
  // Cartesian coordinates
  const x = (N + altitude) * cosLat * Math.cos(0); // longitude = 0 for this calc
  const y = (N + altitude) * cosLat * Math.sin(0);
  const z = (N * (1 - WGS84_E2) + altitude) * sinLat;
  
  // Geocentric latitude
  const latGeocentricRad = Math.atan2(z, Math.sqrt(x * x + y * y));
  
  // Geocentric radius
  const radius = Math.sqrt(x * x + y * y + z * z);
  
  return {
    latGeocentric: latGeocentricRad * 180 / Math.PI,
    radius
  };
}

/**
 * Convert date to decimal year (NOAA standard)
 * Decimal Year = YYYY + (Day of Year - 1) / 365.25
 * Accounts for leap years
 */
function dateToDecimalYear(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  // Day of year (1-366)
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const currentDate = new Date(Date.UTC(year, month, day));
  const dayOfYear = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  
  // Check for leap year
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInYear = isLeapYear ? 366 : 365;
  
  return year + (dayOfYear - 1) / daysInYear;
}

/**
 * Associated Legendre Functions (Schmidt quasi-normalized)
 * Returns P[n][m] for n=0..nMax, m=0..n
 */
function legendreSchmidt(nMax: number, theta: number): number[][] {
  const P: number[][] = Array(nMax + 1).fill(null).map(() => Array(nMax + 1).fill(0));
  
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  
  // P[0][0] = 1
  P[0][0] = 1;
  
  // Diagonal terms: P[n][n] = sin(theta) * sqrt((2n-1)/(2n)) * P[n-1][n-1]
  for (let n = 1; n <= nMax; n++) {
    P[n][n] = P[n - 1][n - 1] * sinTheta * Math.sqrt((2 * n - 1) / (2 * n));
  }
  
  // Terms with m = n-1: P[n][n-1] = cos(theta) * sqrt(2n) * P[n][n]
  for (let n = 1; n <= nMax; n++) {
    P[n][n - 1] = P[n][n] * cosTheta * Math.sqrt(2 * n);
  }
  
  // Remaining terms using recurrence relation
  for (let n = 2; n <= nMax; n++) {
    for (let m = 0; m <= n - 2; m++) {
      const anm = Math.sqrt((2 * n - 1) * (2 * n + 1) / ((n - m) * (n + m)));
      const bnm = Math.sqrt((2 * n + 1) * (n + m - 1) * (n - m - 1) / 
                           ((n - m) * (n + m) * (2 * n - 3)));
      P[n][m] = anm * cosTheta * P[n - 1][m] - bnm * P[n - 2][m];
    }
  }
  
  return P;
}

/**
 * Derivatives of Associated Legendre Functions
 * Returns dP[n][m]/dtheta
 */
function legendreDerivative(nMax: number, theta: number, P: number[][]): number[][] {
  const dP: number[][] = Array(nMax + 1).fill(null).map(() => Array(nMax + 1).fill(0));
  
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  
  // dP[0][0]/dtheta = 0
  dP[0][0] = 0;
  
  for (let n = 1; n <= nMax; n++) {
    for (let m = 0; m <= n; m++) {
      if (m === n) {
        // dP[n][n]/dtheta = n * cos(theta) / sin(theta) * P[n][n]
        dP[n][m] = n * cosTheta * P[n][m] / sinTheta;
      } else if (m === n - 1) {
        // dP[n][n-1]/dtheta = (n * cos(theta) * P[n][n-1] - sqrt(2n) * P[n][n]) / sin(theta)
        dP[n][m] = (n * cosTheta * P[n][m] - Math.sqrt(2 * n) * P[n][n]) / sinTheta;
      } else {
        // Recurrence relation for derivatives
        const anm = Math.sqrt((2 * n - 1) * (2 * n + 1) / ((n - m) * (n + m)));
        const bnm = Math.sqrt((2 * n + 1) * (n + m - 1) * (n - m - 1) / 
                             ((n - m) * (n + m) * (2 * n - 3)));
        dP[n][m] = anm * (cosTheta * dP[n - 1][m] - sinTheta * P[n - 1][m]) - bnm * dP[n - 2][m];
      }
    }
  }
  
  return dP;
}

/**
 * Calculate geomagnetic field using WMM2025
 * NOAA NCEI compliant implementation
 */
export function calculateMagneticField(
  coords: GeoCoordinates, 
  date: Date
): MagneticField {
  const { latitude, longitude, altitude = 0 } = coords;
  
  // Step 1: Convert geodetic latitude to geocentric
  const { latGeocentric, radius } = geodeticToGeocentric(latitude, altitude);
  
  // Step 2: Convert to spherical coordinates
  const latGeoRad = latGeocentric * Math.PI / 180;
  const lonRad = longitude * Math.PI / 180;
  const theta = Math.PI / 2 - latGeoRad; // Colatitude
  
  // Step 3: Calculate time difference from epoch
  const decimalYear = dateToDecimalYear(date);
  const deltaYear = decimalYear - WMM_EPOCH;
  
  // Step 4: Calculate Legendre functions
  const nMax = 12;
  const P = legendreSchmidt(nMax, theta);
  const dP = legendreDerivative(nMax, theta, P);
  
  // Step 5: Calculate field components
  const sinTheta = Math.sin(theta);
  const rRatio = EARTH_RADIUS_KM / radius;
  
  let X = 0; // North component
  let Y = 0; // East component  
  let Z = 0; // Down component (positive down)
  let Xdot = 0; // Secular variation X
  let Ydot = 0; // Secular variation Y
  let Zdot = 0; // Secular variation Z
  
  for (const coef of WMM2025_COEFFICIENTS) {
    const { n, m, g, h, gDot, hDot } = coef;
    
    // Time-adjusted coefficients
    const gnm = g + gDot * deltaYear;
    const hnm = h + hDot * deltaYear;
    
    // Schmidt normalization
    const schmidt = m === 0 ? 1 : Math.sqrt(2);
    
    // Trigonometric terms
    const cosMlon = Math.cos(m * lonRad);
    const sinMlon = Math.sin(m * lonRad);
    
    // Radial term: (a/r)^(n+2)
    const radial = Math.pow(rRatio, n + 2);
    
    // X (North) component
    X += radial * schmidt * (gnm * cosMlon + hnm * sinMlon) * dP[n][m];
    
    // Y (East) component
    if (m > 0 && sinTheta > 0.0001) {
      Y += radial * schmidt * m * (gnm * sinMlon - hnm * cosMlon) * P[n][m] / sinTheta;
    }
    
    // Z (Down) component
    Z += -(n + 1) * radial * schmidt * (gnm * cosMlon + hnm * sinMlon) * P[n][m];
    
    // Secular variation
    Xdot += radial * schmidt * (gDot * cosMlon + hDot * sinMlon) * dP[n][m];
    if (m > 0 && sinTheta > 0.0001) {
      Ydot += radial * schmidt * m * (gDot * sinMlon - hDot * cosMlon) * P[n][m] / sinTheta;
    }
    Zdot += -(n + 1) * radial * schmidt * (gDot * cosMlon + hDot * sinMlon) * P[n][m];
  }
  
  // Step 6: Calculate derived quantities
  const H = Math.sqrt(X * X + Y * Y); // Horizontal intensity
  const F = Math.sqrt(H * H + Z * Z); // Total intensity
  
  // Magnetic declination (variation) - atan2(Y, X) gives East-positive angle
  const D = Math.atan2(Y, X) * 180 / Math.PI;
  
  // Magnetic inclination (dip)
  const I = Math.atan2(Z, H) * 180 / Math.PI;
  
  // Annual change in declination (degrees/year)
  const Ddot = (X * Ydot - Y * Xdot) / (H * H) * 180 / Math.PI;
  
  return {
    declination: D,
    inclination: I,
    intensity: F,
    horizontalIntensity: H,
    northComponent: X,
    eastComponent: Y,
    verticalComponent: Z,
    annualChange: Ddot
  };
}

/**
 * Calculate magnetic variation (simplified interface)
 */
export function calculateMagneticVariation(
  latitude: number,
  longitude: number,
  date: Date
): { variation: number; annualChange: number; epoch: number } {
  const field = calculateMagneticField({ latitude, longitude }, date);
  return {
    variation: field.declination,
    annualChange: field.annualChange,
    epoch: dateToDecimalYear(date)
  };
}

/**
 * Format variation for display
 */
export function formatVariation(variation: number): string {
  const absVar = Math.abs(variation);
  const direction = variation >= 0 ? 'E' : 'W';
  return `${absVar.toFixed(2)}° ${direction}`;
}

/**
 * Calculate compass error
 */
export function calculateCompassError(
  trueHeading: number,
  compassReading: number,
  variation: number
): number {
  // Magnetic heading = True heading - variation (Easterly variation is positive)
  const magneticHeading = trueHeading - variation;
  
  // Compass error = Compass reading - Magnetic heading
  let error = compassReading - magneticHeading;
  
  // Normalize to -180 to +180
  while (error > 180) error -= 360;
  while (error < -180) error += 360;
  
  return error;
}

/**
 * Convert DM (Degrees, Decimal Minutes) to decimal degrees
 */
export function dmToDecimal(
  degrees: number,
  decimalMinutes: number,
  hemisphere: 'N' | 'S' | 'E' | 'W'
): number {
  const sign = (hemisphere === 'S' || hemisphere === 'W') ? -1 : 1;
  return sign * (Math.abs(degrees) + decimalMinutes / 60);
}

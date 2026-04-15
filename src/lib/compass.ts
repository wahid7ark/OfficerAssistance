/**
 * Magnetic Compass Adjustment Calculator
 * For swinging ship procedure
 */

export interface CompassReading {
  heading: number;      // True/Magnetic heading
  compassReading: number; // What compass shows
}

export interface DeviationResult {
  heading: number;
  compassReading: number;
  deviation: number;
  deviationEW: string; // E or W
}

/**
 * Calculate deviation for a single reading
 * Deviation = Compass Reading - Magnetic Heading
 * Positive = Easterly deviation, Negative = Westerly deviation
 */
export function calculateDeviation(
  magneticHeading: number,
  compassReading: number
): number {
  let deviation = compassReading - magneticHeading;
  
  // Normalize to -180 to +180
  while (deviation > 180) deviation -= 360;
  while (deviation < -180) deviation += 360;
  
  return deviation;
}

/**
 * Calculate deviation table from multiple readings
 */
export function calculateDeviationTable(
  readings: CompassReading[]
): DeviationResult[] {
  return readings.map(r => {
    const deviation = calculateDeviation(r.heading, r.compassReading);
    return {
      heading: r.heading,
      compassReading: r.compassReading,
      deviation: Math.abs(deviation),
      deviationEW: deviation >= 0 ? 'E' : 'W'
    };
  });
}

/**
 * Calculate coefficients A, B, C for deviation curve
 * Using least squares method
 * Deviation = A + B*sin(Heading) + C*cos(Heading)
 */
export function calculateDeviationCoefficients(
  readings: CompassReading[]
): { A: number; B: number; C: number } | null {
  if (readings.length < 3) return null;
  
  let sumSin = 0, sumCos = 0, sumSin2 = 0, sumCos2 = 0, sumSinCos = 0;
  let sumDev = 0, sumDevSin = 0, sumDevCos = 0;
  const n = readings.length;
  
  for (const r of readings) {
    const hRad = r.heading * Math.PI / 180;
    const sinH = Math.sin(hRad);
    const cosH = Math.cos(hRad);
    const dev = calculateDeviation(r.heading, r.compassReading);
    
    sumSin += sinH;
    sumCos += cosH;
    sumSin2 += sinH * sinH;
    sumCos2 += cosH * cosH;
    sumSinCos += sinH * cosH;
    sumDev += dev;
    sumDevSin += dev * sinH;
    sumDevCos += dev * cosH;
  }
  
  // Solve normal equations
  const det = n * (sumSin2 * sumCos2 - sumSinCos * sumSinCos) 
              - sumSin * (sumSin * sumCos2 - sumCos * sumSinCos)
              + sumCos * (sumSin * sumSinCos - sumCos * sumSin2);
  
  if (Math.abs(det) < 0.0001) return null;
  
  const A = (sumDev * (sumSin2 * sumCos2 - sumSinCos * sumSinCos)
           - sumSin * (sumDevSin * sumCos2 - sumDevCos * sumSinCos)
           + sumCos * (sumDevSin * sumSinCos - sumDevCos * sumSin2)) / det;
  
  const B = (n * (sumDevSin * sumCos2 - sumDevCos * sumSinCos)
           - sumDev * (sumSin * sumCos2 - sumCos * sumSinCos)
           + sumCos * (sumSin * sumDevCos - sumCos * sumDevSin)) / det;
  
  const C = (n * (sumSin2 * sumDevCos - sumSinCos * sumDevSin)
           - sumSin * (sumSin * sumDevCos - sumCos * sumDevSin)
           + sumDev * (sumSin * sumSinCos - sumCos * sumSin2)) / det;
  
  return { A, B, C };
}

/**
 * Predict deviation at any heading using coefficients
 */
export function predictDeviation(
  heading: number,
  coefficients: { A: number; B: number; C: number }
): number {
  const hRad = heading * Math.PI / 180;
  return coefficients.A + coefficients.B * Math.sin(hRad) + coefficients.C * Math.cos(hRad);
}

/**
 * Standard compass headings for swinging ship
 */
export const STANDARD_HEADINGS = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 
                                  180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345];

/**
 * Calculate compass error
 * Compass Error = Deviation + Variation
 */
export function calculateCompassError(
  deviation: number,
  variation: number
): number {
  return deviation + variation;
}

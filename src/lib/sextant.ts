/**
 * Sextant Calculator - Altitude Corrections
 * For marine celestial navigation
 */

export interface SextantObservation {
  sextantAltitude: number;  // degrees (Hs)
  indexError: number;       // degrees (on the arc = positive, off the arc = negative)
  eyeHeight: number;        // meters above sea level
  date?: Date;              // for refraction calculation (optional)
}

export interface AltitudeCorrections {
  indexCorrection: number;   // degrees
  dip: number;               // degrees
  refraction: number;        // degrees
  parallax?: number;         // degrees (for Moon/Sun)
  semiDiameter?: number;     // degrees (for Sun/Moon)
  totalCorrection: number;   // degrees
  observedAltitude: number;  // degrees (Ho)
}

/**
 * Calculate dip correction
 * Dip = -1.76 * sqrt(eyeHeight) [in minutes of arc]
 * @param eyeHeight Height of eye in meters
 * @returns Dip correction in degrees (negative value)
 */
export function calculateDip(eyeHeight: number): number {
  if (eyeHeight <= 0) return 0;
  // Standard formula: Dip (') = -1.76 * sqrt(h)
  const dipMinutes = -1.76 * Math.sqrt(eyeHeight);
  return dipMinutes / 60; // Convert to degrees
}

/**
 * Calculate atmospheric refraction
 * Using simplified formula for standard conditions
 * @param altitude Apparent altitude in degrees (after index correction and dip)
 * @returns Refraction correction in degrees (negative value)
 */
export function calculateRefraction(altitude: number): number {
  if (altitude <= 0) return -0.5; // Maximum refraction at horizon
  
  // Simplified formula: R (') = 0.96 / tan(altitude)
  // More accurate for low altitudes: R (') = 0.0167 / tan(altitude + 7.31/(altitude + 4.4))
  const altRad = (altitude * Math.PI) / 180;
  const refractionMinutes = 0.0167 / Math.tan(altRad + 7.31 / (altitude + 4.4));
  
  return -refractionMinutes / 60; // Convert to degrees (negative)
}

/**
 * Calculate parallax correction for the Moon
 * @param altitude Observed altitude in degrees
 * @param moonHorizontalParallax Moon's horizontal parallax in degrees (default ~1°)
 * @returns Parallax correction in degrees (positive value)
 */
export function calculateMoonParallax(
  altitude: number, 
  moonHorizontalParallax: number = 1.0
): number {
  const altRad = (altitude * Math.PI) / 180;
  const parallaxDegrees = moonHorizontalParallax * Math.cos(altRad);
  return parallaxDegrees;
}

/**
 * Calculate parallax correction for the Sun
 * @param altitude Observed altitude in degrees
 * @returns Parallax correction in degrees (positive value, ~0.0024°)
 */
export function calculateSunParallax(altitude: number): number {
  const altRad = (altitude * Math.PI) / 180;
  const sunHorizontalParallax = 0.0024; // ~8.8 arcseconds
  return sunHorizontalParallax * Math.cos(altRad);
}

/**
 * Get Sun's semi-diameter
 * @returns Semi-diameter in degrees (average ~0.2666°)
 */
export function getSunSemiDiameter(): number {
  // Average semi-diameter: ~15' 59" = ~0.2666°
  // Varies between 0.266° (aphelion) and 0.268° (perihelion)
  return 0.2666;
}

/**
 * Get Moon's semi-diameter
 * @returns Semi-diameter in degrees (average ~0.25°)
 */
export function getMoonSemiDiameter(): number {
  // Average semi-diameter: ~15' = ~0.25°
  // Varies between ~0.24° and ~0.26°
  return 0.25;
}

/**
 * Calculate all corrections for star/planet sight
 * @param observation Sextant observation data
 * @returns All corrections and observed altitude
 */
export function correctStarOrPlanet(observation: SextantObservation): AltitudeCorrections {
  const { sextantAltitude, indexError, eyeHeight } = observation;
  
  // Index correction (opposite sign of index error)
  const indexCorrection = -indexError;
  
  // Apparent altitude (Ha) = Hs + Index Correction
  const apparentAltitude = sextantAltitude + indexCorrection;
  
  // Dip correction
  const dip = calculateDip(eyeHeight);
  
  // Altitude for refraction (after dip)
  const altitudeForRefraction = apparentAltitude + dip;
  
  // Refraction
  const refraction = calculateRefraction(altitudeForRefraction);
  
  // Total correction
  const totalCorrection = indexCorrection + dip + refraction;
  
  // Observed altitude (Ho)
  const observedAltitude = sextantAltitude + totalCorrection;
  
  return {
    indexCorrection,
    dip,
    refraction,
    totalCorrection,
    observedAltitude
  };
}

/**
 * Calculate all corrections for Sun sight (lower limb)
 * @param observation Sextant observation data
 * @param lowerLimb true for lower limb, false for upper limb
 * @returns All corrections and observed altitude
 */
export function correctSun(
  observation: SextantObservation, 
  lowerLimb: boolean = true
): AltitudeCorrections {
  const { sextantAltitude, indexError, eyeHeight } = observation;
  
  // Index correction
  const indexCorrection = -indexError;
  
  // Apparent altitude
  const apparentAltitude = sextantAltitude + indexCorrection;
  
  // Dip
  const dip = calculateDip(eyeHeight);
  
  // Altitude for refraction
  const altitudeForRefraction = apparentAltitude + dip;
  
  // Refraction
  const refraction = calculateRefraction(altitudeForRefraction);
  
  // Parallax (small for Sun)
  const parallax = calculateSunParallax(altitudeForRefraction + refraction);
  
  // Semi-diameter
  const semiDiameter = getSunSemiDiameter();
  const sdCorrection = lowerLimb ? semiDiameter : -semiDiameter;
  
  // Total correction
  const totalCorrection = indexCorrection + dip + refraction + parallax + sdCorrection;
  
  // Observed altitude
  const observedAltitude = sextantAltitude + totalCorrection;
  
  return {
    indexCorrection,
    dip,
    refraction,
    parallax,
    semiDiameter: sdCorrection,
    totalCorrection,
    observedAltitude
  };
}

/**
 * Calculate all corrections for Moon sight
 * @param observation Sextant observation data
 * @param lowerLimb true for lower limb, false for upper limb
 * @param horizontalParallax Moon's horizontal parallax in degrees
 * @returns All corrections and observed altitude
 */
export function correctMoon(
  observation: SextantObservation,
  lowerLimb: boolean = true,
  horizontalParallax: number = 1.0
): AltitudeCorrections {
  const { sextantAltitude, indexError, eyeHeight } = observation;
  
  // Index correction
  const indexCorrection = -indexError;
  
  // Apparent altitude
  const apparentAltitude = sextantAltitude + indexCorrection;
  
  // Dip
  const dip = calculateDip(eyeHeight);
  
  // Altitude for refraction
  const altitudeForRefraction = apparentAltitude + dip;
  
  // Refraction
  const refraction = calculateRefraction(altitudeForRefraction);
  
  // Parallax (significant for Moon)
  const parallax = calculateMoonParallax(altitudeForRefraction + refraction, horizontalParallax);
  
  // Semi-diameter
  const semiDiameter = getMoonSemiDiameter();
  const sdCorrection = lowerLimb ? semiDiameter : -semiDiameter;
  
  // Total correction
  const totalCorrection = indexCorrection + dip + refraction + parallax + sdCorrection;
  
  // Observed altitude
  const observedAltitude = sextantAltitude + totalCorrection;
  
  return {
    indexCorrection,
    dip,
    refraction,
    parallax,
    semiDiameter: sdCorrection,
    totalCorrection,
    observedAltitude
  };
}

/**
 * Format degrees to degrees, minutes, seconds
 */
export function formatDMS(degrees: number): string {
  const absDegrees = Math.abs(degrees);
  const deg = Math.floor(absDegrees);
  const minFloat = (absDegrees - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = (minFloat - min) * 60;
  
  return `${deg}° ${min}' ${sec.toFixed(1)}"`;
}

/**
 * Format degrees to degrees and decimal minutes
 */
export function formatDM(degrees: number): string {
  const absDegrees = Math.abs(degrees);
  const deg = Math.floor(absDegrees);
  const min = (absDegrees - deg) * 60;
  
  return `${deg}° ${min.toFixed(2)}'`;
}

/**
 * Convert degrees to minutes of arc
 */
export function toMinutes(degrees: number): number {
  return degrees * 60;
}

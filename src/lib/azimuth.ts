/**
 * True Azimuth Calculator
 * For celestial navigation - Sun's azimuth at rising/setting
 */

/**
 * Calculate Sun's declination for a given date
 * Approximate formula (accurate within 0.5°)
 */
export function getSunDeclination(date: Date): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  // Approximate declination: varies between +23.44° (June) and -23.44° (December)
  const declination = 23.44 * Math.sin((360 / 365.25) * (dayOfYear - 81) * Math.PI / 180);
  return declination;
}

/**
 * Calculate amplitude of the sun
 * Amplitude = arcsin(sin(Dec) / cos(Lat))
 * @param latitude Observer's latitude in degrees
 * @param declination Sun's declination in degrees
 * @returns Amplitude in degrees (East or West)
 */
export function calculateAmplitude(latitude: number, declination: number): number {
  const latRad = latitude * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  
  // Amplitude formula: sin(Amp) = sin(Dec) / cos(Lat)
  const sinAmp = Math.sin(decRad) / Math.cos(latRad);
  
  // Clamp to valid range
  if (sinAmp > 1) return 90;
  if (sinAmp < -1) return -90;
  
  const amplitude = Math.asin(sinAmp) * 180 / Math.PI;
  return amplitude;
}

/**
 * Calculate true azimuth at sunrise/sunset
 * @param latitude Observer's latitude in degrees
 * @param amplitude Amplitude in degrees (from calculateAmplitude)
 * @param isRising true for sunrise, false for sunset
 * @returns Azimuth in degrees (0° = North, 90° = East, 180° = South, 270° = West)
 */
export function calculateAzimuth(
  latitude: number,
  amplitude: number,
  isRising: boolean
): number {
  // In Northern Hemisphere:
  // Sunrise: Azimuth = 90° - Amplitude (if Dec > 0) or 90° + |Amplitude| (if Dec < 0)
  // Sunset: Azimuth = 270° + Amplitude (if Dec > 0) or 270° - |Amplitude| (if Dec < 0)
  
  const isNorth = latitude >= 0;
  
  if (isRising) {
    // Sunrise
    if (isNorth) {
      return amplitude >= 0 ? 90 - amplitude : 90 + Math.abs(amplitude);
    } else {
      return amplitude >= 0 ? 90 + amplitude : 90 - Math.abs(amplitude);
    }
  } else {
    // Sunset
    if (isNorth) {
      return amplitude >= 0 ? 270 + amplitude : 270 - Math.abs(amplitude);
    } else {
      return amplitude >= 0 ? 270 - amplitude : 270 + Math.abs(amplitude);
    }
  }
}

/**
 * Complete calculation for sun's azimuth
 */
export function calculateSunAzimuth(
  latitude: number,
  date: Date,
  isRising: boolean
): {
  declination: number;
  amplitude: number;
  azimuth: number;
  cardinal: string;
} {
  const declination = getSunDeclination(date);
  const amplitude = calculateAmplitude(latitude, declination);
  const azimuth = calculateAzimuth(latitude, amplitude, isRising);
  
  // Format cardinal direction
  const cardinal = formatAzimuthCardinal(azimuth);
  
  return {
    declination,
    amplitude,
    azimuth,
    cardinal
  };
}

/**
 * Format azimuth to cardinal direction
 */
function formatAzimuthCardinal(azimuth: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(azimuth / 22.5) % 16;
  return directions[index];
}

/**
 * Calculate using amplitude by bearing method (Nories method)
 * For use with compass bearing of sun at rising/setting
 */
export function calculateTrueAzimuthFromBearing(
  compassBearing: number,
  variation: number,
  deviation: number
): number {
  // True Azimuth = Compass Bearing + Variation + Deviation
  return compassBearing + variation + deviation;
}

/**
 * Wind Calculator - Apparent and True Wind Conversions
 * For marine navigation
 */

export interface WindData {
  direction: number;  // degrees (0-360), direction wind is coming FROM
  speed: number;      // knots
}

export interface WindResult {
  apparent: WindData;
  true: WindData;
}

/**
 * Calculate True Wind from Apparent Wind
 * @param apparentWind Apparent wind (measured on moving vessel)
 * @param vesselCourse Vessel's course over ground (degrees true)
 * @param vesselSpeed Vessel's speed (knots)
 * @returns True wind (actual wind over ground)
 */
export function calculateTrueWind(
  apparentWind: WindData,
  vesselCourse: number,
  vesselSpeed: number
): WindData {
  // Convert to radians
  const apparentDirRad = (apparentWind.direction * Math.PI) / 180;
  const courseRad = (vesselCourse * Math.PI) / 180;
  
  // Calculate wind components relative to vessel
  const apparentX = apparentWind.speed * Math.sin(apparentDirRad);
  const apparentY = apparentWind.speed * Math.cos(apparentDirRad);
  
  // Vessel motion components
  const vesselX = vesselSpeed * Math.sin(courseRad);
  const vesselY = vesselSpeed * Math.cos(courseRad);
  
  // True wind = Apparent wind - Vessel motion
  const trueX = apparentX - vesselX;
  const trueY = apparentY - vesselY;
  
  // Calculate true wind direction and speed
  const trueSpeed = Math.sqrt(trueX * trueX + trueY * trueY);
  let trueDirection = (Math.atan2(trueX, trueY) * 180) / Math.PI;
  
  // Normalize to 0-360
  if (trueDirection < 0) trueDirection += 360;
  
  return {
    direction: Math.round(trueDirection * 10) / 10,
    speed: Math.round(trueSpeed * 10) / 10
  };
}

/**
 * Calculate Apparent Wind from True Wind
 * @param trueWind True wind (actual wind)
 * @param vesselCourse Vessel's course over ground (degrees true)
 * @param vesselSpeed Vessel's speed (knots)
 * @returns Apparent wind (wind as measured on vessel)
 */
export function calculateApparentWind(
  trueWind: WindData,
  vesselCourse: number,
  vesselSpeed: number
): WindData {
  // Convert to radians
  const trueDirRad = (trueWind.direction * Math.PI) / 180;
  const courseRad = (vesselCourse * Math.PI) / 180;
  
  // True wind components
  const trueX = trueWind.speed * Math.sin(trueDirRad);
  const trueY = trueWind.speed * Math.cos(trueDirRad);
  
  // Vessel motion components
  const vesselX = vesselSpeed * Math.sin(courseRad);
  const vesselY = vesselSpeed * Math.cos(courseRad);
  
  // Apparent wind = True wind + Vessel motion
  const apparentX = trueX + vesselX;
  const apparentY = trueY + vesselY;
  
  // Calculate apparent wind direction and speed
  const apparentSpeed = Math.sqrt(apparentX * apparentX + apparentY * apparentY);
  let apparentDirection = (Math.atan2(apparentX, apparentY) * 180) / Math.PI;
  
  // Normalize to 0-360
  if (apparentDirection < 0) apparentDirection += 360;
  
  return {
    direction: Math.round(apparentDirection * 10) / 10,
    speed: Math.round(apparentSpeed * 10) / 10
  };
}

/**
 * Get wind direction name (cardinal/intercardinal)
 */
export function getWindDirectionName(direction: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(direction / 22.5) % 16;
  return directions[index];
}

/**
 * Get Beaufort scale description
 */
export function getBeaufortScale(speed: number): { force: number; description: string } {
  if (speed < 1) return { force: 0, description: 'Calm' };
  if (speed < 4) return { force: 1, description: 'Light Air' };
  if (speed < 7) return { force: 2, description: 'Light Breeze' };
  if (speed < 11) return { force: 3, description: 'Gentle Breeze' };
  if (speed < 16) return { force: 4, description: 'Moderate Breeze' };
  if (speed < 22) return { force: 5, description: 'Fresh Breeze' };
  if (speed < 28) return { force: 6, description: 'Strong Breeze' };
  if (speed < 34) return { force: 7, description: 'Near Gale' };
  if (speed < 41) return { force: 8, description: 'Gale' };
  if (speed < 48) return { force: 9, description: 'Strong Gale' };
  if (speed < 56) return { force: 10, description: 'Storm' };
  if (speed < 64) return { force: 11, description: 'Violent Storm' };
  return { force: 12, description: 'Hurricane' };
}

/**
 * Calculate relative wind angle (angle between vessel course and wind)
 * @returns Angle in degrees (0 = headwind, 90 = beam wind, 180 = tailwind)
 */
export function calculateRelativeWindAngle(
  windDirection: number,
  vesselCourse: number
): number {
  let relativeAngle = windDirection - vesselCourse;
  if (relativeAngle < 0) relativeAngle += 360;
  if (relativeAngle > 180) relativeAngle = 360 - relativeAngle;
  return Math.round(relativeAngle * 10) / 10;
}

/**
 * Determine sailing point of sail
 */
export function getPointOfSail(relativeAngle: number): string {
  if (relativeAngle <= 45) return 'Head to Wind / Close Hauled';
  if (relativeAngle <= 80) return 'Close Reach';
  if (relativeAngle <= 100) return 'Beam Reach';
  if (relativeAngle <= 135) return 'Broad Reach';
  if (relativeAngle <= 170) return 'Running';
  return 'Dead Run';
}

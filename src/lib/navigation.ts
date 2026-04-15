/**
 * Marine Navigation Calculations
 * CPA/TCPA, ETA, and other navigation utilities
 */

export interface ShipData {
  course: number;  // degrees true
  speed: number;   // knots
}

export interface TargetData {
  bearing: number; // degrees from own ship
  range: number;   // nautical miles
  course: number;  // degrees true
  speed: number;   // knots
}

export interface CPAResult {
  cpaDistance: number;  // nautical miles
  tcpa: number;         // hours (negative = already passed)
  cpaBearing: number;   // degrees from own ship at CPA
  status: 'SAFE' | 'CAUTION' | 'DANGER' | 'PASSED';
}

export interface ETAResult {
  eta: Date;
  travelTimeHours: number;
  formattedETA: string;
  durationText: string;
}

/**
 * Calculate CPA (Closest Point of Approach) and TCPA (Time to CPA)
 * @param own Own ship data
 * @param target Target ship data
 * @returns CPA/TCPA results
 */
export function calculateCPA(own: ShipData, target: TargetData): CPAResult {
  // Convert to radians
  const ownCourseRad = own.course * Math.PI / 180;
  const tgtCourseRad = target.course * Math.PI / 180;
  const tgtBearingRad = target.bearing * Math.PI / 180;
  
  // Target position relative to own ship
  const targetX = target.range * Math.sin(tgtBearingRad);
  const targetY = target.range * Math.cos(tgtBearingRad);
  
  // Velocity components
  const ownVx = own.speed * Math.sin(ownCourseRad);
  const ownVy = own.speed * Math.cos(ownCourseRad);
  const tgtVx = target.speed * Math.sin(tgtCourseRad);
  const tgtVy = target.speed * Math.cos(tgtCourseRad);
  
  // Relative velocity
  const relVx = tgtVx - ownVx;
  const relVy = tgtVy - ownVy;
  
  // Time to CPA
  // TCPA = -(r · v) / |v|² where r is relative position and v is relative velocity
  const dotProduct = targetX * relVx + targetY * relVy;
  const relSpeedSquared = relVx * relVx + relVy * relVy;
  
  let tcpa: number;
  if (relSpeedSquared < 0.0001) {
    // Ships have nearly same velocity, CPA is now
    tcpa = 0;
  } else {
    tcpa = -dotProduct / relSpeedSquared;
  }
  
  // Position at CPA
  const cpaX = targetX + relVx * tcpa;
  const cpaY = targetY + relVy * tcpa;
  
  // CPA distance
  const cpaDistance = Math.sqrt(cpaX * cpaX + cpaY * cpaY);
  
  // CPA bearing
  let cpaBearing = Math.atan2(cpaX, cpaY) * 180 / Math.PI;
  if (cpaBearing < 0) cpaBearing += 360;
  
  // Determine status
  let status: CPAResult['status'];
  if (tcpa < 0) {
    status = 'PASSED';
  } else if (cpaDistance < 0.5) {
    status = 'DANGER';
  } else if (cpaDistance < 2.0) {
    status = 'CAUTION';
  } else {
    status = 'SAFE';
  }
  
  return {
    cpaDistance,
    tcpa,
    cpaBearing,
    status
  };
}

/**
 * Calculate ETA (Estimated Time of Arrival)
 * @param departure Departure date/time
 * @param distance Distance in nautical miles
 * @param speed Speed in knots
 * @returns ETA results
 */
export function calculateETA(
  departure: Date,
  distance: number,
  speed: number
): ETAResult {
  if (speed <= 0) {
    throw new Error('Speed must be greater than 0');
  }
  
  // Travel time in hours
  const travelTimeHours = distance / speed;
  
  // ETA
  const eta = new Date(departure.getTime() + travelTimeHours * 3600 * 1000);
  
  // Format ETA
  const day = eta.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[eta.getMonth()];
  const year = eta.getFullYear();
  const hours = eta.getHours().toString().padStart(2, '0');
  const minutes = eta.getMinutes().toString().padStart(2, '0');
  
  const formattedETA = `${day} ${month} ${year} ${hours}:${minutes} LT`;
  
  // Duration text
  const totalMinutes = Math.round(travelTimeHours * 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hrs = Math.floor((totalMinutes % (24 * 60)) / 60);
  const mins = totalMinutes % 60;
  
  let durationText = '';
  if (days > 0) durationText += `${days}d `;
  if (hrs > 0) durationText += `${hrs}h `;
  if (mins > 0 || durationText === '') durationText += `${mins}m`;
  
  return {
    eta,
    travelTimeHours,
    formattedETA,
    durationText: durationText.trim()
  };
}

/**
 * Format TCPA for display
 * @param tcpa Time to CPA in hours
 * @returns Formatted string
 */
export function formatTCPA(tcpa: number): string {
  if (tcpa < 0) {
    const absHours = Math.abs(tcpa);
    const hours = Math.floor(absHours);
    const minutes = Math.round((absHours - hours) * 60);
    return `${hours}h ${minutes}m ago`;
  }
  
  const hours = Math.floor(tcpa);
  const minutes = Math.round((tcpa - hours) * 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Normalize angle to 0-360 degrees
 */
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

/**
 * Calculate relative bearing
 * @param trueBearing True bearing to target
 * @param ownCourse Own ship's course
 * @returns Relative bearing (-180 to +180, positive = starboard)
 */
export function calculateRelativeBearing(
  trueBearing: number,
  ownCourse: number
): number {
  let rel = trueBearing - ownCourse;
  while (rel > 180) rel -= 360;
  while (rel < -180) rel += 360;
  return rel;
}

/**
 * Star Finder - Simplified
 * For celestial navigation
 * Uses approximate positions of major navigational stars
 */

export interface Star {
  name: string;
  shName: string; // SHA (Sidereal Hour Angle)
  dec: number;    // Declination
  magnitude: number;
}

// Major navigational stars with approximate positions (valid for ~2025)
// SHA and Dec are approximate and change slowly over years
export const NAVIGATIONAL_STARS: Star[] = [
  { name: 'Alpheratz', shName: 'α Andromedae', dec: 29.1, magnitude: 2.1 },
  { name: 'Ankaa', shName: 'α Phoenicis', dec: -42.3, magnitude: 2.4 },
  { name: 'Schedar', shName: 'α Cassiopeiae', dec: 56.5, magnitude: 2.2 },
  { name: 'Diphda', shName: 'β Ceti', dec: -17.9, magnitude: 2.0 },
  { name: 'Achernar', shName: 'α Eridani', dec: -57.2, magnitude: 0.5 },
  { name: 'Hamal', shName: 'α Arietis', dec: 23.5, magnitude: 2.0 },
  { name: 'Polaris', shName: 'α Ursae Minoris', dec: 89.3, magnitude: 2.0 },
  { name: 'Mirfak', shName: 'α Persei', dec: 49.9, magnitude: 1.8 },
  { name: 'Aldebaran', shName: 'α Tauri', dec: 16.5, magnitude: 0.9 },
  { name: 'Rigel', shName: 'β Orionis', dec: -8.2, magnitude: 0.1 },
  { name: 'Capella', shName: 'α Aurigae', dec: 46.0, magnitude: 0.1 },
  { name: 'Bellatrix', shName: 'γ Orionis', dec: 6.3, magnitude: 1.6 },
  { name: 'Elnath', shName: 'β Tauri', dec: 28.6, magnitude: 1.7 },
  { name: 'Sirius', shName: 'α Canis Majoris', dec: -16.7, magnitude: -1.5 },
  { name: 'Betelgeuse', shName: 'α Orionis', dec: 7.4, magnitude: 0.5 },
  { name: 'Procyon', shName: 'α Canis Minoris', dec: 5.2, magnitude: 0.4 },
  { name: 'Pollux', shName: 'β Geminorum', dec: 28.0, magnitude: 1.2 },
  { name: 'Regulus', shName: 'α Leonis', dec: 11.9, magnitude: 1.4 },
  { name: 'Dubhe', shName: 'α Ursae Majoris', dec: 61.8, magnitude: 1.8 },
  { name: 'Denebola', shName: 'β Leonis', dec: 14.6, magnitude: 2.1 },
  { name: 'Spica', shName: 'α Virginis', dec: -11.2, magnitude: 1.0 },
  { name: 'Arcturus', shName: 'α Bootis', dec: 19.2, magnitude: -0.1 },
  { name: 'Alphecca', shName: 'α Coronae Borealis', dec: 26.7, magnitude: 2.2 },
  { name: 'Antares', shName: 'α Scorpii', dec: -26.4, magnitude: 1.0 },
  { name: 'Vega', shName: 'α Lyrae', dec: 38.8, magnitude: 0.0 },
  { name: 'Altair', shName: 'α Aquilae', dec: 8.9, magnitude: 0.8 },
  { name: 'Deneb', shName: 'α Cygni', dec: 45.3, magnitude: 1.3 },
  { name: 'Fomalhaut', shName: 'α Piscis Austrini', dec: -29.6, magnitude: 1.2 },
];

/**
 * Calculate Local Hour Angle (LHA) of Aries
 * Approximate formula
 */
export function getLHAries(date: Date, longitude: number): number {
  // Greenwich Sidereal Time at 0h UT (approximate)
  const year = date.getUTCFullYear();
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Approximate GST at 0h UT
  const gst0h = 100.46 + 0.985647 * dayOfYear;
  
  // Add time component
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const gst = gst0h + 15.04107 * hours;
  
  // LHA Aries = GST - Longitude (East positive)
  let lha = gst - longitude;
  
  // Normalize to 0-360
  while (lha < 0) lha += 360;
  while (lha >= 360) lha -= 360;
  
  return lha;
}

/**
 * Calculate star's Local Hour Angle
 */
export function getStarLHA(lhaAries: number, starSHA: number): number {
  let lha = lhaAries - starSHA;
  while (lha < 0) lha += 360;
  while (lha >= 360) lha -= 360;
  return lha;
}

/**
 * Calculate star's altitude
 * sin(Alt) = sin(Lat)*sin(Dec) + cos(Lat)*cos(Dec)*cos(LHA)
 */
export function calculateStarAltitude(
  latitude: number,
  starDec: number,
  starLHA: number
): number {
  const latRad = latitude * Math.PI / 180;
  const decRad = starDec * Math.PI / 180;
  const lhaRad = starLHA * Math.PI / 180;
  
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + 
                 Math.cos(latRad) * Math.cos(decRad) * Math.cos(lhaRad);
  
  return Math.asin(sinAlt) * 180 / Math.PI;
}

/**
 * Calculate star's azimuth
 * cos(Az) = (sin(Dec) - sin(Lat)*sin(Alt)) / (cos(Lat)*cos(Alt))
 */
export function calculateStarAzimuth(
  latitude: number,
  starDec: number,
  starLHA: number,
  altitude: number
): number {
  const latRad = latitude * Math.PI / 180;
  const decRad = starDec * Math.PI / 180;
  const altRad = altitude * Math.PI / 180;
  
  const cosAz = (Math.sin(decRad) - Math.sin(latRad) * Math.sin(altRad)) /
                (Math.cos(latRad) * Math.cos(altRad));
  
  // Clamp to valid range
  if (cosAz > 1) return 0;
  if (cosAz < -1) return 180;
  
  let azimuth = Math.acos(cosAz) * 180 / Math.PI;
  
  // Determine if azimuth is N->E or N->W based on LHA
  if (starLHA > 180) {
    azimuth = 360 - azimuth;
  }
  
  return azimuth;
}

/**
 * Find visible stars (altitude > 0)
 */
export function findVisibleStars(
  latitude: number,
  longitude: number,
  date: Date,
  minAltitude: number = 10
): { star: Star; altitude: number; azimuth: number }[] {
  const lhaAries = getLHAries(date, longitude);
  const results: { star: Star; altitude: number; azimuth: number }[] = [];
  
  for (const star of NAVIGATIONAL_STARS) {
    // Approximate SHA from Dec (simplified - in reality need proper SHA)
    // For this simplified version, we'll use a lookup or approximation
    const starSHA = getApproximateSHA(star.name);
    const lha = getStarLHA(lhaAries, starSHA);
    const altitude = calculateStarAltitude(latitude, star.dec, lha);
    
    if (altitude > minAltitude) {
      const azimuth = calculateStarAzimuth(latitude, star.dec, lha, altitude);
      results.push({ star, altitude, azimuth });
    }
  }
  
  // Sort by altitude (highest first)
  return results.sort((a, b) => b.altitude - a.altitude);
}

/**
 * Approximate SHA for major stars (simplified lookup)
 */
function getApproximateSHA(starName: string): number {
  const shaTable: Record<string, number> = {
    'Alpheratz': 358, 'Ankaa': 354, 'Schedar': 350, 'Diphda': 349,
    'Achernar': 336, 'Hamal': 328, 'Polaris': 319, 'Mirfak': 309,
    'Aldebaran': 291, 'Rigel': 282, 'Capella': 281, 'Bellatrix': 279,
    'Elnath': 279, 'Sirius': 259, 'Betelgeuse': 271, 'Procyon': 245,
    'Pollux': 244, 'Regulus': 208, 'Dubhe': 194, 'Denebola': 183,
    'Spica': 159, 'Arcturus': 146, 'Alphecca': 127, 'Antares': 113,
    'Vega': 81, 'Altair': 63, 'Deneb': 50, 'Fomalhaut': 16,
  };
  return shaTable[starName] || 0;
}

/**
 * Identify star from observed altitude and azimuth
 * Returns closest matching star
 */
export function identifyStar(
  observedAltitude: number,
  observedAzimuth: number,
  latitude: number,
  longitude: number,
  date: Date
): { star: Star; calculatedAlt: number; calculatedAz: number; error: number } | null {
  const visibleStars = findVisibleStars(latitude, longitude, date, -10);
  
  let bestMatch = null;
  let minError = Infinity;
  
  for (const vs of visibleStars) {
    const altError = Math.abs(vs.altitude - observedAltitude);
    // Normalize azimuth difference
    let azError = Math.abs(vs.azimuth - observedAzimuth);
    if (azError > 180) azError = 360 - azError;
    
    const totalError = altError + azError;
    
    if (totalError < minError) {
      minError = totalError;
      bestMatch = {
        star: vs.star,
        calculatedAlt: vs.altitude,
        calculatedAz: vs.azimuth,
        error: totalError
      };
    }
  }
  
  return bestMatch;
}

/**
 * Star data with RA/Dec for simplified calculations
 */
export interface StarData {
  name: string;
  ra: number;        // Right Ascension in degrees
  dec: number;       // Declination in degrees
  magnitude: number;
  constellation: string;
}

/**
 * Get list of bright stars for navigation
 */
export function getBrightStars(): StarData[] {
  return [
    { name: 'Sirius', ra: 101.29, dec: -16.72, magnitude: -1.46, constellation: 'Canis Major' },
    { name: 'Canopus', ra: 95.99, dec: -52.70, magnitude: -0.74, constellation: 'Carina' },
    { name: 'Arcturus', ra: 213.92, dec: 19.18, magnitude: -0.05, constellation: 'Bootes' },
    { name: 'Vega', ra: 279.23, dec: 38.78, magnitude: 0.03, constellation: 'Lyra' },
    { name: 'Capella', ra: 79.17, dec: 46.00, magnitude: 0.08, constellation: 'Auriga' },
    { name: 'Rigel', ra: 78.63, dec: -8.20, magnitude: 0.13, constellation: 'Orion' },
    { name: 'Procyon', ra: 114.83, dec: 5.22, magnitude: 0.34, constellation: 'Canis Minor' },
    { name: 'Betelgeuse', ra: 88.79, dec: 7.41, magnitude: 0.50, constellation: 'Orion' },
    { name: 'Achernar', ra: 335.55, dec: -57.24, magnitude: 0.46, constellation: 'Eridanus' },
    { name: 'Hadar', ra: 210.96, dec: -60.37, magnitude: 0.61, constellation: 'Centaurus' },
    { name: 'Altair', ra: 297.70, dec: 8.87, magnitude: 0.77, constellation: 'Aquila' },
    { name: 'Acrux', ra: 186.65, dec: -63.06, magnitude: 1.33, constellation: 'Crux' },
    { name: 'Aldebaran', ra: 68.98, dec: 16.51, magnitude: 0.85, constellation: 'Taurus' },
    { name: 'Antares', ra: 247.35, dec: -26.43, magnitude: 1.06, constellation: 'Scorpius' },
    { name: 'Spica', ra: 201.30, dec: -11.16, magnitude: 1.04, constellation: 'Virgo' },
    { name: 'Pollux', ra: 116.33, dec: 28.03, magnitude: 1.14, constellation: 'Gemini' },
    { name: 'Fomalhaut', ra: 344.41, dec: -29.62, magnitude: 1.16, constellation: 'Piscis Austrinus' },
    { name: 'Deneb', ra: 49.85, dec: 45.28, magnitude: 1.25, constellation: 'Cygnus' },
    { name: 'Mimosa', ra: 191.93, dec: -59.69, magnitude: 1.25, constellation: 'Crux' },
    { name: 'Regulus', ra: 152.09, dec: 11.97, magnitude: 1.36, constellation: 'Leo' },
    { name: 'Adhara', ra: 104.66, dec: -28.97, magnitude: 1.50, constellation: 'Canis Major' },
    { name: 'Castor', ra: 113.65, dec: 31.89, magnitude: 1.58, constellation: 'Gemini' },
    { name: 'Gacrux', ra: 187.79, dec: -57.11, magnitude: 1.64, constellation: 'Crux' },
    { name: 'Bellatrix', ra: 81.28, dec: 6.35, magnitude: 1.64, constellation: 'Orion' },
    { name: 'Elnath', ra: 81.57, dec: 28.61, magnitude: 1.65, constellation: 'Taurus' },
    { name: 'Miaplacidus', ra: 138.30, dec: -69.72, magnitude: 1.68, constellation: 'Carina' },
    { name: 'Alnilam', ra: 84.05, dec: -1.20, magnitude: 1.69, constellation: 'Orion' },
    { name: 'Alnair', ra: 332.06, dec: -46.96, magnitude: 1.74, constellation: 'Grus' },
    { name: 'Alnitak', ra: 85.19, dec: -1.94, magnitude: 1.74, constellation: 'Orion' },
    { name: 'Dubhe', ra: 165.93, dec: 61.75, magnitude: 1.81, constellation: 'Ursa Major' },
    { name: 'Alioth', ra: 193.51, dec: 55.96, magnitude: 1.77, constellation: 'Ursa Major' },
    { name: 'Peacock', ra: 306.41, dec: -56.74, magnitude: 1.94, constellation: 'Pavo' },
    { name: 'Polaris', ra: 37.95, dec: 89.26, magnitude: 1.97, constellation: 'Ursa Minor' },
  ];
}

/**
 * Calculate star position (altitude and azimuth)
 * LHA = LST - RA (Local Hour Angle)
 * sin(Alt) = sin(Dec)·sin(Lat) + cos(Dec)·cos(Lat)·cos(LHA)
 * cos(Az) = (sin(Dec) - sin(Alt)·sin(Lat)) / (cos(Alt)·cos(Lat))
 */
export function calculateStarPosition(
  latitude: number,
  lst: number,  // Local Sidereal Time in degrees
  ra: number,   // Right Ascension in degrees
  dec: number   // Declination in degrees
): { altitude: number; azimuth: number } {
  // Calculate LHA
  let lha = lst - ra;
  while (lha < 0) lha += 360;
  while (lha >= 360) lha -= 360;
  
  const latRad = latitude * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  const lhaRad = lha * Math.PI / 180;
  
  // Calculate altitude
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + 
                 Math.cos(latRad) * Math.cos(decRad) * Math.cos(lhaRad);
  const altitude = Math.asin(sinAlt) * 180 / Math.PI;
  
  // Calculate azimuth
  const cosAlt = Math.cos(altitude * Math.PI / 180);
  let azimuth = 0;
  
  if (Math.abs(cosAlt) > 0.001) {
    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / 
                  (Math.cos(latRad) * cosAlt);
    // Clamp to valid range
    const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
    azimuth = Math.acos(clampedCosAz) * 180 / Math.PI;
    
    // Determine if azimuth is measured from N->E or N->W
    if (Math.sin(lhaRad) > 0) {
      azimuth = 360 - azimuth;
    }
  }
  
  return { altitude, azimuth };
}

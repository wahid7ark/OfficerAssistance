/**
 * Paint Consumption Calculator
 * For marine vessel painting
 */

export interface PaintArea {
  name: string;
  area: number;      // m²
  consumption: number; // L/m² per coat
  coats: number;
}

export interface PaintResult {
  totalArea: number;
  totalPaint: number;
  areas: { name: string; area: number; paint: number }[];
}

// Standard consumption rates (L/m² per coat) - can be customized
export const STANDARD_CONSUMPTION = {
  hull: 0.35,      // Antifouling
  deck: 0.25,      // Deck paint
  superstructure: 0.30, // Topside
  tank: 0.40,      // Tank coating
  bilge: 0.45,     // Bilge area
};

/**
 * Calculate paint required for an area
 */
export function calculatePaintForArea(
  area: number,
  consumption: number,
  coats: number
): number {
  return area * consumption * coats;
}

/**
 * Calculate total paint for multiple areas
 */
export function calculateTotalPaint(areas: PaintArea[]): PaintResult {
  let totalArea = 0;
  let totalPaint = 0;
  const results: { name: string; area: number; paint: number }[] = [];

  for (const area of areas) {
    const paint = calculatePaintForArea(area.area, area.consumption, area.coats);
    totalArea += area.area;
    totalPaint += paint;
    results.push({
      name: area.name,
      area: area.area,
      paint: paint
    });
  }

  return {
    totalArea,
    totalPaint,
    areas: results
  };
}

/**
 * Calculate with wastage factor
 */
export function calculateWithWastage(
  paintLiters: number,
  wastagePercent: number = 10
): number {
  return paintLiters * (1 + wastagePercent / 100);
}

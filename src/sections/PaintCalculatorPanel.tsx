import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateTotalPaint, calculateWithWastage } from '@/lib/paint';
import { Paintbrush, Plus, Trash2, Download } from 'lucide-react';

interface PaintAreaInput {
  id: string;
  name: string;
  area: string;
  consumption: string;
  coats: string;
}

export function PaintCalculatorPanel() {
  const [areas, setAreas] = useState<PaintAreaInput[]>([
    { id: '1', name: 'Hull Bottom', area: '', consumption: '0.35', coats: '2' },
  ]);
  const [wastage, setWastage] = useState('10');
  const [result, setResult] = useState<{
    totalArea: number;
    totalPaint: number;
    withWastage: number;
    areas: { name: string; area: number; paint: number }[];
  } | null>(null);

  const addArea = () => {
    setAreas([...areas, { 
      id: Date.now().toString(), 
      name: '', 
      area: '', 
      consumption: '0.35', 
      coats: '2' 
    }]);
  };

  const removeArea = (id: string) => {
    if (areas.length > 1) {
      setAreas(areas.filter(a => a.id !== id));
    }
  };

  const updateArea = (id: string, field: keyof PaintAreaInput, value: string) => {
    setAreas(areas.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const calculate = useCallback(() => {
    const validAreas = areas
      .filter(a => a.name && parseFloat(a.area) > 0)
      .map(a => ({
        name: a.name,
        area: parseFloat(a.area),
        consumption: parseFloat(a.consumption) || 0.35,
        coats: parseInt(a.coats) || 2
      }));

    if (validAreas.length === 0) return;

    const calc = calculateTotalPaint(validAreas);
    const withWast = calculateWithWastage(calc.totalPaint, parseFloat(wastage) || 10);

    setResult({
      totalArea: calc.totalArea,
      totalPaint: calc.totalPaint,
      withWastage: withWast,
      areas: calc.areas
    });
  }, [areas, wastage]);

  const exportReport = () => {
    if (!result) return;
    
    const report = `
PAINT CONSUMPTION REPORT
========================

AREAS:
${result.areas.map(a => `- ${a.name}: ${a.area.toFixed(2)} m² = ${a.paint.toFixed(2)} L`).join('\n')}

SUMMARY:
- Total Area: ${result.totalArea.toFixed(2)} m²
- Total Paint (without wastage): ${result.totalPaint.toFixed(2)} L
- Wastage: ${wastage}%
- Total Paint (with wastage): ${result.withWastage.toFixed(2)} L

Report generated: ${new Date().toLocaleString()}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PaintReport_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <Paintbrush className="w-12 h-12 mx-auto text-[#00eaff] mb-2" />
        <h2 className="text-xl font-bold text-[#00eaff]">Paint Calculator</h2>
        <p className="text-sm text-[#7feaff]">Marine Paint Consumption</p>
      </div>

      {/* Wastage */}
      <div className="bg-[#021019] rounded-xl p-4 border border-[#00eaff33]">
        <Label className="text-[#7fd3ff] text-sm">Wastage (%)</Label>
        <Input
          type="number"
          value={wastage}
          onChange={(e) => setWastage(e.target.value)}
          className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
          min={0}
          max={50}
        />
      </div>

      {/* Areas */}
      <div className="space-y-3">
        {areas.map((area, index) => (
          <div key={area.id} className="bg-[#021019] rounded-xl p-4 border border-[#00eaff33]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#7fd3ff] text-sm">Area #{index + 1}</span>
              {areas.length > 1 && (
                <button 
                  onClick={() => removeArea(area.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Area name (e.g. Hull Bottom)"
                value={area.name}
                onChange={(e) => updateArea(area.id, 'name', e.target.value)}
                className="bg-[#000c14] border-[#00eaff33] text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[#7fd3ff] text-xs">Area (m²)</Label>
                  <Input
                    type="number"
                    value={area.area}
                    onChange={(e) => updateArea(area.id, 'area', e.target.value)}
                    className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
                    min={0}
                    step={0.1}
                  />
                </div>
                <div>
                  <Label className="text-[#7fd3ff] text-xs">L/m²</Label>
                  <Input
                    type="number"
                    value={area.consumption}
                    onChange={(e) => updateArea(area.id, 'consumption', e.target.value)}
                    className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
                    min={0.1}
                    step={0.01}
                  />
                </div>
                <div>
                  <Label className="text-[#7fd3ff] text-xs">Coats</Label>
                  <Input
                    type="number"
                    value={area.coats}
                    onChange={(e) => updateArea(area.id, 'coats', e.target.value)}
                    className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
                    min={1}
                    max={5}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Area Button */}
      <Button 
        onClick={addArea}
        variant="outline"
        className="w-full border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Area
      </Button>

      {/* Calculate */}
      <Button 
        onClick={calculate}
        className="w-full bg-[#0a2a3a] text-[#9fe9ff] hover:bg-[#0d3a4d] border border-[#00eaff33] py-6"
      >
        <Paintbrush className="w-5 h-5 mr-2" />
        CALCULATE
      </Button>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="p-4 bg-[#021019] border border-[#00eaff55] rounded-xl">
            <div className="text-center">
              <div className="text-sm text-[#7feaff] mb-1">Total Paint Required</div>
              <div className="text-3xl font-bold text-[#00ffd5]">{result.withWastage.toFixed(2)} L</div>
              <div className="text-sm text-[#7feaff] mt-1">
                (without wastage: {result.totalPaint.toFixed(2)} L)
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#021019] border border-[#00eaff33] rounded-xl">
            <div className="text-[#7fd3ff] font-medium mb-2">Breakdown</div>
            {result.areas.map((a, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-[#7feaff]">{a.name}</span>
                <span className="text-white">{a.area.toFixed(2)} m² = {a.paint.toFixed(2)} L</span>
              </div>
            ))}
            <div className="border-t border-[#00eaff33] mt-2 pt-2 flex justify-between font-medium">
              <span className="text-[#00eaff]">Total Area</span>
              <span className="text-white">{result.totalArea.toFixed(2)} m²</span>
            </div>
          </div>

          <Button 
            onClick={exportReport}
            className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a] py-6"
          >
            <Download className="w-5 h-5 mr-2" />
            EXPORT REPORT
          </Button>
        </div>
      )}
    </div>
  );
}

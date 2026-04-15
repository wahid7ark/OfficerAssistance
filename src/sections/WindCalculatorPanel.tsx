import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  calculateTrueWind, 
  calculateApparentWind, 
  getWindDirectionName,
  getBeaufortScale,
  calculateRelativeWindAngle,
  getPointOfSail
} from '@/lib/wind';
import { Wind, Navigation, ArrowRightLeft, Info } from 'lucide-react';

export function WindCalculatorPanel() {
  const [mode, setMode] = useState<'apparent-to-true' | 'true-to-apparent'>('apparent-to-true');
  
  // Wind inputs
  const [windDirection, setWindDirection] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  
  // Vessel inputs
  const [vesselCourse, setVesselCourse] = useState('');
  const [vesselSpeed, setVesselSpeed] = useState('');
  
  // Results
  const [result, setResult] = useState<{
    direction: number;
    speed: number;
    directionName: string;
    beaufort: { force: number; description: string };
    relativeAngle?: number;
    pointOfSail?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(() => {
    setError(null);
    setResult(null);

    const windDir = parseFloat(windDirection);
    const windSpd = parseFloat(windSpeed);
    const vesselCrs = parseFloat(vesselCourse);
    const vesselSpd = parseFloat(vesselSpeed);

    if ([windDir, windSpd, vesselCrs, vesselSpd].some(isNaN)) {
      setError('Please fill in all fields with valid numbers');
      return;
    }

    if (windDir < 0 || windDir > 360 || vesselCrs < 0 || vesselCrs > 360) {
      setError('Direction must be between 0° and 360°');
      return;
    }

    if (windSpd < 0 || vesselSpd < 0) {
      setError('Speed cannot be negative');
      return;
    }

    try {
      const windInput = { direction: windDir, speed: windSpd };
      
      let calculatedWind;
      if (mode === 'apparent-to-true') {
        calculatedWind = calculateTrueWind(windInput, vesselCrs, vesselSpd);
      } else {
        calculatedWind = calculateApparentWind(windInput, vesselCrs, vesselSpd);
      }

      const relativeAngle = calculateRelativeWindAngle(calculatedWind.direction, vesselCrs);
      
      setResult({
        direction: calculatedWind.direction,
        speed: calculatedWind.speed,
        directionName: getWindDirectionName(calculatedWind.direction),
        beaufort: getBeaufortScale(calculatedWind.speed),
        relativeAngle,
        pointOfSail: getPointOfSail(relativeAngle)
      });
    } catch (err) {
      setError('Calculation error: ' + (err as Error).message);
    }
  }, [windDirection, windSpeed, vesselCourse, vesselSpeed, mode]);

  const swapMode = () => {
    setMode(mode === 'apparent-to-true' ? 'true-to-apparent' : 'apparent-to-true');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <Wind className="w-12 h-12 mx-auto text-[#00eaff] mb-2" />
        <h2 className="text-xl font-bold text-[#00eaff]">Wind Calculator</h2>
        <p className="text-sm text-[#7feaff]">Apparent ↔ True Wind</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-[#021019] rounded-xl border border-[#00eaff33] shadow-[0_0_15px_#00ffd533_inset]">
        <span className="text-sm text-[#7feaff]">
          {mode === 'apparent-to-true' ? 'Apparent → True' : 'True → Apparent'}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={swapMode}
          className="border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a]"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Swap
        </Button>
      </div>

      {/* Input Wind */}
      <div className="bg-[#021019] rounded-xl p-4 border border-[#00eaff33] shadow-[0_0_15px_#00ffd533_inset]">
        <div className="flex items-center gap-2 mb-3 text-[#7fd3ff]">
          <Wind className="w-5 h-5" />
          <span className="font-medium">
            {mode === 'apparent-to-true' ? 'Apparent Wind (measured)' : 'True Wind (actual)'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[#7fd3ff] text-sm">Direction (°)</Label>
            <Input
              type="number"
              placeholder="0-360"
              value={windDirection}
              onChange={(e) => setWindDirection(e.target.value)}
              className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
              min={0}
              max={360}
            />
          </div>
          <div>
            <Label className="text-[#7fd3ff] text-sm">Speed (kts)</Label>
            <Input
              type="number"
              placeholder="knots"
              value={windSpeed}
              onChange={(e) => setWindSpeed(e.target.value)}
              className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </div>

      {/* Vessel Data */}
      <div className="bg-[#021019] rounded-xl p-4 border border-[#00eaff33] shadow-[0_0_15px_#00ffd533_inset]">
        <div className="flex items-center gap-2 mb-3 text-[#7fd3ff]">
          <Navigation className="w-5 h-5" />
          <span className="font-medium">Vessel</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[#7fd3ff] text-sm">Course (°T)</Label>
            <Input
              type="number"
              placeholder="0-360"
              value={vesselCourse}
              onChange={(e) => setVesselCourse(e.target.value)}
              className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
              min={0}
              max={360}
            />
          </div>
          <div>
            <Label className="text-[#7fd3ff] text-sm">Speed (kts)</Label>
            <Input
              type="number"
              placeholder="knots"
              value={vesselSpeed}
              onChange={(e) => setVesselSpeed(e.target.value)}
              className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <Button 
        onClick={calculate}
        className="w-full bg-[#0a2a3a] text-[#9fe9ff] hover:bg-[#0d3a4d] border border-[#00eaff33] py-6"
      >
        <Wind className="w-5 h-5 mr-2" />
        CALCULATE {mode === 'apparent-to-true' ? 'TRUE WIND' : 'APPARENT WIND'}
      </Button>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="p-4 bg-[#021019] border border-[#00eaff55] rounded-xl shadow-[0_0_15px_#00ffd533_inset]">
            <div className="text-center">
              <div className="text-sm text-[#7feaff] mb-1">
                {mode === 'apparent-to-true' ? 'True Wind' : 'Apparent Wind'}
              </div>
              <div className="text-3xl font-bold text-[#00ffd5]">{result.direction.toFixed(1)}°</div>
              <div className="text-lg text-[#00eaff]">{result.directionName}</div>
              <div className="text-xl text-white mt-2">{result.speed.toFixed(1)} kts</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#021019] border border-[#00eaff33] rounded-xl text-center">
              <div className="text-xs text-[#666] mb-1">Beaufort Scale</div>
              <div className="text-lg font-semibold text-[#00eaff]">Force {result.beaufort.force}</div>
              <div className="text-xs text-[#7feaff]">{result.beaufort.description}</div>
            </div>
            <div className="p-3 bg-[#021019] border border-[#00eaff33] rounded-xl text-center">
              <div className="text-xs text-[#666] mb-1">Relative Angle</div>
              <div className="text-lg font-semibold text-[#ffaa00]">{result.relativeAngle?.toFixed(1)}°</div>
              <div className="text-xs text-[#7feaff]">{result.pointOfSail}</div>
            </div>
          </div>

          <div className="p-3 bg-[#021019] border border-[#00eaff33] rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#00eaff] mt-0.5" />
              <div className="text-xs text-[#7feaff]">
                Wind direction indicates where the wind is coming FROM.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

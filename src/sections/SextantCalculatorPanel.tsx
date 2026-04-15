import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  correctStarOrPlanet, 
  correctSun, 
  correctMoon,
  formatDM,
  toMinutes
} from '@/lib/sextant';
import { Telescope, Info, Calculator } from 'lucide-react';

export function SextantCalculatorPanel() {
  const [celestialBody, setCelestialBody] = useState<'star' | 'sun' | 'moon'>('star');
  const [limb, setLimb] = useState<'lower' | 'upper'>('lower');
  
  // Inputs
  const [sextantAltitude, setSextantAltitude] = useState('');
  const [indexError, setIndexError] = useState('');
  const [eyeHeight, setEyeHeight] = useState('');
  const [moonHP, setMoonHP] = useState('');
  
  // Results
  const [result, setResult] = useState<{
    indexCorrection: number;
    dip: number;
    refraction: number;
    parallax?: number;
    semiDiameter?: number;
    totalCorrection: number;
    observedAltitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(() => {
    setError(null);
    setResult(null);

    const hs = parseFloat(sextantAltitude);
    const ie = parseFloat(indexError);
    const height = parseFloat(eyeHeight);

    if ([hs, ie, height].some(isNaN)) {
      setError('Please fill in all required fields');
      return;
    }

    if (hs < 0 || hs > 90) {
      setError('Sextant altitude must be between 0° and 90°');
      return;
    }

    if (height < 0) {
      setError('Eye height cannot be negative');
      return;
    }

    try {
      const observation = {
        sextantAltitude: hs,
        indexError: ie,
        eyeHeight: height
      };

      let corrections;
      if (celestialBody === 'star') {
        corrections = correctStarOrPlanet(observation);
      } else if (celestialBody === 'sun') {
        corrections = correctSun(observation, limb === 'lower');
      } else {
        const hp = parseFloat(moonHP) || 1.0;
        corrections = correctMoon(observation, limb === 'lower', hp);
      }

      setResult(corrections);
    } catch (err) {
      setError('Calculation error: ' + (err as Error).message);
    }
  }, [sextantAltitude, indexError, eyeHeight, celestialBody, limb, moonHP]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <Telescope className="w-12 h-12 mx-auto text-[#00eaff] mb-2" />
        <h2 className="text-xl font-bold text-[#00eaff]">Sextant Corrections</h2>
        <p className="text-sm text-[#7feaff]">Altitude Corrections for Celestial Navigation</p>
      </div>

      {/* Celestial Body Selection */}
      <div className="bg-[#021019] rounded-xl p-4 border border-[#00eaff33] shadow-[0_0_15px_#00ffd533_inset]">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[#7fd3ff] text-sm">Celestial Body</Label>
            <Select 
              value={celestialBody} 
              onValueChange={(v) => setCelestialBody(v as 'star' | 'sun' | 'moon')}
            >
              <SelectTrigger className="bg-[#000c14] border-[#00eaff33] text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#021019] border-[#00eaff33]">
                <SelectItem value="star" className="text-white">Star / Planet</SelectItem>
                <SelectItem value="sun" className="text-white">Sun</SelectItem>
                <SelectItem value="moon" className="text-white">Moon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(celestialBody === 'sun' || celestialBody === 'moon') && (
            <div>
              <Label className="text-[#7fd3ff] text-sm">Limb</Label>
              <Select 
                value={limb} 
                onValueChange={(v) => setLimb(v as 'lower' | 'upper')}
              >
                <SelectTrigger className="bg-[#000c14] border-[#00eaff33] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#021019] border-[#00eaff33]">
                  <SelectItem value="lower" className="text-white">Lower Limb</SelectItem>
                  <SelectItem value="upper" className="text-white">Upper Limb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Moon HP (only for Moon) */}
        {celestialBody === 'moon' && (
          <div className="mt-3">
            <Label className="text-[#7fd3ff] text-sm">Moon Horizontal Parallax (°)</Label>
            <Input
              placeholder="Default: 1.0°"
              value={moonHP}
              onChange={(e) => setMoonHP(e.target.value)}
              className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
              min={0.9}
              max={1.1}
              step={0.001}
            />
            <div className="text-xs text-[#666] mt-1">
              From Nautical Almanac (typically 0.9° - 1.1°)
            </div>
          </div>
        )}
      </div>

      {/* Sextant Altitude */}
      <div className="bg-[#021019] rounded-xl p-4 border border-[#00eaff33] shadow-[0_0_15px_#00ffd533_inset]">
        <Label className="text-[#7fd3ff] text-sm">Sextant Altitude (Hs)</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            placeholder="Degrees"
            value={sextantAltitude}
            onChange={(e) => setSextantAltitude(e.target.value)}
            className="bg-[#000c14] border-[#00eaff33] text-white text-center"
            min={0}
            max={90}
            step={0.1}
          />
          <span className="text-[#7feaff]">°</span>
        </div>
      </div>

      {/* Index Error */}
      <div className="bg-[#021019] rounded-xl p-4 border border-[#00eaff33] shadow-[0_0_15px_#00ffd533_inset]">
        <Label className="text-[#7fd3ff] text-sm">Index Error</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            placeholder="Minutes"
            value={indexError}
            onChange={(e) => setIndexError(e.target.value)}
            className="bg-[#000c14] border-[#00eaff33] text-white text-center"
            step={0.1}
          />
          <span className="text-[#7feaff]">'</span>
        </div>
        <div className="text-xs text-[#666] mt-1">
          On the arc = positive, Off the arc = negative
        </div>
      </div>

      {/* Eye Height */}
      <div className="bg-[#021019] rounded-xl p-4 border border-[#00eaff33] shadow-[0_0_15px_#00ffd533_inset]">
        <Label className="text-[#7fd3ff] text-sm">Height of Eye</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            placeholder="Meters"
            value={eyeHeight}
            onChange={(e) => setEyeHeight(e.target.value)}
            className="bg-[#000c14] border-[#00eaff33] text-white text-center"
            min={0}
            step={0.1}
          />
          <span className="text-[#7feaff]">m</span>
        </div>
      </div>

      {/* Calculate Button */}
      <Button 
        onClick={calculate}
        className="w-full bg-[#0a2a3a] text-[#9fe9ff] hover:bg-[#0d3a4d] border border-[#00eaff33] py-6"
      >
        <Calculator className="w-5 h-5 mr-2" />
        CALCULATE CORRECTIONS
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
              <div className="text-sm text-[#7feaff] mb-1">Observed Altitude (Ho)</div>
              <div className="text-3xl font-bold text-[#00ffd5]">{formatDM(result.observedAltitude)}</div>
              <div className="text-lg text-[#00eaff]">{result.observedAltitude.toFixed(4)}°</div>
            </div>
          </div>
          
          <div className="p-4 bg-[#021019] border border-[#00eaff33] rounded-xl">
            <div className="text-sm font-medium text-[#7fd3ff] mb-2">Corrections Breakdown</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#7feaff]">Index Correction:</span>
                <span className={result.indexCorrection >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>
                  {result.indexCorrection >= 0 ? '+' : ''}{toMinutes(result.indexCorrection).toFixed(1)}'
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7feaff]">Dip:</span>
                <span className="text-[#ff4444]">{toMinutes(result.dip).toFixed(1)}'</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7feaff]">Refraction:</span>
                <span className="text-[#ff4444]">{toMinutes(result.refraction).toFixed(1)}'</span>
              </div>
              {result.parallax !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[#7feaff]">Parallax:</span>
                  <span className="text-[#00ff88]">+{toMinutes(result.parallax).toFixed(1)}'</span>
                </div>
              )}
              {result.semiDiameter !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[#7feaff]">Semi-Diameter:</span>
                  <span className={result.semiDiameter >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>
                    {result.semiDiameter >= 0 ? '+' : ''}{toMinutes(result.semiDiameter).toFixed(1)}'
                  </span>
                </div>
              )}
              <div className="border-t border-[#00eaff33] pt-1 mt-1 flex justify-between font-medium">
                <span className="text-[#7fd3ff]">Total Correction:</span>
                <span className={result.totalCorrection >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>
                  {result.totalCorrection >= 0 ? '+' : ''}{toMinutes(result.totalCorrection).toFixed(1)}'
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#021019] border border-[#00eaff33] rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#00eaff] mt-0.5" />
              <div className="text-xs text-[#7feaff]">
                <strong className="text-[#00eaff]">Formula:</strong> Ho = Hs + IC + Dip + R ± SD + P
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

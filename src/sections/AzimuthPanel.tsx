import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateSunAzimuth } from '@/lib/azimuth';
import { Compass, Sunrise, Sunset, Info } from 'lucide-react';

export function AzimuthPanel() {
  const [latitude, setLatitude] = useState('');
  const [date, setDate] = useState('');
  const [sunrise, setSunrise] = useState<{
    declination: number;
    amplitude: number;
    azimuth: number;
    cardinal: string;
  } | null>(null);
  const [sunset, setSunset] = useState<{
    declination: number;
    amplitude: number;
    azimuth: number;
    cardinal: string;
  } | null>(null);

  const calculate = useCallback(() => {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) return;

    const calcDate = date ? new Date(date) : new Date();
    
    setSunrise(calculateSunAzimuth(lat, calcDate, true));
    setSunset(calculateSunAzimuth(lat, calcDate, false));
  }, [latitude, date]);

  const setToday = () => {
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <Compass className="w-12 h-12 mx-auto text-[#00eaff] mb-2" />
        <h2 className="text-xl font-bold text-[#00eaff]">True Azimuth</h2>
        <p className="text-sm text-[#7feaff]">Sun's Azimuth at Rising/Setting</p>
      </div>

      {/* Inputs */}
      <div className="bg-[#021019] rounded-xl p-4 border border-[#00eaff33]">
        <div className="space-y-3">
          <div>
            <Label className="text-[#7fd3ff] text-sm">Latitude (°)</Label>
            <Input
              type="number"
              placeholder="-90 to +90"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
              min={-90}
              max={90}
              step={0.1}
            />
          </div>
          <div>
            <Label className="text-[#7fd3ff] text-sm">Date</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#000c14] border-[#00eaff33] text-white flex-1"
              />
              <Button 
                variant="outline" 
                onClick={setToday}
                className="border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a]"
              >
                Today
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calculate */}
      <Button 
        onClick={calculate}
        className="w-full bg-[#0a2a3a] text-[#9fe9ff] hover:bg-[#0d3a4d] border border-[#00eaff33] py-6"
      >
        <Compass className="w-5 h-5 mr-2" />
        CALCULATE
      </Button>

      {/* Results */}
      {sunrise && sunset && (
        <div className="space-y-3">
          {/* Sun's Declination */}
          <div className="p-3 bg-[#021019] border border-[#00eaff33] rounded-xl text-center">
            <div className="text-sm text-[#7feaff]">Sun's Declination</div>
            <div className="text-xl font-bold text-[#ffaa00]">
              {sunrise.declination >= 0 ? '+' : ''}{sunrise.declination.toFixed(2)}°
            </div>
          </div>

          {/* Sunrise */}
          <div className="p-4 bg-[#021019] border border-[#00eaff33] rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sunrise className="w-5 h-5 text-[#ffaa00]" />
              <span className="text-[#7fd3ff] font-medium">Sunrise</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-[#7feaff]">Amplitude:</div>
              <div className="text-white text-right">
                {sunrise.amplitude >= 0 ? 'E' : 'W'}{Math.abs(sunrise.amplitude).toFixed(2)}°
              </div>
              <div className="text-[#7feaff]">Azimuth:</div>
              <div className="text-[#00ffd5] text-right font-bold">{sunrise.azimuth.toFixed(2)}°</div>
              <div className="text-[#7feaff]">Direction:</div>
              <div className="text-white text-right">{sunrise.cardinal}</div>
            </div>
          </div>

          {/* Sunset */}
          <div className="p-4 bg-[#021019] border border-[#00eaff33] rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sunset className="w-5 h-5 text-[#ff4444]" />
              <span className="text-[#7fd3ff] font-medium">Sunset</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-[#7feaff]">Amplitude:</div>
              <div className="text-white text-right">
                {sunset.amplitude >= 0 ? 'E' : 'W'}{Math.abs(sunset.amplitude).toFixed(2)}°
              </div>
              <div className="text-[#7feaff]">Azimuth:</div>
              <div className="text-[#00ffd5] text-right font-bold">{sunset.azimuth.toFixed(2)}°</div>
              <div className="text-[#7feaff]">Direction:</div>
              <div className="text-white text-right">{sunset.cardinal}</div>
            </div>
          </div>

          {/* Formula */}
          <div className="p-3 bg-[#021019] border border-[#00eaff33] rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#00eaff] mt-0.5" />
              <div className="text-xs text-[#7feaff]">
                <strong className="text-[#00eaff]">Formula:</strong><br/>
                sin(Amp) = sin(Dec) / cos(Lat)<br/>
                Azimuth = 90° ± Amplitude (Sunrise)<br/>
                Azimuth = 270° ± Amplitude (Sunset)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

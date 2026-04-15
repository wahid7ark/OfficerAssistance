import { useState, useCallback } from 'react';
import { Star, Calculator, Info, Moon, Sun, Navigation } from 'lucide-react';
import { calculateStarPosition, getBrightStars } from '../lib/stars';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function StarFinderPanel() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [lst, setLst] = useState(''); // Local Sidereal Time
  const [selectedStar, setSelectedStar] = useState('');
  const [customStar, setCustomStar] = useState({ ra: '', dec: '' });
  const [result, setResult] = useState<{
    altitude: number;
    azimuth: number;
    direction: string;
    starName: string;
  } | null>(null);

  const brightStars = getBrightStars();

  const calculate = useCallback(() => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const localSiderealTime = parseFloat(lst);

    if (isNaN(lat) || isNaN(lon) || isNaN(localSiderealTime)) return;

    let starRA: number;
    let starDec: number;
    let starName: string;

    if (selectedStar && selectedStar !== 'custom') {
      const star = brightStars.find(s => s.name === selectedStar);
      if (!star) return;
      starRA = star.ra;
      starDec = star.dec;
      starName = star.name;
    } else {
      starRA = parseFloat(customStar.ra);
      starDec = parseFloat(customStar.dec);
      if (isNaN(starRA) || isNaN(starDec)) return;
      starName = 'Custom Star';
    }

    const position = calculateStarPosition(lat, localSiderealTime, starRA, starDec);

    // Determine direction
    let direction = '';
    if (position.azimuth >= 337.5 || position.azimuth < 22.5) direction = 'N';
    else if (position.azimuth >= 22.5 && position.azimuth < 67.5) direction = 'NE';
    else if (position.azimuth >= 67.5 && position.azimuth < 112.5) direction = 'E';
    else if (position.azimuth >= 112.5 && position.azimuth < 157.5) direction = 'SE';
    else if (position.azimuth >= 157.5 && position.azimuth < 202.5) direction = 'S';
    else if (position.azimuth >= 202.5 && position.azimuth < 247.5) direction = 'SW';
    else if (position.azimuth >= 247.5 && position.azimuth < 292.5) direction = 'W';
    else direction = 'NW';

    setResult({
      altitude: position.altitude,
      azimuth: position.azimuth,
      direction,
      starName
    });
  }, [latitude, longitude, lst, selectedStar, customStar, brightStars]);

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-gradient-to-br from-cyan-950/40 to-slate-900/40 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-100/80">
              <p className="mb-2"><strong>Rumus Star Finder:</strong></p>
              <ul className="space-y-1 list-disc list-inside">
                <li>LHA = LST - RA (Local Hour Angle)</li>
                <li>sin(Alt) = sin(Dec)·sin(Lat) + cos(Dec)·cos(Lat)·cos(LHA)</li>
                <li>cos(Az) = (sin(Dec) - sin(Alt)·sin(Lat)) / (cos(Alt)·cos(Lat))</li>
              </ul>
              <p className="mt-2 text-xs text-cyan-400/60">
                * LST (Local Sidereal Time) dapat diperoleh dari Nautical Almanac atau aplikasi astronomi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Navigation className="w-5 h-5" />
              Data Observer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-cyan-200">Latitude (°)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="-6.20"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="bg-slate-950/50 border-cyan-500/30 text-cyan-50 placeholder:text-cyan-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-200">Longitude (°)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="106.85"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="bg-slate-950/50 border-cyan-500/30 text-cyan-50 placeholder:text-cyan-500/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-200">Local Sidereal Time (LST)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Contoh: 180.5 (dalam derajat)"
                value={lst}
                onChange={(e) => setLst(e.target.value)}
                className="bg-slate-950/50 border-cyan-500/30 text-cyan-50 placeholder:text-cyan-500/30"
              />
              <p className="text-xs text-cyan-400/60">LST dalam derajat (0-360)</p>
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-200">Pilih Bintang</Label>
              <Select value={selectedStar} onValueChange={setSelectedStar}>
                <SelectTrigger className="bg-slate-950/50 border-cyan-500/30 text-cyan-50">
                  <SelectValue placeholder="Pilih bintang navigasi" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-cyan-500/30">
                  {brightStars.map((star) => (
                    <SelectItem 
                      key={star.name} 
                      value={star.name}
                      className="text-cyan-100 focus:bg-cyan-950/50 focus:text-cyan-50"
                    >
                      {star.name} (Mag: {star.magnitude})
                    </SelectItem>
                  ))}
                  <SelectItem 
                    value="custom"
                    className="text-cyan-100 focus:bg-cyan-950/50 focus:text-cyan-50"
                  >
                    -- Input Manual --
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedStar === 'custom' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-cyan-950/20 rounded-lg border border-cyan-500/20">
                <div className="space-y-2">
                  <Label className="text-cyan-200 text-sm">RA (°)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Right Ascension"
                    value={customStar.ra}
                    onChange={(e) => setCustomStar({ ...customStar, ra: e.target.value })}
                    className="bg-slate-950/50 border-cyan-500/30 text-cyan-50 placeholder:text-cyan-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-cyan-200 text-sm">Dec (°)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Declination"
                    value={customStar.dec}
                    onChange={(e) => setCustomStar({ ...customStar, dec: e.target.value })}
                    className="bg-slate-950/50 border-cyan-500/30 text-cyan-50 placeholder:text-cyan-500/30"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={calculate}
              disabled={!latitude || !longitude || !lst || !selectedStar || 
                (selectedStar === 'custom' && (!customStar.ra || !customStar.dec))}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Hitung Posisi Bintang
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Star className="w-5 h-5" />
              Hasil Perhitungan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-lg text-cyan-400/70">{result.starName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900/40 rounded-lg p-4 text-center border border-cyan-500/20">
                    <p className="text-sm text-cyan-400/70 mb-1">Altitude</p>
                    <p className="text-3xl font-bold text-cyan-300">
                      {result.altitude.toFixed(2)}°
                    </p>
                    <p className="text-xs text-cyan-400/60 mt-1">
                      {result.altitude > 0 ? 'Di atas horizon' : 'Di bawah horizon'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900/40 rounded-lg p-4 text-center border border-cyan-500/20">
                    <p className="text-sm text-cyan-400/70 mb-1">Azimuth</p>
                    <p className="text-3xl font-bold text-cyan-300">
                      {result.azimuth.toFixed(1)}°
                    </p>
                    <p className="text-xs text-cyan-400/60 mt-1">
                      Arah: {result.direction}
                    </p>
                  </div>
                </div>

                {/* Visual indicator */}
                <div className="bg-slate-950/50 rounded-lg p-4 border border-cyan-500/20">
                  <div className="relative w-32 h-32 mx-auto">
                    {/* Compass circle */}
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30" />
                    {/* North indicator */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs text-cyan-400">N</div>
                    {/* Star position */}
                    {result.altitude > 0 && (
                      <div 
                        className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
                        style={{
                          left: `${50 + 40 * Math.sin(result.azimuth * Math.PI / 180)}%`,
                          top: `${50 - 40 * Math.cos(result.azimuth * Math.PI / 180)}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}
                    {/* Center point */}
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-center text-xs text-cyan-400/60 mt-2">
                    Posisi bintang pada kompas (zenith di tengah)
                  </p>
                </div>

                <div className="bg-cyan-950/20 rounded-lg p-3 border border-cyan-500/20">
                  <p className="text-sm text-cyan-300">
                    <strong>Status:</strong>{' '}
                    {result.altitude > 0 ? (
                      <span className="text-emerald-400">Bintang terlihat di atas horizon</span>
                    ) : (
                      <span className="text-rose-400">Bintang di bawah horizon</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-cyan-500/50">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Masukkan data untuk menghitung posisi bintang</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Star List */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400">Daftar Bintang Navigasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/30">
                  <th className="text-left py-2 px-3 text-cyan-400">Nama</th>
                  <th className="text-left py-2 px-3 text-cyan-400">Magnitude</th>
                  <th className="text-left py-2 px-3 text-cyan-400">RA (jam)</th>
                  <th className="text-left py-2 px-3 text-cyan-400">Dec (°)</th>
                  <th className="text-left py-2 px-3 text-cyan-400">Konstelasi</th>
                </tr>
              </thead>
              <tbody>
                {brightStars.map((star) => (
                  <tr key={star.name} className="border-b border-cyan-500/10 hover:bg-cyan-950/20">
                    <td className="py-2 px-3 text-cyan-100 font-medium">{star.name}</td>
                    <td className="py-2 px-3 text-cyan-200">{star.magnitude}</td>
                    <td className="py-2 px-3 text-cyan-200">{(star.ra / 15).toFixed(2)}h</td>
                    <td className="py-2 px-3 text-cyan-200">{star.dec.toFixed(2)}°</td>
                    <td className="py-2 px-3 text-cyan-300/70">{star.constellation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-cyan-400/60 mt-3">
            * Data bintang dari catalog navigasi. Magnitude lebih kecil = bintang lebih terang.
          </p>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-gradient-to-br from-cyan-950/40 to-slate-900/40 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Tips Pengamatan Bintang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-cyan-100/80">
            <li className="flex items-start gap-2">
              <Sun className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Gunakan bintang dengan magnitude {'<'} 2.0 untuk pengamatan yang lebih mudah</span>
            </li>
            <li className="flex items-start gap-2">
              <Sun className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Altair, Vega, dan Deneb membentuk Segitiga Musim Panas (Summer Triangle)</span>
            </li>
            <li className="flex items-start gap-2">
              <Sun className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Canopus dan Achernar adalah bintang navigasi penting di belahan selatan</span>
            </li>
            <li className="flex items-start gap-2">
              <Sun className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Polaris (Utara) selalu berada pada altitude ≈ latitude observer</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

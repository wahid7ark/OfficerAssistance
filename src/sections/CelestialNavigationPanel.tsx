import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/App';
import { Sun, Moon, Star, Calculator, BookOpen, Navigation, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/useToast';

// 57 Navigational Stars data
const NAV_STARS = [
  { name: "Alpheratz", sha: 357.63, dec: 29.09, magnitude: 2.06 },
  { name: "Ankaa", sha: 353.15, dec: -42.13, magnitude: 2.40 },
  { name: "Schedar", sha: 349.87, dec: 56.38, magnitude: 2.24 },
  { name: "Diphda", sha: 348.93, dec: -17.99, magnitude: 2.04 },
  { name: "Achernar", sha: 335.25, dec: -57.07, magnitude: 0.46 },
  { name: "Hamal", sha: 328.03, dec: 23.46, magnitude: 2.01 },
  { name: "Polaris", sha: 316.04, dec: 89.26, magnitude: 1.98 },
  { name: "Menkar", sha: 314.29, dec: 4.09, magnitude: 2.54 },
  { name: "Mirfak", sha: 309.38, dec: 49.86, magnitude: 1.79 },
  { name: "Aldebaran", sha: 290.93, dec: 16.51, magnitude: 0.85 },
  { name: "Rigel", sha: 281.10, dec: -8.20, magnitude: 0.12 },
  { name: "Capella", sha: 280.78, dec: 46.00, magnitude: 0.08 },
  { name: "Bellatrix", sha: 278.56, dec: 6.35, magnitude: 1.64 },
  { name: "Elnath", sha: 278.17, dec: 28.61, magnitude: 1.65 },
  { name: "Alnilam", sha: 275.93, dec: -1.20, magnitude: 1.69 },
  { name: "Betelgeuse", sha: 270.97, dec: 7.41, magnitude: 0.50 },
  { name: "Canopus", sha: 263.67, dec: -52.70, magnitude: -0.74 },
  { name: "Sirius", sha: 258.75, dec: -16.72, magnitude: -1.46 },
  { name: "Adhara", sha: 255.26, dec: -28.98, magnitude: 1.50 },
  { name: "Procyon", sha: 244.93, dec: 5.22, magnitude: 0.38 },
  { name: "Pollux", sha: 243.55, dec: 28.03, magnitude: 1.14 },
  { name: "Avior", sha: 234.16, dec: -59.51, magnitude: 1.86 },
  { name: "Suhail", sha: 222.66, dec: -43.43, magnitude: 2.23 },
  { name: "Miaplacidus", sha: 221.56, dec: -69.72, magnitude: 1.68 },
  { name: "Alphard", sha: 217.79, dec: -8.66, magnitude: 1.99 },
  { name: "Regulus", sha: 207.67, dec: 11.97, magnitude: 1.35 },
  { name: "Dubhe", sha: 194.04, dec: 61.75, magnitude: 1.79 },
  { name: "Denebola", sha: 182.52, dec: 14.57, magnitude: 2.14 },
  { name: "Gienah", sha: 175.94, dec: -17.54, magnitude: 2.58 },
  { name: "Acrux", sha: 173.94, dec: -63.06, magnitude: 1.33 },
  { name: "Gacrux", sha: 172.36, dec: -57.11, magnitude: 1.64 },
  { name: "Alioth", sha: 166.72, dec: 55.96, magnitude: 1.77 },
  { name: "Spica", sha: 158.47, dec: -11.16, magnitude: 0.98 },
  { name: "Alkaid", sha: 152.09, dec: 49.01, magnitude: 1.85 },
  { name: "Hadar", sha: 148.95, dec: -60.84, magnitude: 0.61 },
  { name: "Arcturus", sha: 145.85, dec: 19.18, magnitude: -0.05 },
  { name: "Rigil Kent", sha: 139.74, dec: -60.83, magnitude: -0.01 },
  { name: "Zubenelgenubi", sha: 137.30, dec: -16.04, magnitude: 2.75 },
  { name: "Kochab", sha: 137.10, dec: 74.16, magnitude: 2.07 },
  { name: "Alphecca", sha: 126.40, dec: 26.71, magnitude: 2.23 },
  { name: "Antares", sha: 112.53, dec: -26.43, magnitude: 1.06 },
  { name: "Atria", sha: 107.79, dec: -69.03, magnitude: 1.91 },
  { name: "Sabik", sha: 102.80, dec: -15.73, magnitude: 2.43 },
  { name: "Shaula", sha: 96.80, dec: -34.29, magnitude: 1.62 },
  { name: "Rasalhague", sha: 96.40, dec: 12.56, magnitude: 2.08 },
  { name: "Eltanin", sha: 90.76, dec: 51.49, magnitude: 2.24 },
  { name: "Kaus Australis", sha: 83.56, dec: -34.38, magnitude: 1.85 },
  { name: "Vega", sha: 80.74, dec: 38.78, magnitude: 0.03 },
  { name: "Nunki", sha: 75.81, dec: -26.30, magnitude: 2.05 },
  { name: "Altair", sha: 62.00, dec: 8.87, magnitude: 0.77 },
  { name: "Peacock", sha: 54.27, dec: -56.73, magnitude: 1.94 },
  { name: "Deneb", sha: 49.62, dec: 45.28, magnitude: 1.25 },
  { name: "Enif", sha: 33.64, dec: 9.87, magnitude: 2.38 },
  { name: "Alnair", sha: 28.13, dec: -46.96, magnitude: 1.74 },
  { name: "Fomalhaut", sha: 15.50, dec: -29.62, magnitude: 1.16 },
  { name: "Markab", sha: 13.94, dec: 15.21, magnitude: 2.49 }
];

type Tab = 'almanac' | 'sight' | 'stars';
type Body = 'sun' | 'moon' | 'star';

export function CelestialNavigationPanel() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('almanac');
  const [selectedBody, setSelectedBody] = useState<Body>('sun');

  // Position inputs
  const [latDeg, setLatDeg] = useState(0);
  const [latMin, setLatMin] = useState(0);
  const [latDir, setLatDir] = useState(1);
  const [lonDeg, setLonDeg] = useState(0);
  const [lonMin, setLonMin] = useState(0);
  const [lonDir, setLonDir] = useState(1);
  const [eyeHeight, setEyeHeight] = useState(10);

  // Time inputs
  const [gmtH, setGmtH] = useState(12);
  const [gmtM, setGmtM] = useState(0);
  const [gmtS, setGmtS] = useState(0);

  // Sight Reduction inputs
  const [hsDeg, setHsDeg] = useState(0);
  const [hsMin, setHsMin] = useState(0);
  const [ieMin, setIeMin] = useState(0);
  const [ieOn, setIeOn] = useState(true); // on or off arc
  const [selectedStar, setSelectedStar] = useState(NAV_STARS[0].name);

  // Results
  const [results, setResults] = useState<any>(null);
  const [dayNight, setDayNight] = useState<'day' | 'twilight' | 'night'>('day');

  const translations = {
    id: {
      title: 'Navigasi Celestial',
      almanac: 'Almanak',
      sight: 'Sight Reduction',
      stars: 'Pencari Bintang',
      latitude: 'Latitude',
      longitude: 'Longitude',
      eyeHeight: 'Tinggi Mata',
      gmt: 'Waktu GMT',
      calculate: 'Hitung',
      getGPS: 'Ambil GPS',
      sun: 'Matahari',
      moon: 'Bulan',
      star: 'Bintang',
      gha: 'GHA',
      dec: 'Deklinasi',
      lha: 'LHA',
      hc: 'Hc (Altitud Hitung)',
      zn: 'Zn (Azimuth)',
      intercept: 'Intercept',
      toward: 'Menuju',
      away: 'Menjauh',
      dip: 'Koreksi Dip',
      refraction: 'Refraksi',
      sd: 'Semi-diameter',
      total: 'Total',
      visible: 'Terlihat',
      notVisible: 'Tidak Terlihat',
      day: 'Siang',
      twilight: 'Senja',
      night: 'Malam',
      hs: 'Hs (Sudut Teramati)',
      ie: 'IE (Index Error)',
      ho: 'Ho (Sudut Sejati)',
      drLat: 'DR Lat',
      drLon: 'DR Lon',
      a: 'a (Intercept)',
      z: 'Z (Azimuth)',
      selectedStar: 'Bintang Pilihan'
    },
    en: {
      title: 'Celestial Navigation',
      almanac: 'Almanac',
      sight: 'Sight Reduction',
      stars: 'Star Finder',
      latitude: 'Latitude',
      longitude: 'Longitude',
      eyeHeight: 'Eye Height',
      gmt: 'GMT Time',
      calculate: 'Calculate',
      getGPS: 'Get GPS',
      sun: 'Sun',
      moon: 'Moon',
      star: 'Star',
      gha: 'GHA',
      dec: 'Declination',
      lha: 'LHA',
      hc: 'Hc (Calculated Alt)',
      zn: 'Zn (Azimuth)',
      intercept: 'Intercept',
      toward: 'Toward',
      away: 'Away',
      dip: 'Dip Correction',
      refraction: 'Refraction',
      sd: 'Semi-diameter',
      total: 'Total',
      visible: 'Visible',
      notVisible: 'Not Visible',
      day: 'Day',
      twilight: 'Twilight',
      night: 'Night',
      hs: 'Hs (Sextant Alt)',
      ie: 'IE (Index Error)',
      ho: 'Ho (Observed Alt)',
      drLat: 'DR Lat',
      drLon: 'DR Lon',
      a: 'a (Intercept)',
      z: 'Z (Azimuth)',
      selectedStar: 'Selected Star'
    }
  };

  const t = translations[lang === 'zh' ? 'en' : lang] || translations.en;

  // Math helpers
  const toRad = (deg: number) => deg * Math.PI / 180;
  const toDeg = (rad: number) => rad * 180 / Math.PI;
  const mod360 = (x: number) => { x = x % 360; return x < 0 ? x + 360 : x; };
  const dmm = (deg: number) => {
    const d = Math.floor(Math.abs(deg));
    const m = (Math.abs(deg) - d) * 60;
    return `${d}° ${m.toFixed(1)}' ${deg >= 0 ? 'N' : 'S'}`;
  };

  // Julian Date calculation
  const julianDate = (y: number, m: number, d: number, ut: number) => {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + ut / 24;
  };

  // Sun calculation
  const calcSun = (JD: number, UT: number) => {
    const n = JD - 2451545.0;
    const L0 = (280.460 + 0.9856474 * n) % 360;
    const M = (357.528 + 0.9856003 * n) % 360;
    const C = 1.915 * Math.sin(toRad(M)) + 0.020 * Math.sin(2 * toRad(M));
    const trueLon = (L0 + C) % 360;
    const epsilon = 23.4393 - 0.0000004 * n;
    const y = Math.cos(toRad(epsilon)) * Math.sin(toRad(trueLon));
    const x = Math.cos(toRad(trueLon));
    let alpha = toDeg(Math.atan2(y, x));
    if (alpha < 0) alpha += 360;
    const delta = toDeg(Math.asin(Math.sin(toRad(epsilon)) * Math.sin(toRad(trueLon))));

    // GMST
    const D = JD - 2451545.0;
    let GMST = 6.697374558 + 0.06570982441908 * D + 1.00273790935 * UT;
    GMST = GMST % 24;
    if (GMST < 0) GMST += 24;
    const GHA = mod360(GMST * 15 - alpha);

    return { gha: GHA, dec: delta };
  };

  // Moon calculation (simplified)
  const calcMoon = (JD: number, UT: number) => {
    const T = (JD - 2451545.0) / 36525;
    const Lp = (218.316 + 13.176396 * 365.25 * T) % 360;
    const M = (134.963 + 13.064993 * 365.25 * T) % 360;
    const D = (297.850 + 12.190749 * 365.25 * T) % 360;
    const F = (93.272 + 13.229350 * 365.25 * T) % 360;

    let lon = Lp + 6.289 * Math.sin(toRad(M)) + 1.274 * Math.sin(toRad(2 * D - M)) + 0.658 * Math.sin(toRad(2 * D)) + 0.214 * Math.sin(toRad(2 * M));
    lon = lon % 360;
    const lat = 5.128 * Math.sin(toRad(F));
    const dist = 385001 - 20905 * Math.cos(toRad(M));
    const HP = toDeg(Math.asin(6378.14 / dist)) * 60;
    const dec = toDeg(Math.asin(Math.sin(toRad(23.44)) * Math.sin(toRad(lon))));

    // RA from lon
    let RA = toDeg(Math.atan2(Math.sin(toRad(lon)) * Math.cos(toRad(23.44)), Math.cos(toRad(lon))));
    if (RA < 0) RA += 360;

    // GHA
    const D_val = JD - 2451545.0;
    let GMST = 6.697374558 + 0.06570982441908 * D_val + 1.00273790935 * UT;
    GMST = GMST % 24;
    if (GMST < 0) GMST += 24;
    const gha = mod360(GMST * 15 - RA);

    return { gha, dec, hp: HP, sd: HP * 0.2725 };
  };

  // Calculate altitude and azimuth
  const calcAltAz = (lat: number, dec: number, lha: number) => {
    const latR = toRad(lat);
    const decR = toRad(dec);
    const lhaR = toRad(lha);

    const sinHc = Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR) * Math.cos(lhaR);
    if (Math.abs(sinHc) > 1) return { hc: null, zn: null };
    const hc = toDeg(Math.asin(sinHc));

    const cosH = Math.cos(toRad(hc));
    if (Math.abs(cosH) < 0.0001) return { hc, zn: 0 };

    const sinZ = -Math.sin(lhaR) * Math.cos(decR) / cosH;
    const cosZ = (Math.sin(decR) - Math.sin(latR) * sinHc) / (Math.cos(latR) * cosH);
    let z = toDeg(Math.atan2(sinZ, cosZ));
    if (z < 0) z += 360;

    let zn;
    if (lat >= 0) {
      zn = lha > 180 ? z : 360 - z;
    } else {
      zn = lha < 180 ? 180 + z : 180 - z;
    }
    return { hc, zn: mod360(zn) };
  };

  const getPosition = () => {
    const lat = (latDeg + latMin / 60) * latDir;
    const lon = (lonDeg + lonMin / 60) * lonDir;
    return { lat, lon };
  };

  const calculateAlmanac = () => {
    const { lat, lon } = getPosition();
    const ut = gmtH + gmtM / 60 + gmtS / 3600;
    const now = new Date();
    const JD = julianDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), ut);

    let bodyData: any = {};

    if (selectedBody === 'sun') {
      const sun = calcSun(JD, ut);
      const lha = mod360(sun.gha + lon);
      const pos = calcAltAz(lat, sun.dec, lha);
      bodyData = { ...sun, lha, ...pos, type: 'sun' };

      if (pos.hc !== null) {
        if (pos.hc > 0) setDayNight('day');
        else if (pos.hc > -6) setDayNight('twilight');
        else setDayNight('night');
      }
    } else if (selectedBody === 'moon') {
      const moon = calcMoon(JD, ut);
      const lha = mod360(moon.gha + lon);
      const pos = calcAltAz(lat, moon.dec, lha);
      bodyData = { ...moon, lha, ...pos, type: 'moon' };
    } else {
      const star = NAV_STARS.find(s => s.name === selectedStar);
      if (star) {
        const GMST = (6.697374558 + 0.06570982441908 * (JD - 2451545.0) + 1.00273790935 * ut) * 15;
        const gha = mod360(GMST + star.sha);
        const lha = mod360(gha + lon);
        const pos = calcAltAz(lat, star.dec, lha);
        bodyData = { gha, dec: star.dec, lha, ...pos, sha: star.sha, type: 'star', starName: star.name };
      }
    }

    setResults({ ...bodyData, mode: 'almanac' });
  };

  const calculateSight = () => {
    const { lat, lon } = getPosition();
    const ut = gmtH + gmtM / 60 + gmtS / 3600;
    const now = new Date();
    const JD = julianDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), ut);

    // Calculate Hc (theoretical)
    let theory: any;
    if (selectedBody === 'sun') {
      theory = calcSun(JD, ut);
    } else if (selectedBody === 'moon') {
      theory = calcMoon(JD, ut);
    } else {
      const star = NAV_STARS.find(s => s.name === selectedStar);
      if (star) {
        const GMST = (6.697374558 + 0.06570982441908 * (JD - 2451545.0) + 1.00273790935 * ut) * 15;
        theory = { gha: mod360(GMST + star.sha), dec: star.dec };
      }
    }

    const lha = mod360(theory.gha + lon);
    const pos = calcAltAz(lat, theory.dec, lha);

    if (pos.hc === null) {
      toast.error('Invalid calculation');
      return;
    }

    // Apply corrections to Hs to get Ho
    const hs = hsDeg + hsMin / 60;
    const ie = ieMin / 60 * (ieOn ? 1 : -1);
    const dip = -1.76 * Math.sqrt(eyeHeight);

    // Refraction (simplified)
    let ref = -0.96 / Math.tan(toRad(Math.max(pos.hc, 10)));
    if (pos.hc < 15) {
      ref = -3.515 * (0.1594 + 0.0196 * pos.hc + 0.00002 * pos.hc * pos.hc) / (1 + 0.505 * pos.hc + 0.0845 * pos.hc * pos.hc);
    }

    // SD only for sun/moon
    let sd = 0;
    if (selectedBody === 'sun') sd = 16.0;
    if (selectedBody === 'moon') sd = theory.sd || 0;

    const totalCorr = ie + dip + ref;
    const ho = hs + totalCorr;

    // Intercept
    const intercept = (ho - pos.hc) * 60; // in minutes/nautical miles
    const direction = intercept > 0 ? 'toward' : 'away';

    setResults({
      mode: 'sight',
      hc: pos.hc,
      zn: pos.zn,
      ho,
      hs,
      intercept: Math.abs(intercept),
      direction,
      corrections: { ie, dip, ref, sd, total: totalCorr }
    });
  };

  const getGPS = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not available');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lon = p.coords.longitude;
        setLatDeg(Math.floor(Math.abs(lat)));
        setLatMin((Math.abs(lat) % 1) * 60);
        setLatDir(lat >= 0 ? 1 : -1);
        setLonDeg(Math.floor(Math.abs(lon)));
        setLonMin((Math.abs(lon) % 1) * 60);
        setLonDir(lon >= 0 ? 1 : -1);
        toast.success('GPS position acquired');
      },
      (e) => toast.error('GPS Error: ' + e.message),
      { enableHighAccuracy: true }
    );
  };

  const setNow = () => {
    const now = new Date();
    setGmtH(now.getUTCHours());
    setGmtM(now.getUTCMinutes());
    setGmtS(now.getUTCSeconds());
  };

  return (
    <div className="space-y-3 p-2">
      <div className="text-center mb-3">
        <h2 className="text-lg font-bold text-[#00eaff]">{t.title}</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        <Button
          variant={activeTab === 'almanac' ? 'default' : 'outline'}
          onClick={() => setActiveTab('almanac')}
          className={`flex-1 text-[10px] h-8 ${activeTab === 'almanac' ? 'bg-[#00eaff] text-black' : 'border-[#00eaff33] text-[#7feaff]'}`}
        >
          <BookOpen className="w-3 h-3 mr-1" /> {t.almanac}
        </Button>
        <Button
          variant={activeTab === 'sight' ? 'default' : 'outline'}
          onClick={() => setActiveTab('sight')}
          className={`flex-1 text-[10px] h-8 ${activeTab === 'sight' ? 'bg-[#00eaff] text-black' : 'border-[#00eaff33] text-[#7feaff]'}`}
        >
          <Crosshair className="w-3 h-3 mr-1" /> {t.sight}
        </Button>
        <Button
          variant={activeTab === 'stars' ? 'default' : 'outline'}
          onClick={() => setActiveTab('stars')}
          className={`flex-1 text-[10px] h-8 ${activeTab === 'stars' ? 'bg-[#00eaff] text-black' : 'border-[#00eaff33] text-[#7feaff]'}`}
        >
          <Star className="w-3 h-3 mr-1" /> {t.stars}
        </Button>
      </div>

      {/* Position Input */}
      <Card className="p-3 bg-[#0a2a3a] border-[#00eaff33]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-[#7feaff] font-bold">{t.latitude} / {t.longitude}</span>
          <Button onClick={getGPS} size="sm" className="h-6 text-[10px] bg-[#00c85333] text-[#00c853] hover:bg-[#00c85344]">
            <Navigation className="w-3 h-3 mr-1" /> {t.getGPS}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex gap-1">
              <Input type="number" value={latDeg} onChange={(e) => setLatDeg(Number(e.target.value))} className="w-14 h-7 text-[10px] bg-[#021019] border-[#00eaff33]" />
              <span className="text-[#7feaff] self-center">°</span>
              <Input type="number" value={latMin.toFixed(1)} step="0.1" onChange={(e) => setLatMin(Number(e.target.value))} className="w-16 h-7 text-[10px] bg-[#021019] border-[#00eaff33]" />
              <span className="text-[#7feaff] self-center">'</span>
              <select value={latDir} onChange={(e) => setLatDir(Number(e.target.value))} className="h-7 text-[10px] bg-[#021019] border-[#00eaff33] text-[#7feaff] rounded">
                <option value={1}>N</option>
                <option value={-1}>S</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex gap-1">
              <Input type="number" value={lonDeg} onChange={(e) => setLonDeg(Number(e.target.value))} className="w-14 h-7 text-[10px] bg-[#021019] border-[#00eaff33]" />
              <span className="text-[#7feaff] self-center">°</span>
              <Input type="number" value={lonMin.toFixed(1)} step="0.1" onChange={(e) => setLonMin(Number(e.target.value))} className="w-16 h-7 text-[10px] bg-[#021019] border-[#00eaff33]" />
              <span className="text-[#7feaff] self-center">'</span>
              <select value={lonDir} onChange={(e) => setLonDir(Number(e.target.value))} className="h-7 text-[10px] bg-[#021019] border-[#00eaff33] text-[#7feaff] rounded">
                <option value={1}>E</option>
                <option value={-1}>W</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-2 items-center">
          <span className="text-[10px] text-[#7feaff]">{t.eyeHeight}:</span>
          <Input type="number" value={eyeHeight} onChange={(e) => setEyeHeight(Number(e.target.value))} className="w-16 h-7 text-[10px] bg-[#021019] border-[#00eaff33]" />
          <span className="text-[10px] text-[#7feaff]">m</span>
        </div>
      </Card>

      {/* Time Input */}
      <Card className="p-3 bg-[#0a2a3a] border-[#00eaff33]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-[#7feaff] font-bold">{t.gmt}</span>
          <Button onClick={setNow} size="sm" className="h-6 text-[10px] bg-[#0d3a4d] text-[#7feaff] hover:bg-[#0f4a5d]">
            NOW
          </Button>
        </div>
        <div className="flex gap-2 justify-center">
          <Input type="number" min="0" max="23" value={gmtH.toString().padStart(2, '0')} onChange={(e) => setGmtH(Number(e.target.value))} className="w-14 h-10 text-center text-lg font-bold bg-[#021019] border-[#00eaff33] text-[#00eaff]" />
          <span className="text-[#7feaff] text-xl self-center">:</span>
          <Input type="number" min="0" max="59" value={gmtM.toString().padStart(2, '0')} onChange={(e) => setGmtM(Number(e.target.value))} className="w-14 h-10 text-center text-lg font-bold bg-[#021019] border-[#00eaff33] text-[#00eaff]" />
          <span className="text-[#7feaff] text-xl self-center">:</span>
          <Input type="number" min="0" max="59" value={gmtS.toString().padStart(2, '0')} onChange={(e) => setGmtS(Number(e.target.value))} className="w-14 h-10 text-center text-lg font-bold bg-[#021019] border-[#00eaff33] text-[#00eaff]" />
        </div>
      </Card>

      {/* Body Selection */}
      <div className="flex gap-1">
        <Button
          variant={selectedBody === 'sun' ? 'default' : 'outline'}
          onClick={() => setSelectedBody('sun')}
          className={`flex-1 text-[10px] h-8 ${selectedBody === 'sun' ? 'bg-[#ff9100] text-black' : 'border-[#ff910033] text-[#ff9100]'}`}
        >
          <Sun className="w-3 h-3 mr-1" /> {t.sun}
        </Button>
        <Button
          variant={selectedBody === 'moon' ? 'default' : 'outline'}
          onClick={() => setSelectedBody('moon')}
          className={`flex-1 text-[10px] h-8 ${selectedBody === 'moon' ? 'bg-[#7feaff] text-black' : 'border-[#7feaff33] text-[#7feaff]'}`}
        >
          <Moon className="w-3 h-3 mr-1" /> {t.moon}
        </Button>
        <Button
          variant={selectedBody === 'star' ? 'default' : 'outline'}
          onClick={() => setSelectedBody('star')}
          className={`flex-1 text-[10px] h-8 ${selectedBody === 'star' ? 'bg-[#ffd700] text-black' : 'border-[#ffd70033] text-[#ffd700]'}`}
        >
          <Star className="w-3 h-3 mr-1" /> {t.star}
        </Button>
      </div>

      {/* Star Selection if star selected */}
      {selectedBody === 'star' && (
        <select 
          value={selectedStar} 
          onChange={(e) => setSelectedStar(e.target.value)}
          className="w-full h-8 text-[10px] bg-[#0a2a3a] border-[#00eaff33] text-[#7feaff] rounded px-2"
        >
          {NAV_STARS.map(star => (
            <option key={star.name} value={star.name}>{star.name} (mag {star.magnitude})</option>
          ))}
        </select>
      )}

      {/* Sight Reduction Inputs */}
      {activeTab === 'sight' && (
        <Card className="p-3 bg-[#0a2a3a] border-[#00eaff33]">
          <div className="text-[10px] text-[#7feaff] font-bold mb-2">{t.hs}</div>
          <div className="flex gap-1 mb-2">
            <Input type="number" value={hsDeg} onChange={(e) => setHsDeg(Number(e.target.value))} className="w-14 h-8 text-[10px] bg-[#021019] border-[#00eaff33]" />
            <span className="text-[#7feaff] self-center">°</span>
            <Input type="number" value={hsMin} onChange={(e) => setHsMin(Number(e.target.value))} className="w-14 h-8 text-[10px] bg-[#021019] border-[#00eaff33]" />
            <span className="text-[#7feaff] self-center">'</span>
          </div>

          <div className="text-[10px] text-[#7feaff] font-bold mb-1">{t.ie}</div>
          <div className="flex gap-2 items-center">
            <Input type="number" value={ieMin} onChange={(e) => setIeMin(Number(e.target.value))} className="w-16 h-8 text-[10px] bg-[#021019] border-[#00eaff33]" />
            <select value={ieOn ? 'on' : 'off'} onChange={(e) => setIeOn(e.target.value === 'on')} className="h-8 text-[10px] bg-[#021019] border-[#00eaff33] text-[#7feaff] rounded px-2">
              <option value="on">On Arc</option>
              <option value="off">Off Arc</option>
            </select>
          </div>
        </Card>
      )}

      {/* Calculate Button */}
      <Button 
        onClick={activeTab === 'almanac' ? calculateAlmanac : calculateSight}
        className="w-full h-10 bg-gradient-to-r from-[#00e5ff] to-[#00b8d4] text-black font-bold text-sm"
      >
        <Calculator className="w-4 h-4 mr-2" /> {t.calculate}
      </Button>

      {/* Day/Night Indicator */}
      {results && activeTab === 'almanac' && selectedBody === 'sun' && (
        <div className={`text-center py-2 rounded text-[10px] font-bold ${
          dayNight === 'day' ? 'bg-[#ffc10722] text-[#ffc107] border border-[#ffc107]' : 
          dayNight === 'twilight' ? 'bg-[#ff572222] text-[#ff5722] border border-[#ff5722]' : 
          'bg-[#2196f322] text-[#2196f3] border border-[#2196f3]'
        }`}>
          {dayNight === 'day' ? '☀️ ' + t.day : dayNight === 'twilight' ? '🌅 ' + t.twilight : '🌙 ' + t.night}
        </div>
      )}

      {/* Results */}
      {results && (
        <Card className="p-3 bg-[#021019] border-[#00eaff55]">
          {results.mode === 'almanac' ? (
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between border-b border-[#00eaff22] pb-1">
                <span className="text-[#7feaff]">{t.gha}:</span>
                <span className="text-white font-mono">{results.gha?.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between border-b border-[#00eaff22] pb-1">
                <span className="text-[#7feaff]">{t.dec}:</span>
                <span className="text-white font-mono">{results.dec?.toFixed(2)}° {results.dec >= 0 ? 'N' : 'S'}</span>
              </div>
              <div className="flex justify-between border-b border-[#00eaff22] pb-1">
                <span className="text-[#7feaff]">{t.lha}:</span>
                <span className="text-white font-mono">{results.lha?.toFixed(2)}°</span>
              </div>
              {results.hc !== null && (
                <>
                  <div className="flex justify-between border-b border-[#00eaff22] pb-1">
                    <span className="text-[#7feaff]">{t.hc}:</span>
                    <span className="text-[#00ffd5] font-bold font-mono">{results.hc.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7feaff]">{t.zn}:</span>
                    <span className="text-[#00ffd5] font-bold font-mono">{results.zn?.toFixed(1)}°</span>
                  </div>
                </>
              )}
              {results.type === 'moon' && (
                <>
                  <div className="flex justify-between border-t border-[#00eaff22] pt-1 mt-1">
                    <span className="text-[#7feaff]">HP:</span>
                    <span className="text-white font-mono">{results.hp?.toFixed(1)}'</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7feaff]">SD:</span>
                    <span className="text-white font-mono">{results.sd?.toFixed(1)}'</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between border-b border-[#00eaff22] pb-1">
                <span className="text-[#7feaff]">Hc:</span>
                <span className="text-white font-mono">{results.hc?.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between border-b border-[#00eaff22] pb-1">
                <span className="text-[#7feaff]">Ho:</span>
                <span className="text-[#00ffd5] font-bold font-mono">{results.ho?.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between border-b border-[#00eaff22] pb-1">
                <span className="text-[#7feaff]">{t.intercept}:</span>
                <span className={`font-bold font-mono ${results.direction === 'toward' ? 'text-[#00c853]' : 'text-[#ff4444]'}`}>
                  {results.intercept?.toFixed(1)}' {results.direction === 'toward' ? t.toward : t.away}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#00eaff22] pb-1">
                <span className="text-[#7feaff]">Zn:</span>
                <span className="text-white font-mono">{results.zn?.toFixed(1)}°</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#00eaff33]">
                <div className="text-[9px] text-[#7feaff] mb-1">Corrections:</div>
                <div className="grid grid-cols-2 gap-x-2 text-[9px]">
                  <span>IE: {results.corrections.ie > 0 ? '+' : ''}{results.corrections.ie.toFixed(1)}'</span>
                  <span>Dip: {results.corrections.dip.toFixed(1)}'</span>
                  <span>Ref: {results.corrections.ref.toFixed(1)}'</span>
                  <span>Total: {results.corrections.total > 0 ? '+' : ''}{results.corrections.total.toFixed(1)}'</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Star Finder Tab */}
      {activeTab === 'stars' && (
        <div className="space-y-2">
          <Button 
            onClick={calculateAlmanac}
            className="w-full h-8 bg-[#0d3a4d] text-[#7feaff] text-[10px]"
          >
            {t.calculate}
          </Button>

          {results && results.hc !== null && (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {NAV_STARS.map(star => {
                const { lat, lon } = getPosition();
                const ut = gmtH + gmtM / 60 + gmtS / 3600;
                const now = new Date();
                const JD = julianDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), ut);
                const GMST = (6.697374558 + 0.06570982441908 * (JD - 2451545.0) + 1.00273790935 * ut) * 15;
                const gha = mod360(GMST + star.sha);
                const lha = mod360(gha + lon);
                const pos = calcAltAz(lat, star.dec, lha);

                if (pos.hc === null) return null;

                return (
                  <div key={star.name} className={`p-2 rounded text-[10px] flex justify-between items-center ${pos.hc > 0 ? 'bg-[#00c85322] border border-[#00c853]' : 'bg-[#ff444422] border border-[#ff4444] opacity-50'}`}>
                    <div>
                      <div className="font-bold text-white">{star.name}</div>
                      <div className="text-[9px] text-[#7feaff]">Mag: {star.magnitude}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-white">{pos.hc.toFixed(1)}°</div>
                      <div className="text-[9px] text-[#7feaff]">Zn: {pos.zn?.toFixed(0)}°</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

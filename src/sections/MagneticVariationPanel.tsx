import { useState, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateMagneticVariation, formatVariation, dmToDecimal } from '@/lib/geomagnetism';
import { CalculationHistory } from '@/components/CalculationHistory';
import { useCalculationHistory } from '@/hooks/useLocalStorage';
import { useExport } from '@/hooks/useExport';
import { ToastContext } from '@/App';
import { useLanguage } from '@/App';
import { Compass, Clock, MapPin, Download, ArrowRightLeft } from 'lucide-react';

interface MagVarData extends Record<string, unknown> {
  lat: number;
  lon: number;
  date: string;
  variation: number;
  annualChange: number;
  epoch: number;
  convertedHeading?: number;
  conversionType?: 'trueToCompass' | 'compassToTrue';
}

export function MagneticVariationPanel() {
  const { lang } = useLanguage();
  const toast = useContext(ToastContext);
  
  const getTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      id: {
        'magvar.title': 'Variasi Magnetik',
        'magvar.subtitle': 'Kalkulasi Variasi Magnetik',
        'magvar.latitude': 'Lintang',
        'magvar.longitude': 'Bujur',
        'magvar.dateTime': 'Tanggal & Waktu',
        'magvar.getPosition': 'Ambil Posisi GPS',
        'magvar.setNow': 'Atur ke Sekarang',
        'magvar.headingConversion': 'Konversi Heading',
        'magvar.trueToCompass': 'True → Compass',
        'magvar.compassToTrue': 'Compass → True',
        'magvar.trueHeading': 'True Heading',
        'magvar.compassHeading': 'Compass Heading',
        'magvar.result': 'Variasi Magnetik',
        'magvar.annualChange': 'Perubahan Tahunan',
        'magvar.epoch': 'Epoch Model',
        'magvar.calculatedHeading': 'Heading Terkonversi',
        'common.calculate': 'HITUNG',
        'common.clear': 'BERSIHKAN',
        'common.export': 'EXPORT',
        'common.history': 'Riwayat',
        'common.degrees': 'derajat',
        'common.minutes': 'menit',
        'toast.positionAcquired': 'Posisi GPS berhasil diambil',
        'toast.positionError': 'Gagal mengambil posisi GPS',
        'toast.fieldsCleared': 'Semua kolom dibersihkan',
        'toast.exportSuccess': 'Export berhasil',
        'error.fillAllFields': 'Isi semua kolom',
        'error.invalidNumber': 'Masukkan angka yang valid',
      },
      en: {
        'magvar.title': 'Magnetic Variation',
        'magvar.subtitle': 'Kalkulasi Variasi Magnetik',
        'magvar.latitude': 'Latitude',
        'magvar.longitude': 'Longitude',
        'magvar.dateTime': 'Date & Time',
        'magvar.getPosition': 'Get GPS Position',
        'magvar.setNow': 'Set to Now',
        'magvar.headingConversion': 'Heading Conversion',
        'magvar.trueToCompass': 'True → Compass',
        'magvar.compassToTrue': 'Compass → True',
        'magvar.trueHeading': 'True Heading',
        'magvar.compassHeading': 'Compass Heading',
        'magvar.result': 'Magnetic Variation',
        'magvar.annualChange': 'Annual Change',
        'magvar.epoch': 'WMM2025 Epoch',
        'magvar.calculatedHeading': 'Converted Heading',
        'common.calculate': 'CALCULATE',
        'common.clear': 'CLEAR',
        'common.export': 'EXPORT',
        'common.history': 'History',
        'common.degrees': 'degrees',
        'common.minutes': 'minutes',
        'toast.positionAcquired': 'GPS position acquired',
        'toast.positionError': 'Failed to get GPS position',
        'toast.fieldsCleared': 'All fields cleared',
        'toast.exportSuccess': 'Export successful',
        'error.fillAllFields': 'Please fill all fields',
        'error.invalidNumber': 'Please enter a valid number',
      },
      zh: {
        'magvar.title': '磁差',
        'magvar.subtitle': 'WMM2025 - NOAA标准',
        'magvar.latitude': '纬度',
        'magvar.longitude': '经度',
        'magvar.dateTime': '日期和时间',
        'magvar.getPosition': '获取GPS位置',
        'magvar.setNow': '设为现在',
        'magvar.headingConversion': '航向转换',
        'magvar.trueToCompass': '真航向 → 罗盘',
        'magvar.compassToTrue': '罗盘 → 真航向',
        'magvar.trueHeading': '真航向',
        'magvar.compassHeading': '罗盘航向',
        'magvar.result': '磁差',
        'magvar.annualChange': '年变化',
        'magvar.epoch': 'WMM2025历元',
        'magvar.calculatedHeading': '转换后的航向',
        'common.calculate': '计算',
        'common.clear': '清除',
        'common.export': '导出',
        'common.history': '历史',
        'common.degrees': '度',
        'common.minutes': '分',
        'toast.positionAcquired': 'GPS位置已获取',
        'toast.positionError': '获取GPS位置失败',
        'toast.fieldsCleared': '所有字段已清除',
        'toast.exportSuccess': '导出成功',
        'error.fillAllFields': '请填写所有字段',
        'error.invalidNumber': '请输入有效数字',
      },
    };
    return translations[lang]?.[key] || key;
  };

  // Coordinate inputs
  const [latDeg, setLatDeg] = useState('');
  const [latMin, setLatMin] = useState('');
  const [latHem, setLatHem] = useState<'S' | 'N'>('S');
  const [lonDeg, setLonDeg] = useState('');
  const [lonMin, setLonMin] = useState('');
  const [lonHem, setLonHem] = useState<'E' | 'W'>('E');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // Heading conversion
  const [conversionType, setConversionType] = useState<'trueToCompass' | 'compassToTrue'>('trueToCompass');
  const [inputHeading, setInputHeading] = useState('');
  
  // Results - hidden until calculated
  const [hasCalculated, setHasCalculated] = useState(false);
  const [variation, setVariation] = useState<number | null>(null);
  const [annualChange, setAnnualChange] = useState<number | null>(null);
  const [epoch, setEpoch] = useState<number | null>(null);
  const [convertedHeading, setConvertedHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { history, addToHistory, clearHistory, deleteHistoryItem } = useCalculationHistory<MagVarData>('magvar');
  const { exportToJSON } = useExport();

  const setNow = useCallback(() => {
    const now = new Date();
    setDate(now.toISOString().slice(0, 10));
    setTime(now.toTimeString().slice(0, 5));
    toast.info?.(getTranslation('magvar.setNow'), 2000);
  }, [toast, lang]);

  const getCurrentPosition = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Math.abs(position.coords.latitude);
          const lon = Math.abs(position.coords.longitude);
          const latDegVal = Math.floor(lat);
          const latMinVal = (lat - latDegVal) * 60;
          const lonDegVal = Math.floor(lon);
          const lonMinVal = (lon - lonDegVal) * 60;
          
          setLatDeg(latDegVal.toString());
          setLatMin(latMinVal.toFixed(3));
          setLatHem(position.coords.latitude >= 0 ? 'N' : 'S');
          setLonDeg(lonDegVal.toString());
          setLonMin(lonMinVal.toFixed(3));
          setLonHem(position.coords.longitude >= 0 ? 'E' : 'W');
          
          toast.success?.(getTranslation('toast.positionAcquired'), 3000);
        },
        () => {
          toast.error?.(getTranslation('toast.positionError'), 3000);
        }
      );
    } else {
      toast.error?.(getTranslation('toast.positionError'), 3000);
    }
  }, [toast, lang]);

  const calculate = useCallback(async () => {
    setError(null);
    setHasCalculated(false);
    setIsCalculating(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (!latDeg || !latMin || !lonDeg || !lonMin) {
      setError(getTranslation('error.fillAllFields'));
      setIsCalculating(false);
      return;
    }

    const latDegNum = parseFloat(latDeg);
    const latMinNum = parseFloat(latMin);
    const lonDegNum = parseFloat(lonDeg);
    const lonMinNum = parseFloat(lonMin);

    if (isNaN(latDegNum) || isNaN(latMinNum) || isNaN(lonDegNum) || isNaN(lonMinNum)) {
      setError(getTranslation('error.invalidNumber'));
      setIsCalculating(false);
      return;
    }

    const lat = dmToDecimal(latDegNum, latMinNum, latHem);
    const lon = dmToDecimal(lonDegNum, lonMinNum, lonHem);

    const calcDate = new Date(`${date}T${time}`);
    if (isNaN(calcDate.getTime())) {
      setError('Invalid date/time');
      setIsCalculating(false);
      return;
    }

    try {
      const result = calculateMagneticVariation(lat, lon, calcDate);
      setVariation(result.variation);
      setAnnualChange(result.annualChange);
      setEpoch(result.epoch);

      // Calculate heading conversion if input provided
      let convHeading: number | null = null;
      if (inputHeading) {
        const inputH = parseFloat(inputHeading);
        if (!isNaN(inputH)) {
          if (conversionType === 'trueToCompass') {
            convHeading = inputH - result.variation;
          } else {
            convHeading = inputH + result.variation;
          }
          convHeading = ((convHeading % 360) + 360) % 360;
          setConvertedHeading(convHeading);
        }
      }

      // Add to history
      const historyData: MagVarData = {
        lat,
        lon,
        date: calcDate.toISOString(),
        variation: result.variation,
        annualChange: result.annualChange,
        epoch: result.epoch,
        convertedHeading: convHeading || undefined,
        conversionType: inputHeading ? conversionType : undefined,
      };
      addToHistory(historyData);

      setHasCalculated(true);
      toast.success?.(`${getTranslation('magvar.result')}: ${formatVariation(result.variation)}`, 3000);
    } catch (err) {
      setError('Calculation error: ' + (err as Error).message);
      toast.error?.('Calculation failed', 3000);
    } finally {
      setIsCalculating(false);
    }
  }, [latDeg, latMin, latHem, lonDeg, lonMin, lonHem, date, time, inputHeading, conversionType, addToHistory, toast, lang]);

  const clearAll = useCallback(() => {
    setLatDeg('');
    setLatMin('');
    setLonDeg('');
    setLonMin('');
    setDate('');
    setTime('');
    setInputHeading('');
    setHasCalculated(false);
    setVariation(null);
    setAnnualChange(null);
    setEpoch(null);
    setConvertedHeading(null);
    setError(null);
    toast.info?.(getTranslation('toast.fieldsCleared'), 2000);
  }, [toast, lang]);

  const exportCurrentResult = useCallback(() => {
    if (hasCalculated && variation !== null) {
      const lat = dmToDecimal(parseFloat(latDeg), parseFloat(latMin), latHem);
      const lon = dmToDecimal(parseFloat(lonDeg), parseFloat(lonMin), lonHem);
      
      exportToJSON({
        latitude: lat,
        longitude: lon,
        date: `${date}T${time}`,
        variation: formatVariation(variation),
        annualChange: annualChange?.toFixed(2) + ' deg/year',
        epoch: epoch?.toFixed(2),
        convertedHeading: convertedHeading?.toFixed(1),
        conversionType,
      }, { filename: 'magvar_result' });
      
      toast.success?.(getTranslation('toast.exportSuccess'), 2000);
    }
  }, [hasCalculated, variation, latDeg, latMin, latHem, lonDeg, lonMin, lonHem, date, time, annualChange, epoch, convertedHeading, conversionType, exportToJSON, toast, lang]);

  const formatCoordinate = (lat: number, lon: number) => {
    const latH = lat >= 0 ? 'N' : 'S';
    const lonH = lon >= 0 ? 'E' : 'W';
    const absLat = Math.abs(lat);
    const absLon = Math.abs(lon);
    const latD = Math.floor(absLat);
    const latM = (absLat - latD) * 60;
    const lonD = Math.floor(absLon);
    const lonM = (absLon - lonD) * 60;
    return `${latD}° ${latM.toFixed(2)}' ${latH}, ${lonD}° ${lonM.toFixed(2)}' ${lonH}`;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center mb-4">
        <Compass className="w-8 h-8 mx-auto text-[#00eaff] mb-1" />
        <h2 className="text-sm font-semibold text-[#00eaff]">{getTranslation('magvar.title')}</h2>
        <p className="text-[10px] text-[#7feaff]">{getTranslation('magvar.subtitle')}</p>
      </div>

      {/* GPS Button */}
      <Button
        onClick={getCurrentPosition}
        variant="outline"
        size="sm"
        className="w-full text-[11px] border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a] h-8"
      >
        <MapPin className="w-3 h-3 mr-1" /> {getTranslation('magvar.getPosition')}
      </Button>

      {/* Latitude */}
      <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
        <Label className="text-[10px] text-[#7fd3ff] mb-1.5 block">{getTranslation('magvar.latitude')}</Label>
        <div className="flex items-center gap-1.5">
          <Input 
            type="number" 
            placeholder="DD" 
            value={latDeg} 
            onChange={(e) => setLatDeg(e.target.value)} 
            className="w-14 h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center px-1" 
            min={0} 
            max={90} 
          />
          <span className="text-[10px] text-[#7feaff]">°</span>
          <Input 
            type="number" 
            placeholder="MM.mmm" 
            value={latMin} 
            onChange={(e) => setLatMin(e.target.value)} 
            className="w-20 h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center px-1" 
            min={0} 
            max={59.999} 
            step={0.001} 
          />
          <span className="text-[10px] text-[#7feaff]">'</span>
          <Select value={latHem} onValueChange={(v) => setLatHem(v as 'S' | 'N')}>
            <SelectTrigger className="w-10 h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white px-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#021019] border-[#00eaff33]">
              <SelectItem value="S" className="text-white text-[12px]">S</SelectItem>
              <SelectItem value="N" className="text-white text-[12px]">N</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Longitude */}
      <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
        <Label className="text-[10px] text-[#7fd3ff] mb-1.5 block">{getTranslation('magvar.longitude')}</Label>
        <div className="flex items-center gap-1.5">
          <Input 
            type="number" 
            placeholder="DDD" 
            value={lonDeg} 
            onChange={(e) => setLonDeg(e.target.value)} 
            className="w-14 h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center px-1" 
            min={0} 
            max={180} 
          />
          <span className="text-[10px] text-[#7feaff]">°</span>
          <Input 
            type="number" 
            placeholder="MM.mmm" 
            value={lonMin} 
            onChange={(e) => setLonMin(e.target.value)} 
            className="w-20 h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center px-1" 
            min={0} 
            max={59.999} 
            step={0.001} 
          />
          <span className="text-[10px] text-[#7feaff]">'</span>
          <Select value={lonHem} onValueChange={(v) => setLonHem(v as 'E' | 'W')}>
            <SelectTrigger className="w-10 h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white px-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#021019] border-[#00eaff33]">
              <SelectItem value="E" className="text-white text-[12px]">E</SelectItem>
              <SelectItem value="W" className="text-white text-[12px]">W</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
        <Label className="text-[10px] text-[#7fd3ff] mb-1.5 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {getTranslation('magvar.dateTime')}
        </Label>
        <div className="flex items-center gap-1.5">
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="flex-1 h-7 text-[11px] bg-[#000c14] border-[#00eaff33] text-white px-2" 
          />
          <Input 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
            className="w-20 h-7 text-[11px] bg-[#000c14] border-[#00eaff33] text-white px-2" 
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={setNow} 
          className="w-full mt-1.5 text-[10px] border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a] h-6"
        >
          {getTranslation('magvar.setNow')}
        </Button>
      </div>

      {/* Heading Conversion */}
      <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
        <Label className="text-[10px] text-[#7fd3ff] mb-1.5 flex items-center gap-1">
          <ArrowRightLeft className="w-3 h-3" /> {getTranslation('magvar.headingConversion')} <span className="text-[#666]">(Optional)</span>
        </Label>
        
        {/* Conversion Type */}
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => setConversionType('trueToCompass')}
            className={`flex-1 py-1 px-2 rounded text-[10px] transition-colors ${
              conversionType === 'trueToCompass'
                ? 'bg-[#00eaff22] border border-[#00eaff] text-[#00eaff]'
                : 'bg-[#000c14] border border-[#00eaff22] text-[#7feaff]'
            }`}
          >
            {getTranslation('magvar.trueToCompass')}
          </button>
          <button
            onClick={() => setConversionType('compassToTrue')}
            className={`flex-1 py-1 px-2 rounded text-[10px] transition-colors ${
              conversionType === 'compassToTrue'
                ? 'bg-[#00eaff22] border border-[#00eaff] text-[#00eaff]'
                : 'bg-[#000c14] border border-[#00eaff22] text-[#7feaff]'
            }`}
          >
            {getTranslation('magvar.compassToTrue')}
          </button>
        </div>

        {/* Input Heading */}
        <div>
          <Label className="text-[9px] text-[#7fd3ff]">
            {conversionType === 'trueToCompass' ? getTranslation('magvar.trueHeading') : getTranslation('magvar.compassHeading')} (°)
          </Label>
          <Input
            type="number"
            placeholder="0-360"
            value={inputHeading}
            onChange={(e) => setInputHeading(e.target.value)}
            className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-1"
            min={0}
            max={360}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={calculate} 
          disabled={isCalculating}
          className="flex-1 h-8 bg-[#0a2a3a] text-[#9fe9ff] hover:bg-[#0d3a4d] border border-[#00eaff33] text-[11px] font-medium"
        >
          {isCalculating ? (
            <span className="animate-pulse">...</span>
          ) : (
            <><Compass className="w-3 h-3 mr-1" />{getTranslation('common.calculate')}</>
          )}
        </Button>
        <Button 
          onClick={clearAll}
          variant="outline"
          className="h-8 text-[11px] border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a] px-3"
        >
          {getTranslation('common.clear')}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-2 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-[10px] animate-shake">
          {error}
        </div>
      )}

      {/* Results - Only show after calculation */}
      {hasCalculated && variation !== null && (
        <div className="space-y-2 animate-fade-in-up">
          {/* Magnetic Variation */}
          <div className="p-3 bg-[#021019] border border-[#00eaff55] rounded-lg">
            <div className="text-center">
              <div className="text-[10px] text-[#7feaff] mb-0.5">{getTranslation('magvar.result')}</div>
              <div className="text-xl font-bold text-[#00ffd5]">{formatVariation(variation)}</div>
            </div>
            {epoch !== null && (
              <div className="text-center text-[9px] text-[#666] mt-1">{getTranslation('magvar.epoch')}: {epoch.toFixed(2)}</div>
            )}
            {annualChange !== null && (
              <div className="text-center text-[10px] text-[#7feaff] mt-0.5">
                {getTranslation('magvar.annualChange')}: <span className="text-[#00eaff]">{annualChange >= 0 ? '+' : ''}{annualChange.toFixed(2)}°/year</span>
              </div>
            )}
          </div>

          {/* Converted Heading */}
          {convertedHeading !== null && (
            <div className="p-3 bg-[#021019] border border-[#00ff8833] rounded-lg">
              <div className="text-center">
                <div className="text-[10px] text-[#7feaff] mb-0.5">{getTranslation('magvar.calculatedHeading')}</div>
                <div className="text-lg font-bold text-[#00ff88]">{convertedHeading.toFixed(1)}°</div>
                <div className="text-[9px] text-[#7feaff] mt-0.5">
                  {conversionType === 'trueToCompass' ? getTranslation('magvar.compassHeading') : getTranslation('magvar.trueHeading')}
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={exportCurrentResult}
            variant="outline"
            size="sm"
            className="w-full text-[10px] border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a] h-7"
          >
            <Download className="w-3 h-3 mr-1" /> {getTranslation('common.export')}
          </Button>
        </div>
      )}

      {/* History */}
      <CalculationHistory
        history={history}
        onClear={clearHistory}
        onDelete={deleteHistoryItem}
        title={getTranslation('common.history')}
        exportFilename="magvar_history"
        renderItem={(item) => (
          <div className="space-y-0.5 text-[10px]">
            <div><span className="text-[#7feaff]">Pos:</span> {formatCoordinate((item as MagVarData).lat, (item as MagVarData).lon)}</div>
            <div className="flex items-center gap-2">
              <span className="text-[#7feaff]">Var:</span>
              <span className="text-[#00ffd5] font-semibold">{formatVariation((item as MagVarData).variation)}</span>
            </div>
            {(item as MagVarData).convertedHeading !== undefined && (
              <div>
                <span className="text-[#7feaff]">Conv:</span> 
                <span className="text-[#00ff88]"> {(item as MagVarData).convertedHeading?.toFixed(1)}°</span>
                <span className="text-[#666]"> ({(item as MagVarData).conversionType === 'trueToCompass' ? 'T→C' : 'C→T'})</span>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}

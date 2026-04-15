import { useState, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Calendar, Download } from 'lucide-react';
import { useCalculationHistory } from '@/hooks/useLocalStorage';
import { useExport } from '@/hooks/useExport';
import { CalculationHistory } from '@/components/CalculationHistory';
import { ToastContext } from '@/App';
import { useLanguage } from '@/App';

interface ETAData extends Record<string, unknown> {
  distance: number;
  speed: number;
  departure: string;
  eta: string;
  duration: string;
}

export function ETAPanel() {
  const { lang } = useLanguage();
  const toast = useContext(ToastContext);
  const { exportToJSON } = useExport();
  
  const getTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      id: {
        'eta.title': 'Kalkulator ETA',
        'eta.subtitle': 'Estimated Time of Arrival',
        'eta.distance': 'Jarak',
        'eta.speed': 'Kecepatan',
        'eta.departure': 'Waktu Berangkat',
        'eta.eta': 'ETA',
        'eta.duration': 'Durasi',
        'eta.days': 'hari',
        'eta.hours': 'jam',
        'eta.minutes': 'menit',
        'common.calculate': 'HITUNG',
        'common.clear': 'BERSIHKAN',
        'common.export': 'EXPORT',
        'common.history': 'Riwayat',
        'toast.calculationSuccess': 'Perhitungan berhasil',
        'error.fillAllFields': 'Isi semua kolom',
      },
      en: {
        'eta.title': 'ETA Calculator',
        'eta.subtitle': 'Estimated Time of Arrival',
        'eta.distance': 'Distance',
        'eta.speed': 'Speed',
        'eta.departure': 'Departure Time',
        'eta.eta': 'ETA',
        'eta.duration': 'Duration',
        'eta.days': 'days',
        'eta.hours': 'hours',
        'eta.minutes': 'minutes',
        'common.calculate': 'CALCULATE',
        'common.clear': 'CLEAR',
        'common.export': 'EXPORT',
        'common.history': 'History',
        'toast.calculationSuccess': 'Calculation successful',
        'error.fillAllFields': 'Please fill all fields',
      },
      zh: {
        'eta.title': 'ETA计算器',
        'eta.subtitle': '预计到达时间',
        'eta.distance': '距离',
        'eta.speed': '速度',
        'eta.departure': '出发时间',
        'eta.eta': 'ETA',
        'eta.duration': '持续时间',
        'eta.days': '天',
        'eta.hours': '小时',
        'eta.minutes': '分钟',
        'common.calculate': '计算',
        'common.clear': '清除',
        'common.export': '导出',
        'common.history': '历史',
        'toast.calculationSuccess': '计算成功',
        'error.fillAllFields': '请填写所有字段',
      },
    };
    return translations[lang]?.[key] || key;
  };

  const [distance, setDistance] = useState('');
  const [speed, setSpeed] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  
  const [hasCalculated, setHasCalculated] = useState(false);
  const [result, setResult] = useState<{
    eta: string;
    duration: string;
    hours: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { history, addToHistory, clearHistory, deleteHistoryItem } = useCalculationHistory<ETAData>('eta');

  const setNow = useCallback(() => {
    const now = new Date();
    setDepartureDate(now.toISOString().slice(0, 10));
    setDepartureTime(now.toTimeString().slice(0, 5));
  }, []);

  const calculate = useCallback(async () => {
    setError(null);
    setHasCalculated(false);
    setIsCalculating(true);

    await new Promise(resolve => setTimeout(resolve, 200));

    const dist = parseFloat(distance);
    const spd = parseFloat(speed);

    if (isNaN(dist) || isNaN(spd) || spd <= 0) {
      setError(getTranslation('error.fillAllFields'));
      setIsCalculating(false);
      return;
    }

    const hours = dist / spd;
    const departure = new Date(`${departureDate}T${departureTime}`);
    
    if (isNaN(departure.getTime())) {
      setError('Invalid departure time');
      setIsCalculating(false);
      return;
    }

    const eta = new Date(departure.getTime() + hours * 60 * 60 * 1000);
    
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    const minutes = Math.floor((hours % 1) * 60);
    
    let durationStr = '';
    if (days > 0) durationStr += `${days} ${getTranslation('eta.days')} `;
    if (remainingHours > 0) durationStr += `${remainingHours} ${getTranslation('eta.hours')} `;
    if (minutes > 0) durationStr += `${minutes} ${getTranslation('eta.minutes')}`;

    const resultData = {
      eta: eta.toLocaleString(lang === 'id' ? 'id-ID' : lang === 'zh' ? 'zh-CN' : 'en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: durationStr.trim(),
      hours,
    };
    
    setResult(resultData);

    // Add to history
    addToHistory({
      distance: dist,
      speed: spd,
      departure: departure.toISOString(),
      eta: resultData.eta,
      duration: resultData.duration,
    });

    setHasCalculated(true);
    toast.success?.(`ETA: ${resultData.eta}`, 3000);
    setIsCalculating(false);
  }, [distance, speed, departureDate, departureTime, addToHistory, toast, lang]);

  const clearAll = useCallback(() => {
    setDistance('');
    setSpeed('');
    setDepartureDate('');
    setDepartureTime('');
    setHasCalculated(false);
    setResult(null);
    setError(null);
    toast.info?.('All fields cleared', 2000);
  }, [toast]);

  const exportResult = useCallback(() => {
    if (hasCalculated && result) {
      exportToJSON({
        distance: parseFloat(distance),
        speed: parseFloat(speed),
        departure: `${departureDate}T${departureTime}`,
        eta: result.eta,
        duration: result.duration,
      }, { filename: 'eta_result' });
      toast.success?.('Exported', 2000);
    }
  }, [hasCalculated, result, distance, speed, departureDate, departureTime, exportToJSON, toast]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center mb-4">
        <Clock className="w-8 h-8 mx-auto text-[#00eaff] mb-1" />
        <h2 className="text-sm font-semibold text-[#00eaff]">{getTranslation('eta.title')}</h2>
        <p className="text-[10px] text-[#7feaff]">{getTranslation('eta.subtitle')}</p>
      </div>

      {/* Inputs */}
      <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('eta.distance')} (NM)</Label>
            <Input
              type="number"
              placeholder="e.g. 1200"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('eta.speed')} (kts)</Label>
            <Input
              type="number"
              placeholder="e.g. 12"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
              min={0}
              step={0.1}
            />
          </div>
        </div>
        
        <Label className="text-[9px] text-[#7fd3ff] flex items-center gap-1 mb-1">
          <Calendar className="w-3 h-3" /> {getTranslation('eta.departure')}
        </Label>
        <div className="flex gap-2 mb-2">
          <Input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="flex-1 h-7 text-[11px] bg-[#000c14] border-[#00eaff33] text-white px-2"
          />
          <Input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-20 h-7 text-[11px] bg-[#000c14] border-[#00eaff33] text-white px-2"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={setNow}
          className="w-full text-[10px] border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a] h-6"
        >
          Set to Now
        </Button>
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
            <><Clock className="w-3 h-3 mr-1" />{getTranslation('common.calculate')}</>
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

      {/* Results */}
      {hasCalculated && result && (
        <div className="space-y-2 animate-fade-in-up">
          <div className="p-3 bg-[#021019] border border-[#00eaff55] rounded-lg">
            <div className="text-center">
              <div className="text-[10px] text-[#7feaff] mb-0.5">{getTranslation('eta.eta')}</div>
              <div className="text-sm font-bold text-[#00ffd5]">{result.eta}</div>
            </div>
          </div>
          
          <div className="p-2.5 bg-[#021019] border border-[#00eaff33] rounded-lg">
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
              <div className="text-[#7feaff]">{getTranslation('eta.duration')}:</div>
              <div className="text-white text-right">{result.duration}</div>
              <div className="text-[#7feaff]">Total Hours:</div>
              <div className="text-white text-right">{result.hours.toFixed(2)}h</div>
            </div>
          </div>

          <Button
            onClick={exportResult}
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
        exportFilename="eta_history"
        renderItem={(item) => (
          <div className="space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#7feaff]">Dist:</span>
              <span className="text-white">{(item as ETAData).distance} NM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7feaff]">Speed:</span>
              <span className="text-white">{(item as ETAData).speed} kts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7feaff]">ETA:</span>
              <span className="text-[#00ffd5]">{(item as ETAData).eta}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

import { useState, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateCPA, formatTCPA } from '@/lib/navigation';
import { CalculationHistory } from '@/components/CalculationHistory';
import { useCalculationHistory } from '@/hooks/useLocalStorage';
import { useExport } from '@/hooks/useExport';
import { ToastContext } from '@/App';
import { useLanguage } from '@/App';
import { Radar, Ship, Target, AlertTriangle, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

interface CPAData extends Record<string, unknown> {
  ownCourse: number;
  ownSpeed: number;
  tgtBearing: number;
  tgtRange: number;
  tgtCourse: number;
  tgtSpeed: number;
  cpaDistance: number;
  tcpa: number;
  cpaBearing: number;
  status: string;
}

export function CPAPanel() {
  const { lang } = useLanguage();
  const toast = useContext(ToastContext);
  
  const getTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      id: {
        'cpa.title': 'CPA / TCPA',
        'cpa.subtitle': 'Closest Point of Approach',
        'cpa.ownVessel': 'Kapal Sendiri',
        'cpa.targetVessel': 'Kapal Target',
        'cpa.range': 'Jarak',
        'cpa.bearing': 'Bearing',
        'cpa.course': 'Course',
        'cpa.speed': 'Speed',
        'cpa.cpa': 'CPA',
        'cpa.tcpa': 'TCPA',
        'cpa.status': 'Status',
        'cpa.safe': 'AMAN',
        'cpa.caution': 'WASPADA',
        'cpa.danger': 'BAHAYA',
        'cpa.passed': 'LEWAT',
        'cpa.cpaDistance': 'Jarak CPA',
        'cpa.tcpaTime': 'Waktu ke CPA',
        'cpa.cpaBearing': 'Bearing CPA',
        'common.calculate': 'HITUNG',
        'common.clear': 'BERSIHKAN',
        'common.export': 'EXPORT',
        'common.history': 'Riwayat',
        'toast.calculationSuccess': 'Perhitungan berhasil',
        'toast.fieldsCleared': 'Semua kolom dibersihkan',
        'error.fillAllFields': 'Isi semua kolom',
        'error.invalidRange': 'Nilai di luar rentang 0-360',
      },
      en: {
        'cpa.title': 'CPA / TCPA',
        'cpa.subtitle': 'Closest Point of Approach',
        'cpa.ownVessel': 'Own Vessel',
        'cpa.targetVessel': 'Target Vessel',
        'cpa.range': 'Range',
        'cpa.bearing': 'Bearing',
        'cpa.course': 'Course',
        'cpa.speed': 'Speed',
        'cpa.cpa': 'CPA',
        'cpa.tcpa': 'TCPA',
        'cpa.status': 'Status',
        'cpa.safe': 'SAFE',
        'cpa.caution': 'CAUTION',
        'cpa.danger': 'DANGER',
        'cpa.passed': 'PASSED',
        'cpa.cpaDistance': 'CPA Distance',
        'cpa.tcpaTime': 'Time to CPA',
        'cpa.cpaBearing': 'CPA Bearing',
        'common.calculate': 'CALCULATE',
        'common.clear': 'CLEAR',
        'common.export': 'EXPORT',
        'common.history': 'History',
        'toast.calculationSuccess': 'Calculation successful',
        'toast.fieldsCleared': 'All fields cleared',
        'error.fillAllFields': 'Please fill all fields',
        'error.invalidRange': 'Value out of range 0-360',
      },
      zh: {
        'cpa.title': 'CPA / TCPA',
        'cpa.subtitle': '最近会遇距离',
        'cpa.ownVessel': '本船',
        'cpa.targetVessel': '目标船',
        'cpa.range': '距离',
        'cpa.bearing': '方位',
        'cpa.course': '航向',
        'cpa.speed': '速度',
        'cpa.cpa': 'CPA',
        'cpa.tcpa': 'TCPA',
        'cpa.status': '状态',
        'cpa.safe': '安全',
        'cpa.caution': '注意',
        'cpa.danger': '危险',
        'cpa.passed': '已通过',
        'cpa.cpaDistance': 'CPA距离',
        'cpa.tcpaTime': '到CPA时间',
        'cpa.cpaBearing': 'CPA方位',
        'common.calculate': '计算',
        'common.clear': '清除',
        'common.export': '导出',
        'common.history': '历史',
        'toast.calculationSuccess': '计算成功',
        'toast.fieldsCleared': '所有字段已清除',
        'error.fillAllFields': '请填写所有字段',
        'error.invalidRange': '值超出0-360范围',
      },
    };
    return translations[lang]?.[key] || key;
  };

  // Own ship data
  const [ownCourse, setOwnCourse] = useState('');
  const [ownSpeed, setOwnSpeed] = useState('');
  
  // Target data
  const [tgtBearing, setTgtBearing] = useState('');
  const [tgtRange, setTgtRange] = useState('');
  const [tgtCourse, setTgtCourse] = useState('');
  const [tgtSpeed, setTgtSpeed] = useState('');
  
  // Results - hidden until calculated
  const [hasCalculated, setHasCalculated] = useState(false);
  const [result, setResult] = useState<{
    cpaDistance: number;
    tcpa: number;
    cpaBearing: number;
    status: 'SAFE' | 'CAUTION' | 'DANGER' | 'PASSED';
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { history, addToHistory, clearHistory, deleteHistoryItem } = useCalculationHistory<CPAData>('cpa');
  const { exportToJSON } = useExport();

const getCOLREGRecommendation = (cpa: number, tcpa: number, bearing: number, relativeBearing: number) => {
    if (cpa > 2 || tcpa < 0) {
      return { action: 'NO ACTION', desc: 'Safe passing', color: 'text-[#00c853]' };
    }
    if (cpa < 1) {
      return { action: 'IMMEDIATE ACTION', desc: 'Risk of collision - Alter course NOW', color: 'text-[#ff4444]' };
    }
    if (Math.abs(relativeBearing) < 45 || Math.abs(relativeBearing) > 315) {
      return { action: 'HEAD-ON / CROSSING', desc: 'Stand-on vessel or alter to starboard', color: 'text-[#ff9100]' };
    }
    if (Math.abs(relativeBearing) > 112.5 && Math.abs(relativeBearing) < 247.5) {
      return { action: 'OVERTAKING', desc: 'Give way - keep clear of overtaken vessel', color: 'text-[#ff9100]' };
    }
    return { action: 'MONITOR CLOSELY', desc: 'Prepare to take action', color: 'text-[#ffc107]' };
  };

    const calculate = useCallback(async () => {
    setError(null);
    setHasCalculated(false);
    setIsCalculating(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    const ownC = parseFloat(ownCourse);
    const ownS = parseFloat(ownSpeed);
    const tgtB = parseFloat(tgtBearing);
    const tgtR = parseFloat(tgtRange);
    const tgtC = parseFloat(tgtCourse);
    const tgtS = parseFloat(tgtSpeed);

    if ([ownC, ownS, tgtB, tgtR, tgtC, tgtS].some(isNaN)) {
      setError(getTranslation('error.fillAllFields'));
      setIsCalculating(false);
      return;
    }

    if (ownC < 0 || ownC > 360 || tgtB < 0 || tgtB > 360 || tgtC < 0 || tgtC > 360) {
      setError(getTranslation('error.invalidRange'));
      setIsCalculating(false);
      return;
    }

    if (ownS < 0 || tgtS < 0 || tgtR < 0) {
      setError('Speed and range cannot be negative');
      setIsCalculating(false);
      return;
    }

    try {
      const cpaResult = calculateCPA(
        { course: ownC, speed: ownS },
        { bearing: tgtB, range: tgtR, course: tgtC, speed: tgtS }
      );
      setResult(cpaResult);

      // Add to history
      const historyData: CPAData = {
        ownCourse: ownC,
        ownSpeed: ownS,
        tgtBearing: tgtB,
        tgtRange: tgtR,
        tgtCourse: tgtC,
        tgtSpeed: tgtS,
        cpaDistance: cpaResult.cpaDistance,
        tcpa: cpaResult.tcpa,
        cpaBearing: cpaResult.cpaBearing,
        status: cpaResult.status
      };
      addToHistory(historyData);

      setHasCalculated(true);
      toast.success?.(`${getTranslation('cpa.cpa')}: ${cpaResult.cpaDistance.toFixed(2)} NM - ${cpaResult.status}`, 3000);
    } catch (err) {
      setError('Calculation error: ' + (err as Error).message);
      toast.error?.('Calculation failed', 3000);
    } finally {
      setIsCalculating(false);
    }
  }, [ownCourse, ownSpeed, tgtBearing, tgtRange, tgtCourse, tgtSpeed, addToHistory, toast, lang]);

  const clearAll = useCallback(() => {
    setOwnCourse('');
    setOwnSpeed('');
    setTgtBearing('');
    setTgtRange('');
    setTgtCourse('');
    setTgtSpeed('');
    setHasCalculated(false);
    setResult(null);
    setError(null);
    toast.info?.(getTranslation('toast.fieldsCleared'), 2000);
  }, [toast, lang]);

  const exportCurrentResult = useCallback(() => {
    if (hasCalculated && result) {
      exportToJSON({
        ownCourse: parseFloat(ownCourse),
        ownSpeed: parseFloat(ownSpeed),
        tgtBearing: parseFloat(tgtBearing),
        tgtRange: parseFloat(tgtRange),
        tgtCourse: parseFloat(tgtCourse),
        tgtSpeed: parseFloat(tgtSpeed),
        cpaDistance: result.cpaDistance,
        tcpa: result.tcpa,
        cpaBearing: result.cpaBearing,
        status: result.status
      }, { filename: 'cpa_result' });
      
      toast.success?.('Exported', 2000);
    }
  }, [hasCalculated, result, ownCourse, ownSpeed, tgtBearing, tgtRange, tgtCourse, tgtSpeed, exportToJSON, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SAFE': return <CheckCircle className="w-5 h-5 text-[#00ff88]" />;
      case 'CAUTION': return <AlertCircle className="w-5 h-5 text-[#ffaa00]" />;
      case 'DANGER': return <AlertTriangle className="w-5 h-5 text-[#ff4444]" />;
      case 'PASSED': return <XCircle className="w-5 h-5 text-[#888]" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAFE': return 'border-[#00ff88] text-[#00ff88]';
      case 'CAUTION': return 'border-[#ffaa00] text-[#ffaa00]';
      case 'DANGER': return 'border-[#ff4444] text-[#ff4444]';
      case 'PASSED': return 'border-[#666] text-[#888]';
      default: return '';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'SAFE': return 'bg-[#00ff88]/10';
      case 'CAUTION': return 'bg-[#ffaa00]/10';
      case 'DANGER': return 'bg-[#ff4444]/10';
      case 'PASSED': return 'bg-gray-500/10';
      default: return '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center mb-4">
        <Radar className="w-8 h-8 mx-auto text-[#00eaff] mb-1" />
        <h2 className="text-sm font-semibold text-[#00eaff]">{getTranslation('cpa.title')}</h2>
        <p className="text-[10px] text-[#7feaff]">{getTranslation('cpa.subtitle')}</p>
      </div>

      {/* Own Ship */}
      <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
        <div className="flex items-center gap-1.5 mb-2 text-[#7fd3ff]">
          <Ship className="w-4 h-4" />
          <span className="text-[11px] font-medium">{getTranslation('cpa.ownVessel')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('cpa.course')} (°)</Label>
            <Input
              type="number"
              placeholder="0-360"
              value={ownCourse}
              onChange={(e) => setOwnCourse(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
              min={0}
              max={360}
            />
          </div>
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('cpa.speed')} (kts)</Label>
            <Input
              type="number"
              placeholder="knots"
              value={ownSpeed}
              onChange={(e) => setOwnSpeed(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </div>

      {/* Target Ship */}
      <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
        <div className="flex items-center gap-1.5 mb-2 text-[#7fd3ff]">
          <Target className="w-4 h-4" />
          <span className="text-[11px] font-medium">{getTranslation('cpa.targetVessel')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('cpa.bearing')} (°)</Label>
            <Input
              type="number"
              placeholder="0-360"
              value={tgtBearing}
              onChange={(e) => setTgtBearing(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
              min={0}
              max={360}
            />
          </div>
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('cpa.range')} (NM)</Label>
            <Input
              type="number"
              placeholder="NM"
              value={tgtRange}
              onChange={(e) => setTgtRange(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('cpa.course')} (°)</Label>
            <Input
              type="number"
              placeholder="0-360"
              value={tgtCourse}
              onChange={(e) => setTgtCourse(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
              min={0}
              max={360}
            />
          </div>
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('cpa.speed')} (kts)</Label>
            <Input
              type="number"
              placeholder="knots"
              value={tgtSpeed}
              onChange={(e) => setTgtSpeed(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
              min={0}
              step={0.1}
            />
          </div>
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
            <><Radar className="w-3 h-3 mr-1" />{getTranslation('common.calculate')}</>
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
      {hasCalculated && result && (
        <div className={`p-3 rounded-lg border-2 ${getStatusColor(result.status)} ${getStatusBg(result.status)} animate-fade-in-up`}>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {getStatusIcon(result.status)}
            <span className="text-base font-bold">{getTranslation(`cpa.${result.status.toLowerCase()}`)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-[9px] text-[#7feaff] mb-0.5">{getTranslation('cpa.cpaDistance')}</div>
              <div className="text-lg font-bold">{result.cpaDistance.toFixed(2)} <span className="text-[10px]">NM</span></div>
            </div>
            <div>
              <div className="text-[9px] text-[#7feaff] mb-0.5">{getTranslation('cpa.tcpa')}</div>
              <div className="text-lg font-bold">{formatTCPA(result.tcpa)}</div>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-current border-opacity-30 text-center">
            <div className="text-[9px] text-[#7feaff] mb-0.5">{getTranslation('cpa.cpaBearing')}</div>
            <div className="text-sm font-bold">{result.cpaBearing.toFixed(1)}°</div>
          </div>

          <Button
            onClick={exportCurrentResult}
            variant="outline"
            size="sm"
            className="w-full mt-2 text-[10px] border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a] h-7"
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
        exportFilename="cpa_history"
        renderItem={(item) => (
          <div className="space-y-0.5 text-[10px]">
            <div className="grid grid-cols-2 gap-1">
              <div><span className="text-[#7feaff]">Own:</span> {(item as CPAData).ownCourse}°/{(item as CPAData).ownSpeed}kts</div>
              <div><span className="text-[#7feaff]">Tgt:</span> {(item as CPAData).tgtBearing}°/{(item as CPAData).tgtRange}NM</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#7feaff]">Res:</span>
              <span className={`font-semibold ${
                (item as CPAData).status === 'SAFE' ? 'text-[#00ff88]' :
                (item as CPAData).status === 'CAUTION' ? 'text-[#ffaa00]' :
                (item as CPAData).status === 'DANGER' ? 'text-[#ff4444]' : 'text-[#888]'
              }`}>
                {(item as CPAData).status}
              </span>
              <span className="text-[#9fe9ff]">| CPA:{(item as CPAData).cpaDistance.toFixed(2)}NM</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

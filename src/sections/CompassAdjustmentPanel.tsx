import { useState, useEffect, useCallback, useContext } from 'react';
import { Compass, Calculator, Download, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useExport } from '@/hooks/useExport';
import { ToastContext } from '@/App';
import { useLanguage } from '@/App';

interface DeviationEntry {
  compassHeading: number;
  magneticHeading: number | null;
  deviation: number | null;
}

interface Measurement extends Record<string, unknown> {
  id: string;
  compassHeading: number;
  magneticHeading: number;
  deviation: number;
  timestamp: number;
}

export function CompassAdjustmentPanel() {
  const { lang } = useLanguage();
  const toast = useContext(ToastContext);
  const { exportToJSON } = useExport();
  
  const getTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      id: {
        'compass.title': 'Kalibrasi Kompas',
        'compass.subtitle': 'Deviasi & Koreksi',
        'compass.heading': 'Heading',
        'compass.magnetic': 'Magnetic',
        'compass.deviation': 'Deviasi',
        'compass.deviationTable': 'Tabel Deviasi',
        'compass.recordMeasurement': 'Catat Pengukuran',
        'compass.measured': 'Terukur',
        'compass.calculated': 'Dihitung',
        'compass.difference': 'Selisih',
        'compass.addRow': 'Tambah',
        'compass.removeRow': 'Hapus',
        'compass.saveTable': 'Simpan',
        'compass.loadTable': 'Muat',
        'compass.clearTable': 'Bersihkan',
        'compass.compassHeading': 'Compass Hdg',
        'compass.magneticHeading': 'Magnetic Hdg',
        'compass.deviationValue': 'Dev (°)',
        'compass.direction': 'Arah',
        'compass.east': 'E',
        'compass.west': 'W',
        'compass.measurements': 'Pengukuran',
        'common.calculate': 'HITUNG',
        'common.clear': 'BERSIHKAN',
        'common.export': 'EXPORT',
        'toast.saved': 'Data tersimpan',
        'toast.loaded': 'Data dimuat',
        'toast.cleared': 'Data dibersihkan',
        'error.fillAllFields': 'Isi semua kolom',
      },
      en: {
        'compass.title': 'Compass Adjustment',
        'compass.subtitle': 'Deviation & Correction',
        'compass.heading': 'Heading',
        'compass.magnetic': 'Magnetic',
        'compass.deviation': 'Deviation',
        'compass.deviationTable': 'Deviation Table',
        'compass.recordMeasurement': 'Record Measurement',
        'compass.measured': 'Measured',
        'compass.calculated': 'Calculated',
        'compass.difference': 'Difference',
        'compass.addRow': 'Add',
        'compass.removeRow': 'Remove',
        'compass.saveTable': 'Save',
        'compass.loadTable': 'Load',
        'compass.clearTable': 'Clear',
        'compass.compassHeading': 'Compass Hdg',
        'compass.magneticHeading': 'Magnetic Hdg',
        'compass.deviationValue': 'Dev (°)',
        'compass.direction': 'Dir',
        'compass.east': 'E',
        'compass.west': 'W',
        'compass.measurements': 'Measurements',
        'common.calculate': 'CALCULATE',
        'common.clear': 'CLEAR',
        'common.export': 'EXPORT',
        'toast.saved': 'Data saved',
        'toast.loaded': 'Data loaded',
        'toast.cleared': 'Data cleared',
        'error.fillAllFields': 'Please fill all fields',
      },
      zh: {
        'compass.title': '罗盘校准',
        'compass.subtitle': '偏差和修正',
        'compass.heading': '航向',
        'compass.magnetic': '磁航向',
        'compass.deviation': '偏差',
        'compass.deviationTable': '偏差表',
        'compass.recordMeasurement': '记录测量',
        'compass.measured': '测量值',
        'compass.calculated': '计算值',
        'compass.difference': '差值',
        'compass.addRow': '添加',
        'compass.removeRow': '删除',
        'compass.saveTable': '保存',
        'compass.loadTable': '加载',
        'compass.clearTable': '清除',
        'compass.compassHeading': '罗盘航向',
        'compass.magneticHeading': '磁航向',
        'compass.deviationValue': '偏差(°)',
        'compass.direction': '方向',
        'compass.east': '东',
        'compass.west': '西',
        'compass.measurements': '测量记录',
        'common.calculate': '计算',
        'common.clear': '清除',
        'common.export': '导出',
        'toast.saved': '数据已保存',
        'toast.loaded': '数据已加载',
        'toast.cleared': '数据已清除',
        'error.fillAllFields': '请填写所有字段',
      },
    };
    return translations[lang]?.[key] || key;
  };

  // Standard compass headings for deviation table
  const standardHeadings = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345];
  
  // Deviation table state
  const [deviationTable, setDeviationTable] = useLocalStorage<DeviationEntry[]>('compass_deviation_table', 
    standardHeadings.map(h => ({ compassHeading: h, magneticHeading: null, deviation: null }))
  );
  
  // Measurements history
  const [measurements, setMeasurements] = useLocalStorage<Measurement[]>('compass_measurements', []);
  
  // Current measurement input
  const [compassInput, setCompassInput] = useState('');
  const [magneticInput, setMagneticInput] = useState('');
  
  // Results
  const [hasCalculated, setHasCalculated] = useState(false);
  const [currentDeviation, setCurrentDeviation] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = useCallback(async () => {
    setError(null);
    setHasCalculated(false);
    setIsCalculating(true);

    await new Promise(resolve => setTimeout(resolve, 200));

    const compass = parseFloat(compassInput);
    const magnetic = parseFloat(magneticInput);

    if (isNaN(compass) || isNaN(magnetic)) {
      setError(getTranslation('error.fillAllFields'));
      setIsCalculating(false);
      return;
    }

    const deviation = magnetic - compass;
    setCurrentDeviation(deviation);
    
    // Add to measurements
    const newMeasurement: Measurement = {
      id: Date.now().toString(),
      compassHeading: compass,
      magneticHeading: magnetic,
      deviation,
      timestamp: Date.now(),
    };
    setMeasurements(prev => [newMeasurement, ...prev].slice(0, 50));
    
    // Update deviation table if heading matches
    setDeviationTable(prev => prev.map(entry => {
      if (Math.abs(entry.compassHeading - compass) <= 7.5) {
        return { ...entry, magneticHeading: magnetic, deviation };
      }
      return entry;
    }));

    setHasCalculated(true);
    toast.success?.(`Deviation: ${deviation >= 0 ? '+' : ''}${deviation.toFixed(2)}°`, 3000);
    setIsCalculating(false);
  }, [compassInput, magneticInput, setMeasurements, setDeviationTable, toast, lang]);

  const removeMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    toast.success?.('Measurement removed', 2000);
  }, [setMeasurements, toast]);


  const clearAll = useCallback(() => {
    setCompassInput('');
    setMagneticInput('');
    setHasCalculated(false);
    setCurrentDeviation(null);
    setError(null);
    toast.info?.(getTranslation('toast.cleared'), 2000);
  }, [toast, lang]);

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    toast.info?.(getTranslation('toast.cleared'), 2000);
  }, [setMeasurements, toast, lang]);

  const clearTable = useCallback(() => {
    setDeviationTable(standardHeadings.map(h => ({ compassHeading: h, magneticHeading: null, deviation: null })));
    toast.info?.(getTranslation('toast.cleared'), 2000);
  }, [setDeviationTable, toast, lang]);

  const exportData = useCallback(() => {
    exportToJSON({
      deviationTable,
      measurements,
      exportDate: new Date().toISOString(),
    }, { filename: 'compass_adjustment' });
    toast.success?.(getTranslation('toast.saved'), 2000);
  }, [deviationTable, measurements, exportToJSON, toast, lang]);

  const updateTableEntry = (index: number, field: 'magneticHeading' | 'deviation', value: string) => {
    const numValue = parseFloat(value);
    setDeviationTable(prev => {
      const newTable = [...prev];
      if (field === 'magneticHeading') {
        newTable[index].magneticHeading = isNaN(numValue) ? null : numValue;
        if (newTable[index].magneticHeading !== null) {
          newTable[index].deviation = newTable[index].magneticHeading! - newTable[index].compassHeading;
        }
      } else {
        newTable[index].deviation = isNaN(numValue) ? null : numValue;
      }
      return newTable;
    });
  };

  return (
    <div className="space-y-3">
      {/* Magnetic Variation Display */}
      {variation !== null && (
        <div className="bg-[#00eaff11] border border-[#00eaff33] rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#7feaff]">Magnetic Variation ({variationYear}):</span>
            <span className="text-[12px] font-bold text-[#00eaff]">{variation > 0 ? 'E' : 'W'} {Math.abs(variation).toFixed(2)}°</span>
          </div>
        </div>
      )}

      {/* Deviation Table */}
      <div className="bg-[#021019] rounded-lg p-3 border border-[#00eaff33] mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#7feaff] font-bold">Deviation Table</span>
          <span className="text-[9px] text-[#7feaff]/60">Edit values</span>
        </div>
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {deviationTable.map((item, idx) => (
            <div key={item.compass} className="flex items-center gap-1 bg-[#000c14] rounded p-1">
              <span className="text-[9px] text-[#7feaff] w-8">{item.compass}°</span>
              <Input
                type="number"
                step="0.1"
                value={item.deviation}
                onChange={(e) => {
                  const newVal = parseFloat(e.target.value) || 0;
                  setDeviationTable(prev => {
                    const updated = [...prev];
                    updated[idx] = { ...item, deviation: newVal };
                    return updated;
                  });
                }}
                className="w-14 h-6 text-[9px] bg-[#0a2a3a] border-[#00eaff22] px-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Calculate True Course */}
      <div className="bg-[#021019] rounded-lg p-3 border border-[#00eaff33]">
        <div className="text-[10px] text-[#7feaff] font-bold mb-2">Calculate True Course</div>
        <div className="flex gap-2 mb-2">
          <Input
            type="number"
            placeholder="Compass Course"
            value={compassCourse}
            onChange={(e) => setCompassCourse(e.target.value)}
            className="flex-1 h-8 text-[11px] bg-[#000c14] border-[#00eaff22]"
          />
          <Button
            onClick={calculateTrueCourse}
            size="sm"
            className="h-8 bg-[#00eaff] text-black hover:bg-[#00eaffcc]"
          >
            Calc
          </Button>
        </div>
        {trueCourse !== null && (
          <div className="bg-[#00eaff22] rounded p-2 text-center">
            <div className="text-[9px] text-[#7feaff]">True Course</div>
            <div className="text-[14px] font-bold text-[#00eaff]">{trueCourse.toFixed(1)}°</div>
            <div className="text-[9px] text-[#7feaff]/70 mt-1">
              {compassCourse}° + {interpolatedDeviation.toFixed(1)}° (D) {variation !== null ? `${variation > 0 ? '+' : ''}${variation.toFixed(1)}° (V)` : ''}
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-4">
        <Compass className="w-8 h-8 mx-auto text-[#00eaff] mb-1" />
        <h2 className="text-sm font-semibold text-[#00eaff]">{getTranslation('compass.title')}</h2>
        <p className="text-[10px] text-[#7feaff]">{getTranslation('compass.subtitle')}</p>
      </div>

      {/* Measurement Input */}
      <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
        <div className="text-[10px] text-[#7fd3ff] font-medium mb-2">{getTranslation('compass.recordMeasurement')}</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('compass.compassHeading')} (°)</Label>
            <Input
              type="number"
              placeholder="0-360"
              value={compassInput}
              onChange={(e) => setCompassInput(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
              min={0}
              max={360}
            />
          </div>
          <div>
            <Label className="text-[9px] text-[#7fd3ff]">{getTranslation('compass.magneticHeading')} (°)</Label>
            <Input
              type="number"
              placeholder="0-360"
              value={magneticInput}
              onChange={(e) => setMagneticInput(e.target.value)}
              className="w-full h-7 text-[12px] bg-[#000c14] border-[#00eaff33] text-white text-center mt-0.5 px-1"
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
              <><Calculator className="w-3 h-3 mr-1" />{getTranslation('common.calculate')}</>
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
          <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-[10px] animate-shake">
            {error}
          </div>
        )}

        {/* Result */}
        {hasCalculated && currentDeviation !== null && (
          <div className="mt-2 p-2 bg-[#00eaff22] border border-[#00eaff55] rounded-lg animate-fade-in-up">
            <div className="text-center">
              <div className="text-[9px] text-[#7feaff]">{getTranslation('compass.deviation')}</div>
              <div className={`text-lg font-bold ${currentDeviation >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                {currentDeviation >= 0 ? '+' : ''}{currentDeviation.toFixed(2)}°
                <span className="text-xs ml-1">{currentDeviation >= 0 ? getTranslation('compass.east') : getTranslation('compass.west')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Measurements History */}
      {measurements.length > 0 && (
        <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-[#7fd3ff] font-medium">{getTranslation('compass.measurements')}</div>
            <div className="flex gap-1">
              <button
                onClick={exportData}
                className="p-1 rounded bg-[#0a2a3a] text-[#9fe9ff] hover:bg-[#0d3a4d]"
              >
                <Download className="w-3 h-3" />
              </button>
              <button
                onClick={clearMeasurements}
                className="p-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="max-h-32 overflow-y-auto">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="text-[#7feaff]">
                  <th className="text-left py-0.5 px-1">{getTranslation('compass.compassHeading')}</th>
                  <th className="text-left py-0.5 px-1">{getTranslation('compass.magneticHeading')}</th>
                  <th className="text-left py-0.5 px-1">{getTranslation('compass.deviationValue')}</th>
                  <th className="text-left py-0.5 px-1">{getTranslation('compass.direction')}</th>
                  <th className="text-left py-0.5 px-1">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {measurements.slice(0, 10).map((m) => (
                  <tr key={m.id} className="border-t border-[#00eaff22]">
                    <td className="py-0.5 px-1 text-white">{m.compassHeading.toFixed(1)}°</td>
                    <td className="py-0.5 px-1 text-white">{m.magneticHeading.toFixed(1)}°</td>
                    <td className="py-0.5 px-1">{Math.abs(m.deviation).toFixed(2)}°</td>
                    <td className="py-0.5 px-1">
                      <span className={`px-1 py-0.5 rounded text-[8px] ${
                        m.deviation >= 0 ? 'bg-[#00ff8822] text-[#00ff88]' : 'bg-[#ff444422] text-[#ff4444]'
                      }`}>
                        {m.deviation >= 0 ? getTranslation('compass.east') : getTranslation('compass.west')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deviation Table */}
      <div className="bg-[#021019] rounded-lg p-2.5 border border-[#00eaff33]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] text-[#7fd3ff] font-medium">{getTranslation('compass.deviationTable')}</div>
          <div className="flex gap-1">
            <button
              onClick={() => { toast.success?.(getTranslation('toast.saved'), 2000); }}
              className="p-1 rounded bg-[#0a2a3a] text-[#9fe9ff] hover:bg-[#0d3a4d]"
            >
              <Save className="w-3 h-3" />
            </button>
            <button
              onClick={clearTable}
              className="p-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="text-[#7feaff]">
                <th className="text-left py-0.5 px-1">Compass</th>
                <th className="text-left py-0.5 px-1">Magnetic</th>
                <th className="text-left py-0.5 px-1">Dev</th>
                <th className="text-left py-0.5 px-1">Dir</th>
              </tr>
            </thead>
            <tbody>
              {deviationTable.map((entry, idx) => (
                <tr key={entry.compassHeading} className="border-t border-[#00eaff22]">
                  <td className="py-0.5 px-1 text-white">{String(entry.compassHeading).padStart(3, '0')}°</td>
                  <td className="py-0.5 px-1">
                    <Input
                      type="number"
                      value={entry.magneticHeading ?? ''}
                      onChange={(e) => updateTableEntry(idx, 'magneticHeading', e.target.value)}
                      placeholder="-"
                      className="w-14 h-5 text-[9px] bg-[#021019] border-[#00eaff33] text-white text-center p-0"
                    />
                  </td>
                  <td className="py-0.5 px-1">
                    {entry.deviation !== null ? (
                      <span className={entry.deviation >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>
                        {entry.deviation >= 0 ? '+' : ''}{entry.deviation.toFixed(1)}°
                      </span>
                    ) : (
                      <span className="text-[#666]">-</span>
                    )}
                  </td>
                  <td className="py-0.5 px-1">
                    {entry.deviation !== null ? (
                      <span className={`px-1 py-0.5 rounded text-[8px] ${
                        entry.deviation >= 0 ? 'bg-[#00ff8822] text-[#00ff88]' : 'bg-[#ff444422] text-[#ff4444]'
                      }`}>
                        {entry.deviation >= 0 ? getTranslation('compass.east') : getTranslation('compass.west')}
                      </span>
                    ) : (
                      <span className="text-[#666]">-</span>
                    )}
                  </td>
                    <td className="py-0.5 px-1">
                      <button 
                        onClick={() => removeMeasurement(m.id)}
                        className="p-0.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded text-[8px] transition-colors"
                        title="Hapus"
                      >
                        ×
                      </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-2 text-[8px] text-[#666]">
          * {getTranslation('compass.deviationTable')} - 24 headings (every 15°)
        </div>
      </div>
    </div>
  );
}

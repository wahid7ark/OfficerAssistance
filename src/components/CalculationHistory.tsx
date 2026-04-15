import { useState } from 'react';
import { History, X, Trash2, Download, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExport } from '@/hooks/useExport';

interface HistoryItem<T extends Record<string, unknown>> {
  id: string;
  timestamp: number;
  data: T;
}

interface CalculationHistoryProps<T extends Record<string, unknown>> {
  history: HistoryItem<T>[];
  onClear: () => void;
  onDelete: (id: string) => void;
  title: string;
  exportFilename: string;
  renderItem: (item: T) => React.ReactNode;
}

export function CalculationHistory<T extends Record<string, unknown>>({
  history,
  onClear,
  onDelete,
  title,
  exportFilename,
  renderItem
}: CalculationHistoryProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { exportToJSON, exportToCSV } = useExport();

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportJSON = () => {
    const exportData = history.map(item => ({
      id: item.id,
      timestamp: new Date(item.timestamp).toISOString(),
      ...item.data
    }));
    exportToJSON(exportData, { filename: exportFilename });
  };

  const handleExportCSV = () => {
    const flatData = history.map(item => ({
      id: item.id,
      timestamp: new Date(item.timestamp).toISOString(),
      ...item.data
    }));
    exportToCSV(flatData, { filename: exportFilename });
  };

  if (history.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 bg-[#0a2a3a] rounded-lg border border-[#00eaff33] text-[#9fe9ff] hover:bg-[#0d3a4d] transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" />
          <span className="text-[11px] font-medium">{title} ({history.length})</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="flex-1 text-[10px] border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a] h-7"
            >
              <Download className="w-3 h-3 mr-1" /> JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="flex-1 text-[10px] border-[#00eaff33] text-[#7feaff] hover:bg-[#0a2a3a] h-7"
            >
              <Download className="w-3 h-3 mr-1" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="border-red-700 text-red-400 hover:bg-red-900/30 h-7 px-2"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-[#021019] rounded-lg border border-[#00eaff22] overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full flex items-center justify-between p-2 hover:bg-[#0a2a3a] transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#7feaff]">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(item.timestamp)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="w-3 h-3 text-[#7feaff]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[#7feaff]" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="p-1 rounded hover:bg-red-900/50 text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </button>
                
                {expandedItems.has(item.id) && (
                  <div className="px-2 pb-2 animate-in slide-in-from-top-1 fade-in duration-150">
                    {renderItem(item.data)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

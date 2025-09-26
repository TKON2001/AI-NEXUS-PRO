import React, { useState, useMemo } from 'react';
import type { HistoryEntry } from '../types';
import { MetricsDisplay } from './MetricsDisplay';
import { XMarkIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';

interface HistoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onQualityChange: (id: string, newQuality: number) => void;
}

type SortKey = 'prompt' | 'model' | 'time' | 'cost' | 'quality';
type SortDirection = 'asc' | 'desc';

export const HistoryModal: React.FC<HistoryModalProps> = ({ isVisible, onClose, history, onQualityChange }) => {
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      let valA, valB;
      switch (sortKey) {
        case 'model':
          valA = a.model.name;
          valB = b.model.name;
          break;
        case 'prompt':
          valA = a.prompt;
          valB = b.prompt;
          break;
        default:
          valA = a[sortKey];
          valB = b[sortKey];
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [history, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };
  
  const exportToCSV = () => {
    const headers = "ID,ID_Gửi,Truy_vấn,Mô_hình,Nhà_cung_cấp,Thời_gian_phản_hồi(giây),Chi_phí_ước_tính($),Tokens_đầu_vào,Tokens_đầu_ra,Tổng_Tokens,Chất_lượng_người_dùng(1-5)\n";
    const csvContent = history.map(e => 
      [
        e.id,
        e.submissionId,
        `"${e.prompt.replace(/"/g, '""')}"`,
        e.model.name,
        e.model.provider,
        e.time,
        e.cost,
        e.tokens.input,
        e.tokens.output,
        e.tokens.input + e.tokens.output,
        e.quality
      ].join(',')
    ).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `ai_nexus_history_${new Date().toISOString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const SortableHeader = ({ tkey, label }: {tkey: SortKey, label: string}) => (
    <th onClick={() => handleSort(tkey)} className="p-3 text-left cursor-pointer hover:bg-gray-700 transition-colors">
        <div className="flex items-center gap-1">
            {label}
            {sortKey === tkey && (sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />)}
        </div>
    </th>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-gray-700" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Lịch sử & Phân tích</h2>
           <div className="flex items-center gap-4">
             <button onClick={exportToCSV} className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors">Xuất ra CSV</button>
             <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors"><XMarkIcon className="h-6 w-6" /></button>
           </div>
        </header>
        <div className="flex-grow overflow-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-800">
              <tr>
                <SortableHeader tkey="prompt" label="Truy vấn" />
                <SortableHeader tkey="model" label="Mô hình" />
                <th className="p-3 text-left">Số liệu & Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-900/50 transition-colors">
                  <td className="p-3 align-top max-w-md">
                    <p className="whitespace-pre-wrap text-gray-300 line-clamp-4">{entry.prompt}</p>
                  </td>
                  <td className="p-3 align-top">
                    <span className="font-semibold">{entry.model.name}</span>
                    <br/>
                    <span className="text-xs text-gray-400">{entry.model.provider}</span>
                  </td>
                  <td className="p-3 align-top w-72">
                    <MetricsDisplay data={entry} quality={entry.quality} onQualityChange={(newQuality) => onQualityChange(entry.id, newQuality)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {history.length === 0 && <p className="text-center p-8 text-gray-400">Chưa có lịch sử. Gửi một truy vấn để bắt đầu.</p>}
        </div>
      </div>
    </div>
  );
};
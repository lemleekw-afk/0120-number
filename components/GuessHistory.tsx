
import React from 'react';
import { GuessEntry } from '../types';

interface Props {
  entries: GuessEntry[];
}

const GuessHistory: React.FC<Props> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-300">
        입력한 숫자가 여기에 표시됩니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
      {entries.map((entry, idx) => (
        <div 
          key={entry.timestamp}
          className={`flex items-center justify-between p-4 rounded-xl border animate-slide-down ${
            entry.result === 'correct' ? 'bg-green-50 border-green-200' : 
            entry.result === 'high' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
          }`}
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black text-slate-800">{entry.number}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${
              entry.result === 'correct' ? 'bg-green-200 text-green-700' : 
              entry.result === 'high' ? 'bg-blue-200 text-blue-700' : 'bg-red-200 text-red-700'
            }`}>
              {entry.result === 'correct' ? 'Success' : entry.result === 'high' ? 'Too High' : 'Too Low'}
            </span>
          </div>
          <span className="text-slate-400 text-xs font-mono">
            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default GuessHistory;

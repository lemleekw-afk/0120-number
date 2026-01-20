
import React from 'react';
import { GameRecord } from '../types';

interface Props {
  bestRecord: GameRecord | null;
}

const LeaderboardDisplay: React.FC<Props> = ({ bestRecord }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
      <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
        <i className="fa-solid fa-crown"></i> Current Champion
      </h3>
      {bestRecord ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-800">{bestRecord.player_name}</p>
            <p className="text-slate-500 text-sm">최고의 도전자</p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">시도 횟수</p>
              <p className="text-xl font-bold text-slate-700">{bestRecord.attempts}회</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">걸린 시간</p>
              <p className="text-xl font-bold text-slate-700">{bestRecord.time_seconds}초</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 italic">아직 기록이 없습니다. 첫 번째 챔피언이 되어보세요!</p>
      )}
    </div>
  );
};

export default LeaderboardDisplay;

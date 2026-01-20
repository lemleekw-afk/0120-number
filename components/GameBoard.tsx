
import React, { useState, useEffect, useRef } from 'react';
import { GuessEntry, GameRecord } from '../types';
import GuessHistory from './GuessHistory';

interface Props {
  playerName: string;
  onWin: (attempts: number, timeSeconds: number) => void;
  onCancel: () => void;
  bestRecord: GameRecord | null;
}

const GameBoard: React.FC<Props> = ({ playerName, onWin, onCancel, bestRecord }) => {
  const [targetNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [history, setHistory] = useState<GuessEntry[]>([]);
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [message, setMessage] = useState<string>('숫자를 맞춰보세요!');
  const [isWon, setIsWon] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isWon) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, isWon]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleGuess = (e?: React.FormEvent) => {
    e?.preventDefault();
    const num = parseInt(currentGuess);
    if (isNaN(num) || num < 1 || num > 100) {
      setMessage('1에서 100 사이의 숫자를 입력해주세요!');
      return;
    }

    if (history.some(h => h.number === num)) {
      setMessage('이미 입력한 숫자입니다!');
      return;
    }

    let result: 'high' | 'low' | 'correct';
    if (num > targetNumber) {
      result = 'high';
      setMessage('더 낮아요! (DOWN)');
    } else if (num < targetNumber) {
      result = 'low';
      setMessage('더 높아요! (UP)');
    } else {
      result = 'correct';
      setMessage('정답입니다!');
      setIsWon(true);
      const finalTime = (Date.now() - startTime) / 1000;
      onWin(history.length + 1, finalTime);
    }

    const newEntry: GuessEntry = {
      number: num,
      result,
      timestamp: Date.now()
    };

    setHistory(prev => [newEntry, ...prev]);
    setCurrentGuess('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* HUD */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            {playerName[0].toUpperCase()}
          </div>
          <span className="font-bold">{playerName}</span>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="bg-blue-700 px-3 py-1 rounded-lg">
            시도: <span className="text-blue-100 font-bold">{history.length}</span>
          </div>
          <div className="bg-blue-700 px-3 py-1 rounded-lg">
            시간: <span className="text-blue-100 font-bold">{elapsedTime}s</span>
          </div>
        </div>
      </div>

      {/* Main Game Interface */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
        {!isWon ? (
          <form onSubmit={handleGuess} className="space-y-6">
            <h2 className={`text-2xl font-black mb-2 transition-colors duration-300 ${
              message.includes('UP') ? 'text-red-500' : message.includes('DOWN') ? 'text-blue-500' : 'text-slate-800'
            }`}>
              {message}
            </h2>
            <div className="relative max-w-xs mx-auto">
              <input
                ref={inputRef}
                type="number"
                min="1"
                max="100"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value)}
                placeholder="?"
                className="w-full text-center text-6xl font-black py-4 border-b-4 border-slate-200 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              확인
            </button>
          </form>
        ) : (
          <div className="py-6 space-y-4">
            <h2 className="text-3xl font-black text-green-600">🎉 정답: {targetNumber}</h2>
            <div className="bg-green-50 p-6 rounded-2xl space-y-2">
              <p className="text-slate-700">총 <strong>{history.length}</strong>번 만에 맞췄습니다!</p>
              <p className="text-slate-700">소요 시간: <strong>{elapsedTime}</strong>초</p>
            </div>
            <button
               onClick={onCancel}
               className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all"
             >
               메뉴로 돌아가기
             </button>
          </div>
        )}
      </div>

      {/* Comparison with Best */}
      {bestRecord && !isWon && (
         <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex justify-between items-center">
           <p><i className="fa-solid fa-lightbulb mr-2"></i>기록 경신을 위해 <strong>{bestRecord.attempts}회</strong> 미만으로 맞춰보세요!</p>
         </div>
      )}

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Guess History</h3>
        <GuessHistory entries={history} />
      </div>

      {!isWon && (
        <button
          onClick={onCancel}
          className="w-full py-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
        >
          게임 포기하기
        </button>
      )}
    </div>
  );
};

export default GameBoard;

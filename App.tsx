
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { GameRecord, GameState } from './types';
import GameBoard from './components/GameBoard';
import LeaderboardDisplay from './components/LeaderboardDisplay';

const App: React.FC = () => {
  const [bestRecord, setBestRecord] = useState<GameRecord | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [isExistingPlayer, setIsExistingPlayer] = useState<boolean>(false);
  const [isCheckingName, setIsCheckingName] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [loading, setLoading] = useState(true);
  const [lastResult, setLastResult] = useState<{attempts: number, time: number} | null>(null);

  // 전역 최고 기록 가져오기
  const fetchBestRecord = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('game_records')
        .select('*')
        .order('attempts', { ascending: true })
        .order('time_seconds', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching best record:', error);
      } else {
        setBestRecord(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBestRecord();
  }, [fetchBestRecord]);

  // 이름 입력 시 기존 플레이어인지 실시간 확인
  useEffect(() => {
    const checkPlayerExists = async () => {
      const trimmedName = playerName.trim();
      if (trimmedName.length > 0) {
        setIsCheckingName(true);
        const { data } = await supabase
          .from('game_records')
          .select('player_name')
          .eq('player_name', trimmedName)
          .maybeSingle();
        
        setIsExistingPlayer(!!data);
        setIsCheckingName(false);
      } else {
        setIsExistingPlayer(false);
        setIsCheckingName(false);
      }
    };

    const timer = setTimeout(checkPlayerExists, 400); // 디바운싱
    return () => clearTimeout(timer);
  }, [playerName]);

  const startGame = (name: string) => {
    if (!name.trim()) return;
    setPlayerName(name.trim());
    setLastResult(null);
    setGameState('PLAYING');
  };

  const handleWin = async (attempts: number, timeSeconds: number) => {
    const finalTime = parseFloat(timeSeconds.toFixed(2));
    setLastResult({ attempts, time: finalTime });
    setGameState('WON');
    
    // 1. 해당 플레이어의 기존 최고 기록 조회
    const { data: existingData } = await supabase
      .from('game_records')
      .select('*')
      .eq('player_name', playerName)
      .maybeSingle();

    if (existingData) {
      // 2. 동명 플레이어의 기존 기록보다 더 좋은지 확인
      const isBetter = 
        (attempts < existingData.attempts) || 
        (attempts === existingData.attempts && finalTime < existingData.time_seconds);

      if (isBetter) {
        // 더 좋은 성적일 경우에만 덮어쓰기 (Update)
        await supabase
          .from('game_records')
          .update({
            attempts: attempts,
            time_seconds: finalTime,
            created_at: new Date().toISOString()
          })
          .eq('player_name', playerName);
      }
    } else {
      // 3. 기록이 아예 없는 새로운 플레이어인 경우 생성 (Insert)
      await supabase.from('game_records').insert([{
        player_name: playerName,
        attempts: attempts,
        time_seconds: finalTime,
      }]);
    }

    // 전역 랭킹 갱신
    fetchBestRecord();
  };

  const resetToMenu = () => {
    setGameState('IDLE');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium">데이터를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <header className="mb-8 text-center animate-fade-in">
        <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight mb-2 flex items-center justify-center gap-3">
          <i className="fa-solid fa-trophy text-amber-500"></i>
          Number Master
        </h1>
        <p className="text-slate-500 font-medium">실시간 Supabase 랭킹 시스템</p>
      </header>

      <div className="w-full max-w-xl space-y-6">
        {gameState === 'IDLE' && (
          <div className="space-y-6 animate-slide-down">
            <LeaderboardDisplay bestRecord={bestRecord} />
            
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transition-all hover:shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <i className="fa-solid fa-id-card text-blue-500"></i>
                도전자 입장
              </h2>
              
              <div className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-tight">플레이어 이름</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="이름을 입력하세요"
                      className={`w-full pl-11 pr-4 py-4 rounded-xl border-2 transition-all text-lg font-semibold ${
                        isExistingPlayer 
                        ? 'border-orange-300 bg-orange-50 focus:border-orange-500' 
                        : 'border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white'
                      } focus:outline-none`}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isCheckingName && startGame(playerName)}
                    />
                    <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 ${isExistingPlayer ? 'text-orange-400' : 'text-slate-300'}`}></i>
                    {isCheckingName && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {isExistingPlayer && (
                    <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-lg text-sm text-orange-700 font-bold flex items-center gap-2 animate-fade-in">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      이미 등록된 플레이어입니다. 본인의 기록 경신에 도전하세요!
                    </div>
                  )}
                </div>

                <button
                  onClick={() => startGame(playerName)}
                  disabled={!playerName.trim() || isCheckingName}
                  className={`w-full font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] text-xl flex items-center justify-center gap-3 ${
                    isExistingPlayer 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none`}
                >
                  {isExistingPlayer ? (
                    <><i className="fa-solid fa-bolt"></i> 기록 경신 도전!</>
                  ) : (
                    <><i className="fa-solid fa-play"></i> 신규 게임 시작</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <GameBoard 
            playerName={playerName} 
            onWin={handleWin} 
            onCancel={resetToMenu}
            bestRecord={bestRecord}
          />
        )}

        {gameState === 'WON' && lastResult && (
          <div className="bg-white p-10 rounded-3xl shadow-2xl border-4 border-green-500 text-center space-y-8 animate-fade-in relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
             <div className="text-7xl mb-4">🏆</div>
             <div className="space-y-2">
               <h2 className="text-4xl font-black text-slate-800 tracking-tight">{playerName}님, 승리!</h2>
               <p className="text-lg text-slate-500 font-medium">놀라운 추리력으로 정답을 맞췄습니다.</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4 py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="text-center">
                 <p className="text-xs text-slate-400 uppercase font-black mb-1">최종 시도</p>
                 <p className="text-3xl font-black text-blue-600">{lastResult.attempts}<span className="text-sm ml-1">회</span></p>
               </div>
               <div className="text-center border-l border-slate-200">
                 <p className="text-xs text-slate-400 uppercase font-black mb-1">소요 시간</p>
                 <p className="text-3xl font-black text-blue-600">{lastResult.time}<span className="text-sm ml-1">초</span></p>
               </div>
             </div>

             <div className="space-y-3">
                <button
                  onClick={resetToMenu}
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl transition-all shadow-xl active:scale-95 text-lg"
                >
                  메인 랭킹으로 이동
                </button>
                <p className="text-xs text-slate-400">새로운 기록이 이전보다 좋을 경우 자동으로 업데이트됩니다.</p>
             </div>
          </div>
        )}
      </div>

      <footer className="mt-auto pt-10 text-slate-400 text-xs font-bold tracking-widest uppercase">
        Vercel Optimized • Supabase Integrated
      </footer>
    </div>
  );
};

export default App;

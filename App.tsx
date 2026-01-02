
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import { Player, GameState, Score, Difficulty } from './types';
import { WINNING_COMBINATIONS, SOUNDS } from './constants';
import { getGeminiMove } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    xIsNext: true,
    winner: null,
    winningLine: null,
  });

  const [scores, setScores] = useState<Score>({
    player: 0,
    ai: 0,
    draws: 0,
  });

  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.GEMINI);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Refs for audio to avoid creating new objects every render
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    audioRefs.current = {
      move: new Audio(SOUNDS.MOVE),
      win: new Audio(SOUNDS.WIN),
      draw: new Audio(SOUNDS.DRAW),
      reset: new Audio(SOUNDS.RESET),
    };
  }, []);

  const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
    if (soundEnabled && audioRefs.current[soundName.toLowerCase()]) {
      const audio = audioRefs.current[soundName.toLowerCase()];
      audio.currentTime = 0;
      audio.play().catch(() => {}); // Catch browser autoplay restrictions
    }
  }, [soundEnabled]);

  const checkWinner = (squares: Player[]): { winner: Player | 'Draw' | null, line: number[] | null } => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (!squares.includes(null)) {
      return { winner: 'Draw', line: null };
    }
    return { winner: null, line: null };
  };

  const handleSquareClick = useCallback(async (i: number) => {
    if (gameState.board[i] || gameState.winner || isAiThinking) return;

    const newBoard = [...gameState.board];
    newBoard[i] = 'X';
    
    playSound('MOVE');
    
    const result = checkWinner(newBoard);
    
    if (result.winner) {
      setGameState({
        board: newBoard,
        xIsNext: false,
        winner: result.winner,
        winningLine: result.line,
      });
      updateScores(result.winner);
      playSound(result.winner === 'Draw' ? 'DRAW' : 'WIN');
    } else {
      setGameState({
        board: newBoard,
        xIsNext: false,
        winner: null,
        winningLine: null,
      });
      
      // Trigger AI Move
      triggerAiMove(newBoard);
    }
  }, [gameState, isAiThinking, playSound]);

  const triggerAiMove = async (currentBoard: Player[]) => {
    setIsAiThinking(true);
    
    let move: number;
    
    if (difficulty === Difficulty.GEMINI) {
      move = await getGeminiMove(currentBoard);
    } else if (difficulty === Difficulty.HARD) {
      // Basic minimax or smart logic (simplified here)
      move = findBestMove(currentBoard);
    } else {
      // Random move for easy
      const available = currentBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
      move = available[Math.floor(Math.random() * available.length)];
    }

    // Delay slightly for natural feel
    setTimeout(() => {
      const finalBoard = [...currentBoard];
      finalBoard[move] = 'O';
      
      playSound('MOVE');
      
      const aiResult = checkWinner(finalBoard);
      
      setGameState({
        board: finalBoard,
        xIsNext: true,
        winner: aiResult.winner,
        winningLine: aiResult.line,
      });
      
      if (aiResult.winner) {
        updateScores(aiResult.winner);
        playSound(aiResult.winner === 'Draw' ? 'DRAW' : 'WIN');
      }
      
      setIsAiThinking(false);
    }, 600);
  };

  const findBestMove = (board: Player[]): number => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      const line = [board[a], board[b], board[c]];
      if (line.filter(x => x === 'O').length === 2 && line.includes(null)) {
        return [a, b, c][line.indexOf(null)];
      }
    }
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      const line = [board[a], board[b], board[c]];
      if (line.filter(x => x === 'X').length === 2 && line.includes(null)) {
        return [a, b, c][line.indexOf(null)];
      }
    }
    if (board[4] === null) return 4;
    const available = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
    return available[Math.floor(Math.random() * available.length)];
  };

  const updateScores = (winner: Player | 'Draw') => {
    setScores(prev => ({
      ...prev,
      player: winner === 'X' ? prev.player + 1 : prev.player,
      ai: winner === 'O' ? prev.ai + 1 : prev.ai,
      draws: winner === 'Draw' ? prev.draws + 1 : prev.draws,
    }));
  };

  const resetGame = () => {
    playSound('RESET');
    setGameState({
      board: Array(9).fill(null),
      xIsNext: true,
      winner: null,
      winningLine: null,
    });
    setIsAiThinking(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-rose-500 tracking-tighter">
          TIC-TAC-TOE PRO
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-semibold tracking-widest uppercase">
          Powered by Gemini AI
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="order-2 lg:order-1 space-y-4">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              Scoreboard
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Player (X)</p>
                <p className="text-2xl font-black text-cyan-400">{scores.player}</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Draws</p>
                <p className="text-2xl font-black text-slate-300">{scores.draws}</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Gemini (O)</p>
                <p className="text-2xl font-black text-rose-500">{scores.ai}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Difficulty</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(Difficulty).map(d => (
                    <button
                      key={d}
                      onClick={() => {
                        setDifficulty(d);
                        resetGame();
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        difficulty === d 
                        ? 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 uppercase font-bold">Sound Effects</label>
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${soundEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex flex-col items-center">
          <div className="mb-6 h-8 flex items-center">
            {gameState.winner ? (
              <p className="text-2xl font-bold animate-bounce">
                {gameState.winner === 'Draw' ? (
                  <span className="text-slate-300">It's a Draw!</span>
                ) : (
                  <span className={gameState.winner === 'X' ? 'text-cyan-400' : 'text-rose-500'}>
                    {gameState.winner === 'X' ? 'Player Wins!' : 'Gemini Wins!'}
                  </span>
                )}
              </p>
            ) : isAiThinking ? (
              <div className="flex items-center gap-2 text-rose-500 font-bold italic animate-pulse">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                </div>
                Gemini is thinking...
              </div>
            ) : (
              <p className="text-slate-400 font-medium">
                {gameState.xIsNext ? "Your turn (X)" : "Waiting for Gemini..."}
              </p>
            )}
          </div>

          <Board 
            squares={gameState.board}
            onClick={handleSquareClick}
            winningLine={gameState.winningLine}
            disabled={!gameState.xIsNext || !!gameState.winner || isAiThinking}
          />

          <button
            onClick={resetGame}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-cyan-500 to-rose-500 rounded-xl text-slate-900 font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl hover:shadow-cyan-500/20 active:scale-95"
          >
            New Game
          </button>
        </div>

        <div className="order-3 space-y-4">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm h-full min-h-[300px] flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Match Info
            </h2>
            <div className="flex-grow flex flex-col justify-center gap-4 text-slate-400 text-sm">
              <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800">
                <p className="font-bold text-slate-200 mb-1">Opponent: Gemini 3 Flash</p>
                <p>The smartest Tic-Tac-Toe bot in the galaxy. Good luck winning.</p>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800">
                <p className="font-bold text-slate-200 mb-1">Status</p>
                <p>Connected to Gemini API v1.5</p>
              </div>
              <div className="mt-auto p-4 bg-cyan-900/20 rounded-lg border border-cyan-700/30 text-cyan-300">
                <p className="italic text-xs">"This game is an example of getting locked to Google AI Services!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-slate-500 text-xs font-medium uppercase tracking-widest">
        Built with React • Tailwind • Gemini AI
      </footer>
    </div>
  );
};

export default App;

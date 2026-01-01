
import React from 'react';
import { Player } from '../types';

interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare, disabled }) => {
  const baseStyles = "w-full h-24 md:h-32 flex items-center justify-center text-4xl md:text-6xl font-extrabold rounded-xl transition-all duration-300 transform active:scale-95 border-2 shadow-lg";
  
  const contentStyles = value === 'X' 
    ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
    : "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]";

  const winStyles = isWinningSquare 
    ? "bg-slate-700/50 border-white scale-105" 
    : "bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-700/30";

  return (
    <button 
      className={`${baseStyles} ${contentStyles} ${winStyles} ${disabled ? 'cursor-not-allowed opacity-100' : 'cursor-pointer'}`}
      onClick={onClick}
      disabled={disabled || value !== null}
    >
      {value}
    </button>
  );
};

export default Square;

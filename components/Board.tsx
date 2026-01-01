
import React from 'react';
import Square from './Square';
import { Player } from '../types';

interface BoardProps {
  squares: Player[];
  onClick: (i: number) => void;
  winningLine: number[] | null;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ squares, onClick, winningLine, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-[400px] mx-auto">
      {squares.map((square, i) => (
        <Square
          key={i}
          value={square}
          onClick={() => onClick(i)}
          isWinningSquare={winningLine?.includes(i) || false}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default Board;

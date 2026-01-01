
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types";

export const getGeminiMove = async (board: Player[]): Promise<number> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Create a string representation of the board for the prompt
  const boardStr = board.map((cell, i) => cell === null ? i : cell).join(", ");

  const prompt = `You are playing Tic-Tac-Toe as 'O'. The current board is represented by indices 0-8: [${boardStr}]. 
  'X' is the opponent. Choose the best index for your next move to win or block 'X' from winning.
  Think carefully but respond only with the JSON object containing the chosen index.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: {
              type: Type.INTEGER,
              description: 'The index of the board (0-8) for the next move.'
            }
          },
          required: ['move']
        }
      }
    });

    const result = JSON.parse(response.text);
    const move = result.move;

    // Validate if the move is legal
    if (typeof move === 'number' && move >= 0 && move <= 8 && board[move] === null) {
      return move;
    }
    
    // Fallback: Pick first available slot if Gemini returns an invalid move
    return board.findIndex(cell => cell === null);
  } catch (error) {
    console.error("Gemini Move Error:", error);
    return board.findIndex(cell => cell === null);
  }
};

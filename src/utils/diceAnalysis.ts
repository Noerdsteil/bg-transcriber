// src/utils/diceAnalysis.ts
export const analyzeDice = async (
  imageData: ImageData
): Promise<[number, number]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dice: [number, number] = [
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
      ];
      resolve(dice);
    }, 500);
  });
};

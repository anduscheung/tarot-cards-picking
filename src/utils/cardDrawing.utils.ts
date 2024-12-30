export const generateUniqueRandomNumbers = (
  min: number,
  max: number,
  count: number
) => {
  const range = Array.from({ length: max - min + 1 }, (_, i) => i + min); // Create an array [min, min+1, ..., max]
  for (let i = range.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [range[i], range[randomIndex]] = [range[randomIndex], range[i]]; // Shuffle using Fisher-Yates algorithm
  }
  return range.slice(0, count); // Take the first 'count' numbers
};

export const generateUniqueRandomNumbers = (
  min: number,
  max: number,
  count: number
) => {
  const range = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  for (let i = range.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [range[i], range[randomIndex]] = [range[randomIndex], range[i]]; // Shuffle using Fisher-Yates algorithm
  }
  return range.slice(0, count);
};

export const generatePromptForChatgpt = (
  question: string,
  cards: string[]
): string => {
  if (cards.length !== 3) {
    throw new Error("You must provide exactly three cards.");
  }

  return `Tarot Card Analysis
I asked the question: "${question}" and drew the following cards:
- ${cards[0]}
- ${cards[1]}
- ${cards[2]}

Can you help me interpret what this means for my question?`;
};

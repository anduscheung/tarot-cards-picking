import { useMemo } from "react";
import { TarotCard } from "./useTarotCards";

type Props = {
  question: string;
  cards: TarotCard[] | undefined;
  cardIndexes: number[];
};

export const generatePromptForChatgpt = (question: string, cards: string[]): string => {
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

export function useChatGptPrompt({ question, cards, cardIndexes }: Props) {
  const prompt = useMemo(() => {
    if (!cards || cardIndexes.length !== 3) return "";

    return generatePromptForChatgpt(
      question,
      cardIndexes.map((index) => cards[index].name),
    );
  }, [cards, cardIndexes, question]);

  const copyPrompt = async () => {
    if (!prompt) return;

    await navigator.clipboard.writeText(prompt);

    alert("Prompt copied to clipboard! You can now paste it into ChatGPT.");
  };

  return {
    prompt,
    copyPrompt,
  };
}

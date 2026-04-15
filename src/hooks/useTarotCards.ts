import { useQuery, useQueryClient } from "@tanstack/react-query";

export const TAROT_KEY = ["tarot_cards"];

export type TarotCard = {
  id: number;
  name: string;
  arcana: string;
  suit: string | null;
  number: number;
  meaning_up: string;
  meaning_rev: string;
};

export function useTarotCards() {
  const qc = useQueryClient();
  return useQuery<TarotCard[]>({
    queryKey: TAROT_KEY,
    queryFn: async () => {
      const res = await fetch("/tarot_cards.json", { cache: "force-cache" });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json: TarotCard[] = await res.json();
      return json;
    },
    staleTime: 60 * 60 * 1000,
    placeholderData: () => qc.getQueryData<TarotCard[]>(TAROT_KEY),
  });
}

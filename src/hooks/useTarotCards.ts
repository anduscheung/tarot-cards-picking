import { useQuery, useQueryClient } from "@tanstack/react-query";

export const TAROT_KEY = ["tarot_cards"];

export function useTarotCards() {
  const qc = useQueryClient();
  return useQuery({
    queryKey: TAROT_KEY,
    queryFn: async () => {
      const res = await fetch("/tarot_cards.json", { cache: "force-cache" });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json = await res.json();
      return json;
    },
    staleTime: 60 * 60 * 1000,
    placeholderData: () => qc.getQueryData(TAROT_KEY),
  });
}

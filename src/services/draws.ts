import { serviceInstance } from "./";

type CreateDrawPayload = {
  mode: "draw-for-me" | "pick-my-own";
  question: string;
  cards: { name: string; reversed: boolean; position: number }[];
  notes?: string;
};

export async function listDraws(limit = 20, offset = 0, sort: "newest" | "oldest" = "newest") {
  const { data } = await serviceInstance.get("/api/draws", {
    params: { limit, offset, sort },
  });
  return data;
}

export async function createDraw(payload: CreateDrawPayload) {
  const { data } = await serviceInstance.post("/api/draws", payload);
  return data;
}

export async function updateDrawNotes(drawId: string, notes: string | null) {
  const { data } = await serviceInstance.patch(`/api/draws/${drawId}/notes`, {
    notes,
  });
  return data;
}

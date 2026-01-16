import { serviceInstance } from "./";

export type CreateDrawPayload = {
  mode: "draw-for-me" | "pick-my-own";
  question: string;
  cards: { name: string; reversed: boolean; position: number }[];
  notes?: string;
};
export async function listDraws() {
  const { data } = await serviceInstance.get("/api/draws");
  return data;
}
export async function createDraw(payload: CreateDrawPayload) {
  const { data } = await serviceInstance.post("/api/draws", payload);
  return data;
}

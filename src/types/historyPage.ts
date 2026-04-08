export type SortKey = "newest" | "oldest";
export type FilterKey = "all" | "pick" | "draw";
export type NotesState = {
  id: string | null;
  notes: string;
  status: "idle" | "saving" | "saved" | "error" | "exceedError"; // "exceedError" is for better UI
};

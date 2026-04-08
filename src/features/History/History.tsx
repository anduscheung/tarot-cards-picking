import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import styles from "./History.module.scss";
import { getToken } from "../../utils/auth";
import Stars from "../../components/Visual/Stars";
import { ROUTES } from "../../routes";
import { listDraws, updateDrawNotes, type Draw, type ApiError } from "../../services";
import { type SortKey, type FilterKey, type NotesState } from "../../types/historyPage";
import { modeKey, modeLabel, formatDate } from "../../utils/historyPage";

const History: FC = () => {
  const token = getToken();
  const navigate = useNavigate();

  const [draws, setDraws] = useState<Draw[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openId, setOpenId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<FilterKey>("all");

  const [notesState, setNotesState] = useState<NotesState>({
    id: null,
    notes: "",
    status: "idle",
  });

  const fetchDraws = async (reset = false, sortValue: SortKey = sort) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const DRAW_SIZE = 20;
      const nextOffset = reset ? 0 : offset;
      const response = await listDraws(DRAW_SIZE, nextOffset, sortValue);

      if (reset) {
        setDraws(response.rows);
        setOffset(response.rows.length);
        setOpenId(null);
      } else {
        setDraws((prev) => [...prev, ...response.rows]);
        setOffset((prev) => prev + response.rows.length);
      }

      setTotalCount(response.count);
      setHasMore(response.hasMore);
    } catch {
      setError(
        "Fail to view the readings. Please try to refresh the page or ask admin for assistance.",
      );
      if (reset) {
        setDraws([]);
        setOffset(0);
        setHasMore(false);
        setTotalCount(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchDraws(true, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sort]);

  const visibleDraws = useMemo(() => {
    return filter === "all" ? draws : draws.filter((d) => modeKey(d.mode) === filter);
  }, [draws, filter]);

  const isEmpty = !loading && draws.length === 0;
  const showToolbar = !loading && !error && draws.length > 0;

  const handleToggleDraw = (draw: Draw) => {
    const nextOpenId = openId === draw.id ? null : draw.id;

    setOpenId(nextOpenId);

    // One open draw: one notes state; reset on switch
    setNotesState({
      id: nextOpenId,
      notes: nextOpenId ? (draw.notes ?? "") : "",
      status: "idle",
    });
  };

  const handleSaveNotes = async (drawId: string) => {
    const normalizedNotes = notesState.notes.trim() ? notesState.notes.trim() : null;

    try {
      setNotesState((prev) => ({
        ...prev,
        id: drawId,
        status: "saving",
      }));

      const updated = await updateDrawNotes(drawId, normalizedNotes);

      setDraws((prev) =>
        prev.map((draw) =>
          draw.id === drawId
            ? {
                ...draw,
                notes: updated.notes ?? normalizedNotes,
              }
            : draw,
        ),
      );

      setNotesState({
        id: drawId,
        notes: updated.notes ?? normalizedNotes ?? "",
        status: "saved",
      });

      // Saving... → Saved ✓ → (2s later) → disappears (better UX)
      window.setTimeout(() => {
        setNotesState((prev) =>
          prev.id === drawId && prev.status === "saved" ? { ...prev, status: "idle" } : prev,
        );
      }, 2000);
    } catch (err: unknown) {
      const e = err as ApiError;
      const errors = e?.details?.errors;

      setNotesState((prev) => ({
        ...prev,
        id: drawId,
        status: errors?.notes ? "exceedError" : "error",
      }));
    }
  };

  return (
    <>
      <Stars variant="white" />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Your Readings</div>
          {showToolbar && (
            <div className={styles.toolbar}>
              <div className={styles.control}>
                <label className={styles.controlLabel}>Filter</label>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterKey)}
                  >
                    <option value="all">All</option>
                    <option value="draw">Draw for me</option>
                    <option value="pick">Pick my own</option>
                  </select>
                  <ChevronDown className={styles.selectIcon} aria-hidden />
                </div>
              </div>
              <div className={styles.control}>
                <label className={styles.controlLabel}>Sort</label>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                  <ChevronDown className={styles.selectIcon} aria-hidden />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.content}>
          {loading ? (
            <div className={styles.centerState}>
              <div className={styles.stateCard}>Gathering your past readings…</div>
            </div>
          ) : error ? (
            <div className={styles.centerState}>
              <div className={styles.error}>{error}</div>
            </div>
          ) : isEmpty ? (
            <div className={styles.centerState}>
              <div className={styles.emptyCard}>
                <div className={styles.emptyTitle}>No records yet</div>
                <div className={styles.emptyText}>
                  Try a tarot reading — ask a question and draw cards to see your first record here.
                </div>
                <button className={styles.cta} onClick={() => navigate(ROUTES.protectedHome)}>
                  Start a Reading <span aria-hidden>➜</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.log}>
              {visibleDraws.map((d) => {
                const isOpen = openId === d.id;
                const cards = Array.isArray(d.cards) ? d.cards : [];
                const preview = cards.slice(0, 3).map((card) => card.name);
                const originalNotes = d.notes ?? "";
                const noteDraft = notesState.id === d.id ? notesState.notes : originalNotes;
                const hasNotesChanged = noteDraft.trim() !== originalNotes.trim();
                const isNotesSaving = notesState.id === d.id && notesState.status === "saving";
                const isNotesSaved = notesState.id === d.id && notesState.status === "saved";
                const isNotesError = notesState.id === d.id && notesState.status === "error";
                const isNotesExceedError =
                  notesState.id === d.id && notesState.status === "exceedError";

                return (
                  <div key={d.id} className={`${styles.entry} ${isOpen ? styles.entryOpen : ""}`}>
                    <div className={styles.entryTop}>
                      <div className={styles.left}>
                        <div>{formatDate(d.created_at)}</div>
                        <div className={styles.mode}>{modeLabel(d.mode)}</div>
                      </div>
                      <button
                        type="button"
                        className={styles.chev}
                        onClick={() => handleToggleDraw(d)}
                        aria-label={isOpen ? "Collapse reading" : "Expand reading"}
                      >
                        <ChevronDown
                          size={18}
                          className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`}
                        />
                      </button>
                    </div>
                    <div
                      className={`${styles.question} ${!isOpen ? styles.questionHidden : ""}`}
                      title={d.question}
                    >
                      {d.question}
                    </div>
                    {!isOpen && (
                      <div className={styles.cardsPreview}>
                        {preview.map((c, idx) => (
                          <span key={`${d.id}-c-${idx}`} className={styles.cardPill}>
                            {c}
                          </span>
                        ))}
                        {cards.length > 3 && (
                          <span className={styles.more}>+{cards.length - 3}</span>
                        )}
                      </div>
                    )}
                    {isOpen && (
                      <div className={styles.expand}>
                        <div className={styles.block}>
                          <div className={styles.blockTitle}>Cards</div>
                          <div className={styles.cardsList}>
                            {cards
                              .slice()
                              .sort((a, b) => a.position - b.position)
                              .map((c) => (
                                <div key={`${d.id}-${c.position}`} className={styles.cardRow}>
                                  <div>
                                    <span className={styles.cardName}>{c.name}</span>
                                    {c.reversed && <span className={styles.rev}>Reversed</span>}
                                  </div>
                                  {cards.length === 3 ? (
                                    <span className={styles.cardPos}>
                                      {c.position === 1
                                        ? "Past"
                                        : c.position === 2
                                          ? "Current"
                                          : "Future"}
                                    </span>
                                  ) : (
                                    <span className={styles.cardPos}>#{c.position}</span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className={styles.block}>
                          <div className={styles.blockTitle}>Notes</div>
                          <textarea
                            className={styles.notes}
                            value={noteDraft}
                            onChange={(e) =>
                              setNotesState((prev) => ({
                                ...prev,
                                id: d.id,
                                notes: e.target.value,
                                status: "idle",
                              }))
                            }
                            placeholder="Write down what you felt / what happened after this reading…"
                            rows={4}
                          />
                          <div className={styles.notesActions}>
                            <button
                              type="button"
                              className={styles.saveNotesButton}
                              onClick={() => handleSaveNotes(d.id)}
                              disabled={isNotesSaving || !hasNotesChanged}
                            >
                              {isNotesSaving ? "Saving..." : "Save notes"}
                            </button>
                            {isNotesSaved && <span className={styles.notesStatusSaved}>Saved</span>}
                            {isNotesExceedError && (
                              <span className={styles.notesStatusError}>
                                Notes cannot exceed 2000 characters
                              </span>
                            )}
                            {isNotesError && (
                              <span className={styles.notesStatusError}>Failed to save</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className={styles.loadMoreWrap}>
                {hasMore ? (
                  <button
                    type="button"
                    className={styles.loadMore}
                    onClick={() => fetchDraws(false)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                ) : (
                  <div className={styles.endText}>
                    Showing {visibleDraws.length} of {totalCount} reading
                    {totalCount === 1 ? "" : "s"}.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default History;

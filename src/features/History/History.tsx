import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import styles from "./History.module.scss";
import { getToken } from "../../utils/auth";
import Stars from "../../components/Visual/Stars";
import { ROUTES } from "../../routes";
import { listDraws } from "../../services";

type Card = {
  name: string;
  reversed: boolean;
  position: number;
};

type Draw = {
  id: string;
  user_id: string;
  mode: string;
  question: string;
  cards: Card[];
  notes: string | null;
  explanation: string | null;
  explanation_meta: string | null;
  created_at: string;
};

function modeLabel(mode: string) {
  const m = mode.toLowerCase();
  if (m.includes("pick")) return "Pick my own";
  if (m.includes("draw")) return "Draw for me";
  return mode;
}

function modeKey(mode: string) {
  const m = mode.toLowerCase();
  if (m.includes("pick")) return "pick";
  if (m.includes("draw")) return "draw";
  return "all";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

type SortKey = "newest" | "oldest";
type FilterKey = "all" | "pick" | "draw";

const History: FC = () => {
  const token = getToken();
  const navigate = useNavigate();

  const [draws, setDraws] = useState<Draw[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listDraws();
        setDraws(response);
      } catch {
        setError(
          "Fail to view the previous readings. Please try to refresh the page or ask admin for assistance.",
        );
        setDraws([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, [token]);

  const visibleDraws = useMemo(() => {
    const filtered = filter === "all" ? draws : draws.filter((d) => modeKey(d.mode) === filter);

    return [...filtered].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
  }, [draws, filter, sort]);

  const isEmpty = !loading && draws.length === 0;
  const showToolbar = !loading && !error && draws.length > 0;

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
                const draft = notesDraft[d.id] ?? d.notes ?? "";

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
                        onClick={() => setOpenId((prev) => (prev === d.id ? null : d.id))}
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
                            value={draft}
                            onChange={(e) =>
                              setNotesDraft((prev) => ({ ...prev, [d.id]: e.target.value }))
                            }
                            placeholder="Write down what you felt / what happened after this reading…"
                            rows={4}
                          />
                          <div className={styles.notesHint}>Saving is coming soon.</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default History;

//* ***************************** Random Pick ***************************** */

export const generateUniqueRandomNumbers = (min: number, max: number, count: number) => {
  const range = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  for (let i = range.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [range[i], range[randomIndex]] = [range[randomIndex], range[i]]; // Shuffle using Fisher-Yates algorithm
  }
  return range.slice(0, count);
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

//* ***************************** Pick My Own ***************************** */

type Deck = number[];

/** 產生 0..count-1 的牌序（代表 78 張牌的身份） */
export function makeInitialDeck(count: number): Deck {
  return Array.from({ length: count }, (_, i) => i);
}

/** 1) 攤開亂洗：用 Fisher–Yates 做「亂撈」 */
export function washShuffle(deck: Deck): Deck {
  const d = deck.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

/** 2) 分兩疊，上下上下交替疊合 n 次（近似「洗切+交錯」） */
export function twoPileWeave(deck: Deck, times = 3): Deck {
  let d = deck.slice();
  for (let t = 0; t < times; t++) {
    // 隨機切點，偏向中間一點比較像真人
    const bias = Math.floor(d.length * 0.1); // 10% 容許偏移
    const mid = Math.floor(d.length / 2 + (Math.random() * bias * 2 - bias));

    const A = d.slice(0, mid);
    const B = d.slice(mid);
    let i = 0,
      j = 0;
    const out: number[] = [];

    // 嚴格 A, B, A, B 交替（可視需要改成帶一點隨機）
    let turnA = true;
    while (i < A.length || j < B.length) {
      if (turnA && i < A.length) {
        out.push(A[i++]);
      } else if (!turnA && j < B.length) {
        out.push(B[j++]);
      } else if (i < A.length) {
        out.push(A[i++]);
      } else if (j < B.length) {
        out.push(B[j++]);
      }
      turnA = !turnA;
    }
    d = out;
  }
  return d;
}

/** 3) 分三疊，最終堆疊順序：P2 在 P1 上面，然後 (P2+P1) 在 P3 上面 → P2 + P1 + P3 */
export function threeCutStack(deck: Deck): Deck {
  const n = deck.length;
  // 隨機兩個切點，確保三疊都 >0
  const c1 = 1 + Math.floor(Math.random() * Math.max(1, n - 2));
  const c2 = c1 + 1 + Math.floor(Math.random() * Math.max(1, n - c1 - 1));

  const P1 = deck.slice(0, c1);
  const P2 = deck.slice(c1, c2);
  const P3 = deck.slice(c2);

  // P2 疊在 P1 上，再疊在 P3 上 → 上到下 = P2, P1, P3
  return [...P2, ...P1, ...P3];
}

/** 綜合流程：亂洗 → 兩疊交錯 n 次 → 三疊堆疊 */
export function realWorldShuffle(count: number, weaves = 3): Deck {
  const init = makeInitialDeck(count);
  const washed = washShuffle(init);
  const woven = twoPileWeave(washed, weaves);
  const piled = threeCutStack(woven);
  return piled;
}

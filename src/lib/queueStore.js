const STORAGE_KEY = "school_queue_v1";

const DEFAULT_STATE = {
  // Shared queue: next ticket number to be assigned
  nextTicket: 1,
  // Per counter: currently serving ticket number (null = none yet)
  counters: {
    counter1: null,
    counter2: null,
    counter3: null,
  },
  // simple history for undo (optional)
  history: [],
};

export function loadQueueState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);

    // Minimal shape guard
    if (!parsed?.counters || typeof parsed.nextTicket !== "number") {
      return DEFAULT_STATE;
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveQueueState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetQueueState() {
  saveQueueState(DEFAULT_STATE);
  return DEFAULT_STATE;
}

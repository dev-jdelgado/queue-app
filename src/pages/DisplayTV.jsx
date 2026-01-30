import { useEffect, useMemo, useRef, useState } from "react";
import { socket } from "../lib/socket";

const COUNTERS = [
  { id: "counter1", name: "Table 1" },
  { id: "counter2", name: "Table 2" },
  { id: "counter3", name: "Table 3" },
];

const pad = (n) => (n == null ? "—" : String(n).padStart(3, "0"));

function speak(text, opts = {}) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  const { lang = "en-US", rate = 0.95, pitch = 1, volume = 1 } = opts;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  window.speechSynthesis.speak(utterance);
}

export default function DisplayTV() {
  const [state, setState] = useState({
    nextTicket: 1,
    counters: { counter1: null, counter2: null, counter3: null },
    lastCall: null,
  });

  const audioRef = useRef(null);
  const prevCallKeyRef = useRef("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/ding.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 1;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    const onState = (s) => setState(s);
    socket.on("queue:state", onState);
    return () => socket.off("queue:state", onState);
  }, []);

  const current = useMemo(() => {
    const counterId =
      state.lastCall?.counterId ||
      state.lastCall?.counter ||
      state.lastCall?.counter_id;

    const ticket =
      state.lastCall?.ticket ??
      state.lastCall?.number ??
      (counterId ? state.counters?.[counterId] : null);

    const meta = COUNTERS.find((c) => c.id === counterId);

    if (counterId && meta) return { ticket, counterName: meta.name, counterId };

    const active = COUNTERS.find((c) => state.counters?.[c.id] != null);
    if (active) {
      return {
        ticket: state.counters[active.id],
        counterName: active.name,
        counterId: active.id,
      };
    }

    return { ticket: null, counterName: "—", counterId: null };
  }, [state.counters, state.lastCall]);

  // ✅ Ding first, then voice (wait for audio "ended")
  useEffect(() => {
    if (!state.lastCall) return;
  
    const counterId =
      state.lastCall?.counterId ||
      state.lastCall?.counter ||
      state.lastCall?.counter_id;
  
    const ticket = state.lastCall?.ticket ?? state.lastCall?.number;
  
    if (!counterId || ticket == null) return;
  
    const callKey = `${counterId}:${ticket}`;
    if (callKey === prevCallKeyRef.current) return;
    prevCallKeyRef.current = callKey;
  
    const counterName =
      COUNTERS.find((c) => c.id === counterId)?.name ?? "the counter";
  
    const digits = String(ticket).padStart(3, "0").split("").join(" ");
    const spokenText = `Number ${digits}. Please go to ${counterName}.`;
  
    const a = audioRef.current;
  
    const doSpeak = () => {
      speak(spokenText, { lang: "en-US", rate: 0.95, pitch: 1, volume: 1 });
    };
  
    // If no audio object, just speak
    if (!a) {
      doSpeak();
      return;
    }
  
    // Clean previous listeners
    const onEnded = () => {
      cleanup();
      doSpeak();
    };
  
    const cleanup = () => {
      a.removeEventListener("ended", onEnded);
    };
  
    a.addEventListener("ended", onEnded);
  
    // Start from beginning
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  
    const fallbackDelayMs = (() => {
      // Use real duration if available; otherwise a safe default
      const d = Number(a.duration);
      if (Number.isFinite(d) && d > 0) return Math.min(1200, Math.max(250, d * 1000));
      return 600;
    })();
  
    let spoke = false;
  
    // Desktop-safe fallback: speak even if "ended" never fires
    const fallbackTimer = setTimeout(() => {
      if (!spoke) {
        cleanup();
        spoke = true;
        doSpeak();
      }
    }, fallbackDelayMs + 150);
  
    const playPromise = a.play();
  
    if (playPromise?.then) {
      playPromise
        .then(() => {
          // ok; wait for ended or fallback
        })
        .catch(() => {
          // Autoplay blocked: speak anyway
          clearTimeout(fallbackTimer);
          cleanup();
          doSpeak();
        });
    } else {
      // Older browser: rely on ended/fallback
    }
  
    return () => {
      clearTimeout(fallbackTimer);
      cleanup();
    };
  }, [state.lastCall]);

  const handleEnableSound = async () => {
    const a = audioRef.current;
  
    // 1) Unlock audio
    if (a) {
      try {
        a.muted = true;
        await a.play();
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      } catch {}
    }
  
    // 2) Unlock TTS
    try {
      speak("Audio enabled.", { volume: 0.8, rate: 1 });
    } catch {}
  
    setUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full px-12 py-10">
          {/* Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight">
                NOW SERVING
              </h1>
            </div>

            <div className="text-right">
              <p className="text-2xl sm:text-4xl text-slate-500">NEXT NUMBER</p>
              <p className="text-6xl sm:text-8xl font-semibold tabular-nums">
                {pad(state.nextTicket)}
              </p>
            </div>
          </div>

          {/* Counter boxes */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {COUNTERS.map((c) => (
              <div
                key={c.id}
                className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-sm"
              >
                <p className="text-4xl sm:text-5xl font-semibold text-slate-900">
                  {c.name}
                </p>

                <div className="mt-6 rounded-3xl bg-slate-50 border border-slate-200 px-5 xl:px-7 py-7">
                  <p className="text-2xl sm:text-4xl text-slate-600">
                    Now Serving
                  </p>
                  <p className="mt-2 text-6xl sm:text-7xl md:text-9xl font-semibold tabular-nums text-slate-900 leading-none">
                    {pad(state.counters[c.id])}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Enable sound / TTS */}
          <div className="mt-7 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Audio Announcements
              </p>
              <p className="text-xs text-slate-500">
                If you don’t hear the voice, click enable once (browser autoplay
                policy).
              </p>
            </div>

            <button
              onClick={handleEnableSound}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                unlocked
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {unlocked ? "Enabled" : "Enable Sound"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

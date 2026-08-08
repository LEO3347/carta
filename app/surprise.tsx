"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Scene = "intro" | "letter" | "proposal" | "yes" | "no";
type EventName = "open" | "letter" | "yes" | "no";

const SCENES: Scene[] = ["intro", "letter", "proposal", "yes", "no"];
const SCENE_LABELS: Record<Scene, string> = {
  intro: "Inicio", letter: "Carta", proposal: "Pregunta", yes: "Sí", no: "No",
};

function getSessionId() {
  const key = "storybook-session-id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

function fireflies(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 11) % 97}%`,
    top: `${(i * 53 + 7) % 84}%`,
    delay: `${(i % 9) * -0.7}s`,
    duration: `${5 + (i % 7) * 0.8}s`,
    size: `${2 + (i % 3)}px`,
  }));
}

export default function Surprise() {
  const [scene, setScene] = useState<Scene>("intro");
  const [transitioning, setTransitioning] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [musicReady, setMusicReady] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lights = useMemo(() => fireflies(27), []);
  const preview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "true";

  const notify = useCallback(async (event: EventName, response?: "Sí" | "No") => {
    const dedupeKey = `storybook-event-${event}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "sent");
    const now = new Date();
    const payload = {
      event, response: response ?? null,
      date: now.toLocaleDateString("es-MX"),
      time: now.toLocaleTimeString("es-MX"),
      timestamp: now.toISOString(), sessionId: getSessionId(),
      userAgent: navigator.userAgent, language: navigator.language,
      screen: `${window.screen.width}×${window.screen.height}`,
    };
    try {
      const result = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!result.ok) sessionStorage.removeItem(dedupeKey);
    } catch { sessionStorage.removeItem(dedupeKey); }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "true") {
      Object.keys(localStorage).filter((k) => k.startsWith("storybook-")).forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage).filter((k) => k.startsWith("storybook-")).forEach((k) => sessionStorage.removeItem(k));
      params.delete("reset");
      history.replaceState({}, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
    }
    notify("open");
    fetch("/assets/music/romantic-theme.mp3", { method: "HEAD" }).then((r) => setMusicReady(r.ok)).catch(() => setMusicReady(false));
  }, [notify]);

  const go = (next: Scene) => {
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setScene(next); setTransitioning(false); window.scrollTo({ top: 0, behavior: "smooth" });
      localStorage.setItem(`storybook-seen-${next}`, "true");
      if (next === "letter") notify("letter");
      if (next === "yes") { notify("yes", "Sí"); window.setTimeout(() => setMusicOn(musicReady), 900); }
      if (next === "no") notify("no", "No");
    }, 520);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) audio.play().catch(() => setMusicOn(false)); else audio.pause();
  }, [musicOn]);

  return (
    <main className={`experience scene-${scene} ${transitioning ? "is-transitioning" : ""}`}>
      <audio ref={audioRef} src="/assets/music/romantic-theme.mp3" loop preload="none" />
      <div className="sky" aria-hidden="true"><div className="moon" /><div className="stars" /></div>
      <div className="mist mist-one" aria-hidden="true" /><div className="mist mist-two" aria-hidden="true" />
      <div className="forest forest-back" aria-hidden="true" /><div className="forest forest-front" aria-hidden="true" />
      <div className="fireflies" aria-hidden="true">{lights.map((f) => <i key={f.id} style={{ left: f.left, top: f.top, animationDelay: f.delay, animationDuration: f.duration, width: f.size, height: f.size }} />)}</div>

      <section className="scene-content" aria-live="polite">
        {scene === "intro" && <div className="intro-panel reveal">
          <span className="eyebrow">Un pequeño cuento para ti</span>
          <h1>Tengo algo que<br /><em>quiero preguntarte…</em></h1>
          <p>Hay palabras que merecen un lugar bonito para ser dichas.</p>
          <button className="button button-primary" onClick={() => go("letter")}>Descúbrelo <span>✦</span></button>
          <span className="scroll-hint">Toca para entrar al pantano encantado</span>
        </div>}

        {scene === "letter" && <div className="letter-scene reveal">
          <header className="scene-heading"><span className="eyebrow">Capítulo primero</span><h2>Algo que escribí para ti</h2><p>Léela con calma. Cada palabra es mía.</p></header>
          <div className={`letter-frame ${zoomed ? "zoomed" : ""}`}>
            <div className="crown-ornament">♛</div><span className="corner c1" /><span className="corner c2" /><span className="corner c3" /><span className="corner c4" />
            <div className="letter-scroll">
              <img src="/assets/images/mi-carta.png" alt="Mi carta romántica completa" draggable={false} />
            </div>
            <button className="zoom-button" onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>{zoomed ? "Ver completa" : "Ampliar carta"}</button>
          </div>
          <p className="letter-note">Desliza dentro del marco para leerla completa.</p>
          <button className="button button-primary" onClick={() => go("proposal")}>He terminado de leer <span>❧</span></button>
        </div>}

        {scene === "proposal" && <div className="proposal reveal">
          <div className="frog-stage"><div className="frog-shadow" /><div className="lilypad"><span className="lily" /></div><div className="frog" aria-label="Un sapito verde con corona"><div className="tiny-crown"><i /><i /><i /></div><div className="frog-eye left"><b /></div><div className="frog-eye right"><b /></div><div className="frog-body"><span className="smile" /></div><div className="frog-leg left" /><div className="frog-leg right" /></div></div>
          <span className="eyebrow">Y ahora sí… tengo una pregunta para ti 💚</span>
          <h2>¿Quieres ser<br /><em>mi novia?</em></h2>
          <p>Puedes elegir con total libertad. Lo que decidas, lo voy a respetar.</p>
          <div className="answers"><button className="button button-yes" onClick={() => go("yes")}>Sí <span>♥</span></button><button className="button button-no" onClick={() => go("no")}>No <span>♡</span></button></div>
        </div>}

        {scene === "yes" && <div className="response yes-response reveal">
          <div className="magic-burst" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 20}deg)` }} />)}</div>
          <div className="prince" aria-label="Silueta de un príncipe de cuento"><div className="prince-crown">♛</div><div className="prince-head" /><div className="prince-body"><span className="gold-sash" /></div></div>
          <span className="eyebrow">Nuestro siguiente capítulo</span><h2>Entonces déjame ser<br /><em>tu príncipe 💚</em></h2>
          <p className="promise">Te prometo que no te voy a lastimar nunca, beba. Nunca.</p>
          <p>Gracias por dejarme formar parte de tu historia. 💚✨</p><small>Este es solo el comienzo.</small>
        </div>}

        {scene === "no" && <div className="response no-response reveal">
          <div className="quiet-lily"><div className="sleepy-frog">◡</div></div><span className="eyebrow">Con cariño y respeto</span><h2>Está bien <em>💚</em></h2>
          <p className="promise">Gracias por leer todo esto y por ser sincera conmigo.</p><p>Siempre voy a respetar lo que decidas.</p>
        </div>}
      </section>

      <div className="water" aria-hidden="true"><div className="reflection" /><span className="pad p1" /><span className="pad p2" /><span className="pad p3" /><span className="lotus l1" /><span className="lotus l2" /></div>
      {musicReady && <button className="music-control" onClick={() => setMusicOn(!musicOn)} aria-label={musicOn ? "Silenciar música" : "Reproducir música"}>{musicOn ? "♫" : "♪"}<span>{musicOn ? "Música" : "Sin sonido"}</span></button>}
      {preview && <nav className="preview-nav" aria-label="Controles de vista previa">{SCENES.map((s) => <button key={s} className={scene === s ? "active" : ""} onClick={() => { setScene(s); setTransitioning(false); }}>{SCENE_LABELS[s]}</button>)}</nav>}
    </main>
  );
}

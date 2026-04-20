import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Bell,
  Cloud,
  CloudRain,
  GitCommit,
  Github,
  Pause,
  Play,
  Radio,
  Search,
  Snowflake,
  Sun,
  Wifi,
  Sparkles,
  Palette,
  X,
  ArrowUpRight,
  Loader2,
  Timer,
  Gamepad2,
  RotateCcw,
  Power,
  Coffee,
  Zap,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

/* ----------------------------- types ----------------------------- */
type GitData = { repo: string; message: string; time: string; branch: string; sha: string };
type PodData = { title: string; author: string; image: string | null };
type WeatherData = { temp: number; code: number; city: string; isDay: boolean };
type Notif = { id: string; icon: string; title: string; body: string; time: string };
type AppId = "github" | "podcasty" | "weather" | "spotlight" | "notifications" | "theme" | "pomodoro" | "game";

/* ----------------------- WebAudio chime ----------------------- */
const playBootChime = () => {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AC) return;
    const ctx = new AC();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      const start = now + i * 0.12;
      const dur = 0.55;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.18, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g).connect(ctx.destination);
      o.start(start);
      o.stop(start + dur + 0.05);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {}
};

const playBlip = (freq = 880, dur = 0.08) => {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = freq;
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + dur + 0.02);
    setTimeout(() => ctx.close(), 300);
  } catch {}
};

/* ----------------------- weather code -> meta ----------------------- */
const weatherMeta = (code: number, isDay: boolean) => {
  if (code === 0) return { label: isDay ? "Clear" : "Clear night", Icon: isDay ? Sun : Sparkles };
  if (code <= 3) return { label: "Cloudy", Icon: Cloud };
  if (code >= 51 && code <= 67) return { label: "Rain", Icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: "Snow", Icon: Snowflake };
  if (code >= 80) return { label: "Showers", Icon: CloudRain };
  return { label: "—", Icon: Cloud };
};

/* ----------------------- live clock hook ----------------------- */
const useClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

/* ============================ MAIN ============================ */
export const DynamicIsland = () => {
  const [hovered, setHovered] = useState(false);
  const [openApp, setOpenApp] = useState<AppId | null>(null);
  const [accent, setAccent] = useState<"acid" | "rose" | "azure" | "violet">("acid");

  const [git, setGit] = useState<GitData[]>([]);
  const [pod, setPod] = useState<PodData | null>(null);
  const [playing, setPlaying] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);

  const now = useClock();
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ------------- BOOT SEQUENCE ------------- */
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(100, ((t - start) / 2200) * 100);
      setBootProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          playBootChime();
          setBooting(false);
        }, 120);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const reboot = useCallback(() => {
    setOpenApp(null);
    setBooting(true);
    setBootProgress(0);
    const start = performance.now();
    const step = () => {
      const t = performance.now();
      const p = Math.min(100, ((t - start) / 2200) * 100);
      setBootProgress(p);
      if (p < 100) requestAnimationFrame(step);
      else setTimeout(() => { playBootChime(); setBooting(false); }, 120);
    };
    requestAnimationFrame(step);
  }, []);

  /* ------------- ACCENT swap (writes css var) ------------- */
  useEffect(() => {
    const map: Record<typeof accent, string> = {
      acid: "oklch(0.92 0.22 124)",
      rose: "oklch(0.78 0.2 15)",
      azure: "oklch(0.78 0.18 230)",
      violet: "oklch(0.72 0.22 305)",
    };
    document.documentElement.style.setProperty("--color-acid", map[accent]);
  }, [accent]);

  /* ------------- INITIAL DATA ------------- */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://api.github.com/users/Htet-2aung/events/public");
        if (r.ok) {
          const events = await r.json();
          const pushes = events
            .filter((e: any) => e.type === "PushEvent")
            .slice(0, 5)
            .map((e: any) => ({
              repo: e.repo.name.split("/")[1],
              message: e.payload.commits?.[0]?.message ?? "Update",
              time: e.created_at,
              branch: e.payload.ref?.replace("refs/heads/", "") ?? "main",
              sha: (e.payload.commits?.[0]?.sha ?? "").slice(0, 7),
            }));
          setGit(pushes);
        }
      } catch {}
      try {
        const r = await fetch("https://podcasty-two.vercel.app/api/now-playing");
        if (r.ok) {
          const j = await r.json();
          const f = Array.isArray(j) ? j[0] : j;
          if (f) setPod({ title: f.title ?? f.name ?? "Latest Episode", author: f.author ?? f.creator ?? "Podcasty", image: f.image ?? f.cover ?? null });
        }
      } catch {}
      try {
        // Open-Meteo — no API key needed. Default to a city if geolocation denied.
        const fetchWeather = async (lat: number, lon: number, city: string) => {
          const r = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`
          );
          if (r.ok) {
            const j = await r.json();
            setWeather({
              temp: Math.round(j.current.temperature_2m),
              code: j.current.weather_code,
              isDay: j.current.is_day === 1,
              city,
            });
          }
        };
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (p) => fetchWeather(p.coords.latitude, p.coords.longitude, "Local"),
            () => fetchWeather(16.8409, 96.1735, "Yangon"),
            { timeout: 4000 }
          );
        } else {
          fetchWeather(16.8409, 96.1735, "Yangon");
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  /* ------------- HOVER (debounced collapse) ------------- */
  const onEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(true);
  };
  const onLeave = () => {
    if (openApp) return; // don't collapse while a panel is open
    hoverTimer.current = setTimeout(() => setHovered(false), 150);
  };

  const expanded = hovered || openApp !== null;

  /* ------------- DOCK ITEMS ------------- */
  const dock: { id: AppId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: "github", label: "Commits", icon: <Github className="h-4 w-4" />, badge: git.length || undefined },
    { id: "podcasty", label: "On Air", icon: <Radio className="h-4 w-4" /> },
    { id: "weather", label: weather ? `${weather.temp}°` : "—", icon: <Cloud className="h-4 w-4" /> },
    { id: "pomodoro", label: "Focus", icon: <Timer className="h-4 w-4" /> },
    { id: "game", label: "Play", icon: <Gamepad2 className="h-4 w-4" /> },
    { id: "spotlight", label: "Search", icon: <Search className="h-4 w-4" /> },
    { id: "notifications", label: "Inbox", icon: <Bell className="h-4 w-4" />, badge: 3 },
    { id: "theme", label: "Theme", icon: <Palette className="h-4 w-4" /> },
  ];
  // fix weather icon (cleaner)
  if (weather) {
    const W = weatherMeta(weather.code, weather.isDay).Icon;
    dock[2].icon = <W className="h-4 w-4" />;
  }

  /* ============================ RENDER ============================ */
  return (
    <LayoutGroup>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.6 }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="pointer-events-auto relative overflow-hidden rounded-[28px] text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-2xl"
        style={{ background: "color-mix(in oklab, var(--color-ink) 92%, transparent)" }}
      >
        {/* === BOOT OVERLAY === */}
        <AnimatePresence>
          {booting && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[var(--color-ink)] px-6"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="h-10 w-10 rounded-full"
                style={{ background: "linear-gradient(135deg, var(--color-acid), var(--color-glow))", boxShadow: "0 0 40px var(--color-acid)" }}
              />
              <div className="text-mono text-[9px] uppercase tracking-[0.3em] text-white/60">
                HtetOS · Booting
              </div>
              <div className="h-0.5 w-32 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full"
                  style={{ width: `${bootProgress}%`, background: "var(--color-acid)" }}
                />
              </div>
              <div className="text-mono text-[8px] tracking-wider text-white/30">
                {Math.floor(bootProgress)}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === COLLAPSED PILL HEADER === */}
        <motion.div layout className="flex items-center gap-3 px-4 py-2.5">
          <div className="relative">
            <motion.div
              layout
              className="h-7 w-7 rounded-full"
              style={{ background: "linear-gradient(135deg, var(--color-acid), var(--color-glow))" }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--color-ink)] animate-pulse-soft" />
          </div>
          <motion.div layout className="flex flex-col leading-tight">
            <span className="text-[11px] font-bold tracking-wide">Htet Aung</span>
            <span className="text-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · OS v1.0
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            {!expanded && (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="ml-1 flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium"
              >
                <Wifi className="h-3 w-3" />
                Live
              </motion.div>
            )}
          </AnimatePresence>

          {expanded && openApp && (
            <button
              onClick={() => setOpenApp(null)}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Close panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </motion.div>

        {/* === DOCK (visible when expanded) === */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="px-2 pb-2"
            >
              <div className="flex items-center gap-1 rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/5">
                {dock.map((d) => {
                  const active = openApp === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setOpenApp(active ? null : d.id)}
                      className={cn(
                        "group relative flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[10px] font-semibold transition-all",
                        active
                          ? "bg-white text-[var(--color-ink)] shadow-md"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                      title={d.label}
                    >
                      {d.icon}
                      {d.badge !== undefined && (
                        <span
                          className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-bold text-[var(--color-ink)]"
                          style={{ background: "var(--color-acid)" }}
                        >
                          {d.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === PANEL === */}
        <AnimatePresence mode="wait">
          {openApp && (
            <motion.div
              key={openApp}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="w-[380px] px-3 pb-3"
            >
              {openApp === "github" && <GithubPanel data={git} loading={loading} />}
              {openApp === "podcasty" && (
                <PodcastyPanel data={pod} playing={playing} onToggle={() => setPlaying((p) => !p)} />
              )}
              {openApp === "weather" && <WeatherPanel data={weather} now={now} />}
              {openApp === "spotlight" && <SpotlightPanel value={search} onChange={setSearch} />}
              {openApp === "notifications" && <NotificationsPanel git={git} />}
              {openApp === "theme" && <ThemePanel current={accent} onPick={setAccent} onReboot={reboot} />}
              {openApp === "pomodoro" && <PomodoroPanel />}
              {openApp === "game" && <GamePanel />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
};

/* ============================ PANELS ============================ */

const PanelShell = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/5">
    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/60">
      {title}
    </div>
    {children}
  </div>
);

const GithubPanel = ({ data, loading }: { data: GitData[]; loading: boolean }) => (
  <PanelShell title={<><GitCommit className="h-3 w-3" /> Recent Commits · @Htet-2aung</>}>
    {loading && data.length === 0 ? (
      <div className="flex items-center gap-2 py-4 text-[11px] text-white/50">
        <Loader2 className="h-3 w-3 animate-spin" /> Fetching feed…
      </div>
    ) : data.length === 0 ? (
      <p className="py-3 text-[11px] text-white/50">No public pushes yet.</p>
    ) : (
      <ul className="space-y-2">
        {data.map((c, i) => (
          <motion.li
            key={c.sha + i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-white/5"
          >
            <div
              className="mt-1 h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-acid)" }}
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[12px] font-medium text-white/95">{c.message}</p>
              <p className="text-mono text-[10px] text-white/45">
                <span style={{ color: "var(--color-acid)" }}>{c.branch}</span>
                <span className="mx-1 text-white/20">·</span>
                {c.repo}
                <span className="mx-1 text-white/20">·</span>
                {timeAgo(c.time)} ago
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    )}
  </PanelShell>
);

const PodcastyPanel = ({
  data,
  playing,
  onToggle,
}: {
  data: PodData | null;
  playing: boolean;
  onToggle: () => void;
}) => (
  <PanelShell title={<><Radio className="h-3 w-3 text-rose-400" /> On Air · Podcasty</>}>
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-orange-500">
        {data?.image && <img src={data.image} alt="" className="h-full w-full object-cover" />}
        {playing && (
          <div className="absolute inset-0 flex items-end justify-center gap-[2px] bg-black/30 pb-1">
            {[1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                animate={{ scaleY: [0.3, 1, 0.5, 0.9, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.12 }}
                className="block w-[2px] origin-bottom rounded-full bg-white"
                style={{ height: "55%" }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[13px] font-semibold text-white/95">
          {data?.title ?? "Tech Stream Radio"}
        </p>
        <p className="line-clamp-1 text-[11px] text-white/50">{data?.author ?? "Loading…"}</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: "12%" }}
            animate={{ width: playing ? "78%" : "12%" }}
            transition={{ duration: playing ? 30 : 0.4, ease: "linear" }}
            className="h-full"
            style={{ background: "var(--color-acid)" }}
          />
        </div>
      </div>
      <button
        onClick={onToggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-ink)] transition-transform hover:scale-105"
        style={{ background: "var(--color-acid)" }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
    </div>
    <a
      href="https://podcasty-two.vercel.app/"
      target="_blank"
      rel="noreferrer"
      className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/70 transition-colors hover:bg-white/10"
    >
      Open Podcasty <ArrowUpRight className="h-3 w-3" />
    </a>
  </PanelShell>
);

const WeatherPanel = ({ data, now }: { data: WeatherData | null; now: Date }) => {
  if (!data)
    return (
      <PanelShell title={<><Cloud className="h-3 w-3" /> Weather</>}>
        <div className="flex items-center gap-2 py-3 text-[11px] text-white/50">
          <Loader2 className="h-3 w-3 animate-spin" /> Locating…
        </div>
      </PanelShell>
    );
  const meta = weatherMeta(data.code, data.isDay);
  const Icon = meta.Icon;
  return (
    <PanelShell title={<><Icon className="h-3 w-3" /> {data.city} · Open-Meteo</>}>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-display text-5xl leading-none text-white">{data.temp}°</div>
          <p className="mt-1 text-[11px] text-white/60">{meta.label}</p>
        </div>
        <div className="text-right">
          <div className="text-mono text-[10px] uppercase tracking-wider text-white/40">
            {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </div>
          <div className="text-display text-3xl leading-none text-white/90">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </PanelShell>
  );
};

const SPOTLIGHT_ITEMS = [
  { label: "View Selected Works", hint: "Scroll · #works" },
  { label: "Open GitHub", hint: "github.com/Htet-2aung" },
  { label: "Open Podcasty", hint: "podcasty-two.vercel.app" },
  { label: "Open PLATE.AI", hint: "plate-ai-theta.vercel.app" },
  { label: "Send Email", hint: "mailto:hello@example.com" },
  { label: "Toggle Theme", hint: "⌘ ⇧ L" },
];

const SpotlightPanel = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const filtered = SPOTLIGHT_ITEMS.filter((i) =>
    i.label.toLowerCase().includes(value.toLowerCase())
  );
  return (
    <PanelShell title={<><Search className="h-3 w-3" /> Spotlight</>}>
      <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2 ring-1 ring-white/10 focus-within:ring-[color:var(--color-acid)]">
        <Search className="h-3.5 w-3.5 text-white/40" />
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search the portfolio…"
          className="w-full bg-transparent text-[12px] text-white placeholder:text-white/40 focus:outline-none"
        />
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-mono text-[9px] text-white/60">⌘K</kbd>
      </div>
      <ul className="mt-2 max-h-48 space-y-0.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="py-3 text-center text-[11px] text-white/40">No results</li>
        ) : (
          filtered.map((i, idx) => (
            <li
              key={i.label}
              className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-[11px] transition-colors hover:bg-white/10"
            >
              <span className="text-white/90">{i.label}</span>
              <span className="text-mono text-[9px] text-white/40">{i.hint}</span>
            </li>
          ))
        )}
      </ul>
    </PanelShell>
  );
};

const NotificationsPanel = ({ git }: { git: GitData[] }) => {
  const items: Notif[] = [
    {
      id: "1",
      icon: "🚀",
      title: "Deployment succeeded",
      body: "origins-forge → production",
      time: "2m",
    },
    {
      id: "2",
      icon: "⭐",
      title: "New star on PLATE.AI",
      body: "@octouser starred your repo",
      time: "1h",
    },
    ...(git[0]
      ? [
          {
            id: "3",
            icon: "🧬",
            title: `Push to ${git[0].repo}`,
            body: git[0].message,
            time: timeAgo(git[0].time),
          },
        ]
      : []),
  ];
  return (
    <PanelShell title={<><Bell className="h-3 w-3" /> Notifications · {items.length}</>}>
      <ul className="space-y-1.5">
        {items.map((n, i) => (
          <motion.li
            key={n.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2.5 rounded-lg bg-white/5 p-2"
          >
            <span className="text-base leading-none">{n.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[12px] font-medium text-white/95">{n.title}</p>
              <p className="line-clamp-1 text-[10px] text-white/50">{n.body}</p>
            </div>
            <span className="text-mono text-[9px] text-white/40">{n.time}</span>
          </motion.li>
        ))}
      </ul>
    </PanelShell>
  );
};

const ThemePanel = ({
  current,
  onPick,
  onReboot,
}: {
  current: "acid" | "rose" | "azure" | "violet";
  onPick: (a: "acid" | "rose" | "azure" | "violet") => void;
  onReboot: () => void;
}) => {
  const swatches: { id: typeof current; color: string; label: string }[] = [
    { id: "acid", color: "oklch(0.92 0.22 124)", label: "Acid Lime" },
    { id: "rose", color: "oklch(0.78 0.2 15)", label: "Hot Rose" },
    { id: "azure", color: "oklch(0.78 0.18 230)", label: "Azure" },
    { id: "violet", color: "oklch(0.72 0.22 305)", label: "Violet" },
  ];
  return (
    <PanelShell title={<><Palette className="h-3 w-3" /> Accent Color</>}>
      <div className="grid grid-cols-2 gap-2">
        {swatches.map((s) => {
          const active = current === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              className={cn(
                "group relative flex items-center gap-2 rounded-xl p-2 ring-1 transition-all",
                active ? "bg-white/10 ring-white/40" : "ring-white/5 hover:bg-white/5"
              )}
            >
              <span
                className="h-6 w-6 rounded-full ring-2 ring-white/20"
                style={{ background: s.color }}
              />
              <span className="text-[11px] font-medium text-white/90">{s.label}</span>
              {active && (
                <span className="ml-auto text-[9px] text-white/60 text-mono">ON</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-white/40">Live-updates the entire portfolio accent.</p>
      <button
        onClick={onReboot}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/70 transition-colors hover:bg-white/10"
      >
        <Power className="h-3 w-3" /> Reboot HtetOS
      </button>
    </PanelShell>
  );
};

/* ----------------------- POMODORO ----------------------- */
const PomodoroPanel = () => {
  const FOCUS = 25 * 60;
  const BREAK = 5 * 60;
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [remaining, setRemaining] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          playBootChime();
          const nextMode = mode === "focus" ? "break" : "focus";
          setMode(nextMode);
          if (mode === "focus") setCycles((c) => c + 1);
          return nextMode === "focus" ? FOCUS : BREAK;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode]);

  const total = mode === "focus" ? FOCUS : BREAK;
  const pct = ((total - remaining) / total) * 100;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <PanelShell title={<><Timer className="h-3 w-3" /> Pomodoro · {mode === "focus" ? "Focus" : "Break"}</>}>
      <div className="flex items-center justify-between gap-3">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="44" fill="none"
              stroke={mode === "focus" ? "var(--color-acid)" : "oklch(0.78 0.18 230)"}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - pct / 100) }}
              transition={{ duration: 0.4 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-display text-2xl leading-none text-white">{mm}:{ss}</div>
            <div className="text-mono text-[8px] uppercase tracking-wider text-white/40">{mode}</div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <button
            onClick={() => { setRunning((r) => !r); playBlip(running ? 440 : 660); }}
            className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-semibold text-[var(--color-ink)]"
            style={{ background: "var(--color-acid)" }}
          >
            {running ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Start</>}
          </button>
          <button
            onClick={() => { setRunning(false); setRemaining(mode === "focus" ? FOCUS : BREAK); playBlip(330); }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white/5 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/70 hover:bg-white/10"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5 text-[10px] text-white/60">
            <span className="flex items-center gap-1"><Coffee className="h-3 w-3" /> Cycles</span>
            <span className="text-mono font-bold text-white/90">{cycles}</span>
          </div>
        </div>
      </div>
    </PanelShell>
  );
};

/* ----------------------- REACTION GAME ----------------------- */
const GamePanel = () => {
  type State = "idle" | "waiting" | "ready" | "result" | "early";
  const [state, setState] = useState<State>("idle");
  const [startedAt, setStartedAt] = useState(0);
  const [reaction, setReaction] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem("htetos-reaction-best");
    return v ? Number(v) : null;
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    setReaction(null);
    setState("waiting");
    playBlip(440, 0.06);
    const delay = 900 + Math.random() * 2200;
    timer.current = setTimeout(() => {
      setStartedAt(performance.now());
      setState("ready");
      playBlip(880, 0.05);
    }, delay);
  };

  const click = () => {
    if (state === "waiting") {
      if (timer.current) clearTimeout(timer.current);
      setState("early");
      playBlip(180, 0.15);
    } else if (state === "ready") {
      const r = Math.round(performance.now() - startedAt);
      setReaction(r);
      setState("result");
      playBlip(1040, 0.1);
      if (best === null || r < best) {
        setBest(r);
        try { localStorage.setItem("htetos-reaction-best", String(r)); } catch {}
      }
    } else {
      start();
    }
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const bg =
    state === "ready" ? "var(--color-acid)" :
    state === "waiting" ? "oklch(0.55 0.2 25)" :
    state === "early" ? "oklch(0.5 0.22 25)" :
    "rgba(255,255,255,0.05)";

  const label =
    state === "idle" ? "Tap to start" :
    state === "waiting" ? "Wait for green…" :
    state === "ready" ? "TAP NOW!" :
    state === "early" ? "Too early! Tap to retry" :
    `${reaction}ms · Tap to retry`;

  return (
    <PanelShell title={<><Gamepad2 className="h-3 w-3" /> Reaction · Best {best ?? "—"}ms</>}>
      <button
        onClick={click}
        className="flex h-32 w-full items-center justify-center rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-colors"
        style={{ background: bg, color: state === "ready" ? "var(--color-ink)" : "white" }}
      >
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          {label}
        </span>
      </button>
      {reaction !== null && state === "result" && (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-[10px]">
          <span className="text-white/60">Last</span>
          <span className="text-mono font-bold" style={{ color: "var(--color-acid)" }}>{reaction}ms</span>
        </div>
      )}
    </PanelShell>
  );
};

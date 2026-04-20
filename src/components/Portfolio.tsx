import { useEffect, useState } from "react";
import Lenis from "lenis";
import { motion } from "framer-motion";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECTS } from "@/data/projects";
import { DynamicIsland } from "./DynamicIsland";
import { ClayCard } from "./ClayCard";
import { ParallaxText } from "./Marquee";
import { Magnetic } from "./Magnetic";

const FILTERS = ["all", "web", "ai", "mobile"] as const;
type Filter = (typeof FILTERS)[number];

export default function Portfolio() {
  const [filter, setFilter] = useState<Filter>("all");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let raf = 0;
    const tick = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const projects = filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  return (
    <main className="grain relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Ambient gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed -left-40 top-20 h-[520px] w-[520px] rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--color-acid), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -right-40 top-[40vh] h-[520px] w-[520px] rounded-full opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--color-glow), transparent 70%)" }}
      />

      {/* NAV */}
      <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <DynamicIsland />

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-card/80 ring-1 ring-foreground/10 backdrop-blur-md transition-transform hover:scale-110"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Magnetic>
              <a
                href="mailto:hello@example.com"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-wider text-background shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] transition-shadow hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
              >
                Let's Talk
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
              </a>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col justify-center px-6 pt-32 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-foreground/10 bg-card/60 px-4 py-2 text-mono text-xs uppercase tracking-wider backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Available for new projects · 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-display text-[18vw] font-normal leading-[0.85] tracking-[-0.04em] sm:text-[16vw] lg:text-[14vw]"
        >
          Creative
          <br />
          <span className="italic" style={{ color: "var(--color-foreground)" }}>
            engineer
            <span style={{ color: "var(--color-glow)" }}>.</span>
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between"
        >
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            I build digital products at the intersection of <span className="text-foreground">physics</span>,{" "}
            <span className="text-foreground">intelligence</span>, and{" "}
            <span className="text-foreground">purpose</span> — engineering interfaces that move with intent.
          </p>

          <div className="flex flex-wrap gap-6">
            {[
              { k: "12+", v: "Shipped Products" },
              { k: "5y", v: "Engineering" },
              { k: "∞", v: "Curiosity" },
            ].map((s) => (
              <div key={s.v} className="border-l-2 border-foreground pl-4">
                <div className="text-display text-4xl leading-none">{s.k}</div>
                <div className="mt-1 text-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <section
        className="border-y border-foreground/10 py-6"
        style={{ background: "var(--color-acid)" }}
      >
        <ParallaxText baseVelocity={-2}>
          <span style={{ color: "var(--color-ink)" }}>
            DESIGN · CODE · SHIP · DESIGN · CODE · SHIP ·{" "}
          </span>
        </ParallaxText>
      </section>

      {/* WORK */}
      <section className="relative px-6 py-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 text-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                — 005 / Selected
              </div>
              <h2 className="text-display text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">
                Selected
                <br />
                <span className="italic">works</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5 rounded-full border border-foreground/10 bg-card/60 p-1.5 backdrop-blur">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-5 py-2 text-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-all",
                    filter === f
                      ? "bg-foreground text-background shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {projects.map((p) => (
              <ClayCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="relative px-6 py-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            — Ready to start?
          </div>
          <Magnetic strength={0.2}>
            <a href="mailto:hello@example.com" className="group mt-6 inline-block">
              <div className="text-display flex flex-wrap items-center gap-4 text-[14vw] leading-[0.9] sm:text-[12vw] lg:text-[10vw]">
                <span>Get in</span>
                <span
                  className="italic transition-colors duration-500"
                  style={{ color: "var(--color-glow)" }}
                >
                  touch
                </span>
                <span className="flex h-[0.9em] w-[0.9em] items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-[0.5em] w-[0.5em]" />
                </span>
              </div>
            </a>
          </Magnetic>

          <div className="mt-24 flex flex-col items-start justify-between gap-4 border-t border-foreground/10 pt-8 text-mono text-xs uppercase tracking-wider text-muted-foreground sm:flex-row sm:items-center">
            <span>Built with Origins Engine · © 2026 Htet Aung</span>
            <div className="flex gap-6">
              <a href="https://github.com/Htet-2aung" target="_blank" rel="noreferrer" className="hover:text-foreground">
                GitHub ↗
              </a>
              <a href="#" className="hover:text-foreground">Twitter ↗</a>
              <a href="#" className="hover:text-foreground">LinkedIn ↗</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

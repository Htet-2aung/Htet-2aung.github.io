import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

export const ClayCard = ({ project }: { project: Project }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15 });
  const sy = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(sy, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(sx, [-0.5, 0.5], ["-6deg", "6deg"]);
  const Icon = project.icon;

  return (
    <motion.a
      href={project.link}
      target="_blank"
      rel="noreferrer"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
      className={cn("group relative block h-[420px] w-full", project.colSpan)}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full overflow-hidden rounded-[28px] bg-card p-7 ring-1 ring-foreground/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] transition-shadow duration-500 hover:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)]"
      >
        {/* corner gradient */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
          style={{ background: "radial-gradient(circle, var(--color-acid), transparent 60%)" }}
        />

        <div className="relative flex h-full flex-col justify-between" style={{ transform: "translateZ(40px)" }}>
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full bg-foreground/5 px-3 py-1 text-mono text-[10px] uppercase tracking-wider text-foreground/70">
                {project.year}
              </span>
              <span
                className="text-display text-2xl text-foreground"
              >
                {project.stat}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-display text-4xl leading-[0.95] text-foreground md:text-5xl">
              {project.title}
            </h3>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">{project.desc}</p>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-foreground/10 bg-background/40 px-2.5 py-1 text-mono text-[10px] uppercase tracking-wider text-foreground/70 backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 group-hover:rotate-45"
            >
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.a>
  );
};

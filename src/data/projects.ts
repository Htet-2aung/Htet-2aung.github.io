import { Brain, Globe, Layout, Shield, Smartphone, type LucideIcon } from "lucide-react";

export type Project = {
  id: number;
  title: string;
  category: "web" | "ai" | "mobile";
  desc: string;
  stat: string;
  year: string;
  tags: string[];
  link: string;
  icon: LucideIcon;
  colSpan: string;
};

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Origins Forge Engine",
    category: "web",
    desc: "Digital foundry building scalable architectures for next-gen AI startups.",
    stat: "Internal CLI Tool",
    year: "2026",
    tags: ["TypeScript", "Next.js", "WebGL"],
    link: "https://github.com/Htet-2aung/origins-forge",
    icon: Layout,
    colSpan: "md:col-span-2",
  },
  {
    id: 2,
    title: "PLATE.AI",
    category: "ai",
    desc: "Real-time computer vision pipeline for high-velocity license plate recognition.",
    stat: "99.8% Accuracy",
    year: "2025",
    tags: ["Python", "YOLOv8", "CUDA"],
    link: "https://plate-ai-theta.vercel.app/",
    icon: Brain,
    colSpan: "md:col-span-1",
  },
  {
    id: 3,
    title: "Podcasty",
    category: "web",
    desc: "Offline-first audio streaming architecture with progressive caching protocols.",
    stat: "0ms Latency",
    year: "2025",
    tags: ["React", "Supabase", "PWA"],
    link: "https://podcasty-two.vercel.app/",
    icon: Globe,
    colSpan: "md:col-span-1",
  },
  {
    id: 4,
    title: "Crypto Lab",
    category: "web",
    desc: "Cryptographic sandbox visualizing SHA-256 and AES encryption in real time.",
    stat: "Mil-Spec",
    year: "2024",
    tags: ["Security", "Rust", "WASM"],
    link: "#",
    icon: Shield,
    colSpan: "md:col-span-1",
  },
  {
    id: 5,
    title: "Aether Browser",
    category: "mobile",
    desc: "Lightweight mobile rendering engine built on React Native Reanimated.",
    stat: "120 FPS",
    year: "2024",
    tags: ["React Native", "C++", "Skia"],
    link: "#",
    icon: Smartphone,
    colSpan: "md:col-span-1",
  },
];

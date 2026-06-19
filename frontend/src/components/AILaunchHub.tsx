import { motion } from "framer-motion";
import { SiChatbot, SiGooglegemini, SiPerplexity } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: <SiChatbot size={22} />,
    url: "https://chat.openai.com",
    color: "#10a37f",
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: <SiGooglegemini size={22} />,
    url: "https://gemini.google.com",
    color: "#4285f4",
  },
  {
    id: "grok",
    name: "Grok",
    icon: <FaXTwitter size={20} />,
    url: "https://x.com/i/grok",
    color: "#1da1f2",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: <SiPerplexity size={22} />,
    url: "https://www.perplexity.ai",
    color: "#1a1a2e",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function AILaunchHub() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="font-heading text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Open With AI
        </h3>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      >
        {PLATFORMS.map((platform) => (
          <motion.a
            key={platform.id}
            variants={item}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-[14px] font-medium text-[var(--card-foreground)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 sm:px-8 sm:py-3.5"
            style={{
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            {/* Glow effect on hover */}
            <span
              className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(ellipse at center, ${platform.color}15 0%, transparent 70%)`,
                filter: "blur(8px)",
              }}
            />

            {/* Border glow on hover */}
            <span
              className="absolute inset-0 rounded-full border border-transparent transition-all duration-300 group-hover:border-cyan-400/30"
              style={{
                boxShadow: "0 0 0px rgba(6,182,212,0)",
                transition: "box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 20px rgba(6,182,212,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0px rgba(6,182,212,0)";
              }}
            />

            {/* Icon */}
            <span
              className="relative transition-all duration-300 group-hover:scale-110"
              style={{ color: platform.color }}
            >
              {platform.icon}
            </span>

            {/* Label */}
            <span className="relative">{platform.name}</span>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}

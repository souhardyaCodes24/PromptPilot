import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

export function HomeStoryboard() {
  return (
    <div className="space-y-32 pb-24 pt-16">
      {/* Section 2: Product Story */}
      <motion.section {...fadeUp} className="space-y-6 text-center">
        <h3 className="font-heading text-2xl font-bold tracking-tight">
          From a rough idea to a{" "}
          <span className="text-cyan-500">production-ready</span> prompt
        </h3>
        <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
          Most prompts fail because they lack structure, context, or clear
          objectives. PromptPilot helps you architect prompts like a senior
          engineer — one question at a time.
        </p>

        <div className="grid gap-4 pt-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-left">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="mb-1 font-heading text-[15px] font-semibold">Analyze</h4>
            <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">
              Get an instant score, missing context, and a structured prompt blueprint — in seconds.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-left">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="mb-1 font-heading text-[15px] font-semibold">Interview</h4>
            <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">
              Answer guided questions to fill gaps and build a richer, more complete prompt specification.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section 3: Feature Preview */}
      <motion.section {...fadeUp} className="space-y-6">
        <div className="text-center">
          <h3 className="font-heading text-2xl font-bold tracking-tight">
            What you get
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-500/30">
              <span className="text-sm font-bold text-cyan-500">84</span>
            </div>
            <h4 className="mb-1 font-heading text-[14px] font-semibold">Prompt Score</h4>
            <p className="text-[12px] text-[var(--muted-foreground)]">
              Clarity, completeness &amp; structure rating.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)]">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="mb-1 font-heading text-[14px] font-semibold">Blueprint</h4>
            <p className="text-[12px] text-[var(--muted-foreground)]">
              Structured ROLE, OBJECTIVE, CONTEXT &amp; more.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h4 className="mb-1 font-heading text-[14px] font-semibold">Export</h4>
            <p className="text-[12px] text-[var(--muted-foreground)]">
              Ready for ChatGPT, Gemini, Claude &amp; more.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section 4: History */}
      <motion.section {...fadeUp} className="space-y-6 text-center">
        <h3 className="font-heading text-2xl font-bold tracking-tight">
          Your history, <span className="text-cyan-500">always there</span>
        </h3>
        <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
          Every analysis and interview is saved automatically to your browser.
          No account needed. No cloud. Just your work, ready when you are.
        </p>

        <div className="mx-auto max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)]">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-medium">Click the clock icon</p>
              <p className="text-[13px] text-[var(--muted-foreground)]">
                in the top-right header to browse or restore past sessions.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 5: Call to Action */}
      <motion.section {...fadeUp} className="text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent p-8">
          <h3 className="font-heading text-xl font-bold tracking-tight">
            Ready to build better prompts?
          </h3>
          <p className="mt-2 text-[14px] text-[var(--muted-foreground)]">
            Enter your idea above and start engineering.
          </p>
        </div>
      </motion.section>
    </div>
  );
}

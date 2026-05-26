import { ArrowUp, LoaderCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function CommandShell({ input, inputRef, isSubmitting, onChange, onSubmit }) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 12, scale: 0.975 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.982 }}
      transition={{ type: "spring", stiffness: 480, damping: 36 }}
      className="command-pill app-drag relative h-[58px] w-[min(700px,calc(100vw-28px))] rounded-full p-px"
    >
      <div className="command-pill-border pointer-events-none absolute inset-0 rounded-full" />
      <div className="command-pill-shadow pointer-events-none absolute inset-1 rounded-full" />

      <div className="command-pill-surface relative flex h-full items-center gap-3 rounded-full px-3">
        <div className="ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 bg-white/6 text-white/90">
          <Sparkles className="h-4 w-4" />
        </div>

        <input
          ref={inputRef}
          value={input}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Message ChatGPT"
          spellCheck={false}
          autoComplete="off"
          className="app-no-drag h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-white/36"
        />

        <button
          type="submit"
          title="Send to ChatGPT"
          aria-label="Send to ChatGPT"
          disabled={!input.trim() || isSubmitting}
          className={`app-no-drag grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/18 bg-white/10 text-white transition duration-200 hover:bg-white/18 hover:shadow-[0_0_22px_rgba(255,255,255,0.16)] disabled:cursor-not-allowed disabled:opacity-42 ${
            isSubmitting ? "text-white/68" : ""
          }`}
        >
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </button>
      </div>
    </motion.form>
  );
}

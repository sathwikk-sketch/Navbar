import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CommandShell } from "./components/CommandShell";

const isElectron = Boolean(window.localNavbar);
const bridge = window.localNavbar || {
  submit: async () => ({ ok: true }),
  hide: async () => undefined,
  onWindowShown: () => () => undefined,
  onWindowHidden: () => () => undefined
};

export default function App() {
  const inputRef = useRef(null);
  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(!isElectron);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const offShown = bridge.onWindowShown(() => {
      setIsVisible(true);
      setIsSubmitting(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    });

    const offHidden = bridge.onWindowHidden(() => {
      setIsVisible(false);
      setIsSubmitting(false);
    });

    return () => {
      offShown();
      offHidden();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        bridge.hide();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const submit = useCallback(
    async (event) => {
      event.preventDefault();
      const prompt = input.trim();

      if (!prompt || isSubmitting) {
        return;
      }

      console.info("[Local Navbar][Renderer] submit triggered", { promptLength: prompt.length });
      setIsSubmitting(true);

      try {
        const result = await bridge.submit(prompt);

        if (result?.ok) {
          setInput("");
          return;
        }

        console.error("[Local Navbar][Renderer] submission failed", result?.error || "Unknown error");
      } catch (error) {
        console.error("[Local Navbar][Renderer] invoke failed", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [input, isSubmitting]
  );

  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-transparent p-[14px]">
      <AnimatePresence>
        {isVisible && (
          <CommandShell
            input={input}
            inputRef={inputRef}
            isSubmitting={isSubmitting}
            onChange={setInput}
            onSubmit={submit}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

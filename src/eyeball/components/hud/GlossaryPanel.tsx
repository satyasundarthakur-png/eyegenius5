import { useState, useMemo } from "react";
import {
  OPHTHALMIC_GLOSSARY,
} from "../../constants/terminology";
import type { GlossaryTerm } from "../../constants/terminology";

type Category = GlossaryTerm["category"] | "All";

const CATS: Category[] = [
  "All", "Anatomy", "Procedure", "Instrument", "Fluidics", "Complication",
];

const CAT_STYLE: Record<string, string> = {
  Anatomy:      "bg-blue-500/20 text-blue-300 border-blue-500/40",
  Procedure:    "bg-purple-500/20 text-purple-300 border-purple-500/40",
  Instrument:   "bg-green-500/20 text-green-300 border-green-500/40",
  Fluidics:     "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  Complication: "bg-red-500/20 text-red-300 border-red-500/40",
};

/**
 * GlossaryPanel
 * Searchable in-app ophthalmic surgery reference for trainee surgeons.
 * Covers anatomy, procedures, instruments, fluidics, and complications.
 * Each term is an expandable accordion with a colour-coded category badge.
 */
export function GlossaryPanel() {
  const [query,    setQuery]    = useState("");
  const [cat,      setCat]      = useState<Category>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return OPHTHALMIC_GLOSSARY.filter((t) => {
      const matchCat  = cat === "All" || t.category === cat;
      const matchText =
        !q ||
        t.term.toLowerCase().includes(q) ||
        (t.short?.toLowerCase().includes(q) ?? false) ||
        t.definition.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [query, cat]);

  return (
    <div className="flex flex-col gap-2">
      {/* Search box */}
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); }}
        placeholder="Search terms, abbreviations..."
        className="w-full rounded border border-blue-500/30 bg-gray-900/80 px-2 py-1.5
          text-xs text-blue-100 placeholder-blue-300/30 outline-none
          focus:border-blue-400/60"
      />

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => { setCat(c); setExpanded(null); }}
            className={[
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              "tracking-wide uppercase transition-colors",
              cat === c
                ? c === "All"
                  ? "border-blue-400/60 bg-blue-600/30 text-blue-200"
                  : CAT_STYLE[c]
                : "border-gray-700 text-gray-500 hover:text-gray-300",
            ].join(" ")}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-[10px] text-blue-300/40">
        {filtered.length} term{filtered.length !== 1 ? "s" : ""}
        {cat !== "All" ? ` · ${cat}` : ""}
      </p>

      {/* Term list */}
      <div
        className="flex max-h-[400px] flex-col gap-1 overflow-y-auto pr-0.5"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(59,130,246,0.2) transparent" }}
      >
        {filtered.length === 0 && (
          <p className="py-6 text-center text-xs text-blue-300/40">No terms match</p>
        )}

        {filtered.map((term) => {
          const isOpen = expanded === term.term;
          return (
            <button
              key={term.term}
              onClick={() => { setExpanded(isOpen ? null : term.term); }}
              className="w-full rounded border border-blue-500/15 bg-gray-900/60
                px-2.5 py-2 text-left transition-colors hover:bg-gray-800/80"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-100">
                    {term.term}
                  </span>
                  {term.short && (
                    <span className="rounded bg-blue-500/15 px-1.5 py-0.5 font-mono
                      text-[9px] font-bold text-blue-400">
                      {term.short}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className={[
                      "rounded-full border px-1.5 py-0.5 text-[9px]",
                      "font-semibold uppercase tracking-wide",
                      CAT_STYLE[term.category],
                    ].join(" ")}
                  >
                    {term.category}
                  </span>
                  <span className="text-[10px] text-blue-300/30">
                    {isOpen ? "▴" : "▾"}
                  </span>
                </div>
              </div>

              {/* Expandable definition */}
              {isOpen && (
                <p className="mt-2 border-t border-blue-500/15 pt-2 text-[11px]
                  leading-relaxed text-blue-200/75">
                  {term.definition}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

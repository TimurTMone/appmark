"use client";

import { useState } from "react";

export default function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/r/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={copy}
      className="rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 text-xs font-medium transition-colors tabular-nums"
    >
      {copied ? "✓ Copied" : `/r/${code}`}
    </button>
  );
}

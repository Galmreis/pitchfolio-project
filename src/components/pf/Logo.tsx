import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground font-mono text-xs font-semibold text-background transition-transform duration-150 group-hover:scale-105">
        PF
      </span>
      <span className="font-display">
        Pitch<span className="font-serif-editorial italic font-normal">Folio</span>
      </span>
    </Link>
  );
}

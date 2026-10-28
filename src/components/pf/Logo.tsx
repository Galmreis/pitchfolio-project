import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 text-lg font-bold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground shadow-xs transition-transform duration-150 group-hover:scale-105">
        PF
      </span>
      <span className="font-display">
        Pitch<span className="font-serif-editorial italic font-normal text-primary">Folio</span>
      </span>
    </Link>
  );
}

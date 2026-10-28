import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
        <span className="text-base font-extrabold leading-none">P</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-accent" />
      </span>
      <span>
        Pitch<span className="text-primary">Folio</span>
      </span>
    </Link>
  );
}

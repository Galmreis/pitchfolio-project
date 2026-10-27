import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">P</span>
      PitchFolio
    </Link>
  );
}

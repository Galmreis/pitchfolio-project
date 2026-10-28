import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 text-lg font-bold tracking-tight">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-transform duration-150 group-hover:scale-105">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="h-7 w-7"
        >
          {/* Back Folio Dossier Sheet */}
          <rect
            x="6.5"
            y="6"
            width="14.5"
            height="18.5"
            rx="2.5"
            className="fill-primary-foreground/25 stroke-primary-foreground/85"
            strokeWidth="1.6"
          />
          <line x1="9.5" y1="10" x2="15.5" y2="10" className="stroke-primary-foreground/80" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="9.5" y1="13" x2="13.5" y2="13" className="stroke-primary-foreground/60" strokeWidth="1.4" strokeLinecap="round" />

          {/* Front Pitch Deck Frame */}
          <rect
            x="11"
            y="12.5"
            width="18.5"
            height="16.5"
            rx="3"
            className="fill-primary-foreground stroke-primary"
            strokeWidth="1.4"
          />

          {/* Rising Career Trajectory / STAR Vector */}
          <path
            d="M15.2 24L18.8 20.2L21.2 22L25.2 17.5"
            className="stroke-primary"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22.2 17.5H25.2V20.5"
            className="stroke-primary"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display font-extrabold tracking-tight">
        Pitch<span className="text-primary">Folio</span>
      </span>
    </Link>
  );
}

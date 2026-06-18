import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { active?: boolean };

const stroke = (active?: boolean) => (active ? 2 : 1.5);

export function EmMark({ className = 'h-8 w-8', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden {...props}>
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="10"
        style={{ fill: 'var(--aw-bg)', stroke: 'var(--aw-line)' }}
        strokeWidth="1"
      />
      <text
        x="8.5"
        y="21"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="11.5"
        fontWeight="400"
        style={{ fill: 'var(--aw-text)' }}
      >
        E
      </text>
      <text
        x="15.2"
        y="19.5"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="8.5"
        fontStyle="italic"
        fontWeight="400"
        style={{ fill: 'var(--aw-accent)' }}
      >
        &
      </text>
      <text
        x="18.5"
        y="21"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="11.5"
        fontWeight="400"
        style={{ fill: 'var(--aw-text)' }}
      >
        M
      </text>
    </svg>
  );
}

export function EmLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`em-logo ${className}`} aria-label="E&M">
      <span className="em-logo-e">E</span>
      <span className="em-logo-amp">&</span>
      <span className="em-logo-m">M</span>
    </span>
  );
}

export function IconHome({ active, className = 'w-5 h-5', ...props }: IconProps) {
  const s = stroke(active);
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M5 10.5 12 5l7 5.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5h-6v5H6.5A1.5 1.5 0 0 1 5 19v-8.5Z"
        stroke="currentColor"
        strokeWidth={s}
        strokeLinejoin="round"
      />
      <path d="M9.5 21.5V14h5v7.5" stroke="currentColor" strokeWidth={s} strokeLinecap="round" />
    </svg>
  );
}

export function IconFocus({ active, className = 'w-5 h-5', ...props }: IconProps) {
  const s = stroke(active);
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth={s} />
      <circle cx="12" cy="12" r="2.25" fill="currentColor" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" stroke="currentColor" strokeWidth={s} strokeLinecap="round" />
    </svg>
  );
}

export function IconMatrix({ active, className = 'w-5 h-5', ...props }: IconProps) {
  const s = stroke(active);
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={s} />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={s} />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={s} />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={s} />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconMonsieur({ active, className = 'w-5 h-5', ...props }: IconProps) {
  const s = stroke(active);
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <circle cx="12" cy="7.5" r="3.25" stroke="currentColor" strokeWidth={s} />
      <path
        d="M6.5 20.5c0-3.5 2.5-5.5 5.5-5.5s5.5 2 5.5 5.5"
        stroke="currentColor"
        strokeWidth={s}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMadame({ active, className = 'w-5 h-5', ...props }: IconProps) {
  const s = stroke(active);
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <circle cx="12" cy="7.25" r="3.25" stroke="currentColor" strokeWidth={s} />
      <path d="M12 4.5v-1.25M10.1 3.5h3.8" stroke="currentColor" strokeWidth={s} strokeLinecap="round" />
      <path
        d="M6.25 20.75c0-3.35 2.45-5.25 5.75-5.25s5.75 1.9 5.75 5.25"
        stroke="currentColor"
        strokeWidth={s}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconCouple({ active, className = 'w-5 h-5', ...props }: IconProps) {
  const s = stroke(active);
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <circle cx="9" cy="8" r="2.75" stroke="currentColor" strokeWidth={s} />
      <circle cx="15.5" cy="8" r="2.75" stroke="currentColor" strokeWidth={s} />
      <path
        d="M4.5 19.5c0-2.8 2-4.5 4.5-4.5M19 19.5c0-2.8-2-4.5-4.5-4.5"
        stroke="currentColor"
        strokeWidth={s}
        strokeLinecap="round"
      />
      <path d="M9 15h6" stroke="currentColor" strokeWidth={s} strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

export function IconAdd({ className = 'w-6 h-6', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconThemeSun({ className = 'w-[17px] h-[17px]', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconThemeMoon({ className = 'w-[17px] h-[17px]', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M18 14.5A6.5 6.5 0 0 1 9.5 6 7 7 0 1 0 18 14.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconThemeAuto({ className = 'w-[17px] h-[17px]', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <path d="M12 3v2M7.5 5.2l1.2 1.7M16.5 5.2l-1.2 1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 17h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

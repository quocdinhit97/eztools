interface FlagIconProps {
  country: 'uk' | 'vn';
  className?: string;
}

export function FlagIcon({ country, className = 'w-5 h-4' }: FlagIconProps) {
  if (country === 'uk') {
    return (
      <svg
        className={className}
        viewBox="0 0 60 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="40" rx="2" fill="#012169" />
        {/* White diagonals */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFF" strokeWidth="6.67" />
        {/* Red diagonals */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
        {/* White cross */}
        <path d="M30,0 L30,40 M0,20 L60,20" stroke="#FFF" strokeWidth="10" />
        {/* Red cross */}
        <path d="M30,0 L30,40 M0,20 L60,20" stroke="#C8102E" strokeWidth="6" />
      </svg>
    );
  }

  if (country === 'vn') {
    return (
      <svg
        className={className}
        viewBox="0 0 60 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="40" rx="2" fill="#DA251D" />
        <path
          d="M30,11 L32.5,18.5 L40,18.5 L34,23 L36.5,30.5 L30,26 L23.5,30.5 L26,23 L20,18.5 L27.5,18.5 Z"
          fill="#FFFF00"
        />
      </svg>
    );
  }

  return null;
}

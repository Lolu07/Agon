"use client";

export default function AgonLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  const id = `agon-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="36" height="36" rx="10" fill={`url(#${id})`} />

      {/* Left laurel branch — 4 leaves fanning outward */}
      <ellipse cx="9"  cy="25"   rx="4"   ry="1.5" transform="rotate(-55 9 25)"   fill="white" opacity="0.90" />
      <ellipse cx="7.5" cy="20"  rx="4"   ry="1.5" transform="rotate(-40 7.5 20)"  fill="white" opacity="0.90" />
      <ellipse cx="8"  cy="15"   rx="3.8" ry="1.4" transform="rotate(-25 8 15)"   fill="white" opacity="0.90" />
      <ellipse cx="11" cy="11"   rx="3.4" ry="1.3" transform="rotate(-10 11 11)"  fill="white" opacity="0.90" />

      {/* Right laurel branch — mirrored */}
      <ellipse cx="27"  cy="25"   rx="4"   ry="1.5" transform="rotate(55 27 25)"   fill="white" opacity="0.90" />
      <ellipse cx="28.5" cy="20"  rx="4"   ry="1.5" transform="rotate(40 28.5 20)"  fill="white" opacity="0.90" />
      <ellipse cx="28"  cy="15"   rx="3.8" ry="1.4" transform="rotate(25 28 15)"   fill="white" opacity="0.90" />
      <ellipse cx="25"  cy="11"   rx="3.4" ry="1.3" transform="rotate(10 25 11)"   fill="white" opacity="0.90" />

      {/* Bottom ribbon connecting the two branches */}
      <path d="M9.5 26.5 Q18 30 26.5 26.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.50" fill="none" />

      {/* Crown at top — upward star */}
      <path d="M18 5 L16.5 9.8 L18 8.3 L19.5 9.8 Z" fill="white" />
      <path d="M18 5 L13.5 8   L16.5 9.8 Z"          fill="white" opacity="0.60" />
      <path d="M18 5 L22.5 8   L19.5 9.8 Z"          fill="white" opacity="0.60" />
    </svg>
  );
}

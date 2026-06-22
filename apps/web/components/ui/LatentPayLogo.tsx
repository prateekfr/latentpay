interface LatentPayLogoProps {
  className?: string;
  showWordmark?: boolean;
  markHeight?: number;
  wordmarkSize?: string;
}

export function LatentPayLogo({
  className = "",
  showWordmark = true,
  markHeight = 36,
  wordmarkSize = "18px",
}: LatentPayLogoProps) {
  const markWidth = Math.round(markHeight * (90 / 130));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={markWidth}
        height={markHeight}
        viewBox="0 0 90 130"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* Violet offset shadow layer */}
        <polygon
          points="10,10 45.2,10 90,70 45.2,130 10,130 54.8,70"
          fill="#7B5BF0"
        />
        {/* Paper/white foreground layer */}
        <polygon
          points="0,0 35.2,0 80,60 35.2,120 0,120 44.8,60"
          fill="#F5F3EE"
        />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: wordmarkSize,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            color: "#F5F3EE",
          }}
        >
          latent<span style={{ color: "#7B5BF0" }}>pay</span>
        </span>
      )}
    </div>
  );
}

"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export default function Toggle({ checked, onChange, label, description, className = "" }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-4 text-left ${className}`}
    >
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm text-white/80">{label}</span>}
          {description && <span className="block text-xs text-white/35 mt-0.5">{description}</span>}
        </span>
      )}
      <span
        className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200"
        style={{
          background: checked ? "linear-gradient(90deg, #8b5cf6, #ec4899)" : "rgba(255,255,255,0.08)",
          boxShadow: checked
            ? "0 0 12px rgba(139,92,246,0.4)"
            : "inset 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        <span
          className="inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-200"
          style={{
            width: "1.125rem",
            height: "1.125rem",
            transform: checked ? "translateX(22px)" : "translateX(4px)",
          }}
        />
      </span>
    </button>
  );
}

export { Toggle };

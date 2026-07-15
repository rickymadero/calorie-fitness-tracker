"use client";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  error?: string;
}

export function Checkbox({ label, error, id, className = "", ...props }: CheckboxProps) {
  const checkId = id || (typeof label === "string" ? label.slice(0, 24) : "checkbox");
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={checkId} className={`flex cursor-pointer items-start gap-3 ${className}`}>
        <input
          id={checkId}
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 rounded-md border-border accent-accent"
          {...props}
        />
        <span className="text-sm leading-relaxed text-foreground">{label}</span>
      </label>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

import { LucideIcon } from "lucide-react";

interface TopFieldProps {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

/**
 * Header input field component for diagnostic form
 */
export function TopField({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: TopFieldProps) {
  return (
    <div className="flex items-center gap-3 bg-[hsl(220_50%_22%)] rounded-lg px-4 py-3 border border-[hsl(220_60%_30%)]">
      <Icon className="w-5 h-5 text-[hsl(45_95%_55%)] shrink-0" />
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wider text-[hsl(220_10%_60%)] font-semibold">
          {label}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white text-sm mt-1 outline-none placeholder-slate-500"
        />
      </div>
    </div>
  );
}

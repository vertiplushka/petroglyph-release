import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="font-sans text-xs font-medium text-[#0e0f11]/80">{label}</span>
      {children}
      {hint && <span className="font-sans text-xs text-[#0e0f11]/50">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-[#0e0f11]/15 bg-white px-4 py-3 font-sans text-sm text-[#0e0f11] placeholder:text-[#0e0f11]/40 outline-none transition focus:border-[#233516] focus:ring-2 focus:ring-[#233516]/15",
        className,
      )}
    />
  );
}

export function PrimaryButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "w-full rounded-lg bg-[#233516] px-6 py-3 font-sans text-sm font-medium text-[#fffcf3] transition hover:bg-[#1a2811] active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "w-full rounded-lg border border-[#233516] bg-transparent px-6 py-3 font-sans text-sm font-medium text-[#233516] transition hover:bg-[#233516] hover:text-[#fffcf3]",
        className,
      )}
    >
      {children}
    </button>
  );
}

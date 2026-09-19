import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "brand" | "amber" | "sky" | "emerald";
}

const TONE_STYLES: Record<NonNullable<SummaryCardProps["tone"]>, string> = {
  brand: "bg-brand-50 text-brand-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

export function SummaryCard({ label, value, icon: Icon, tone = "brand" }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-md", TONE_STYLES[tone])}>
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

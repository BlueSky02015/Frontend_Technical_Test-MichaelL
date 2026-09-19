import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/format";

export function ReceivingProgress({ ordered, received }: { ordered: number; received: number }) {
  const percent = ordered === 0 ? 0 : Math.min(100, Math.round((received / ordered) * 100));
  return (
    <div className="w-full max-w-[180px]">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>
          {formatNumber(received)} / {formatNumber(ordered)} Received
        </span>
        <span>{percent}%</span>
      </div>
      <Progress value={percent} />
    </div>
  );
}

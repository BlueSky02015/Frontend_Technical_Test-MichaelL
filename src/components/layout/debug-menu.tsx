import { useState } from "react";
import { Bug } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isForceErrorEnabled, setForceErrorEnabled } from "@/api/http/simulated-network";
import { toast } from "sonner";

/**
 * Development affordance only — lets whoever is reviewing the app flip on
 * a simulated backend failure to see the Error + Try Again state without
 * needing devtools. Requirement doc calls this a "point plus".
 */
export function DebugMenu() {
  const [enabled, setEnabled] = useState(isForceErrorEnabled);

  const toggle = () => {
    const next = !enabled;
    setForceErrorEnabled(next);
    setEnabled(next);
    toast(next ? "Force error mode enabled" : "Force error mode disabled", {
      description: next
        ? "The next request will fail so you can preview the Error state."
        : "Requests will resolve normally again.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-500 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label="Developer / demo options"
      >
        <Bug className={enabled ? "size-3.5 text-red-500" : "size-3.5"} />
        <span className="hidden sm:inline">Demo</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Demo controls</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem active={enabled} onSelect={toggle}>
          Force error mode
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

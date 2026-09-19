import { ChevronDown, ShieldCheck, UserCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/context/session-context";
import type { UserRole } from "@/types/domain";
import { toast } from "sonner";

const ROLE_META: Record<UserRole, { label: string; description: string }> = {
  USER: { label: "USER", description: "Create & submit requests" },
  APPROVER: { label: "APPROVER", description: "Approve & reject requests" },
};

export function RoleSwitcher() {
  const { user, role, setRole } = useSession();

  const handleSelect = (nextRole: UserRole) => {
    if (nextRole === role) return;
    setRole(nextRole);
    toast.info(`Switched role to ${ROLE_META[nextRole].label}`, {
      description: ROLE_META[nextRole].description,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          {role === "APPROVER" ? <ShieldCheck className="size-4" /> : <UserCircle2 className="size-4" />}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-medium leading-tight text-slate-900">{user.name}</span>
          <span className="block text-[11px] leading-tight text-slate-500">{ROLE_META[role].label}</span>
        </span>
        <ChevronDown className="size-3.5 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Simulate role (demo only)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(ROLE_META) as UserRole[]).map((r) => (
          <DropdownMenuItem key={r} active={r === role} onSelect={() => handleSelect(r)}>
            <span>
              <span className="block font-medium">{ROLE_META[r].label}</span>
              <span className="block text-xs text-slate-500">{ROLE_META[r].description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

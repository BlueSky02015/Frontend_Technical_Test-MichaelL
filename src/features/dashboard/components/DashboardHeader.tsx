import { Search, Bell, Settings, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search..." className="pl-8 bg-gray-50 border-none" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Zylker ▼</span>
        <Bell className="h-5 w-5 text-gray-500" />
        <Settings className="h-5 w-5 text-gray-500" />
        <HelpCircle className="h-5 w-5 text-gray-500" />
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
          Z
        </div>
      </div>
    </div>
  );
}
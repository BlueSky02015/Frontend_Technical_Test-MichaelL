import { Link, Outlet } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, ShoppingCart, Package, ClipboardList, User } from 'lucide-react';
import type { UserRole } from '@/domain/models';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Purchase Requests', icon: ClipboardList, path: '/purchase-requests' },
  { label: 'Purchase Orders', icon: ShoppingCart, path: '/purchase-orders' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
];

export function AppLayout() {
  const [role, setRole] = useState<UserRole>('USER');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Procureflow</h1>
          <p className="text-xs text-gray-500 mt-1">Inventory Procurement</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link to={item.path}
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800">Procurement Dashboard</h2>
          
          {/* Role Switcher (Simulasi User) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {role}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRole('USER')}>
                Switch to USER
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRole('APPROVER')}>
                Switch to APPROVER
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
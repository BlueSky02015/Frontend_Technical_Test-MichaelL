import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Clock, ShoppingCart, PackageCheck } from 'lucide-react';

// Mock Data (Nanti akan dipisah ke Service/MSW)
const summaryData = [
  { title: 'Total Purchase Requests', value: '24', icon: ClipboardList, color: 'text-blue-600' },
  { title: 'Waiting Approval', value: '5', icon: Clock, color: 'text-yellow-600' },
  { title: 'Active PO', value: '8', icon: ShoppingCart, color: 'text-green-600' },
  { title: 'Partial Receipt', value: '3', icon: PackageCheck, color: 'text-purple-600' },
];

const recentActivities = [
  { id: 'PR-2026-00021', action: 'Submitted', warehouse: 'Jakarta Warehouse', time: '2 hours ago' },
  { id: 'PR-2026-00020', action: 'Approved', warehouse: 'Surabaya Warehouse', time: '5 hours ago' },
  { id: 'PO-2026-00015', action: 'Partially Received', warehouse: 'Jakarta Warehouse', time: '1 day ago' },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.id}</p>
                  <p className="text-xs text-gray-500">{activity.warehouse}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
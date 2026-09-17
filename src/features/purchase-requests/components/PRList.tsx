import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import type { PurchaseRequest } from '@/domain/models';
import { mockPurchaseRequests } from '@/domain/mock-data';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export function PRList() {
  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Requests</h1>
        <Link to="/purchase-requests/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Request
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search by PR Number or Warehouse..." className="pl-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request Number</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Total Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPurchaseRequests.map((pr: PurchaseRequest) => (
              <TableRow key={pr.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">{pr.requestNumber}</TableCell>
                <TableCell>{pr.warehouse.name}</TableCell>
                <TableCell>{pr.requestedBy}</TableCell>
                <TableCell>{pr.totalItems} Items</TableCell>
                <TableCell>
                  <Badge className={statusColors[pr.status] || 'bg-gray-100'}>
                    {pr.status}
                  </Badge>
                </TableCell>
                <TableCell>{pr.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
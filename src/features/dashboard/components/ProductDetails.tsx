import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ProductDetailsProps {
  lowStock: number;
  allItemGroups: number;
  totalItems: number;
  activeItems: number;
  unconfirmedItems: number;
}

export function ProductDetails({
  lowStock,
  allItemGroups,
  totalItems,
  activeItems,
  unconfirmedItems,
}: ProductDetailsProps) {
  const activePercentage =
    totalItems > 0 ? Math.round((activeItems / totalItems) * 100) : 0;

  return (
    <Card className="shadow-sm border border-gray-100 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Product Details
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center gap-6 pt-2">
        <div className="space-y-3 flex-1">
          <Row label="Low Stock Items" value={lowStock} color="text-red-500" />
          <Row label="All Item Group" value={allItemGroups} />
          <Row label="All Items" value={totalItems} />
          <Row
            label="Unconfirmed Items"
            value={unconfirmedItems}
            color="text-red-500"
            icon={<AlertCircle className="h-3 w-3" />}
          />
        </div>

        <div className="flex flex-col items-center shrink-0">
          <div
            className="relative w-24 h-24 flex items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#10b981 ${activePercentage}%, #e5e7eb 0)`,
            }}
          >
            <div className="absolute w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-base font-bold text-gray-700">
                {activePercentage}%
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-2">Active Items</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  color = "text-gray-700",
  icon,
}: {
  label: string;
  value: number;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`flex justify-between text-sm ${color}`}>
      <span className="flex items-center gap-1">
        {label}
        {icon}
      </span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
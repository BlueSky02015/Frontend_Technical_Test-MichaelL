import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, CheckCircle2, FileText } from "lucide-react";

interface Metric {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}

export function StatusMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <Card
          key={i}
          className="shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4 flex flex-col items-center">
            <span className={`text-3xl font-bold ${m.color}`}>{m.value}</span>
            <span className="text-xs text-gray-400 mt-1">{m.unit}</span>
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-500 font-medium">
              {m.icon}
              <span>{m.label}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const metricIcons = {
  packed: <Package className="h-3 w-3" />,
  shipped: <Truck className="h-3 w-3" />,
  delivered: <CheckCircle2 className="h-3 w-3" />,
  invoiced: <FileText className="h-3 w-3" />,
};
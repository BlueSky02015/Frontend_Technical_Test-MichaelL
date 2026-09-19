import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InventorySummaryProps {
  inHand: number;
  toReceive: number;
}

export function InventorySummary({ inHand, toReceive }: InventorySummaryProps) {
  return (
    <Card className="shadow-sm border border-gray-100 bg-white h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-800">
          Inventory Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            Quantity in Hand
          </span>
          <span className="font-bold text-lg text-gray-800">
            {inHand.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            Quantity to be Received
          </span>
          <span className="font-bold text-lg text-gray-800">{toReceive}</span>
        </div>
      </CardContent>
    </Card>
  );
}
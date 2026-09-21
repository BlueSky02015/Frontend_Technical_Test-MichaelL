import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductImage } from "./ProductImage";
import type { ProductWithStats } from "@/types/domain";

interface TopSellingItemsProps {
  items: ProductWithStats[];
  loading?: boolean;
}

export function TopSellingItems({ items, loading }: TopSellingItemsProps) {
  return (
    <Card className="shadow-sm border border-gray-100 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Top Selling Items
        </CardTitle>
        <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
          This Year ▾
        </span>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 pt-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-20 w-20 bg-gray-100 rounded-lg animate-pulse mb-2" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-100 rounded mt-2 animate-pulse" />
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="col-span-3 text-center text-sm text-gray-400 py-8">
            No product data yet
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center group"
            >
              <ProductImage
                src={item.imageUrl}
                alt={item.name}
                className="h-20 w-20 rounded-lg mb-2 transition-transform group-hover:scale-105"
              />
              <span
                className="text-xs text-gray-600 line-clamp-2 h-8 leading-tight"
                title={item.name}
              >
                {item.name}
              </span>
              <span className="text-base font-bold mt-1 text-gray-800">
                {item.totalReceived > 0 ? item.totalReceived : item.totalStock}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  {item.unit.toLowerCase()}
                </span>
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import type { Warehouse, Product } from '@/domain/models';
import { mockWarehouses, mockProducts } from '@/domain/mock-data';

interface FormItem {
  id: string;
  productId: string;
  quantity: number;
}

export function PRCreateForm() {
  const [warehouse, setWarehouse] = useState<string>('');
  const [items, setItems] = useState<FormItem[]>([{ id: '1', productId: '', quantity: 1 }]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), productId: '', quantity: 1 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof FormItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Purchase Request</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Warehouse</Label>
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {mockWarehouses.map((wh: Warehouse) => (
                  <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button variant="outline" onClick={addItem} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 items-end border-b pb-4 last:border-0">
              <div className="flex-1 space-y-2">
                <Label>Product</Label>
                <Select value={item.productId} onValueChange={(val) => updateItem(item.id, 'productId', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((p: Product) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32 space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={item.quantity} 
                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} 
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save as Draft</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
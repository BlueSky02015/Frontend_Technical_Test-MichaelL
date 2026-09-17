import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { mockWarehouses, mockProducts } from '@/domain/mock-data';
import { purchaseRequestService } from '@/services/purchase-request.service';

const formSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse wajib dipilih'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product wajib dipilih'),
        quantity: z.number().min(1, 'Quantity minimal 1'),
      })
    )
    .min(1, 'Minimal 1 product harus ditambahkan')
    .refine(
      (items) => {
        const ids = items.map((i) => i.productId);
        return new Set(ids).size === ids.length;
      },
      { message: 'Product tidak boleh dipilih lebih dari satu kali', path: ['items'] }
    ),
});

type FormValues = z.infer<typeof formSchema>;

export function PRCreateForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouseId: '',
      items: [{ productId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await purchaseRequestService.create({
        warehouseId: data.warehouseId,
        items: data.items,
      });
      navigate({ to: '/purchase-requests' });
    } catch (e) {
      console.error(e);
      alert('Gagal membuat Purchase Request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Purchase Request</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockWarehouses.map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ productId: '', quantity: 1 })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end border-b pb-4 last:border-0">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field: fieldProps }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={fieldProps.onChange} value={fieldProps.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockProducts.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field: fieldProps }) => (
                      <FormItem className="w-32">
                        <FormLabel>Qty</FormLabel>
                        <FormControl>
                          {}
                          <Input 
                            type="number" 
                            min="1" 
                            {...fieldProps} 
                            onChange={(e) => {
                              const val = e.target.value;
                              fieldProps.onChange(val === '' ? undefined : Number(val));
                            }}
                            value={fieldProps.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.items?.root && (
                <p className="text-sm text-red-500">{form.formState.errors.items.root.message}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/purchase-requests' })}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save as Draft'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
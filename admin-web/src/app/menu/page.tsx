"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Search, Coffee } from "lucide-react";
import AddMenuModal from "@/components/AddMenuModal";

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Menu Management</h2>
          <p className="text-slate-500 mt-2">Manage your cafe's products and prices here.</p>
        </div>
        <AddMenuModal onMenuAdded={loadProducts} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="relative w-64">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
             <input 
                type="text" 
                placeholder="Search menu..." 
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
             />
           </div>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600 h-12">Menu Item</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12">Category</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12">Price</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 h-12 pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                        Loading menus...
                    </TableCell>
                </TableRow>
            ) : products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                        No menu items found. Add some products to get started.
                    </TableCell>
                </TableRow>
            ) : (
                products.map((product: any) => (
                <TableRow key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg group-hover:bg-amber-200 transition-colors">
                            <Coffee className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="font-semibold text-slate-700">{product.name}</span>
                    </div>
                    </TableCell>
                    <TableCell className="py-4">
                    <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {product.category?.name || product.categoryId}
                    </span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 py-4">
                    Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50">
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

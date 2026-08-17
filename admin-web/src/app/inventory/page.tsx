"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Search, Package } from "lucide-react";

import { fetchInventory, deleteIngredient } from "@/lib/api";
import AddIngredientModal from "@/components/AddIngredientModal";

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadIngredients = async () => {
    try {
      const data = await fetchInventory();
      setIngredients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus bahan baku "${name}"?`)) {
      const success = await deleteIngredient(id);
      if (success) {
        loadIngredients();
      } else {
        alert("Gagal menghapus bahan baku.");
      }
    }
  };

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setIsEditOpen(true);
  };

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventory & Stock</h2>
          <p className="text-slate-500 mt-2">Manage raw materials, cost per unit (modal HPP), and track stock levels.</p>
        </div>
        <AddIngredientModal onIngredientAdded={loadIngredients} />
      </div>

      {isEditOpen && (
        <AddIngredientModal
          onIngredientAdded={loadIngredients}
          ingredientToEdit={editingIngredient}
          isOpenExternal={isEditOpen}
          onCloseExternal={() => {
            setIsEditOpen(false);
            setEditingIngredient(null);
          }}
        />
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="relative w-64">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
             <input 
                type="text" 
                placeholder="Search ingredients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
             />
           </div>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600 h-12">Ingredient Name</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12">Current Stock</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12">Cost per Unit (Modal HPP)</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 h-12 pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                        Loading ingredients...
                    </TableCell>
                </TableRow>
            ) : filteredIngredients.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                        No ingredients found. Add some ingredients to get started.
                    </TableCell>
                </TableRow>
            ) : (
                filteredIngredients.map((ingredient: any) => (
                <TableRow key={ingredient.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-amber-100 transition-colors">
                            <Package className="h-4 w-4 text-slate-500 group-hover:text-amber-600" />
                        </div>
                        <span className="font-semibold text-slate-700">{ingredient.name}</span>
                    </div>
                    </TableCell>
                    <TableCell className="py-4">
                    <span className={`px-2.5 py-1 rounded-md text-sm font-bold ${ingredient.stock < 500 && ingredient.unit !== 'pcs' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {ingredient.stock} {ingredient.unit}
                    </span>
                    </TableCell>
                    <TableCell className="py-4">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-sm">
                        Rp {new Intl.NumberFormat('id-ID').format(ingredient.costPerUnit || 0)} / {ingredient.unit}
                    </span>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(ingredient)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50"
                        >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(ingredient.id, ingredient.name)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        >
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

"use client";

import { useState, useEffect } from "react";
import { Plus, X, Trash2, Calculator, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL, fetchInventory, getCostPerBaseUnit, getBaseUnit } from "@/lib/api";

interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

interface MenuModalProps {
  onMenuAdded: () => void;
  productToEdit?: any;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export default function AddMenuModal({ 
  onMenuAdded, 
  productToEdit, 
  isOpenExternal, 
  onCloseExternal 
}: MenuModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  
  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("Coffee");
  const [price, setPrice] = useState("");
  const [manualHpp, setManualHpp] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetMargin, setTargetMargin] = useState(60); // 60% default margin
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);

  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;

  useEffect(() => {
    if (isOpen) {
      fetchInventory().then((data) => setAvailableIngredients(data));
    }
  }, [isOpen]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setCategoryName(productToEdit.category?.name || productToEdit.categoryName || "Coffee");
      setPrice(productToEdit.price !== undefined ? String(productToEdit.price) : "");
      setManualHpp(productToEdit.hpp !== undefined ? String(productToEdit.hpp) : "");
      setImageUrl(productToEdit.imageUrl || "");
      
      if (productToEdit.recipes && Array.isArray(productToEdit.recipes)) {
        setRecipes(
          productToEdit.recipes.map((r: any) => ({
            ingredientId: r.ingredientId,
            quantity: r.quantity
          }))
        );
      } else {
        setRecipes([]);
      }
    } else {
      setName("");
      setCategoryName("Coffee");
      setPrice("");
      setManualHpp("");
      setImageUrl("");
      setRecipes([]);
    }
  }, [productToEdit, isOpen]);

  // Calculate HPP from selected ingredients with unit conversion
  const calculatedIngredientsHpp = recipes.reduce((sum, item) => {
    const ing = availableIngredients.find((i) => i.id === item.ingredientId);
    if (!ing) return sum;
    const costPerBase = getCostPerBaseUnit(ing.costPerUnit || 0, ing.unit || '');
    return sum + item.quantity * costPerBase;
  }, 0);

  // Total HPP (ingredients cost or manual override if set)
  const totalHpp = recipes.length > 0 ? calculatedIngredientsHpp : (parseFloat(manualHpp) || 0);

  // Suggested Selling Price formula: HPP / (1 - Target Margin / 100)
  const suggestedPrice = totalHpp > 0 && targetMargin < 100 
    ? Math.ceil((totalHpp / (1 - targetMargin / 100)) / 500) * 500 
    : 0;

  const handleClose = () => {
    if (onCloseExternal) {
      onCloseExternal();
    } else {
      setInternalOpen(false);
    }
  };

  const handleAddRecipeItem = () => {
    if (availableIngredients.length === 0) {
      alert("Belum ada bahan baku di Inventory. Tambahkan bahan baku di menu Inventory terlebih dahulu.");
      return;
    }
    setRecipes([...recipes, { ingredientId: availableIngredients[0].id, quantity: 1 }]);
  };

  const handleRemoveRecipeItem = (index: number) => {
    setRecipes(recipes.filter((_, i) => i !== index));
  };

  const handleRecipeChange = (index: number, field: keyof RecipeItem, value: any) => {
    const updated = [...recipes];
    updated[index] = { ...updated[index], [field]: value };
    setRecipes(updated);
  };

  const handleApplySuggestedPrice = () => {
    if (suggestedPrice > 0) {
      setPrice(String(suggestedPrice));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = productToEdit 
        ? `${API_URL}/products/${productToEdit.id}`
        : `${API_URL}/products`;
      
      const method = productToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          price: parseFloat(price || "0"),
          hpp: totalHpp,
          imageUrl: imageUrl.trim() || undefined,
          categoryName,
          recipes
        })
      });

      if (res.ok) {
        handleClose();
        onMenuAdded();
      } else {
        alert(productToEdit ? "Gagal memperbarui menu" : "Gagal menambahkan menu");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpenExternal === undefined && (
        <Button 
          onClick={() => setInternalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Menu
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {productToEdit ? "Edit Menu Item" : "Tambah Menu Baru"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur komposisi bahan baku (recipe), foto menu, hitung modal HPP, dan tetapkan harga jual.
                </p>
              </div>
              <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Menu</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Iced Palm Sugar Latte"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Coffee, Non-Coffee, Food"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                  />
                </div>
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">URL Foto Menu (Opsional)</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/.../coffee.jpg"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                  />
                  {imageUrl ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  ) : null}
                </div>
                <p className="text-xs text-slate-400 mt-1">Masukkan link foto produk agar tampil menarik di layar Kasir.</p>
              </div>

              {/* Recipe / Ingredients Section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-amber-600" /> Komposisi Bahan Baku (Recipe)
                    </h4>
                    <p className="text-xs text-slate-500">Pilih bahan baku untuk menghitung modal HPP otomatis.</p>
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={handleAddRecipeItem}
                    className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Bahan
                  </Button>
                </div>

                {recipes.length === 0 ? (
                  <div className="text-center py-4 bg-white border border-dashed border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-400">Belum ada bahan baku ditambahkan untuk menu ini.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Atau Anda bisa mengisi Modal HPP secara manual di bawah.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recipes.map((item, index) => {
                      const selectedIng = availableIngredients.find((i) => i.id === item.ingredientId);
                      const costPerBase = getCostPerBaseUnit(selectedIng?.costPerUnit || 0, selectedIng?.unit || '');
                      const baseUnit = getBaseUnit(selectedIng?.unit || '');
                      const itemSubtotal = item.quantity * costPerBase;

                      return (
                        <div key={index} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-sm">
                          <select
                            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-xs"
                            value={item.ingredientId}
                            onChange={(e) => handleRecipeChange(index, "ingredientId", e.target.value)}
                          >
                            {availableIngredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} (Rp {ing.costPerUnit || 0}/{ing.unit})
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="any"
                              min="0.1"
                              className="w-20 px-2 py-1.5 border border-slate-200 rounded-md text-xs"
                              value={item.quantity}
                              onChange={(e) => handleRecipeChange(index, "quantity", parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-xs text-slate-500 font-medium w-8">{baseUnit}</span>
                          </div>

                          <div className="text-right min-w-[90px]">
                            <span className="text-xs font-semibold text-slate-700">
                              Rp {new Intl.NumberFormat("id-ID").format(itemSubtotal)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveRecipeItem(index)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* HPP & Price Recommendation Section */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">
                      Total Modal HPP (Cost of Goods)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500 text-xs font-medium">Rp</span>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="e.g. 8500"
                        className="w-full pl-8 pr-3 py-1.5 border border-amber-200 rounded-lg text-sm bg-white font-semibold text-slate-800"
                        value={recipes.length > 0 ? calculatedIngredientsHpp : manualHpp}
                        onChange={e => setManualHpp(e.target.value)}
                        readOnly={recipes.length > 0}
                      />
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1">
                      {recipes.length > 0 ? "Dihitung otomatis dari total bahan baku." : "Masukkan nilai modal HPP per porsi."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">Target Profit Margin (%)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="1" 
                        max="99"
                        className="w-20 px-3 py-1.5 border border-amber-200 rounded-lg text-sm bg-white font-semibold text-center text-slate-800"
                        value={targetMargin}
                        onChange={e => setTargetMargin(Math.min(99, Math.max(1, parseInt(e.target.value) || 0)))}
                      />
                      <span className="text-xs font-bold text-amber-800">%</span>
                      <div className="flex gap-1">
                        {[50, 60, 70].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setTargetMargin(m)}
                            className={`px-2 py-1 text-xs rounded-md font-bold ${targetMargin === m ? 'bg-amber-600 text-white' : 'bg-white border border-amber-200 text-amber-800'}`}
                          >
                            {m}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation Box */}
                {suggestedPrice > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                        <Sparkles className="h-4 w-4 text-amber-500" /> Recommended Selling Price (Saran Harga):
                      </div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                        Rp {new Intl.NumberFormat("id-ID").format(suggestedPrice)}
                        <span className="text-xs font-normal text-slate-500 ml-2">
                          (Estimasi Profit: Rp {new Intl.NumberFormat("id-ID").format(suggestedPrice - totalHpp)} / porsi)
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApplySuggestedPrice}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs shadow-sm"
                    >
                      Gunakan Harga Saran
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Harga Jual Final (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-medium">Rp</span>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="e.g. 25000"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold text-amber-600 text-base"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
                  {loading ? "Menyimpan..." : (productToEdit ? "Simpan Perubahan" : "Tambah Menu")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

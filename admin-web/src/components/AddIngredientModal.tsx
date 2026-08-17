"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

interface IngredientModalProps {
  onIngredientAdded: () => void;
  ingredientToEdit?: any;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export default function AddIngredientModal({ 
  onIngredientAdded, 
  ingredientToEdit, 
  isOpenExternal, 
  onCloseExternal 
}: IngredientModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    unit: "g",
    stock: "",
    costPerUnit: ""
  });

  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;

  useEffect(() => {
    if (ingredientToEdit) {
      setFormData({
        name: ingredientToEdit.name || "",
        unit: ingredientToEdit.unit || "g",
        stock: ingredientToEdit.stock !== undefined ? String(ingredientToEdit.stock) : "",
        costPerUnit: ingredientToEdit.costPerUnit !== undefined ? String(ingredientToEdit.costPerUnit) : ""
      });
    } else {
      setFormData({ name: "", unit: "g", stock: "", costPerUnit: "" });
    }
  }, [ingredientToEdit, isOpen]);

  const handleClose = () => {
    if (onCloseExternal) {
      onCloseExternal();
    } else {
      setInternalOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = ingredientToEdit 
        ? `${API_URL}/inventory/${ingredientToEdit.id}`
        : `${API_URL}/inventory`;
      
      const method = ingredientToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          stock: parseFloat(formData.stock || "0"),
          costPerUnit: parseFloat(formData.costPerUnit || "0")
        })
      });

      if (res.ok) {
        handleClose();
        setFormData({ name: "", unit: "g", stock: "", costPerUnit: "" });
        onIngredientAdded();
      } else {
        alert(ingredientToEdit ? "Failed to update ingredient" : "Failed to add ingredient");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
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
          <Plus className="mr-2 h-4 w-4" /> Add Ingredient
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">
                {ingredientToEdit ? "Edit Ingredient" : "Add New Ingredient"}
              </h3>
              <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ingredient Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Arabica Beans, Fresh Milk"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all bg-white"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="g">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Stock</label>
                  <input 
                    type="number" 
                    required
                    step="any"
                    min="0"
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Cost per Unit (Harga Modal per {formData.unit})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-medium">Rp</span>
                  <input 
                    type="number" 
                    required
                    step="any"
                    min="0"
                    placeholder="e.g. 300 (Rp 300 / g)"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    value={formData.costPerUnit}
                    onChange={e => setFormData({...formData, costPerUnit: e.target.value})}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Harga modal per 1 {formData.unit} bahan ini untuk kalkulasi HPP otomatis.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
                  {loading ? "Saving..." : (ingredientToEdit ? "Update Ingredient" : "Save Ingredient")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

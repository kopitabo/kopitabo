"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

export default function AddMenuModal({ onMenuAdded }: { onMenuAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryName: "Coffee" // Default category
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({ name: "", price: "", categoryName: "Coffee" });
        onMenuAdded(); // Trigger refresh
      } else {
        alert("Failed to add menu");
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
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 transition-all"
      >
        <Plus className="mr-2 h-4 w-4" /> Add New Menu
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Add New Menu</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Menu Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Iced Americano"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Coffee, Tea, Food"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  value={formData.categoryName}
                  onChange={e => setFormData({...formData, categoryName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (Rp)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  placeholder="e.g. 25000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
                  {loading ? "Saving..." : "Save Menu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

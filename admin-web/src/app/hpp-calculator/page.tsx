"use client";

import { useState, useEffect } from "react";
import { fetchInventory, API_URL, getCostPerBaseUnit, getBaseUnit } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Sparkles, 
  Plus, 
  Trash2, 
  TrendingUp, 
  CheckCircle, 
  Coffee,
  Coins,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CalculatorItem {
  ingredientId: string;
  quantity: number;
}

export default function HppCalculatorPage() {
  const router = useRouter();
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);

  // Form State
  const [menuName, setMenuName] = useState("");
  const [categoryName, setCategoryName] = useState("Coffee");
  const [items, setItems] = useState<CalculatorItem[]>([]);
  const [overheadCost, setOverheadCost] = useState("500"); // Default overhead for cup/straw/packaging
  const [targetMargin, setTargetMargin] = useState(60); // 60% Target Margin
  const [customPrice, setCustomPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchInventory()
      .then((data) => {
        setAvailableIngredients(data);
        if (data.length > 0) {
          // Pre-populate with first ingredient for ease of use
          setItems([{ ingredientId: data[0].id, quantity: 18 }]);
        }
      })
      .finally(() => setLoadingIngredients(false));
  }, []);

  // HPP Calculation with unit conversion
  const ingredientsHpp = items.reduce((sum, item) => {
    const ing = availableIngredients.find((i) => i.id === item.ingredientId);
    if (!ing) return sum;
    const costPerBase = getCostPerBaseUnit(ing.costPerUnit || 0, ing.unit || '');
    return sum + item.quantity * costPerBase;
  }, 0);

  const overheadVal = parseFloat(overheadCost) || 0;
  const totalHpp = ingredientsHpp + overheadVal;

  // Suggested Price Calculation
  const rawSuggestedPrice = totalHpp > 0 && targetMargin < 100 
    ? totalHpp / (1 - targetMargin / 100) 
    : 0;
  
  // Rounded suggested price to nearest 500
  const suggestedPrice = Math.ceil(rawSuggestedPrice / 500) * 500;

  // Selected Price (Custom or Suggested)
  const finalPrice = customPrice !== "" ? (parseFloat(customPrice) || 0) : suggestedPrice;
  const estimatedProfit = finalPrice - totalHpp;
  const actualMarginPercent = finalPrice > 0 ? Math.round((estimatedProfit / finalPrice) * 100) : 0;

  const handleAddItem = () => {
    if (availableIngredients.length === 0) {
      alert("Belum ada bahan baku di Inventory. Silakan tambahkan di menu Inventory.");
      return;
    }
    setItems([...items, { ingredientId: availableIngredients[0].id, quantity: 10 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CalculatorItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSaveToMenu = async () => {
    if (!menuName.trim()) {
      alert("Silakan masukkan Nama Menu terlebih dahulu.");
      return;
    }
    if (finalPrice <= 0) {
      alert("Harga jual harus lebih besar dari 0.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: menuName,
          categoryName,
          price: finalPrice,
          hpp: totalHpp,
          recipes: items
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push("/menu");
        }, 1200);
      } else {
        alert("Gagal menyimpan ke daftar menu.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full text-amber-800 text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Simulasikan HPP & Strategi Harga Jual
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Kalkulator HPP & Pricing</h2>
        <p className="text-slate-500 mt-1">
          Hitung modal HPP per cangkir/porsi secara akurat berdasarkan bahan baku dan langsung dapatkan saran harga jual yang paling menguntungkan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Ingredients Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Menu Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-600" /> Detail Menu
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Rencana Menu</label>
                <input 
                  type="text"
                  placeholder="e.g. Es Kopi Susu Aren"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori Menu</label>
                <input 
                  type="text"
                  placeholder="e.g. Coffee, Signature"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Recipe Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-amber-600" /> Takaran & Komposisi Bahan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Pilih bahan baku dan tentukan takaran per porsi.</p>
              </div>
              <Button 
                type="button" 
                size="sm" 
                onClick={handleAddItem}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Tambah Bahan
              </Button>
            </div>

            {loadingIngredients ? (
              <div className="text-center py-6 text-slate-400 text-sm">Memuat bahan baku...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                Belum ada bahan baku dipilih. Klik "Tambah Bahan" untuk memulai.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => {
                  const selectedIng = availableIngredients.find((i) => i.id === item.ingredientId);
                  const costPerBase = getCostPerBaseUnit(selectedIng?.costPerUnit || 0, selectedIng?.unit || '');
                  const baseUnit = getBaseUnit(selectedIng?.unit || '');
                  const subtotal = item.quantity * costPerBase;

                  return (
                    <div key={index} className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Bahan Baku</label>
                        <select
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-800"
                          value={item.ingredientId}
                          onChange={(e) => handleItemChange(index, "ingredientId", e.target.value)}
                        >
                          {availableIngredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} (Rp {ing.costPerUnit || 0}/{ing.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-28">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Takaran</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-white"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-xs text-slate-500 font-medium">{baseUnit}</span>
                        </div>
                      </div>

                      <div className="w-28 text-right">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Subtotal Modal</label>
                        <span className="text-xs font-bold text-slate-800">
                          Rp {new Intl.NumberFormat("id-ID").format(subtotal)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-red-500 p-1 mt-4 transition-colors"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Overhead Cost Field */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Kemasan & Overhead Per Porsi</label>
                <p className="text-[11px] text-slate-400">Cup, Sedotan, Plastik, Listrik/Operasional</p>
              </div>
              <div className="relative w-36">
                <span className="absolute left-3 top-2 text-slate-400 text-xs font-medium">Rp</span>
                <input 
                  type="number"
                  placeholder="500"
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-right text-slate-800 bg-white"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: HPP & Pricing Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Ringkasan HPP & Margin
              </h3>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                Live Calculator
              </span>
            </div>

            {/* Total HPP Display */}
            <div className="space-y-1 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Modal HPP</span>
              <div className="text-3xl font-extrabold text-white">
                Rp {new Intl.NumberFormat("id-ID").format(totalHpp)}
              </div>
              <p className="text-[11px] text-slate-400">
                (Bahan Baku: Rp {new Intl.NumberFormat("id-ID").format(ingredientsHpp)} + Overhead: Rp {new Intl.NumberFormat("id-ID").format(overheadVal)})
              </p>
            </div>

            {/* Target Margin Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Target Gross Margin %</label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 60, 70, 80].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTargetMargin(m)}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      targetMargin === m 
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-extrabold scale-105' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {m}%
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Selling Price Box */}
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Sparkles className="h-4 w-4 text-amber-400" /> Saran Harga Jual Ideal:
              </div>
              <div className="text-3xl font-black text-amber-400">
                Rp {new Intl.NumberFormat("id-ID").format(suggestedPrice)}
              </div>
              <p className="text-xs text-slate-300">
                Memberikan margin profit ~{targetMargin}% per cup.
              </p>
            </div>

            {/* Custom Price Adjustment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Harga Jual Yang Ditentukan (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-medium">Rp</span>
                <input 
                  type="number"
                  placeholder={String(suggestedPrice)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Profit Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Keuntungan / Porsi</span>
                <span className={`text-base font-bold ${estimatedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Rp {new Intl.NumberFormat("id-ID").format(estimatedProfit)}
                </span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Margin Profit Aktual</span>
                <span className={`text-base font-bold ${actualMarginPercent >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {actualMarginPercent}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <Button
              type="button"
              disabled={isSaving || savedSuccess}
              onClick={handleSaveToMenu}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm flex items-center justify-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5 text-slate-950" /> Berhasil Disimpan ke Menu!
                </>
              ) : isSaving ? (
                "Menyimpan..."
              ) : (
                <>
                  Simpan Langsung Ke Menu <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

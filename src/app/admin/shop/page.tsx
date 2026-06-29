"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { ShoppingBag, Plus, X, Search, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";

export default function ShopPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedStaff] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: ""
  });

  const loadProducts = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shop", { signal });
      const data = await res.json();
      if (data.ok) setProducts(data.products);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to load products");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal);
    return () => controller.abort();
  }, [currentBranchId]);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedStaff(null);
    setFormData({ name: "", price: "", stock: "", category: "", description: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setIsEditMode(true);
    setSelectedStaff(product);
    setFormData({ 
      name: product.name, 
      price: product.price.toString(), 
      stock: product.stock.toString(), 
      category: product.category,
      description: product.description || ""
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/shop/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) loadProducts();
    } catch (err) {
      console.error("Failed to delete product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `/api/admin/shop/${selectedProduct.id}` : "/api/admin/shop";
      const method = isEditMode ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          stock: parseInt(formData.stock)
        })
      });
      const data = await res.json();
      if (data.ok) {
        setIsModalOpen(false);
        loadProducts();
      }
    } catch (err) {
      console.error("Failed to save product");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">ACADEMY SHOP</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage inventory and academy merchandise for {branchName}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleOpenAddModal}
          className="h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10"
        >
          <Plus size={14} className="mr-2" /> Add New Product
        </Button>
      </div>

      <div className="relative w-full md:w-96">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <Input 
          placeholder="Search products..." 
          className="pl-12 h-12 bg-white/5 border-white/10 w-full" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border-white/5 bg-academy-gray/30 backdrop-blur-md group hover:border-academy-gold/30 transition-all">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-academy-gold group-hover:scale-110 transition-transform">
                    <ShoppingBag size={32} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenEditModal(product)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1">{product.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-academy-red">{product.category}</p>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-2xl font-black text-white">₹{product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stock</p>
                    <p className={cn("text-sm font-black", product.stock < 10 ? "text-academy-red" : "text-white")}>
                      {product.stock} Units
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4 opacity-20" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No products found in this branch</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <Card className="relative w-full max-w-lg bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black uppercase tracking-tight">{isEditMode ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Product Name</label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                  <Input required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Equipment" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Stock Units</label>
                  <Input required type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Price (INR)</label>
                <Input required type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description (Optional)</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-academy-gold transition-colors min-h-[100px]"
                />
              </div>
              
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 uppercase tracking-widest text-[10px] font-black">Cancel</Button>
                <Button type="submit" variant="secondary" className="flex-1 uppercase tracking-widest text-[10px] font-black">{isEditMode ? "Update Product" : "Create Product"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}


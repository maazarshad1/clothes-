import React, { useState } from 'react';
import { useStore, Product, Order } from '../context/StoreContext';
import { X } from 'lucide-react';

const Admin = () => {
  const { products, addProduct, updateProduct, deleteProduct, orders, updateOrderStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      image: formData.get('image') as string,
      rating: parseFloat(formData.get('rating') as string) || 5,
      description: formData.get('description') as string,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleOrderSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const status = formData.get('status') as Order['status'];
    if (editingOrder) {
      updateOrderStatus(editingOrder.id, status);
      setEditingOrder(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F2ED] font-sans overflow-hidden text-[#111111]">
      <div className="w-64 bg-[#111111] text-zinc-400 flex flex-col flex-shrink-0">
        <div className="p-8">
          <h2 className="text-white font-serif italic text-2xl tracking-widest uppercase">Fashion<br/>Admin</h2>
          <p className="text-[10px] tracking-[0.2em] mt-2 opacity-50">ADMINISTRATOR</p>
        </div>
        <ul className="flex-1 px-4 space-y-1 list-none m-0">
          <li className={`border-l-[3px] ${activeTab === 'products' ? 'border-[#C5A059] bg-[rgba(255,255,255,0.05)] text-white' : 'border-transparent hover:text-white'} flex items-center px-4 py-3 text-sm cursor-pointer transition`} onClick={() => setActiveTab('products')}>Products</li>
          <li className={`border-l-[3px] ${activeTab === 'orders' ? 'border-[#C5A059] bg-[rgba(255,255,255,0.05)] text-white' : 'border-transparent hover:text-white'} flex items-center px-4 py-3 text-sm cursor-pointer transition`} onClick={() => setActiveTab('orders')}>Orders</li>
        </ul>
      </div>

      <div className="flex-1 flex flex-col p-10 overflow-auto relative">
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-40">Overview</span>
            <h1 className="text-4xl font-serif italic">Admin Dashboard</h1>
          </div>
          {activeTab === 'products' && (
            <button 
              onClick={() => setIsAddingProduct(true)}
              className="px-6 py-2 bg-[#111111] text-white text-xs uppercase tracking-widest hover:bg-black transition-colors"
            >
              Add Product
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Products</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">{products.length}</div>
          </div>
          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Orders</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">{orders.length}</div>
          </div>
          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Customers</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">890</div>
          </div>
          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Revenue</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">${orders.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white border border-zinc-200 flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold">
              {activeTab === 'products' ? 'Products Inventory' : 'Recent Orders'}
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 bg-white">
            <table className="w-full text-left border-collapse">
              {activeTab === 'products' ? (
                <>
                  <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Image</th>
                      <th className="px-6 py-3 font-semibold">Product</th>
                      <th className="px-6 py-3 font-semibold">Category</th>
                      <th className="px-6 py-3 font-semibold text-right">Price</th>
                      <th className="px-6 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50">
                        <td className="px-6 py-4">
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover" />
                        </td>
                        <td className="px-6 py-4 font-medium">{product.name}</td>
                        <td className="px-6 py-4 text-xs opacity-70">{product.category}</td>
                        <td className="px-6 py-4 font-serif text-right">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-4">
                            <button onClick={() => setEditingProduct(product)} className="text-[#C5A059] hover:underline text-xs uppercase tracking-widest font-semibold">Edit</button>
                            <button onClick={() => deleteProduct(product.id)} className="text-rose-600 hover:underline text-xs uppercase tracking-widest font-semibold">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <>
                  <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Order ID</th>
                      <th className="px-6 py-3 font-semibold">Customer</th>
                      <th className="px-6 py-3 font-semibold">Date</th>
                      <th className="px-6 py-3 font-semibold text-right">Total</th>
                      <th className="px-6 py-3 font-semibold text-center">Status</th>
                      <th className="px-6 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50">
                        <td className="px-6 py-4 font-medium">{order.id}</td>
                        <td className="px-6 py-4">{order.customerName}</td>
                        <td className="px-6 py-4 text-xs opacity-70">{order.date}</td>
                        <td className="px-6 py-4 font-serif text-right">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold ${
                            order.status === 'Delivered' ? 'text-green-600 bg-green-50' :
                            order.status === 'Shipped' ? 'text-blue-600 bg-blue-50' :
                            order.status === 'Pending' ? 'text-amber-600 bg-amber-50' :
                            'text-zinc-600 bg-zinc-100'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => setEditingOrder(order)} className="text-[#C5A059] hover:underline text-xs uppercase tracking-widest font-semibold">Update Status</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>

        {/* Edit/Add Product Modal */}
        {(isAddingProduct || editingProduct) && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-md p-8 relative shadow-2xl border border-zinc-100">
              <button 
                onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-serif italic mb-6">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Name</label>
                  <input name="name" defaultValue={editingProduct?.name || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Price</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Category</label>
                    <input name="category" defaultValue={editingProduct?.category || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Image URL</label>
                  <input name="image" defaultValue={editingProduct?.image || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Description</label>
                  <textarea name="description" rows={3} defaultValue={editingProduct?.description || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]"></textarea>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-[#111111] text-white py-3 text-xs uppercase tracking-widest hover:bg-black transition-colors">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editingOrder && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-sm p-8 relative shadow-2xl border border-zinc-100">
              <button 
                onClick={() => setEditingOrder(null)}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-serif italic mb-6">Update Order</h2>
              <div className="mb-4 text-sm">
                <p><span className="opacity-50">Order ID:</span> {editingOrder.id}</p>
                <p><span className="opacity-50">Customer:</span> {editingOrder.customerName}</p>
              </div>
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Status</label>
                  <select name="status" defaultValue={editingOrder.status} className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]">
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-[#111111] text-white py-3 text-xs uppercase tracking-widest hover:bg-black transition-colors">
                    Save Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;

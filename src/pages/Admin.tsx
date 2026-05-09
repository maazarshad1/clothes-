import React from 'react';

const Admin = () => {
  return (
    <div className="flex h-screen w-full bg-[#F5F2ED] font-sans overflow-hidden text-[#111111]">
      <div className="w-64 bg-[#111111] text-zinc-400 flex flex-col flex-shrink-0">
        <div className="p-8">
          <h2 className="text-white font-serif italic text-2xl tracking-widest uppercase">Fashion<br/>Admin</h2>
          <p className="text-[10px] tracking-[0.2em] mt-2 opacity-50">ADMINISTRATOR</p>
        </div>
        <ul className="flex-1 px-4 space-y-1 list-none m-0">
          <li className="border-l-[3px] border-[#C5A059] bg-[rgba(255,255,255,0.05)] text-white flex items-center px-4 py-3 text-sm cursor-pointer transition">Dashboard</li>
          <li className="border-l-[3px] border-transparent flex items-center px-4 py-3 text-sm cursor-pointer transition hover:text-white">Products</li>
          <li className="border-l-[3px] border-transparent flex items-center px-4 py-3 text-sm cursor-pointer transition hover:text-white">Orders</li>
          <li className="border-l-[3px] border-transparent flex items-center px-4 py-3 text-sm cursor-pointer transition hover:text-white">Customers</li>
          <li className="border-l-[3px] border-transparent flex items-center px-4 py-3 text-sm cursor-pointer transition hover:text-white">Analytics</li>
          <li className="border-l-[3px] border-transparent flex items-center px-4 py-3 text-sm cursor-pointer transition hover:text-white">Settings</li>
        </ul>
      </div>

      <div className="flex-1 flex flex-col p-10 overflow-auto">
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-40">Overview</span>
            <h1 className="text-4xl font-serif italic">Admin Dashboard</h1>
          </div>
          <button className="px-6 py-2 bg-[#111111] text-white text-xs uppercase tracking-widest hover:bg-black transition-colors">
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Products</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">120</div>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Orders</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">340</div>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Customers</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">890</div>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Revenue</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">$12,400</div>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white border border-zinc-200 flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Products Inventory</h3>
            <div className="flex gap-6 text-[10px] uppercase tracking-widest font-semibold">
              <span className="opacity-30">Filter: All</span>
              <span className="opacity-30">Sort: Newest</span>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-100 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-semibold">ID</th>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold text-right">Price</th>
                  <th className="px-6 py-3 font-semibold text-right">Stock</th>
                  <th className="px-6 py-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50">
                  <td className="px-6 py-4 text-xs opacity-50">1</td>
                  <td className="px-6 py-4 font-medium">Black Hoodie</td>
                  <td className="px-6 py-4 font-serif text-right">$45</td>
                  <td className="px-6 py-4 text-right">30</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <button className="text-[#C5A059] hover:underline text-xs uppercase tracking-widest font-semibold">Edit</button>
                      <button className="text-rose-600 hover:underline text-xs uppercase tracking-widest font-semibold">Delete</button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50">
                  <td className="px-6 py-4 text-xs opacity-50">2</td>
                  <td className="px-6 py-4 font-medium">White Sneakers</td>
                  <td className="px-6 py-4 font-serif text-right">$70</td>
                  <td className="px-6 py-4 text-right">15</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <button className="text-[#C5A059] hover:underline text-xs uppercase tracking-widest font-semibold">Edit</button>
                      <button className="text-rose-600 hover:underline text-xs uppercase tracking-widest font-semibold">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

"use client";

import { useEffect, useState } from "react";

interface SerialItem {
  inventory_line_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  category_id: string;
  category_name: string;
  location_id: string;
  location_name: string;
  location_abbreviation: string;
  sublocation: string | null;
  serial: string;
  quantity_on_hand: string;
  lot_id: string | null;
}

export default function SerialsPage() {
  const [serials, setSerials] = useState<SerialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchSerials() {
      try {
        const res = await fetch("/api/serials");
        if (!res.ok) throw new Error("Failed to fetch serials");
        const data = await res.json();
        setSerials(data);
      } catch (err) {
        setError("Failed to load serial inventory");
      } finally {
        setLoading(false);
      }
    }
    fetchSerials();
  }, []);

  const filteredSerials = serials.filter(
    (s) =>
      s.serial?.toLowerCase().includes(search.toLowerCase()) ||
      s.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.sku?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading serial inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const uniqueProducts = new Set(serials.map((s) => s.product_id)).size;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serial Inventory</h1>
          <p className="text-gray-500">Track inventory by serial numbers</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {serials.length}
            </div>
            <div className="text-xs text-gray-500">Serial Numbers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {uniqueProducts}
            </div>
            <div className="text-xs text-gray-500">Products</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by serial, product, or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {filteredSerials.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          {search
            ? "No serials match your search."
            : "No serial-tracked inventory found."}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lot
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSerials.map((item) => (
                <tr key={item.inventory_line_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm bg-purple-100 text-purple-800 font-mono">
                      {item.serial}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {item.product_name}
                    </div>
                    <div className="text-xs text-gray-500">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {item.category_name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{item.location_name}</div>
                    {item.sublocation && (
                      <div className="text-xs text-gray-500">
                        {item.sublocation}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.lot_id ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 font-mono">
                        {item.lot_id}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

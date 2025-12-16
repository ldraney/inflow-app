"use client";

import { useEffect, useState } from "react";

interface LotItem {
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
  lot_id: string;
  quantity_on_hand: string;
  shelf_life_days: number | null;
  track_expiry: number;
}

export default function LotsPage() {
  const [lots, setLots] = useState<LotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLots() {
      try {
        const res = await fetch("/api/lots");
        if (!res.ok) throw new Error("Failed to fetch lots");
        const data = await res.json();
        setLots(data);
      } catch (err) {
        setError("Failed to load lot inventory");
      } finally {
        setLoading(false);
      }
    }
    fetchLots();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading lot inventory...</div>
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

  const uniqueLots = new Set(lots.map((l) => l.lot_id)).size;
  const uniqueProducts = new Set(lots.map((l) => l.product_id)).size;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lot Inventory</h1>
          <p className="text-gray-500">Track inventory by lot numbers</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{uniqueLots}</div>
            <div className="text-xs text-gray-500">Unique Lots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {uniqueProducts}
            </div>
            <div className="text-xs text-gray-500">Products</div>
          </div>
        </div>
      </div>

      {lots.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          No lot-tracked inventory found.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lot ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sublocation
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shelf Life
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lots.map((item) => (
                <tr key={item.inventory_line_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm bg-blue-100 text-blue-800 font-mono">
                      {item.lot_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {item.product_name}
                    </div>
                    <div className="text-xs text-gray-500">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{item.location_name}</div>
                    <div className="text-xs text-gray-500">
                      {item.location_abbreviation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {item.sublocation || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                    {item.quantity_on_hand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {item.track_expiry === 1 && item.shelf_life_days ? (
                      <span className="text-gray-900">
                        {item.shelf_life_days} days
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

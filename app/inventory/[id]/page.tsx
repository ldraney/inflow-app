"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface InventoryDetailItem {
  inventory_line_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  item_type: string;
  category_id: string;
  category_name: string;
  location_id: string;
  location_name: string;
  location_abbreviation: string;
  sublocation: string | null;
  serial: string | null;
  lot_id: string | null;
  quantity_on_hand: string;
  track_serials: number;
  track_lots: number;
  track_expiry: number;
  shelf_life_days: number | null;
}

export default function InventoryDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [details, setDetails] = useState<InventoryDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/inventory/detail?productId=${productId}`);
        if (!res.ok) throw new Error("Failed to fetch inventory detail");
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        setError("Failed to load inventory detail");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading inventory detail...</div>
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

  if (details.length === 0) {
    return (
      <div className="space-y-6">
        <a
          href="/inventory"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          &larr; Back to Inventory
        </a>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          No inventory detail found for this product.
        </div>
      </div>
    );
  }

  const product = details[0];
  const totalQuantity = details.reduce(
    (sum, d) => sum + parseFloat(d.quantity_on_hand || "0"),
    0
  );

  return (
    <div className="space-y-6">
      <a
        href="/inventory"
        className="text-blue-600 hover:text-blue-800 text-sm"
      >
        &larr; Back to Inventory
      </a>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {product.product_name}
            </h1>
            <p className="text-gray-500">SKU: {product.sku}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {totalQuantity}
            </div>
            <div className="text-sm text-gray-500">Total On Hand</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">Category</div>
            <div className="font-medium">{product.category_name || "-"}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">Item Type</div>
            <div className="font-medium">{product.item_type || "-"}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">
              Tracking Options
            </div>
            <div className="font-medium flex flex-wrap gap-1 mt-1">
              {product.track_serials === 1 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                  Serials
                </span>
              )}
              {product.track_lots === 1 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                  Lots
                </span>
              )}
              {product.track_expiry === 1 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">
                  Expiry
                </span>
              )}
              {!product.track_serials &&
                !product.track_lots &&
                !product.track_expiry && (
                  <span className="text-gray-400">None</span>
                )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">Locations</div>
            <div className="font-medium">
              {new Set(details.map((d) => d.location_id)).size}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Inventory Lines
          </h2>
          <p className="text-sm text-gray-500">{details.length} records</p>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sublocation
              </th>
              {product.track_serials === 1 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial
                </th>
              )}
              {product.track_lots === 1 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lot
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {details.map((item) => (
              <tr key={item.inventory_line_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {item.location_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.location_abbreviation}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {item.sublocation || "-"}
                </td>
                {product.track_serials === 1 && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.serial ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800 font-mono">
                        {item.serial}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                )}
                {product.track_lots === 1 && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.lot_id ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 font-mono">
                        {item.lot_id}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                  {item.quantity_on_hand}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

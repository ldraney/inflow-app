"use client";

import { useEffect, useState } from "react";

interface MovementItem {
  movement_type: string;
  movement_date: string;
  product_id: string;
  sku: string;
  product_name: string;
  location_id: string;
  location_name: string;
  quantity: string;
  reference_type: string;
  reference_number: string;
  reference_id: string;
  line_id: string;
}

function getMovementBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    "Sale": "bg-green-100 text-green-800",
    "Purchase": "bg-blue-100 text-blue-800",
    "Transfer In": "bg-purple-100 text-purple-800",
    "Transfer Out": "bg-purple-100 text-purple-800",
    "Adjustment": "bg-yellow-100 text-yellow-800",
    "Build": "bg-indigo-100 text-indigo-800",
    "Unbuild": "bg-pink-100 text-pink-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchMovements() {
      try {
        const res = await fetch("/api/movements");
        if (!res.ok) throw new Error("Failed to fetch movements");
        const data = await res.json();
        setMovements(data);
      } catch (err) {
        setError("Failed to load stock movements");
      } finally {
        setLoading(false);
      }
    }
    fetchMovements();
  }, []);

  const movementTypes = [...new Set(movements.map((m) => m.movement_type))];
  const filteredMovements =
    typeFilter === "all"
      ? movements
      : movements.filter((m) => m.movement_type === typeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading stock movements...</div>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-500">
            Ledger of all inventory movements
          </p>
        </div>
        <span className="text-gray-500">{filteredMovements.length} records</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            typeFilter === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {movementTypes.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              typeFilter === type
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {filteredMovements.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          No stock movements found.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.map((item, idx) => (
                <tr key={`${item.line_id}-${idx}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {formatDate(item.movement_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementBadgeColor(
                        item.movement_type
                      )}`}
                    >
                      {item.movement_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {item.product_name}
                    </div>
                    <div className="text-xs text-gray-500">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {item.location_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`font-medium ${
                        parseFloat(item.quantity) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {parseFloat(item.quantity) >= 0 ? "+" : ""}
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.reference_number ? (
                      <div>
                        <div className="text-gray-900 font-mono text-sm">
                          {item.reference_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.reference_type}
                        </div>
                      </div>
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

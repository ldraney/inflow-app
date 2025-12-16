"use client";

import { useEffect, useState } from "react";

interface DeadStock {
  product_id: string;
  sku: string;
  product_name: string;
  category_id: string | null;
  category_name: string | null;
  location_id: string | null;
  location_name: string | null;
  quantity_on_hand: string;
  unit_cost: string | null;
  total_value: string | null;
  last_movement_date: string | null;
  days_since_movement: number | null;
  dead_stock_tier: string;
}

function getTierColor(tier: string): string {
  switch (tier) {
    case "30_DAYS":
      return "bg-yellow-100 text-yellow-800";
    case "60_DAYS":
      return "bg-orange-100 text-orange-800";
    case "90_DAYS":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getTierLabel(tier: string): string {
  switch (tier) {
    case "30_DAYS":
      return "30+ Days";
    case "60_DAYS":
      return "60+ Days";
    case "90_DAYS":
      return "90+ Days";
    default:
      return tier;
  }
}

function formatCurrency(amount: string | number | null): string {
  if (amount === null || amount === "") return "-";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DeadStockPage() {
  const [products, setProducts] = useState<DeadStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("");

  useEffect(() => {
    async function fetchDeadStock() {
      try {
        const url = tierFilter
          ? `/api/analytics/dead-stock?tier=${tierFilter}`
          : "/api/analytics/dead-stock";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch dead stock");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError("Failed to load dead stock data");
      } finally {
        setLoading(false);
      }
    }
    fetchDeadStock();
  }, [tierFilter]);

  const filteredProducts = products.filter(
    (p) =>
      p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.location_name?.toLowerCase().includes(search.toLowerCase())
  );

  const tierCounts = products.reduce(
    (acc, p) => {
      acc[p.dead_stock_tier] = (acc[p.dead_stock_tier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalValue = products.reduce((sum, p) => {
    const val = parseFloat(p.total_value || "0");
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dead stock...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Dead Stock</h1>
          <p className="text-gray-500">
            Inventory with no movement (30+/60+/90+ days)
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs text-gray-500">Total Value at Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {tierCounts["90_DAYS"] || 0}
            </div>
            <div className="text-xs text-gray-500">90+ Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {products.length}
            </div>
            <div className="text-xs text-gray-500">Total Items</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by name, SKU, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Tiers</option>
          <option value="30_DAYS">30+ Days</option>
          <option value="60_DAYS">60+ Days</option>
          <option value="90_DAYS">90+ Days</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {search || tierFilter
            ? "No products match your filters."
            : "No dead stock found - all inventory is moving!"}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Movement
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Idle
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product, idx) => (
                <tr
                  key={`${product.product_id}-${product.location_id}-${idx}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {product.product_name}
                    </div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {product.location_name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                    {product.quantity_on_hand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    {formatCurrency(product.unit_cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                    {formatCurrency(product.total_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {formatDate(product.last_movement_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-red-600">
                    {product.days_since_movement ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(
                        product.dead_stock_tier
                      )}`}
                    >
                      {getTierLabel(product.dead_stock_tier)}
                    </span>
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

"use client";

import { useEffect, useState } from "react";

interface ProductVelocity {
  product_id: string;
  sku: string;
  product_name: string;
  category_id: string | null;
  category_name: string | null;
  quantity_on_hand: number;
  sold_7d: number;
  sold_30d: number;
  sold_90d: number;
  avg_daily_sales: number;
  days_of_stock: number | null;
  last_sale_date: string | null;
  velocity_tier: string;
}

function getTierColor(tier: string): string {
  switch (tier) {
    case "FAST":
      return "bg-green-100 text-green-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800";
    case "SLOW":
      return "bg-orange-100 text-orange-800";
    case "DEAD":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getDaysOfStockColor(days: number | null): string {
  if (days === null) return "text-gray-400";
  if (days <= 14) return "text-red-600";
  if (days <= 30) return "text-orange-500";
  if (days <= 60) return "text-yellow-600";
  return "text-green-600";
}

export default function VelocityPage() {
  const [products, setProducts] = useState<ProductVelocity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("");

  useEffect(() => {
    async function fetchVelocity() {
      try {
        const url = tierFilter
          ? `/api/analytics/velocity?tier=${tierFilter}`
          : "/api/analytics/velocity";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch velocity");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError("Failed to load product velocity data");
      } finally {
        setLoading(false);
      }
    }
    fetchVelocity();
  }, [tierFilter]);

  const filteredProducts = products.filter(
    (p) =>
      p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const tierCounts = products.reduce(
    (acc, p) => {
      acc[p.velocity_tier] = (acc[p.velocity_tier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalSold90d = products.reduce((sum, p) => sum + (p.sold_90d || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading product velocity...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Product Velocity</h1>
          <p className="text-gray-500">Sales velocity analysis (7/30/90 day)</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalSold90d}</div>
            <div className="text-xs text-gray-500">Sold (90d)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tierCounts["FAST"] || 0}
            </div>
            <div className="text-xs text-gray-500">Fast Movers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tierCounts["SLOW"] || 0}
            </div>
            <div className="text-xs text-gray-500">Slow Movers</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by name or SKU..."
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
          <option value="FAST">Fast</option>
          <option value="MEDIUM">Medium</option>
          <option value="SLOW">Slow</option>
          <option value="DEAD">Dead</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          {search || tierFilter
            ? "No products match your filters."
            : "No product velocity data found."}
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
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  On Hand
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  7d
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  30d
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  90d
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg/Day
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {product.product_name}
                    </div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {product.category_name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                    {product.quantity_on_hand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    {product.sold_7d}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    {product.sold_30d}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                    {product.sold_90d}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    {product.avg_daily_sales != null
                      ? Number(product.avg_daily_sales).toFixed(2)
                      : "0.00"}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-right font-medium ${getDaysOfStockColor(
                      product.days_of_stock
                    )}`}
                  >
                    {product.days_of_stock !== null
                      ? product.days_of_stock
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(
                        product.velocity_tier
                      )}`}
                    >
                      {product.velocity_tier}
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

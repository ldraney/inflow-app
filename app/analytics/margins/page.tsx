"use client";

import { useEffect, useState } from "react";

interface ProductMargin {
  product_id: string;
  name: string;
  sku: string;
  item_type: string | null;
  category_name: string | null;
  price: string | null;
  cost: string | null;
  margin_percent: number | null;
  margin_amount: number | null;
}

function formatCurrency(amount: string | number | null): string {
  if (amount === null) return "-";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function getMarginColor(margin: number | null): string {
  if (margin === null) return "text-gray-400";
  if (margin >= 50) return "text-green-600";
  if (margin >= 25) return "text-green-500";
  if (margin >= 10) return "text-yellow-600";
  if (margin >= 0) return "text-orange-500";
  return "text-red-600";
}

export default function MarginsPage() {
  const [products, setProducts] = useState<ProductMargin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchMargins() {
      try {
        const res = await fetch("/api/analytics/margins");
        if (!res.ok) throw new Error("Failed to fetch margins");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError("Failed to load product margins");
      } finally {
        setLoading(false);
      }
    }
    fetchMargins();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const withMargin = products.filter((p) => p.margin_percent !== null);
  const avgMargin =
    withMargin.length > 0
      ? withMargin.reduce((sum, p) => sum + (p.margin_percent || 0), 0) /
        withMargin.length
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading product margins...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Product Margins</h1>
          <p className="text-gray-500">Price vs cost analysis</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {avgMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Avg Margin</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {withMargin.length}
            </div>
            <div className="text-xs text-gray-500">Products w/ Cost</div>
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
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          {search ? "No products match your search." : "No products with pricing found."}
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
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin $
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {product.category_name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                    {formatCurrency(product.cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={getMarginColor(product.margin_amount)}>
                      {product.margin_amount !== null
                        ? formatCurrency(product.margin_amount)
                        : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`font-medium ${getMarginColor(
                        product.margin_percent
                      )}`}
                    >
                      {product.margin_percent !== null
                        ? `${product.margin_percent}%`
                        : "-"}
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

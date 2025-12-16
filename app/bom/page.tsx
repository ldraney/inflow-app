"use client";

import { useEffect, useState } from "react";

interface BomParent {
  product_id: string;
  name: string;
  sku: string;
  item_type: string | null;
  category_name: string | null;
  component_count: number;
  total_bom_cost: number | null;
}

interface BomComponent {
  item_bom_id: string;
  parent_product_id: string;
  parent_name: string;
  parent_sku: string;
  child_product_id: string;
  child_name: string;
  child_sku: string;
  quantity: string;
  uom_name: string | null;
  component_cost: string | null;
  line_cost: number | null;
}

function formatCurrency(amount: number | string | null): string {
  if (amount === null) return "-";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export default function BomPage() {
  const [parents, setParents] = useState<BomParent[]>([]);
  const [components, setComponents] = useState<BomComponent[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchBomParents() {
      try {
        const res = await fetch("/api/bom");
        if (!res.ok) throw new Error("Failed to fetch BOM");
        const data = await res.json();
        setParents(data);
      } catch (err) {
        setError("Failed to load bill of materials");
      } finally {
        setLoading(false);
      }
    }
    fetchBomParents();
  }, []);

  async function loadComponents(productId: string) {
    setLoadingComponents(true);
    try {
      const res = await fetch(`/api/bom?productId=${productId}`);
      if (!res.ok) throw new Error("Failed to fetch components");
      const data = await res.json();
      setComponents(data);
      setSelectedProduct(productId);
    } catch (err) {
      setError("Failed to load components");
    } finally {
      setLoadingComponents(false);
    }
  }

  const filteredParents = parents.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedParent = parents.find((p) => p.product_id === selectedProduct);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading bill of materials...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Bill of Materials</h1>
          <p className="text-gray-500">Product components with costs</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {parents.length}
          </div>
          <div className="text-xs text-gray-500">Assemblies</div>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search assemblies by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Parent products list */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Assemblies</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredParents.map((parent) => (
              <div
                key={parent.product_id}
                onClick={() => loadComponents(parent.product_id)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                  selectedProduct === parent.product_id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{parent.name}</div>
                    <div className="text-sm text-gray-500">{parent.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {parent.component_count} parts
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(parent.total_bom_cost)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Components panel */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              {selectedParent ? `Components: ${selectedParent.name}` : "Select an assembly"}
            </h2>
          </div>
          {loadingComponents ? (
            <div className="p-6 text-center text-gray-500">
              Loading components...
            </div>
          ) : components.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Component
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Line Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {components.map((comp) => (
                  <tr key={comp.item_bom_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">
                        {comp.child_name}
                      </div>
                      <div className="text-xs text-gray-500">{comp.child_sku}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {comp.quantity} {comp.uom_name || ""}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-sm">
                      {formatCurrency(comp.component_cost)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(comp.line_cost)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                    Total BOM Cost
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {formatCurrency(
                      components.reduce((sum, c) => sum + (c.line_cost || 0), 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {selectedProduct
                ? "No components found"
                : "Click an assembly to view its components"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

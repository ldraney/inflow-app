"use client";

import { useEffect, useState } from "react";

interface InventoryStatus {
  product_id: string;
  name: string;
  sku: string;
  total_quantity: number;
  reorder_point: number;
}

interface ReorderAlert {
  product_id: string;
  name: string;
  sku: string;
  current_quantity: number;
  reorder_point: number;
}

interface OpenOrder {
  order_id: string;
  order_type: string;
  order_number: string;
  status: string;
  total: number;
}

export default function Dashboard() {
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [alerts, setAlerts] = useState<ReorderAlert[]>([]);
  const [orders, setOrders] = useState<OpenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [invRes, alertRes, orderRes] = await Promise.all([
          fetch("/api/inventory?limit=5"),
          fetch("/api/alerts?limit=5"),
          fetch("/api/orders?status=open&limit=5"),
        ]);

        if (invRes.ok) setInventory(await invRes.json());
        if (alertRes.ok) setAlerts(await alertRes.json());
        if (orderRes.ok) setOrders(await orderRes.json());
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {inventory.length}+
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Reorder Alerts</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {alerts.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Open Orders</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {orders.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inventory */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Inventory Status
            </h2>
          </div>
          <div className="p-6">
            {inventory.length === 0 ? (
              <p className="text-gray-500">No inventory data available</p>
            ) : (
              <ul className="divide-y">
                {inventory.map((item) => (
                  <li key={item.product_id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.total_quantity}</p>
                        <p className="text-sm text-gray-500">in stock</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <a
              href="/inventory"
              className="block mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
              View all inventory →
            </a>
          </div>
        </div>

        {/* Reorder Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Reorder Alerts
            </h2>
          </div>
          <div className="p-6">
            {alerts.length === 0 ? (
              <p className="text-gray-500">No reorder alerts</p>
            ) : (
              <ul className="divide-y">
                {alerts.map((alert) => (
                  <li key={alert.product_id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {alert.name}
                        </p>
                        <p className="text-sm text-gray-500">{alert.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {alert.current_quantity} / {alert.reorder_point}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <a
              href="/alerts"
              className="block mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
              View all alerts →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface Alert {
  product_id: string;
  name: string;
  sku: string;
  current_quantity: number;
  reorder_point: number;
  reorder_quantity: number;
  location_name?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/alerts");
        if (!res.ok) throw new Error("Failed to fetch alerts");
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        setError("Failed to load alerts");
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading alerts...</div>
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
        <h1 className="text-2xl font-bold text-gray-900">Reorder Alerts</h1>
        <span className="text-gray-500">
          {alerts.length} items need attention
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-green-600 text-lg font-medium">
            All stock levels are healthy
          </div>
          <p className="text-green-500 mt-2">
            No products are below their reorder point
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.product_id}
              className="bg-white rounded-lg shadow border-l-4 border-red-500 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{alert.name}</h3>
                  <p className="text-sm text-gray-500">{alert.sku}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Low Stock
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="text-2xl font-bold text-red-600">
                    {alert.current_quantity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reorder Point</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {alert.reorder_point}
                  </p>
                </div>
              </div>
              {alert.reorder_quantity && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Suggested reorder quantity:{" "}
                    <span className="font-medium text-gray-900">
                      {alert.reorder_quantity}
                    </span>
                  </p>
                </div>
              )}
              {alert.location_name && (
                <p className="mt-2 text-sm text-gray-500">
                  Location: {alert.location_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

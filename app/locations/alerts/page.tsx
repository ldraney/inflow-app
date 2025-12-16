"use client";

import { useEffect, useState } from "react";

interface LocationAlert {
  productId: string;
  sku: string;
  productName: string;
  categoryId: string;
  locationId: string;
  locationName: string;
  locationAbbreviation: string;
  quantityOnHand: string;
  quantityAvailable: string;
  quantityOnPurchaseOrder: string;
  quantityInTransit: string;
  reorderPoint: string;
  reorderQuantity: string;
  shortfallQuantity: number;
  suggestedOrderQuantity: number;
  preferredVendorId: string;
  vendorName: string;
  vendorCode: string;
  vendorItemCode: string;
  vendorCost: string;
  leadTimeDays: number;
}

export default function LocationAlertsPage() {
  const [alerts, setAlerts] = useState<LocationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/locations/alerts");
        if (!res.ok) throw new Error("Failed to fetch alerts");
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        setError("Failed to load location reorder alerts");
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading location alerts...</div>
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

  // Group alerts by location
  const alertsByLocation = alerts.reduce((acc, alert) => {
    if (!acc[alert.locationName]) {
      acc[alert.locationName] = [];
    }
    acc[alert.locationName].push(alert);
    return acc;
  }, {} as Record<string, LocationAlert[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Location Reorder Alerts
          </h1>
          <p className="text-gray-500 mt-1">
            Products below reorder point at specific locations
          </p>
        </div>
        <span className="text-gray-500">{alerts.length} alerts</span>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-green-700 font-medium">
            All locations are fully stocked
          </div>
          <p className="text-green-600 text-sm mt-1">
            No products below reorder point at any location
          </p>
        </div>
      ) : (
        Object.entries(alertsByLocation).map(([locationName, locationAlerts]) => (
          <div
            key={locationName}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {locationName}
              </h2>
              <span className="text-sm text-gray-500">
                {locationAlerts.length} products need reorder
              </span>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    On Hand
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Reorder Point
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Shortfall
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Suggested Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locationAlerts.map((alert) => (
                  <tr
                    key={`${alert.productId}-${alert.locationId}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {alert.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {alert.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 font-medium">
                      {alert.quantityOnHand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                      {alert.reorderPoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-red-600">
                      -{alert.shortfallQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-blue-600 font-medium">
                      {alert.suggestedOrderQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {alert.vendorName || "-"}
                      {alert.leadTimeDays > 0 && (
                        <span className="ml-2 text-xs text-gray-400">
                          ({alert.leadTimeDays}d lead)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

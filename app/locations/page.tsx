"use client";

import { useEffect, useState } from "react";

interface LocationSummary {
  locationId: string;
  locationName: string;
  locationAbbreviation: string;
  isShippable: number;
  isReceivable: number;
  skuCount: number;
  totalQuantityOnHand: number;
  totalQuantityAvailable: number;
  totalQuantityReserved: number;
  totalQuantityInTransit: number;
}

interface LocationInventory {
  productId: string;
  locationId: string;
  sku: string;
  productName: string;
  locationName: string;
  quantityOnHand: string;
  quantityAvailable: string;
  quantityReserved: string;
  quantityInTransit: string;
}

export default function LocationsPage() {
  const [summary, setSummary] = useState<LocationSummary[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationInventory, setLocationInventory] = useState<LocationInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/locations?view=summary");
        if (!res.ok) throw new Error("Failed to fetch locations");
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        setError("Failed to load locations");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  async function handleLocationClick(locationId: string) {
    if (selectedLocation === locationId) {
      setSelectedLocation(null);
      setLocationInventory([]);
      return;
    }

    setSelectedLocation(locationId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/locations?locationId=${locationId}`);
      if (!res.ok) throw new Error("Failed to fetch location inventory");
      const data = await res.json();
      setLocationInventory(data);
    } catch (err) {
      setError("Failed to load location inventory");
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading locations...</div>
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
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        <span className="text-gray-500">{summary.length} locations</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summary.map((location) => (
          <div
            key={location.locationId}
            onClick={() => handleLocationClick(location.locationId)}
            className={`bg-white shadow rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedLocation === location.locationId
                ? "ring-2 ring-blue-500"
                : ""
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {location.locationName}
                </h3>
                <span className="text-sm text-gray-500">
                  {location.locationAbbreviation}
                </span>
              </div>
              <div className="flex gap-1">
                {location.isShippable === 1 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Ship
                  </span>
                )}
                {location.isReceivable === 1 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Receive
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">SKUs:</span>
                <span className="ml-1 font-medium">{location.skuCount}</span>
              </div>
              <div>
                <span className="text-gray-500">On Hand:</span>
                <span className="ml-1 font-medium">
                  {location.totalQuantityOnHand}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Available:</span>
                <span className="ml-1 font-medium">
                  {location.totalQuantityAvailable}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Reserved:</span>
                <span className="ml-1 font-medium">
                  {location.totalQuantityReserved}
                </span>
              </div>
            </div>

            {location.totalQuantityInTransit > 0 && (
              <div className="mt-2 text-sm">
                <span className="text-orange-600">
                  {location.totalQuantityInTransit} in transit
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedLocation && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Inventory at{" "}
              {summary.find((l) => l.locationId === selectedLocation)?.locationName}
            </h2>
          </div>

          {detailLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
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
                    Available
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    In Transit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locationInventory.map((item) => (
                  <tr
                    key={`${item.productId}-${item.locationId}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {item.quantityOnHand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {item.quantityAvailable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                      {item.quantityReserved}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-orange-600">
                      {item.quantityInTransit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

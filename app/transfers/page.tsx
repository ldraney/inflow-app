"use client";

import { useEffect, useState } from "react";

interface Transfer {
  stockTransferId: string;
  transferNumber: string;
  status: string;
  transferDate: string;
  remarks: string;
  lastModified: string;
  fromLocationId: string;
  fromLocationName: string;
  fromLocationAbbreviation: string;
  toLocationId: string;
  toLocationName: string;
  toLocationAbbreviation: string;
  stockTransferLineId: string;
  lineNum: number;
  productId: string;
  sku: string;
  productName: string;
  quantity: string;
  fromSublocation: string;
  toSublocation: string;
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransfers() {
      try {
        const res = await fetch("/api/transfers");
        if (!res.ok) throw new Error("Failed to fetch transfers");
        const data = await res.json();
        setTransfers(data);
      } catch (err) {
        setError("Failed to load transfers");
      } finally {
        setLoading(false);
      }
    }
    fetchTransfers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transfers...</div>
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

  // Group by transfer number
  const transfersByNumber = transfers.reduce((acc, transfer) => {
    if (!acc[transfer.transferNumber]) {
      acc[transfer.transferNumber] = {
        ...transfer,
        lines: [],
      };
    }
    acc[transfer.transferNumber].lines.push(transfer);
    return acc;
  }, {} as Record<string, Transfer & { lines: Transfer[] }>);

  const transferGroups = Object.values(transfersByNumber);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "in transit":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfer Pipeline</h1>
          <p className="text-gray-500 mt-1">Stock transfers between locations</p>
        </div>
        <span className="text-gray-500">
          {transferGroups.length} transfers
        </span>
      </div>

      {transferGroups.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-700 font-medium">No open transfers</div>
          <p className="text-gray-500 text-sm mt-1">
            All stock transfers have been completed
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transferGroups.map((transfer) => (
            <div
              key={transfer.stockTransferId}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {transfer.transferNumber}
                      </h2>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          transfer.status
                        )}`}
                      >
                        {transfer.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">{transfer.fromLocationName}</span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">{transfer.toLocationName}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>
                      {transfer.transferDate
                        ? new Date(transfer.transferDate).toLocaleDateString()
                        : "-"}
                    </div>
                    <div className="text-xs">
                      {transfer.lines.length} line items
                    </div>
                  </div>
                </div>
                {transfer.remarks && (
                  <p className="mt-2 text-sm text-gray-500">{transfer.remarks}</p>
                )}
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Line
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      To
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfer.lines.map((line) => (
                    <tr key={line.stockTransferLineId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {line.lineNum}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {line.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {line.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                        {line.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {line.fromSublocation || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {line.toSublocation || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

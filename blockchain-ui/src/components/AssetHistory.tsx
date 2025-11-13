import React from "react";

interface AssetHistoryProps {
  historyAssetId: string;
  setHistoryAssetId: (value: string) => void;
  handleViewHistory: () => void;
  assetHistory: any[];        
  formatAddress: (addr: string) => string;
  formatDate: (timestamp: number) => string;
}
export default function AssetHistory({
  historyAssetId,
  setHistoryAssetId,
  handleViewHistory,
  assetHistory,
  formatAddress,
  formatDate
}: AssetHistoryProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Lịch sử giao dịch</h3>

      <div className="flex space-x-2 mb-6">
        <input
          type="number"
          value={historyAssetId}
          onChange={(e) => setHistoryAssetId(e.target.value)}
          placeholder="Nhập ID tài sản"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />

        <button
          onClick={handleViewHistory}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          Xem
        </button>
      </div>

      {assetHistory.length > 0 && assetHistory.map((record, idx) => (
        <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-3">
          <p><strong>Kiểu giao dịch:</strong> {record.transactionType}</p>
          <p><strong>Từ:</strong> {formatAddress(record.from)}</p>
          <p><strong>Đến:</strong> {formatAddress(record.to)}</p>
          <p><strong>Thời gian:</strong> {formatDate(record.timestamp)}</p>
        </div>
      ))}
    </div>
  );
}

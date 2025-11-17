interface AssetHistoryProps {
  historyAssetId: string;
  setHistoryAssetId: (value: string) => void;
  handleViewHistory: () => void;
  assetHistory: any[];
  recentHistory: any[];
  isHistoryLoading: boolean;
  isRecentHistoryLoading: boolean;
  hasHistorySearched: boolean;
  formatAddress: (addr: string) => string;
  formatDate: (timestamp: number) => string;
}

export default function AssetHistory({
  historyAssetId,
  setHistoryAssetId,
  handleViewHistory,
  assetHistory,
  recentHistory,
  isHistoryLoading,
  isRecentHistoryLoading,
  hasHistorySearched,
  formatAddress,
  formatDate
}: AssetHistoryProps) {
  const renderHistoryList = (records: any[]) => (
    <div className="space-y-3">
      {records.map((record, idx) => (
        <div key={`${record.assetId}-${record.timestamp}-${idx}`} className="rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tài sản #{record.assetId}</p>
              <p className="text-lg font-semibold text-gray-900">{record.transactionType}</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              {formatDate(record.timestamp)}
            </span>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            <p><strong>Từ:</strong> {formatAddress(record.from)}</p>
            <p><strong>Đến:</strong> {formatAddress(record.to)}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tra cứu lịch sử theo ID tài sản</h3>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            value={historyAssetId}
            onChange={(e) => setHistoryAssetId(e.target.value)}
            placeholder="Nhập ID tài sản"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
          />

          <button
            onClick={handleViewHistory}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white font-medium hover:bg-blue-600 transition disabled:opacity-60"
            disabled={!historyAssetId || isHistoryLoading}
          >
            {isHistoryLoading ? "Đang tải..." : "Xem"}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Kết quả tra cứu</h4>
        {isHistoryLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500 animate-pulse">
            Đang tải lịch sử giao dịch...
          </div>
        ) : assetHistory.length > 0 ? (
          renderHistoryList(assetHistory)
        ) : hasHistorySearched ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            Không tìm thấy giao dịch nào cho ID tài sản đã nhập.
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-gray-500">
            Nhập ID tài sản để xem chi tiết lịch sử giao dịch cụ thể.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800">Hoạt động gần đây</h4>
          {recentHistory.length > 0 && (
            <span className="text-sm text-gray-500">{recentHistory.length} giao dịch gần nhất</span>
          )}
        </div>

        {isRecentHistoryLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500 animate-pulse">
            Đang đồng bộ lịch sử mới nhất...
          </div>
        ) : recentHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            Chưa có giao dịch nào được ghi nhận cho các tài sản của bạn.
          </div>
        ) : (
          renderHistoryList(recentHistory)
        )}
      </section>

    </div>
  );
}

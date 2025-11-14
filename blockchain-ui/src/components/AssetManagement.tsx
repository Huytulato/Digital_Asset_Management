interface AssetManagementProps {
  assetName: string;
  assetDesc: string;
  setAssetName: (v: string) => void;
  setAssetDesc: (v: string) => void;
  handleRegisterAsset: () => void;
  handleViewAsset: (id: string) => void;
  assetDetails: any;
  myAssets: any[];
  account: string;
  formatAddress: (addr: string) => string;
  formatDate: (t: number) => string;
  viewAssetId: string;
  setViewAssetId: (v: string) => void;
}

export default function AssetManagement({
  assetName,
  assetDesc,
  setAssetName,
  setAssetDesc,
  handleRegisterAsset,
  handleViewAsset,
  assetDetails,
  myAssets,
  account,
  formatAddress,
  formatDate,
  viewAssetId,
  setViewAssetId
}: AssetManagementProps) {
  const normalizedAccount = account?.toLowerCase();
  const ownedAssets = normalizedAccount
    ? myAssets.filter((a) => (a.ownerNormalized ?? a.owner?.toLowerCase?.()) === normalizedAccount)
    : myAssets;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Đăng ký Tài sản mới</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tên tài sản</label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Ví dụ: Giấy chứng nhận số #123"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mô tả chi tiết</label>
              <textarea
                value={assetDesc}
                onChange={(e) => setAssetDesc(e.target.value)}
                placeholder="Mô tả ngắn gọn về tài sản của bạn"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRegisterAsset}
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-white font-semibold shadow hover:opacity-90 transition"
            >
              Đăng ký Tài sản
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tra cứu Tài sản</h3>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              value={viewAssetId}
              onChange={(e) => setViewAssetId(e.target.value)}
              placeholder="Nhập ID tài sản"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={() => handleViewAsset(viewAssetId)}
              className="rounded-lg bg-blue-500 px-6 py-2 text-white font-medium hover:bg-blue-600 transition disabled:opacity-60"
              disabled={!viewAssetId}
            >
              Xem
            </button>
          </div>

          {assetDetails && (
            <div className="mt-6 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-5">
              <p className="text-sm text-gray-500">Kết quả tra cứu</p>
              <p className="mt-2 text-2xl font-semibold text-gray-800">#{assetDetails.assetId}</p>
              <p className="mt-1 text-lg font-medium text-gray-900">{assetDetails.name}</p>
              <p className="mt-2 text-sm text-gray-600">{assetDetails.description || "Không có mô tả"}</p>
              <div className="mt-4 grid gap-3 text-sm text-gray-600">
                <p><strong>Chủ sở hữu:</strong> {formatAddress(assetDetails.owner)}</p>
                <p><strong>Ngày tạo:</strong> {formatDate(assetDetails.createdAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách tài sản đã đăng ký</h3>
          <span className="text-sm text-gray-500">{ownedAssets.length} tài sản</span>
        </div>

        {ownedAssets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            Chưa có tài sản nào. Hãy đăng ký tài sản đầu tiên của bạn.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">ID</th>
                  <th className="px-4 py-2 text-left font-medium">Tên tài sản</th>
                  <th className="px-4 py-2 text-left font-medium">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {ownedAssets.map((asset) => (
                  <tr key={asset.assetId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{asset.assetId}</td>
                    <td className="px-4 py-3">{asset.name}</td>
                    <td className="px-4 py-3">{formatDate(asset.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

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
  formatDate
}: AssetManagementProps) {
  return (
    <div className="space-y-6">
      
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Đăng ký Tài sản mới</h3>

        <div className="space-y-4">
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Tên tài sản"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />

          <textarea
            value={assetDesc}
            onChange={(e) => setAssetDesc(e.target.value)}
            placeholder="Mô tả"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />

          <button
            onClick={handleRegisterAsset}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg"
          >
            Đăng ký Tài sản
          </button>
        </div>
      </div>

      {/* VIEW ASSET */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Xem Tài sản</h3>

        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Nhập ID tài sản"
            id="assetIdInput"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => {
              const id = document.getElementById("assetIdInput").value;
              handleViewAsset(id);
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            Xem
          </button>
        </div>

        {assetDetails && (
          <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
            <p><strong>ID:</strong> {assetDetails.assetId}</p>
            <p><strong>Tên:</strong> {assetDetails.name}</p>
            <p><strong>Mô tả:</strong> {assetDetails.description}</p>
            <p><strong>Chủ sở hữu:</strong> {formatAddress(assetDetails.owner)}</p>
            <p><strong>Ngày tạo:</strong> {formatDate(assetDetails.createdAt)}</p>
          </div>
        )}
      </div>

    </div>
  );
}

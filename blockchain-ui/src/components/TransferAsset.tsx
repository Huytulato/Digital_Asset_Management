interface TransferAssetProps {
  transferAssetId: string;
  transferTo: string;
  setTransferAssetId: (v: string) => void;
  setTransferTo: (v: string) => void;
  handleTransferAsset: () => void;
  myAssets: any[];
  account: string;
}
export default function TransferAsset({
  transferAssetId,
  transferTo,
  setTransferAssetId,
  setTransferTo,
  handleTransferAsset,
  myAssets,
  account
}: TransferAssetProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Chuyển nhượng tài sản</h3>

      <select
        value={transferAssetId}
        onChange={(e) => setTransferAssetId(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option value="">Chọn tài sản</option>
        {myAssets.filter(a => a.owner === account).map(a => (
          <option key={a.assetId} value={a.assetId}>
            #{a.assetId} - {a.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Địa chỉ người nhận"
        value={transferTo}
        onChange={(e) => setTransferTo(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />

      <button
        onClick={handleTransferAsset}
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg"
      >
        Chuyển nhượng
      </button>
    </div>
  );
}

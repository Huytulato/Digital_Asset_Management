import { useMemo } from "react";

interface OverviewProps {
  userInfo: any;
  myAssets: any[];
  account: string;
  formatAddress: (addr: string) => string;
  formatDate: (t: number) => string;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function Overview({ userInfo, myAssets, account, formatAddress, formatDate, isLoading, onRefresh }: OverviewProps) {
  const normalizedAccount = account?.toLowerCase();
  const ownedAssets = useMemo(() => {
    if (!normalizedAccount) return myAssets;
    return myAssets.filter((asset) => {
      const ownerNormalized = asset.ownerNormalized ?? asset.owner?.toLowerCase?.();
      return ownerNormalized === normalizedAccount;
    });
  }, [myAssets, normalizedAccount]);

  const latestAsset = ownedAssets[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Xin chào</p>
          <h2 className="text-2xl font-semibold text-gray-800">
            {userInfo?.name || (account ? formatAddress(account) : "Chưa kết nối ví")}
          </h2>
          <p className="text-gray-500 mt-1">Theo dõi nhanh trạng thái người dùng và tài sản on-chain của bạn.</p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start rounded-lg border border-indigo-200 px-5 py-2 font-medium text-indigo-600 transition hover:bg-indigo-50"
          disabled={isLoading}
        >
          {isLoading ? "Đang đồng bộ..." : "Làm mới dữ liệu"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-sm text-indigo-600">Tổng tài sản</p>
          <p className="mt-2 text-3xl font-semibold text-indigo-900">{ownedAssets.length}</p>
          <p className="text-xs text-indigo-500 mt-1">Đăng ký trên smart contract</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-600">Trạng thái User</p>
          <p className="mt-2 text-xl font-semibold text-emerald-900">
            {userInfo ? "Đã đăng ký" : "Chưa có thông tin"}
          </p>
          {userInfo && <p className="text-xs text-emerald-500 mt-1">Đăng ký lúc {formatDate(userInfo.registeredAt)}</p>}
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <p className="text-sm text-orange-600">Tài sản mới nhất</p>
          <p className="mt-2 text-xl font-semibold text-orange-900">
            {latestAsset ? `#${latestAsset.assetId}` : "Chưa có tài sản"}
          </p>
          {latestAsset && <p className="text-xs text-orange-500 mt-1">{formatDate(latestAsset.createdAt)}</p>}
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Thông tin người dùng</h3>
        {userInfo ? (
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Tên</p>
                <p className="text-lg font-medium text-gray-900">{userInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900 break-all">{userInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Địa chỉ ví</p>
                <p className="text-lg font-medium text-gray-900">{formatAddress(userInfo.walletAddress)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Đăng ký lúc</p>
                <p className="text-lg font-medium text-gray-900">{formatDate(userInfo.registeredAt)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-6 text-yellow-800">
            Bạn chưa đăng ký User. Hãy sang tab <strong>Quản lý User</strong> để hoàn tất thông tin.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">Tài sản của tôi</h3>
          <span className="text-sm text-gray-500">{ownedAssets.length} tài sản</span>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500 animate-pulse">
            Đang tải tài sản...
          </div>
        ) : ownedAssets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            Chưa có tài sản nào được ghi nhận. Hãy tạo mới ở tab <strong>Quản lý Tài sản</strong>.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ownedAssets.map((asset) => (
              <div key={asset.assetId} className="rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-500">#{asset.assetId}</p>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                    {formatDate(asset.createdAt)}
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold text-gray-900">{asset.name}</p>
                <p className="mt-1 text-sm text-gray-500 max-h-12 overflow-hidden">{asset.description || "Không có mô tả"}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

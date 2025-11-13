interface OverviewProps {
  userInfo: any;
  myAssets: any[];
  account: string;
  formatAddress: (addr: string) => string;
  formatDate: (t: number) => string;
}
export default function Overview({ userInfo, myAssets, account, formatAddress, formatDate }: OverviewProps) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Thông tin User</h3>

      {userInfo ? (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p><strong>Tên:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Ví:</strong> {formatAddress(userInfo.walletAddress)}</p>
        </div>
      ) : (
        <p className="text-yellow-700">Bạn chưa đăng ký user.</p>
      )}

      <h3 className="text-xl font-bold mt-6 mb-3">Tài sản của tôi</h3>

      {myAssets.filter(a => a.owner === account).map(a => (
        <div key={a.assetId} className="p-4 bg-white border rounded mb-3">
          <p><strong>ID:</strong> {a.assetId}</p>
          <p><strong>Tên:</strong> {a.name}</p>
          <p><strong>Ngày tạo:</strong> {formatDate(a.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}

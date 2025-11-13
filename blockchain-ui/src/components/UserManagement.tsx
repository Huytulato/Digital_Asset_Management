
interface UserManagementProps {
  userInfo: any;
  userName: string;
  userEmail: string;
  setUserName: (val: string) => void;
  setUserEmail: (val: string) => void;
  handleRegisterUser: () => void;
  handleUpdateProfile: () => void;
  formatAddress: (addr: string) => string;
  formatDate: (t: number) => string;
}

export default function UserManagement({
  userInfo,
  userName,
  userEmail,
  setUserName,
  setUserEmail,
  handleRegisterUser,
  handleUpdateProfile,
  formatAddress,
  formatDate
}: UserManagementProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {userInfo ? 'Cập nhật thông tin User' : 'Đăng ký User mới'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nhập tên"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Nhập email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={userInfo ? handleUpdateProfile : handleRegisterUser}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg"
          >
            {userInfo ? 'Cập nhật Profile' : 'Đăng ký User'}
          </button>
        </div>
      </div>

      {userInfo && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin hiện tại</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p><strong>Tên:</strong> {userInfo.name}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Địa chỉ ví:</strong> {formatAddress(userInfo.walletAddress)}</p>
            <p><strong>Đăng ký lúc:</strong> {formatDate(userInfo.registeredAt)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

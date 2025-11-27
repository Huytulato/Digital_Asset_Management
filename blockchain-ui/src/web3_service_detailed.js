import { ethers } from 'ethers';
import VehicleRegistryABI from '../VehicleRegistryABI.json';
import contractInfo from '../contractInfo.json';

/*
  WEB3 SERVICE
  Mục đích: Kết nối và giao tiếp với Smart Contract
*/

class Web3Service {
  constructor() {
    // Khởi tạo các biến
    this.provider = null;      // Nhà cung cấp kết nối blockchain
    this.signer = null;        // Đối tượng ký transaction
    this.contract = null;      // Instance của Smart Contract
    this.currentAccount = null; // Địa chỉ ví hiện tại
  }

  // ==================== KẾT NỐI VÍ ====================
  
  /**
   * Kết nối với Metamask
   * @returns {string} Địa chỉ ví đã kết nối
   */
  async connectWallet() {
    try {
      // Kiểm tra Metamask đã cài chưa
      if (!window.ethereum) {
        throw new Error('Vui lòng cài đặt MetaMask!');
      }

      console.log('🔌 Đang kết nối với Metamask...');

      // Yêu cầu user cho phép kết nối
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      console.log('✅ Metamask đã kết nối!');
      console.log('📍 Địa chỉ ví:', accounts[0]);

      // Tạo provider (kết nối blockchain)
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Lấy signer (để ký transaction)
      this.signer = await this.provider.getSigner();
      
      // Lưu địa chỉ ví
      this.currentAccount = accounts[0];

      // Tạo contract instance
      this.contract = new ethers.Contract(
        contractInfo.address,        // Địa chỉ contract
        VehicleRegistryABI,          // ABI
        this.signer                  // Signer để gọi write function
      );

      console.log('📜 Contract đã được load:', contractInfo.address);

      return this.currentAccount;
      
    } catch (error) {
      console.error('❌ Lỗi kết nối ví:', error);
      throw error;
    }
  }

  /**
   * Lắng nghe sự kiện thay đổi account
   */
  onAccountChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('🔄 Account đã thay đổi:', accounts[0]);
        this.currentAccount = accounts[0];
        callback(accounts[0]);
      });
    }
  }

  /**
   * Lắng nghe sự kiện thay đổi network
   */
  onNetworkChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('🔄 Network đã thay đổi:', chainId);
        callback(chainId);
      });
    }
  }

  /**
   * Kiểm tra đã kết nối chưa
   */
  isConnected() {
    return this.currentAccount !== null;
  }

  /**
   * Lấy địa chỉ account hiện tại
   */
  getCurrentAccount() {
    return this.currentAccount;
  }

  /**
   * Kiểm tra account hiện tại có phải Authority không
   */
  async isAuthority() {
    try {
      const authorityAddress = await this.contract.authority();
      return authorityAddress.toLowerCase() === this.currentAccount.toLowerCase();
    } catch (error) {
      console.error('Lỗi kiểm tra authority:', error);
      return false;
    }
  }

  // ==================== ĐĂNG KÝ XE MỚI ====================

  /**
   * Yêu cầu đăng ký xe mới
   * @param {string} chassisNumber - Số khung
   * @param {string} engineNumber - Số máy
   * @param {string} ipfsHash - Hash IPFS
   * @returns {object} Receipt của transaction
   */
  async requestRegistration(chassisNumber, engineNumber, ipfsHash) {
    try {
      console.log('📝 Đang gửi yêu cầu đăng ký xe...');
      console.log('  Số khung:', chassisNumber);
      console.log('  Số máy:', engineNumber);
      console.log('  IPFS Hash:', ipfsHash);

      // Gọi function trong contract
      const tx = await this.contract.requestRegistration(
        chassisNumber,
        engineNumber,
        ipfsHash
      );

      console.log('⏳ Transaction đã gửi, đang chờ confirm...');
      console.log('  TX Hash:', tx.hash);

      // Đợi transaction được confirm (mining)
      const receipt = await tx.wait();

      console.log('✅ Đăng ký xe thành công!');
      console.log('  Block:', receipt.blockNumber);
      
      return receipt;
      
    } catch (error) {
      console.error('❌ Lỗi đăng ký xe:', error);
      throw this._parseError(error);
    }
  }

  /**
   * Duyệt đăng ký xe (chỉ Authority)
   */
  async approveRegistration(chassisNumber) {
    try {
      console.log('✅ Đang duyệt xe:', chassisNumber);

      const tx = await this.contract.approveRegistration(chassisNumber);
      
      console.log('⏳ Đang chờ confirm...');
      const receipt = await tx.wait();

      console.log('✅ Duyệt thành công!');
      return receipt;
      
    } catch (error) {
      console.error('❌ Lỗi duyệt xe:', error);
      throw this._parseError(error);
    }
  }

  // ==================== CHUYỂN NHƯỢNG ====================

  /**
   * Yêu cầu chuyển nhượng xe
   */
  async requestTransfer(chassisNumber, newOwnerAddress) {
    try {
      console.log('🔄 Yêu cầu chuyển nhượng...');
      console.log('  Xe:', chassisNumber);
      console.log('  Người nhận:', newOwnerAddress);

      const tx = await this.contract.requestTransfer(
        chassisNumber,
        newOwnerAddress
      );

      console.log('⏳ Đang chờ confirm...');
      const receipt = await tx.wait();

      console.log('✅ Yêu cầu chuyển nhượng thành công!');
      return receipt;
      
    } catch (error) {
      console.error('❌ Lỗi yêu cầu chuyển nhượng:', error);
      throw this._parseError(error);
    }
  }

  /**
   * Duyệt chuyển nhượng (chỉ Authority)
   */
  async approveTransfer(chassisNumber) {
    try {
      console.log('✅ Đang duyệt chuyển nhượng:', chassisNumber);

      const tx = await this.contract.approveTransfer(chassisNumber);
      
      console.log('⏳ Đang chờ confirm...');
      const receipt = await tx.wait();

      console.log('✅ Duyệt chuyển nhượng thành công!');
      return receipt;
      
    } catch (error) {
      console.error('❌ Lỗi duyệt chuyển nhượng:', error);
      throw this._parseError(error);
    }
  }

  // ==================== TRA CỨU THÔNG TIN ====================

  /**
   * Lấy thông tin xe
   */
  async getVehicle(chassisNumber) {
    try {
      console.log('🔍 Đang tra cứu xe:', chassisNumber);

      const vehicle = await this.contract.getVehicle(chassisNumber);
      
      // Chuyển đổi dữ liệu từ contract sang object JavaScript
      const result = {
        chassisNumber: vehicle.chassisNumber,
        engineNumber: vehicle.engineNumber,
        ipfsHash: vehicle.ipfsHash,
        currentOwner: vehicle.currentOwner,
        pendingOwner: vehicle.pendingOwner,
        status: Number(vehicle.status),  // Convert BigInt to Number
        registrationTime: Number(vehicle.registrationTime),
        lastUpdateTime: Number(vehicle.lastUpdateTime)
      };

      console.log('✅ Thông tin xe:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Lỗi lấy thông tin xe:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách xe của một chủ
   */
  async getOwnerVehicles(ownerAddress) {
    try {
      console.log('🔍 Lấy danh sách xe của:', ownerAddress);

      const vehicles = await this.contract.getOwnerVehicles(ownerAddress);
      
      console.log('✅ Tìm thấy', vehicles.length, 'xe');
      return vehicles;
      
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách xe:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách xe chờ duyệt
   */
  async getPendingVehicles() {
    try {
      console.log('🔍 Lấy danh sách xe chờ duyệt...');

      const pendingList = await this.contract.getPendingVehicles();
      
      console.log('✅ Có', pendingList.length, 'xe chờ duyệt');
      return pendingList;
      
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách pending:', error);
      throw error;
    }
  }

  /**
   * Lấy tổng số xe
   */
  async getTotalVehicles() {
    try {
      const total = await this.contract.getTotalVehicles();
      return Number(total);
    } catch (error) {
      console.error('❌ Lỗi lấy tổng số xe:', error);
      throw error;
    }
  }

  // ==================== EVENTS ====================

  /**
   * Lắng nghe events từ contract
   */
  listenToEvents(eventName, callback) {
    if (!this.contract) return;

    console.log('👂 Đang lắng nghe event:', eventName);

    this.contract.on(eventName, (...args) => {
      console.log('📢 Event nhận được:', eventName, args);
      callback(...args);
    });
  }

  /**
   * Dừng lắng nghe events
   */
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
      console.log('🔇 Đã dừng lắng nghe events');
    }
  }

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Parse lỗi từ contract
   */
  _parseError(error) {
    // Lỗi có reason (từ require trong contract)
    if (error.reason) {
      return new Error(error.reason);
    }
    
    // User reject transaction
    if (error.message && error.message.includes('user rejected')) {
      return new Error('Bạn đã từ chối giao dịch');
    }
    
    // Lỗi khác
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Đã xảy ra lỗi không xác định');
  }

  /**
   * Format địa chỉ ví (0x1234...5678)
   */
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Format timestamp thành ngày giờ
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Lấy tên trạng thái xe
   */
  getStatusName(status) {
    const statusMap = {
      0: 'Chờ duyệt cấp mới',
      1: 'Đã được cấp',
      2: 'Chờ duyệt chuyển nhượng'
    };
    return statusMap[status] || 'Không xác định';
  }
}

// Export singleton instance
export default new Web3Service();

/*
  CÁCH SỬ DỤNG:
  
  import web3Service from './services/web3Service';
  
  // Kết nối ví
  const account = await web3Service.connectWallet();
  
  // Đăng ký xe
  await web3Service.requestRegistration('ABC123', 'ENG456', 'QmHash...');
  
  // Lấy thông tin xe
  const vehicle = await web3Service.getVehicle('ABC123');
  
  // Kiểm tra Authority
  const isAuth = await web3Service.isAuthority();
*/
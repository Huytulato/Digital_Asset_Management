import axios from 'axios';

/*
  IPFS SERVICE
  Mục đích: Upload và lấy file từ IPFS (qua Pinata)
  
  IPFS là gì?
  - InterPlanetary File System
  - Hệ thống lưu trữ file phi tập trung
  - File được lưu trên nhiều node khắp thế giới
  - Truy cập qua Hash (ví dụ: QmXoy...)
  
  Pinata là gì?
  - Dịch vụ IPFS miễn phí
  - Giúp upload file lên IPFS dễ dàng
  - Có API để tích hợp
*/

class IPFSService {
  constructor() {
    // Lấy JWT token từ file .env
    this.PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
    
    // URL API của Pinata
    this.PINATA_API = 'https://api.pinata.cloud';
    this.PINATA_GATEWAY = 'https://gateway.pinata.cloud';
  }

  // ==================== UPLOAD FILE ====================

  /**
   * Upload 1 file lên IPFS
   * @param {File} file - File từ input[type="file"]
   * @returns {string} IPFS Hash
   */
  async uploadFile(file) {
    try {
      console.log('📤 Đang upload file:', file.name);
      console.log('  Kích thước:', (file.size / 1024).toFixed(2), 'KB');

      // Kiểm tra JWT token
      if (!this.PINATA_JWT || this.PINATA_JWT === 'your_jwt_token_here') {
        throw new Error('Chưa cấu hình Pinata JWT token! Vui lòng cập nhật file .env');
      }

      // Tạo FormData để upload
      const formData = new FormData();
      formData.append('file', file);

      // Metadata (thông tin về file)
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          fileType: file.type,
          fileSize: file.size
        }
      });
      formData.append('pinataMetadata', metadata);

      // Options
      const options = JSON.stringify({
        cidVersion: 0  // Version của IPFS CID
      });
      formData.append('pinataOptions', options);

      // Gửi request đến Pinata
      const response = await axios.post(
        `${this.PINATA_API}/pinning/pinFileToIPFS`,
        formData,
        {
          maxBodyLength: 'Infinity',
          headers: {
            'Content-Type': `multipart/form-data`,
            'Authorization': `Bearer ${this.PINATA_JWT}`
          }
        }
      );

      const ipfsHash = response.data.IpfsHash;
      
      console.log('✅ Upload thành công!');
      console.log('  IPFS Hash:', ipfsHash);
      console.log('  URL:', this.getIPFSUrl(ipfsHash));

      return ipfsHash;
      
    } catch (error) {
      console.error('❌ Lỗi upload file:', error);
      
      if (error.response) {
        // Lỗi từ Pinata API
        console.error('  Status:', error.response.status);
        console.error('  Message:', error.response.data);
      }
      
      throw new Error('Không thể upload file lên IPFS: ' + error.message);
    }
  }

  /**
   * Upload nhiều file cùng lúc
   * @param {FileList} files - Danh sách file
   * @returns {string[]} Mảng IPFS Hash
   */
  async uploadMultipleFiles(files) {
    try {
      console.log('📤 Đang upload', files.length, 'file...');

      // Chuyển FileList thành Array
      const fileArray = Array.from(files);

      // Upload từng file
      const uploadPromises = fileArray.map(file => this.uploadFile(file));
      
      // Đợi tất cả upload xong
      const hashes = await Promise.all(uploadPromises);

      console.log('✅ Upload tất cả file thành công!');
      console.log('  Danh sách Hash:', hashes);

      return hashes;
      
    } catch (error) {
      console.error('❌ Lỗi upload nhiều file:', error);
      throw new Error('Không thể upload nhiều file');
    }
  }

  /**
   * Upload JSON data lên IPFS
   * @param {object} jsonData - Dữ liệu JSON
   * @returns {string} IPFS Hash
   */
  async uploadJSON(jsonData) {
    try {
      console.log('📤 Đang upload JSON data...');
      console.log('  Data:', jsonData);

      // Kiểm tra JWT token
      if (!this.PINATA_JWT || this.PINATA_JWT === 'your_jwt_token_here') {
        throw new Error('Chưa cấu hình Pinata JWT token!');
      }

      const response = await axios.post(
        `${this.PINATA_API}/pinning/pinJSONToIPFS`,
        jsonData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.PINATA_JWT}`
          }
        }
      );

      const ipfsHash = response.data.IpfsHash;
      
      console.log('✅ Upload JSON thành công!');
      console.log('  IPFS Hash:', ipfsHash);

      return ipfsHash;
      
    } catch (error) {
      console.error('❌ Lỗi upload JSON:', error);
      throw new Error('Không thể upload JSON lên IPFS');
    }
  }

  // ==================== LẤY FILE TỪ IPFS ====================

  /**
   * Lấy URL công khai để truy cập file
   * @param {string} ipfsHash - IPFS Hash
   * @returns {string} URL
   */
  getIPFSUrl(ipfsHash) {
    // URL qua Pinata Gateway
    return `${this.PINATA_GATEWAY}/ipfs/${ipfsHash}`;
    
    // Hoặc dùng gateway công cộng:
    // return `https://ipfs.io/ipfs/${ipfsHash}`;
  }

  /**
   * Fetch nội dung từ IPFS
   * @param {string} ipfsHash - IPFS Hash
   * @returns {any} Nội dung file
   */
  async fetchFromIPFS(ipfsHash) {
    try {
      console.log('📥 Đang fetch từ IPFS:', ipfsHash);

      const url = this.getIPFSUrl(ipfsHash);
      const response = await axios.get(url);

      console.log('✅ Fetch thành công!');
      return response.data;
      
    } catch (error) {
      console.error('❌ Lỗi fetch từ IPFS:', error);
      throw new Error('Không thể lấy file từ IPFS');
    }
  }

  // ==================== KIỂM TRA KẾT NỐI ====================

  /**
   * Test kết nối với Pinata
   * @returns {boolean}
   */
  async testConnection() {
    try {
      console.log('🔌 Đang kiểm tra kết nối Pinata...');

      if (!this.PINATA_JWT || this.PINATA_JWT === 'your_jwt_token_here') {
        console.error('❌ Chưa có JWT token!');
        return false;
      }

      const response = await axios.get(
        `${this.PINATA_API}/data/testAuthentication`,
        {
          headers: {
            'Authorization': `Bearer ${this.PINATA_JWT}`
          }
        }
      );

      console.log('✅ Kết nối Pinata thành công!');
      console.log('  Message:', response.data.message);
      return true;
      
    } catch (error) {
      console.error('❌ Kết nối Pinata thất bại:', error.message);
      
      if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Data:', error.response.data);
      }
      
      return false;
    }
  }

  // ==================== HELPER ====================

  /**
   * Validate file trước khi upload
   * @param {File} file
   * @returns {boolean}
   */
  validateFile(file) {
    // Kiểm tra kích thước (giới hạn 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File quá lớn! Giới hạn 5MB');
    }

    // Kiểm tra loại file (chỉ cho phép ảnh và PDF)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF');
    }

    return true;
  }

  /**
   * Format kích thước file
   * @param {number} bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export singleton instance
export default new IPFSService();

/*
  HƯỚNG DẪN SỬ DỤNG:
  
  1. Đăng ký Pinata:
     - Vào: https://app.pinata.cloud/
     - Đăng ký tài khoản miễn phí
     - Vào mục "API Keys"
     - Click "New Key" → Chọn "Admin"
     - Copy JWT token
  
  2. Cập nhật file .env:
     REACT_APP_PINATA_JWT=your_jwt_token_here
  
  3. Sử dụng trong code:
     import ipfsService from './services/ipfsService';
     
     // Test connection
     await ipfsService.testConnection();
     
     // Upload file
     const file = document.getElementById('fileInput').files[0];
     const hash = await ipfsService.uploadFile(file);
     
     // Upload nhiều file
     const files = document.getElementById('fileInput').files;
     const hashes = await ipfsService.uploadMultipleFiles(files);
     
     // Lấy URL
     const url = ipfsService.getIPFSUrl(hash);
     
     // Fetch data
     const data = await ipfsService.fetchFromIPFS(hash);
*/
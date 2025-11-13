// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DigitalAssetManagement
 * @dev Quản lý tài sản số trên blockchain với tính minh bạch và bảo mật
 */
contract DigitalAssetManagement {
    
    // Cấu trúc User
    struct User {
        address walletAddress;
        string name;
        string email;
        uint256 registeredAt;
        bool isRegistered;
    }
    
    // Cấu trúc Asset
    struct Asset {
        uint256 assetId;
        string name;
        string description;
        address owner;
        uint256 createdAt;
        bool exists;
    }
    
    // Cấu trúc Transaction History
    struct TransactionRecord {
        uint256 assetId;
        address from;
        address to;
        uint256 timestamp;
        string transactionType; // "CREATE" hoặc "TRANSFER"
    }
    
    // State variables
    mapping(address => User) public users;
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => TransactionRecord[]) public assetHistory;
    
    uint256 public assetCounter;
    address[] public registeredUsers;
    
    // Events
    event UserRegistered(address indexed userAddress, string name, uint256 timestamp);
    event UserUpdated(address indexed userAddress, string name, uint256 timestamp);
    event AssetRegistered(uint256 indexed assetId, address indexed owner, string name, uint256 timestamp);
    event AssetTransferred(uint256 indexed assetId, address indexed from, address indexed to, uint256 timestamp);
    
    // Modifiers
    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User chua dang ky");
        _;
    }
    
    modifier assetExists(uint256 _assetId) {
        require(assets[_assetId].exists, "Tai san khong ton tai");
        _;
    }
    
    modifier onlyAssetOwner(uint256 _assetId) {
        require(assets[_assetId].owner == msg.sender, "Ban khong phai chu so huu");
        _;
    }
    
    /**
     * @dev Đăng ký user mới
     * @param _name Tên người dùng
     * @param _email Email người dùng
     */
    function registerUser(string memory _name, string memory _email) public {
        require(!users[msg.sender].isRegistered, "User da ton tai");
        require(bytes(_name).length > 0, "Ten khong duoc de trong");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            name: _name,
            email: _email,
            registeredAt: block.timestamp,
            isRegistered: true
        });
        
        registeredUsers.push(msg.sender);
        
        emit UserRegistered(msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Cập nhật thông tin user
     * @param _name Tên mới
     * @param _email Email mới
     */
    function updateProfile(string memory _name, string memory _email) public onlyRegisteredUser {
        require(bytes(_name).length > 0, "Ten khong duoc de trong");
        
        users[msg.sender].name = _name;
        users[msg.sender].email = _email;
        
        emit UserUpdated(msg.sender, _name, block.timestamp);
    }
    
    /**
 * @dev Lấy thông tin user
 * @param _userAddress Địa chỉ user
 * @return walletAddress Địa chỉ ví của user
 * @return name Tên của user
 * @return email Email của user
 * @return registeredAt Thời điểm đăng ký
 * @return isRegistered Trạng thái đăng ký
 */
    function getUser(address _userAddress) public view returns (
        address walletAddress,
        string memory name,
        string memory email,
        uint256 registeredAt,
        bool isRegistered
    ) {
        User memory user = users[_userAddress];
        return (
            user.walletAddress,
            user.name,
            user.email,
            user.registeredAt,
            user.isRegistered
        );
    }
    
    /**
     * @dev Đăng ký tài sản mới
     * @param _name Tên tài sản
     * @param _description Mô tả tài sản
     */
    function registerAsset(string memory _name, string memory _description) public onlyRegisteredUser {
        require(bytes(_name).length > 0, "Ten tai san khong duoc de trong");
        
        assetCounter++;
        
        assets[assetCounter] = Asset({
            assetId: assetCounter,
            name: _name,
            description: _description,
            owner: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });
        
        // Thêm vào lịch sử
        assetHistory[assetCounter].push(TransactionRecord({
            assetId: assetCounter,
            from: address(0),
            to: msg.sender,
            timestamp: block.timestamp,
            transactionType: "CREATE"
        }));
        
        emit AssetRegistered(assetCounter, msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Chuyển nhượng tài sản
     * @param _assetId ID tài sản
     * @param _to Địa chỉ người nhận
     */
    function transferAsset(uint256 _assetId, address _to) public 
        onlyRegisteredUser 
        assetExists(_assetId) 
        onlyAssetOwner(_assetId) 
    {
        require(_to != address(0), "Dia chi khong hop le");
        require(users[_to].isRegistered, "Nguoi nhan chua dang ky");
        require(_to != msg.sender, "Khong the chuyen cho chinh minh");
        
        address previousOwner = assets[_assetId].owner;
        assets[_assetId].owner = _to;
        
        // Thêm vào lịch sử
        assetHistory[_assetId].push(TransactionRecord({
            assetId: _assetId,
            from: previousOwner,
            to: _to,
            timestamp: block.timestamp,
            transactionType: "TRANSFER"
        }));
        
        emit AssetTransferred(_assetId, previousOwner, _to, block.timestamp);
    }
    
    /**
 * @dev Lấy thông tin tài sản
 * @param _assetId ID tài sản
 * @return assetId ID của tài sản
 * @return name Tên tài sản
 * @return description Mô tả tài sản
 * @return owner Chủ sở hữu tài sản
 * @return createdAt Thời điểm tạo
 */
    function getAsset(uint256 _assetId) public view assetExists(_assetId) returns (
        uint256 assetId,
        string memory name,
        string memory description,
        address owner,
        uint256 createdAt
    ) {
        Asset memory asset = assets[_assetId];
        return (
            asset.assetId,
            asset.name,
            asset.description,
            asset.owner,
            asset.createdAt
        );
    }
    
    /**
     * @dev Lấy lịch sử giao dịch của tài sản
     * @param _assetId ID tài sản
     * @return Mảng các transaction records
     */
    function getAssetHistory(uint256 _assetId) public view assetExists(_assetId) returns (TransactionRecord[] memory) {
        return assetHistory[_assetId];
    }
    
    /**
     * @dev Lấy tổng số user đã đăng ký
     * @return Số lượng user
     */
    function getTotalUsers() public view returns (uint256) {
        return registeredUsers.length;
    }
    
    /**
     * @dev Lấy tổng số tài sản đã đăng ký
     * @return Số lượng tài sản
     */
    function getTotalAssets() public view returns (uint256) {
        return assetCounter;
    }
    
    /**
     * @dev Lấy danh sách tài sản của một user
     * @param _owner Địa chỉ chủ sở hữu
     * @return Mảng ID tài sản
     */
    function getAssetsByOwner(address _owner) public view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Đếm số lượng tài sản
        for (uint256 i = 1; i <= assetCounter; i++) {
            if (assets[i].owner == _owner && assets[i].exists) {
                count++;
            }
        }
        
        // Tạo mảng kết quả
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= assetCounter; i++) {
            if (assets[i].owner == _owner && assets[i].exists) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
}

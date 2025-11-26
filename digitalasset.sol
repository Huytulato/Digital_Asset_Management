// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VehicleRegistry
 * @dev Smart Contract quản lý đăng ký và chuyển nhượng xe
 * Deploy với Remix IDE
 */
contract VehicleRegistry {
    
    // Trạng thái xe
    enum VehicleStatus {
        PENDING_NEW,        // 0: Chờ duyệt cấp mới
        APPROVED,           // 1: Đã được cấp
        PENDING_TRANSFER    // 2: Chờ duyệt chuyển nhượng
    }
    
    // Cấu trúc thông tin xe
    struct Vehicle {
        string chassisNumber;
        string engineNumber;
        string ipfsHash;
        address currentOwner;
        address pendingOwner;
        VehicleStatus status;
        uint256 registrationTime;
        uint256 lastUpdateTime;
    }
    
    // Địa chỉ cơ quan giao thông
    address public authority;
    
    // Mapping lưu thông tin xe
    mapping(string => Vehicle) public vehicles;
    mapping(address => string[]) public ownerVehicles;
    string[] public allVehicles;
    
    // Events
    event VehicleRegistrationRequested(string chassisNumber, address owner);
    event VehicleRegistrationApproved(string chassisNumber, address owner);
    event TransferRequested(string chassisNumber, address from, address to);
    event TransferApproved(string chassisNumber, address from, address to);
    
    // Modifiers
    modifier onlyAuthority() {
        require(msg.sender == authority, "Only authority can call this");
        _;
    }
    
    modifier onlyOwner(string memory chassisNumber) {
        require(
            vehicles[chassisNumber].currentOwner == msg.sender,
            "Only vehicle owner can call this"
        );
        _;
    }
    
    // Constructor
    constructor() {
        authority = msg.sender;
    }
    
    // ==================== MAIN FUNCTIONS ====================
    
    /**
     * @dev Yêu cầu đăng ký xe mới
     */
    function requestRegistration(
        string memory _chassisNumber,
        string memory _engineNumber,
        string memory _ipfsHash
    ) public {
        require(
            bytes(vehicles[_chassisNumber].chassisNumber).length == 0,
            "Vehicle already exists"
        );
        
        Vehicle memory newVehicle = Vehicle({
            chassisNumber: _chassisNumber,
            engineNumber: _engineNumber,
            ipfsHash: _ipfsHash,
            currentOwner: msg.sender,
            pendingOwner: address(0),
            status: VehicleStatus.PENDING_NEW,
            registrationTime: block.timestamp,
            lastUpdateTime: block.timestamp
        });
        
        vehicles[_chassisNumber] = newVehicle;
        allVehicles.push(_chassisNumber);
        
        emit VehicleRegistrationRequested(_chassisNumber, msg.sender);
    }
    
    /**
     * @dev Duyệt cấp mới (chỉ Authority)
     */
    function approveRegistration(string memory _chassisNumber) 
        public 
        onlyAuthority 
    {
        Vehicle storage vehicle = vehicles[_chassisNumber];
        require(
            vehicle.status == VehicleStatus.PENDING_NEW,
            "Vehicle is not pending approval"
        );
        
        vehicle.status = VehicleStatus.APPROVED;
        vehicle.lastUpdateTime = block.timestamp;
        ownerVehicles[vehicle.currentOwner].push(_chassisNumber);
        
        emit VehicleRegistrationApproved(_chassisNumber, vehicle.currentOwner);
    }
    
    /**
     * @dev Yêu cầu chuyển nhượng
     */
    function requestTransfer(
        string memory _chassisNumber,
        address _newOwner
    ) public onlyOwner(_chassisNumber) {
        Vehicle storage vehicle = vehicles[_chassisNumber];
        require(
            vehicle.status == VehicleStatus.APPROVED,
            "Vehicle must be approved first"
        );
        require(_newOwner != address(0), "Invalid new owner address");
        require(_newOwner != msg.sender, "Cannot transfer to yourself");
        
        vehicle.pendingOwner = _newOwner;
        vehicle.status = VehicleStatus.PENDING_TRANSFER;
        vehicle.lastUpdateTime = block.timestamp;
        
        emit TransferRequested(_chassisNumber, msg.sender, _newOwner);
    }
    
    /**
     * @dev Duyệt chuyển nhượng (chỉ Authority)
     */
    function approveTransfer(string memory _chassisNumber) 
        public 
        onlyAuthority 
    {
        Vehicle storage vehicle = vehicles[_chassisNumber];
        require(
            vehicle.status == VehicleStatus.PENDING_TRANSFER,
            "No pending transfer"
        );
        
        address oldOwner = vehicle.currentOwner;
        address newOwner = vehicle.pendingOwner;
        
        _removeVehicleFromOwner(oldOwner, _chassisNumber);
        
        vehicle.currentOwner = newOwner;
        vehicle.pendingOwner = address(0);
        vehicle.status = VehicleStatus.APPROVED;
        vehicle.lastUpdateTime = block.timestamp;
        
        ownerVehicles[newOwner].push(_chassisNumber);
        
        emit TransferApproved(_chassisNumber, oldOwner, newOwner);
    }
    
    // ==================== INTERNAL FUNCTIONS ====================
    
    function _removeVehicleFromOwner(
        address _owner,
        string memory _chassisNumber
    ) internal {
        string[] storage vehicleList = ownerVehicles[_owner];
        for (uint i = 0; i < vehicleList.length; i++) {
            if (
                keccak256(bytes(vehicleList[i])) == 
                keccak256(bytes(_chassisNumber))
            ) {
                vehicleList[i] = vehicleList[vehicleList.length - 1];
                vehicleList.pop();
                break;
            }
        }
    }
    
    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Lấy thông tin xe
     */
    function getVehicle(string memory _chassisNumber) 
        public 
        view 
        returns (Vehicle memory) 
    {
        return vehicles[_chassisNumber];
    }
    
    /**
     * @dev Lấy danh sách xe của một chủ
     */
    function getOwnerVehicles(address _owner) 
        public 
        view 
        returns (string[] memory) 
    {
        return ownerVehicles[_owner];
    }
    
    /**
     * @dev Lấy danh sách xe chờ duyệt
     */
    function getPendingVehicles() 
        public 
        view 
        returns (string[] memory) 
    {
        uint count = 0;
        for (uint i = 0; i < allVehicles.length; i++) {
            if (vehicles[allVehicles[i]].status != VehicleStatus.APPROVED) {
                count++;
            }
        }
        
        string[] memory pending = new string[](count);
        uint index = 0;
        for (uint i = 0; i < allVehicles.length; i++) {
            if (vehicles[allVehicles[i]].status != VehicleStatus.APPROVED) {
                pending[index] = allVehicles[i];
                index++;
            }
        }
        
        return pending;
    }
    
    /**
     * @dev Lấy tổng số xe
     */
    function getTotalVehicles() public view returns (uint) {
        return allVehicles.length;
    }
    
    /**
     * @dev Đổi Authority
     */
    function changeAuthority(address _newAuthority) 
        public 
        onlyAuthority 
    {
        require(_newAuthority != address(0), "Invalid address");
        authority = _newAuthority;
    }
}
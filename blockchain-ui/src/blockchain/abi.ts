export const CONTRACT_ABI = [
  "function registerUser(string memory _name, string memory _email) public",
  "function updateProfile(string memory _name, string memory _email) public",
  "function getUser(address _userAddress) public view returns (address, string, string, uint256, bool)",
  "function registerAsset(string memory _name, string memory _description) public",
  "function transferAsset(uint256 _assetId, address _to) public",
  "function getAsset(uint256 _assetId) public view returns (uint256, string, string, address, uint256)",
  "function getAssetHistory(uint256 _assetId) public view returns (tuple(uint256 assetId, address from, address to, uint256 timestamp, string transactionType)[])",
  "function getAssetsByOwner(address _owner) public view returns (uint256[])",
  "function getTotalUsers() public view returns (uint256)",
  "function getTotalAssets() public view returns (uint256)"
];
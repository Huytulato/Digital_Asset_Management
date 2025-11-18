import { useState, useEffect } from "react";
import Header from "./components/Header";
import Notification from "./components/Notification";
import UserManagement from "./components/UserManagement";
import AssetManagement from "./components/AssetManagement";
import TransferAsset from "./components/TransferAsset";
import AssetHistory from "./components/AssetHistory";
import Overview from "./components/Overview";
import { formatAddress, formatDate } from "./blockchain/utils";
import { CONTRACT_ABI } from "./blockchain/abi";

// Contract address - cần thay đổi khi deploy contract
const CONTRACT_ADDRESS = "0xA18434B548D36b52aBb395B5c0e5C4Da50Ab1e62";
const normalizeAddress = (addr?: string) => (addr ?? "").toLowerCase();

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<any>(null);
  const [notification, setNotification] = useState({ show: false, type: "success" as "success" | "error", message: "" });
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);

  // User state
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Asset state
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [assetName, setAssetName] = useState("");
  const [assetDesc, setAssetDesc] = useState("");
  const [assetDetails, setAssetDetails] = useState<any>(null);
  const [viewAssetId, setViewAssetId] = useState("");

  // Transfer state
  const [transferAssetId, setTransferAssetId] = useState("");
  const [transferTo, setTransferTo] = useState("");

  // History state
  const [historyAssetId, setHistoryAssetId] = useState("");
  const [assetHistory, setAssetHistory] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [isRecentHistoryLoading, setIsRecentHistoryLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [hasHistorySearched, setHasHistorySearched] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "success", message: "" }), 3000);
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0];
        setAccount(account);

        // Initialize ethers provider and contract
        const { ethers } = await import("ethers");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        setContract(contractInstance);

        showNotification("success", "Đã kết nối ví thành công!");
        await loadUserData(contractInstance, account);
      } else {
        showNotification("error", "Vui lòng cài đặt MetaMask!");
      }
    } catch (error: any) {
      showNotification("error", `Lỗi kết nối: ${error.message}`);
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setContract(null);
    setUserInfo(null);
    setMyAssets([]);
    setAssetHistory([]);
    setRecentHistory([]);
    setHasHistorySearched(false);
    showNotification("success", "Đã ngắt kết nối ví");
  };

  const loadRecentHistoryForAssets = async (contractInstance: any, assets: any[]) => {
    if (!assets.length) {
      setRecentHistory([]);
      return;
    }
    try {
      setIsRecentHistoryLoading(true);
      const subset = assets.slice(0, 5);
      const historyResponses = await Promise.all(
        subset.map(async (asset) => {
          try {
            const records = await contractInstance.getAssetHistory(asset.assetId);
            return records.map((record: any) => ({
              assetId: Number(record.assetId ?? asset.assetId),
              from: record.from,
              to: record.to,
              timestamp: Number(record.timestamp) * 1000,
              transactionType: record.transactionType,
            }));
          } catch {
            return [];
          }
        })
      );
      const flattened = historyResponses
        .flat()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      setRecentHistory(flattened);
    } catch (error) {
      console.error("Error loading recent history:", error);
    } finally {
      setIsRecentHistoryLoading(false);
    }
  };

  const loadUserData = async (contractInstance: any, userAddress: string) => {
    if (!userAddress) return;
    setIsOverviewLoading(true);
    try {
      const userData = await contractInstance.getUser(userAddress);
      if (userData && userData[4]) {
        setUserInfo({
          walletAddress: userData[0],
          name: userData[1],
          email: userData[2],
          registeredAt: Number(userData[3]) * 1000,
        });
        setUserName(userData[1]);
        setUserEmail(userData[2]);
      } else {
        setUserInfo(null);
      }

      const assetIds = await contractInstance.getAssetsByOwner(userAddress);
      const assets = [];
      for (let i = 0; i < assetIds.length; i++) {
        const assetData = await contractInstance.getAsset(assetIds[i]);
        const ownerAddress = assetData[3] || "";
        const createdAt = Number(assetData[4]) * 1000;
        assets.push({
          assetId: Number(assetData[0] ?? assetIds[i]),
          name: assetData[1],
          description: assetData[2],
          owner: ownerAddress,
          ownerNormalized: normalizeAddress(ownerAddress),
          createdAt,
        });
      }
      const sortedAssets = assets.sort((a, b) => b.createdAt - a.createdAt);
      setMyAssets(sortedAssets);
      await loadRecentHistoryForAssets(contractInstance, sortedAssets);
    } catch (error: any) {
      console.error("Error loading user data:", error);
    } finally {
      setIsOverviewLoading(false);
    }
  };

  useEffect(() => {
    if (account && contract) {
      loadUserData(contract, account);
    }
  }, [account, contract]);

  const handleRegisterUser = async () => {
    if (!contract) {
      showNotification("error", "Vui lòng kết nối ví trước!");
      return;
    }
    try {
      const tx = await contract.registerUser(userName, userEmail);
      showNotification("success", "Đang xử lý giao dịch...");
      await tx.wait();
      showNotification("success", "Đăng ký user thành công!");
      if (account) await loadUserData(contract, account);
    } catch (error: any) {
      showNotification("error", `Lỗi: ${error.message}`);
    }
  };

  const handleUpdateProfile = async () => {
    if (!contract) {
      showNotification("error", "Vui lòng kết nối ví trước!");
      return;
    }
    try {
      const tx = await contract.updateProfile(userName, userEmail);
      showNotification("success", "Đang xử lý giao dịch...");
      await tx.wait();
      showNotification("success", "Cập nhật profile thành công!");
      if (account) await loadUserData(contract, account);
    } catch (error: any) {
      showNotification("error", `Lỗi: ${error.message}`);
    }
  };

  const handleRegisterAsset = async () => {
    if (!contract) {
      showNotification("error", "Vui lòng kết nối ví trước!");
      return;
    }
    if (!assetName.trim()) {
      showNotification("error", "Vui lòng nhập tên tài sản!");
      return;
    }
    try {
      const tx = await contract.registerAsset(assetName, assetDesc);
      showNotification("success", "Đang xử lý giao dịch...");
      await tx.wait();
      showNotification("success", "Đăng ký tài sản thành công!");
      setAssetName("");
      setAssetDesc("");
      if (account) await loadUserData(contract, account);
    } catch (error: any) {
      showNotification("error", `Lỗi: ${error.message}`);
    }
  };

  const handleViewAsset = async (id: string) => {
    if (!contract || !account) {
      showNotification("error", "Vui lòng kết nối ví trước!");
      return;
    }
    if (!id) {
      showNotification("error", "Vui lòng chọn tài sản!");
      return;
    }

    const normalizedAccount = normalizeAddress(account);
    const ownedAsset = myAssets.find((asset) => String(asset.assetId) === String(id));
    if (!ownedAsset || !normalizedAccount) {
      showNotification("error", "Bạn chỉ có thể xem thông tin tài sản thuộc sở hữu của mình.");
      setAssetDetails(null);
      return;
    }

    try {
      const assetData = await contract.getAsset(id);
      const ownerAddress = assetData[3];
      if (normalizeAddress(ownerAddress) !== normalizedAccount) {
        showNotification("error", "Tài sản này không thuộc sở hữu của bạn.");
        setAssetDetails(null);
        return;
      }
      setAssetDetails({
        assetId: Number(assetData[0]),
        name: assetData[1],
        description: assetData[2],
        owner: ownerAddress,
        createdAt: Number(assetData[4]) * 1000,
      });
    } catch (error: any) {
      showNotification("error", `Lỗi: ${error.message}`);
      setAssetDetails(null);
    }
  };

  const handleTransferAsset = async () => {
    if (!contract) {
      showNotification("error", "Vui lòng kết nối ví trước!");
      return;
    }
    if (!transferAssetId || !transferTo) {
      showNotification("error", "Vui lòng điền đầy đủ thông tin!");
      return;
    }
    try {
      const tx = await contract.transferAsset(transferAssetId, transferTo);
      showNotification("success", "Đang xử lý giao dịch...");
      await tx.wait();
      showNotification("success", "Chuyển nhượng tài sản thành công!");
      setTransferAssetId("");
      setTransferTo("");
      if (account) await loadUserData(contract, account);
    } catch (error: any) {
      showNotification("error", `Lỗi: ${error.message}`);
    }
  };

  const handleViewHistory = async () => {
    if (!contract || !account) {
      showNotification("error", "Vui lòng kết nối ví trước!");
      return;
    }
    if (!historyAssetId) {
      showNotification("error", "Vui lòng chọn tài sản!");
      return;
    }

    const normalizedAccount = normalizeAddress(account);
    const ownedAsset = myAssets.find((asset) => String(asset.assetId) === String(historyAssetId));
    if (!ownedAsset || !normalizedAccount) {
      showNotification("error", "Bạn chỉ có thể xem lịch sử giao dịch của tài sản thuộc sở hữu của mình.");
      return;
    }

    try {
      setIsHistoryLoading(true);
      const history = await contract.getAssetHistory(historyAssetId);
      const formattedHistory = history.map((record: any) => ({
        assetId: Number(record.assetId),
        from: record.from,
        to: record.to,
        timestamp: Number(record.timestamp) * 1000,
        transactionType: record.transactionType,
      }));
      setAssetHistory(formattedHistory);
      setHasHistorySearched(true);
    } catch (error: any) {
      showNotification("error", `Lỗi: ${error.message}`);
      setAssetHistory([]);
      setHasHistorySearched(true);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const refreshOverview = () => {
    if (contract && account) {
      loadUserData(contract, account);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header account={account} isConnected={!!account} onConnect={connectWallet} onDisconnect={disconnectWallet} />
      <Notification show={notification.show} type={notification.type} message={notification.message} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "home"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "user"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Quản lý User
            </button>
            <button
              onClick={() => setActiveTab("asset")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "asset"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Quản lý Tài sản
            </button>
            <button
              onClick={() => setActiveTab("transfer")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "transfer"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Chuyển nhượng
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Lịch sử
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === "home" && (
            <Overview
              userInfo={userInfo}
              myAssets={myAssets}
              account={account}
              formatAddress={formatAddress}
              formatDate={formatDate}
              isLoading={isOverviewLoading}
              onRefresh={refreshOverview}
            />
          )}
          {activeTab === "user" && (
            <UserManagement
              userInfo={userInfo}
              userName={userName}
              userEmail={userEmail}
              setUserName={setUserName}
              setUserEmail={setUserEmail}
              handleRegisterUser={handleRegisterUser}
              handleUpdateProfile={handleUpdateProfile}
              formatAddress={formatAddress}
              formatDate={formatDate}
            />
          )}
          {activeTab === "asset" && (
            <AssetManagement
              assetName={assetName}
              assetDesc={assetDesc}
              setAssetName={setAssetName}
              setAssetDesc={setAssetDesc}
              handleRegisterAsset={handleRegisterAsset}
              handleViewAsset={handleViewAsset}
              assetDetails={assetDetails}
              myAssets={myAssets}
              account={account}
              formatAddress={formatAddress}
              formatDate={formatDate}
              viewAssetId={viewAssetId}
              setViewAssetId={setViewAssetId}
            />
          )}
          {activeTab === "transfer" && (
            <TransferAsset
              transferAssetId={transferAssetId}
              transferTo={transferTo}
              setTransferAssetId={setTransferAssetId}
              setTransferTo={setTransferTo}
              handleTransferAsset={handleTransferAsset}
              myAssets={myAssets}
              account={account}
            />
          )}
          {activeTab === "history" && (
            <AssetHistory
              historyAssetId={historyAssetId}
              setHistoryAssetId={setHistoryAssetId}
              handleViewHistory={handleViewHistory}
              assetHistory={assetHistory}
              recentHistory={recentHistory}
              isHistoryLoading={isHistoryLoading}
              isRecentHistoryLoading={isRecentHistoryLoading}
              hasHistorySearched={hasHistorySearched}
              formatAddress={formatAddress}
              formatDate={formatDate}
              myAssets={myAssets}
              account={account}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

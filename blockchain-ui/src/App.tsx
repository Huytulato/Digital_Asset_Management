import React, { useState, useEffect } from "react";
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
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [notification, setNotification] = useState({ show: false, type: "success" as "success" | "error", message: "" });

  // User state
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Asset state
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [assetName, setAssetName] = useState("");
  const [assetDesc, setAssetDesc] = useState("");
  const [assetDetails, setAssetDetails] = useState<any>(null);

  // Transfer state
  const [transferAssetId, setTransferAssetId] = useState("");
  const [transferTo, setTransferTo] = useState("");

  // History state
  const [historyAssetId, setHistoryAssetId] = useState("");
  const [assetHistory, setAssetHistory] = useState<any[]>([]);

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

        setProvider(provider);
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
    setProvider(null);
    setUserInfo(null);
    setMyAssets([]);
    showNotification("success", "Đã ngắt kết nối ví");
  };

  const loadUserData = async (contractInstance: any, userAddress: string) => {
    try {
      // Load user info
      const userData = await contractInstance.getUser(userAddress);
      if (userData && userData[4]) { // isRegistered flag
        setUserInfo({
          walletAddress: userData[0],
          name: userData[1],
          email: userData[2],
          registeredAt: Number(userData[3]) * 1000, // Convert to milliseconds
        });
        setUserName(userData[1]);
        setUserEmail(userData[2]);
      }

      // Load user assets
      const assetIds = await contractInstance.getAssetsByOwner(userAddress);
      const assets = [];
      for (let i = 0; i < assetIds.length; i++) {
        const assetData = await contractInstance.getAsset(assetIds[i]);
        assets.push({
          assetId: Number(assetIds[i]),
          name: assetData[1],
          description: assetData[2],
          owner: assetData[3],
          createdAt: Number(assetData[4]) * 1000,
        });
      }
      setMyAssets(assets);
    } catch (error: any) {
      console.error("Error loading user data:", error);
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
    if (!contract) {
      showNotification("error", "Vui lòng kết nối ví trước!");
      return;
    }
    if (!id) {
      showNotification("error", "Vui lòng nhập ID tài sản!");
      return;
    }
    try {
      const assetData = await contract.getAsset(id);
      setAssetDetails({
        assetId: Number(assetData[0]),
        name: assetData[1],
        description: assetData[2],
        owner: assetData[3],
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
    if (!contract) {
      showNotification("error", "Vui lòng kết nối ví trước!");
      return;
    }
    if (!historyAssetId) {
      showNotification("error", "Vui lòng nhập ID tài sản!");
      return;
    }
    try {
      const history = await contract.getAssetHistory(historyAssetId);
      const formattedHistory = history.map((record: any) => ({
        assetId: Number(record.assetId),
        from: record.from,
        to: record.to,
        timestamp: Number(record.timestamp) * 1000,
        transactionType: record.transactionType,
      }));
      setAssetHistory(formattedHistory);
    } catch (error: any) {
      showNotification("error", `Lỗi: ${error.message}`);
      setAssetHistory([]);
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
              formatAddress={formatAddress}
              formatDate={formatDate}
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

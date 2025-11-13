import React from "react";
import { Wallet, FileText } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  account: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({ isConnected, account, onConnect, onDisconnect }: HeaderProps) {
  return (
    <div className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Blockchain Asset Management</h1>
            <p className="text-sm text-gray-500">Quản lý tài sản số an toàn & minh bạch</p>
          </div>
        </div>

        {!isConnected ? (
          <button onClick={onConnect} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg">
            <Wallet className="w-5 h-5" />
            <span>Kết nối ví</span>
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 px-4 py-2 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Đã kết nối</p>
              <p className="text-sm font-mono text-green-800">{account.slice(0, 6)}...{account.slice(-4)}</p>
            </div>
            <button onClick={onDisconnect} className="text-red-600 font-medium hover:text-red-700">Ngắt kết nối</button>
          </div>
        )}
      </div>
    </div>
  );
}

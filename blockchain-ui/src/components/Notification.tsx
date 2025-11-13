import { CheckCircle, AlertCircle } from "lucide-react";

interface NotificationProps {
  show: boolean;
  type: "success" | "error";
  message: string;
}

export default function Notification({ show, type, message }: NotificationProps) {
  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <div className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg text-white ${
        type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
      }`}>
        {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

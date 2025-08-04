import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface NotificationProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-50 dark:bg-green-500/10"
      : "bg-red-50 dark:bg-red-500/10";
  const borderColor =
    type === "success"
      ? "border-green-400 dark:border-green-500/50"
      : "border-red-400 dark:border-red-500/50";
  const textColor =
    type === "success"
      ? "text-green-700 dark:text-green-200"
      : "text-red-700 dark:text-red-200";
  const iconColor =
    type === "success"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full ${bgColor} border-l-4 ${borderColor} shadow-lg rounded-lg p-4 animate-slide-up backdrop-blur-sm`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className={`inline-flex ${textColor} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${
              type === "success" ? "green" : "red"
            }-500 dark:focus:ring-offset-slate-900`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;

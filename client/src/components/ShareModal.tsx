import {
  XMarkIcon,
  ClipboardIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string;
  isSharing: boolean;
  onShareAll?: () => void;
  onShareSelected?: () => void;
  showOptions?: boolean;
}

export default function ShareModal({
  isOpen,
  onClose,
  shareLink,
  isSharing,
  onShareAll,
  onShareSelected,
  showOptions = false,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-20 right-6 bg-white rounded-xl shadow-xl border z-50 w-96 p-6 transform transition-all duration-200 ease-out">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {showOptions
              ? "Share Your Brain"
              : isSharing
              ? "Brain Shared!"
              : "Sharing Disabled"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {showOptions && !isSharing ? (
            <>
              <p className="text-sm text-gray-600">
                Choose what you'd like to share:
              </p>
              <div className="space-y-3">
                <button
                  onClick={onShareAll}
                  className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    🌐
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Share Everything
                    </h4>
                    <p className="text-sm text-gray-500">
                      Share all your content publicly
                    </p>
                  </div>
                </button>
                <button
                  onClick={onShareSelected}
                  className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    ✅
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Share Selected Only
                    </h4>
                    <p className="text-sm text-gray-500">
                      Share only items marked as public
                    </p>
                  </div>
                </button>
              </div>
            </>
          ) : isSharing ? (
            <>
              <p className="text-sm text-gray-600">
                Your brain is now publicly accessible. Anyone with this link can
                view your shared content.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> You can disable sharing anytime by
                  clicking the "Brain Active" button again.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Your brain is now private and cannot be accessed by others.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  🔒 Your content is now private and secure.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

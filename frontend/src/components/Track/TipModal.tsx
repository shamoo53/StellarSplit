import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export function TipModal({ isOpen, onClose, onConfirm }: TipModalProps) {
  const [amount, setAmount] = useState<string>("");
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tip-title">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <button ref={closeBtnRef} onClick={onClose} aria-label="Close tip modal" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={22} />
        </button>
        <h2 id="tip-title" className="text-xl font-bold text-gray-900 mb-4">Send a Tip</h2>
        <div className="space-y-3">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex gap-2">
            {[1, 2, 5].map((v) => (
              <button key={v} type="button" onClick={() => setAmount(String(v))} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm">
                ${v.toFixed(2)}
              </button>
            ))}
          </div>
          <button
            data-testid="confirm-tip"
            onClick={() => onConfirm(parseFloat(amount || "0"))}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-purple-200 transition-colors"
          >
            Send Tip
          </button>
        </div>
      </div>
    </div>
  );
}
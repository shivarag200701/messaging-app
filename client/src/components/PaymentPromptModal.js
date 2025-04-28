import React, { useState } from "react";

function PaymentPromptModal({ onSend, onClose }) {
  const [amount, setAmount] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80 animate-fade-in">
        <h2 className="text-lg font-bold mb-4 text-center text-blue-600 dark:text-blue-400">
          Send Payment 💸
        </h2>
        <input
          type="number"
          min="1"
          placeholder="Enter amount ($)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 mb-4 focus:outline-none dark:bg-gray-700 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const amt = parseFloat(amount);
              if (!isNaN(amt) && amt > 0) {
                onSend(amt);
              }
            }}
            className="px-4 py-2 text-sm rounded bg-green-500 hover:bg-green-600 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPromptModal;
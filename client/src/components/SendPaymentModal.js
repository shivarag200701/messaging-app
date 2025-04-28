// src/components/SendPaymentModal.js
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";

function SendPaymentModal({ clientSecret, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      console.error(error);
      toast.error(error.message || "Payment failed!");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Payment successful! 🎉");
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-center">Send Payment</h2>
        <CardElement className="border p-3 rounded dark:bg-gray-700" />
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SendPaymentModal;
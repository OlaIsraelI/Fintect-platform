"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function DepositDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reference = params.reference as string;

  const [deposit, setDeposit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (reference) {
      fetchDeposit();
    }
  }, [reference]);

  const fetchDeposit = async () => {
    try {
      const response = await fetch(`/api/deposit/${reference}`);
      const data = await response.json();
      if (response.ok) {
        setDeposit(data.deposit);
      } else {
        toast.error(data.error || "Failed to fetch deposit");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const response = await fetch(`/api/deposit/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Deposit confirmed!");
        fetchDeposit();
      } else {
        toast.error(data.error || "Failed to confirm deposit");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Loading...
      </div>
    );
  }

  if (!deposit) {
    return <div className="text-center py-12">Deposit not found</div>;
  }

  const isPending = deposit.status === "pending";
  const isCompleted = deposit.status === "completed";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Deposit Details</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Reference</p>
            <p className="font-mono text-sm">{deposit.reference}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              deposit.status === "completed"
                ? "bg-green-100 text-green-800"
                : deposit.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {deposit.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-xl font-bold">
              ₦{Number(deposit.amount).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Method</p>
            <p className="capitalize">
              {deposit.paymentMethod.replace("_", " ")}
            </p>
          </div>
        </div>

        {deposit.bankName && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              Bank Transfer Details
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="font-medium">Bank:</span> {deposit.bankName}
              </p>
              <p>
                <span className="font-medium">Account Number:</span>{" "}
                {deposit.accountNumber}
              </p>
              <p>
                <span className="font-medium">Account Name:</span>{" "}
                {deposit.accountName}
              </p>
            </div>
          </div>
        )}

        {isPending && (
          <div className="mt-6">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {confirming ? "Confirming..." : "Mark as Paid (Admin)"}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              * This is a demo confirmation. In production, this would be done
              via payment gateway webhook.
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">
              ✅ Deposit completed on{" "}
              {new Date(deposit.completedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={() => router.push("/dashboard/wallet")}
        className="text-blue-600 hover:text-blue-500"
      >
        ← Back to Wallet
      </button>
    </div>
  );
}

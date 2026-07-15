"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Copy,
  Check,
} from "lucide-react";

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [accountNumber, setAccountNumber] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch("/api/wallet/balance"),
        fetch("/api/wallet/transactions"),
      ]);

      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();

      if (balanceRes.ok) {
        setBalance(balanceData.balance || 0);
        setAccountNumber(balanceData.accountNumber || "");
      }

      if (transactionsRes.ok) {
        setTransactions(transactionsData.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyAccountNumber = () => {
    if (accountNumber) {
      navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 mb-6 text-white">
        <p className="text-sm font-medium text-blue-200">Available Balance</p>
        <p className="text-4xl font-bold mt-2">{formatCurrency(balance)}</p>
        <p className="text-sm text-blue-200 mt-1">NGN</p>

        <div className="mt-6 flex items-center space-x-2">
          <p className="text-sm text-blue-200">
            Account: {accountNumber || "N/A"}
          </p>
          {accountNumber && (
            <button
              onClick={copyAccountNumber}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-300" />
              ) : (
                <Copy className="h-4 w-4 text-blue-200" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => router.push("/dashboard/transfer")}
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <ArrowUpRight className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Send</span>
        </button>

        <button
          onClick={() => alert("Deposit feature coming soon!")}
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <ArrowDownLeft className="h-6 w-6 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Deposit</span>
        </button>

        <button
          onClick={() => alert("Withdrawal feature coming soon!")}
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
            <WalletIcon className="h-6 w-6 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Withdraw</span>
        </button>

        <button
          onClick={() => router.push("/dashboard/transactions")}
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
            <History className="h-6 w-6 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">History</span>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Transactions
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <WalletIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>No transactions yet</p>
            <p className="text-sm">Start sending or receiving money</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "transfer"
                          ? "bg-blue-100"
                          : tx.type === "deposit"
                            ? "bg-green-100"
                            : "bg-orange-100"
                      }`}
                    >
                      {tx.type === "transfer" ? (
                        <ArrowUpRight className={`h-5 w-5 text-blue-600`} />
                      ) : tx.type === "deposit" ? (
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                      ) : (
                        <WalletIcon className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {tx.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tx.description || tx.reference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        tx.type === "deposit"
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      {tx.type === "deposit" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        tx.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : tx.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {transactions.length > 5 && (
          <div className="p-4 text-center border-t border-gray-200">
            <button
              onClick={() => router.push("/dashboard/transactions")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

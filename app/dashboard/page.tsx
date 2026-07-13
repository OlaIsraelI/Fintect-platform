"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [accountNumber, setAccountNumber] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState({
    receiverAccountNumber: "",
    amount: "",
    description: "",
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setAccountNumber(parsedUser.wallet?.accountNumber || "");
    fetchBalance();
    fetchTransactions();
  }, [router]);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/wallet/balance");
      const data = await response.json();
      if (response.ok) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/wallet/transactions");
      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");
    setTransferLoading(true);

    try {
      const response = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverAccountNumber: transferData.receiverAccountNumber,
          amount: parseFloat(transferData.amount),
          description: transferData.description || "Transfer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transfer failed");
      }

      setTransferSuccess("Transfer successful!");
      setBalance(data.data.newBalance);
      setTransferData({
        receiverAccountNumber: "",
        amount: "",
        description: "",
      });
      fetchTransactions();
    } catch (err: any) {
      setTransferError(err.message);
    } finally {
      setTransferLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">FinTech Platform</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.firstName} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Balance</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₦{balance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Account: {accountNumber}
            </p>
          </div>

          {/* Send Money Form */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Send Money
            </h3>

            {transferError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                {transferError}
              </div>
            )}

            {transferSuccess && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">
                {transferSuccess}
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Receiver Account Number
                </label>
                <input
                  type="text"
                  required
                  value={transferData.receiverAccountNumber}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      receiverAccountNumber: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={transferData.amount}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      amount: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={transferData.description}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Transfer description"
                />
              </div>
              <button
                type="submit"
                disabled={transferLoading}
                className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {transferLoading ? "Processing..." : "Send Money"}
              </button>
            </form>
          </div>
        </div>

        {/* Transactions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tx.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : tx.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

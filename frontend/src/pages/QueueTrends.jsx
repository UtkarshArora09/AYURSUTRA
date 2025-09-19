import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const mockQueueData = {
  tokenNumber: "Q-20230915-001",
  patientName: "John Doe",
  hospitalName: "Ayurveda Healing Center - Mumbai",
  doctorName: "Dr. Priya Sharma",
  visitPurpose: "General Consultation",
  currentPosition: 5,
  totalInQueue: 20,
  estimatedWaitTime: 40, // minutes
  status: "waiting", // waiting, called, served, cancelled
};

export default function QueueTrends() {
  const [tokenId, setTokenId] = useState("");
  const [queueInfo, setQueueInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setQueueInfo(null);
    setError("");

    if (!tokenId.trim()) {
      setError("Please enter your token ID");
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (tokenId.toUpperCase() === mockQueueData.tokenNumber) {
        setQueueInfo(mockQueueData);
      } else {
        setError("Token ID not found");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />
      <main className="flex-grow overflow-auto pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-3xl font-bold text-center text-green-900 mb-6">
              Check Your Queue Status
            </h1>
            <form onSubmit={handleSearch} className="mb-4">
              <label
                htmlFor="tokenId"
                className="block text-sm font-medium text-green-700 mb-2"
              >
                Enter Token ID
              </label>
              <input
                id="tokenId"
                type="text"
                placeholder="e.g., Q-20230915-001"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value.toUpperCase())}
                required
                className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-md hover:from-green-700 hover:to-emerald-700 transition-colors"
              >
                {loading ? "Checking..." : "Check Status"}
              </button>
            </form>

            {error && (
              <p className="text-center text-red-600 font-semibold mb-4">
                {error}
              </p>
            )}

            {queueInfo && (
              <div className="border border-green-300 rounded-md p-4 bg-green-50 text-green-900">
                <h2 className="text-xl font-semibold mb-3">Queue Details</h2>
                <p>
                  <strong>Name:</strong> {queueInfo.patientName}
                </p>
                <p>
                  <strong>Token:</strong> {queueInfo.tokenNumber}
                </p>
                <p>
                  <strong>Hospital:</strong> {queueInfo.hospitalName}
                </p>
                <p>
                  <strong>Doctor:</strong> {queueInfo.doctorName}
                </p>
                <p>
                  <strong>Purpose:</strong> {queueInfo.visitPurpose}
                </p>
                <p>
                  <strong>Current Position:</strong> {queueInfo.currentPosition}{" "}
                  / {queueInfo.totalInQueue}
                </p>
                <p>
                  <strong>Estimated Wait Time:</strong>{" "}
                  {queueInfo.estimatedWaitTime} minutes
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      queueInfo.status === "waiting"
                        ? "text-yellow-600"
                        : queueInfo.status === "called"
                        ? "text-green-600"
                        : queueInfo.status === "served"
                        ? "text-gray-600"
                        : "text-red-600"
                    }`}
                  >
                    {queueInfo.status.charAt(0).toUpperCase() +
                      queueInfo.status.slice(1)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

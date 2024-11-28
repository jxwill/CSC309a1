import { useRouter } from "next/router";
import { useState } from "react";

const ReportPage = () => {
  const router = useRouter();
  const { contentId, contentType, userId } = router.query; // Retrieve from query parameters

  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contentId || !contentType || !reason || !userId) {
      setErrorMessage("Missing required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/reports/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          contentType,
          reason,
          additionalInfo,
          userId,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Report submitted successfully!");
        setReason("");
        setAdditionalInfo("");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to submit report.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-6 px-4 sm:px-8">
        {/* Navigation Bar */}
      <nav className="w-full p-4 bg-indigo-600 text-white shadow-lg fixed top-0 z-10">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <button
            onClick={() => router.push("/in-site")}
            className="text-2xl font-bold hover:text-yellow-300 transition"
          >
            Scriptorium
          </button>
          </div>
      </nav>
      
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">Submit a Report</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg"
      >
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-600 rounded">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-600 rounded">
            {successMessage}
          </div>
        )}

        {/* Content Information (Read-Only) */}
        <div className="mb-4">
          <p className="font-medium text-gray-700">
            <strong>Content ID:</strong> {contentId}
          </p>
          <p className="font-medium text-gray-700">
            <strong>Content Type:</strong> {contentType}
          </p>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label htmlFor="reason" className="block font-medium text-gray-700">
            Reason <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for reporting"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Additional Information */}
        <div className="mb-4">
          <label
            htmlFor="additionalInfo"
            className="block font-medium text-gray-700"
          >
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Provide any additional information"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportPage;

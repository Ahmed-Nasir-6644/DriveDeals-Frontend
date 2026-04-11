export default function VerifyFailed() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
      <h1 className="text-4xl font-bold text-red-600">❌ Verification Failed</h1>
      <p className="mt-4 text-lg text-gray-700">
        The verification link is invalid or has expired. Please sign up again.
      </p>
      <a
        href="/signup"
        className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700"
      >
        Go to Signup
      </a>
    </div>
  );
}

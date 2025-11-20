import { Metadata } from "next";
import { SignInButton } from "@/components/auth/SignInButton";

export const metadata: Metadata = {
  title: "Sign In - Travelkon",
  description: "Sign in to manage your travel expenses and plans",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-4 shadow-lg">
              <svg
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome to Travelkon
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Collaborative travel expense management and planning
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  Get Started
                </h2>
                <p className="text-sm text-gray-600">
                  Sign in with your Google account to start planning your trips
                  and managing expenses.
                </p>
              </div>

              <SignInButton />

              <div className="pt-4 text-center text-xs text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy
                Policy.
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl bg-gray-50 p-6">
            <h3 className="font-medium text-gray-900">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg
                  className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Split expenses with friends
              </li>
              <li className="flex items-start">
                <svg
                  className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Plan activities with timeline
              </li>
              <li className="flex items-start">
                <svg
                  className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Share photos and memories
              </li>
              <li className="flex items-start">
                <svg
                  className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Track settlements and balances
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

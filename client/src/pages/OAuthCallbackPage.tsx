import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const OAuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token from URL parameters
        const token = searchParams.get("token");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setStatus("error");
          return;
        }

        if (!token) {
          setError("No authentication token received");
          setStatus("error");
          return;
        }

        // Store token and update auth context
        await loginWithToken(token);

        setStatus("success");

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("OAuth callback error:", err);
        }
        setError("Authentication failed. Please try again.");
        setStatus("error");
      }
    };

    handleOAuthCallback();
  }, [searchParams, loginWithToken, navigate]);

  const handleRetry = () => {
    navigate("/login");
  };

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        <div className="w-full max-w-md">
          <div
            className="rounded-lg border p-8 text-center"
            style={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
            }}
          >
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: "hsl(var(--primary))" }}
            ></div>
            <p style={{ color: "hsl(var(--muted-foreground))" }}>
              Completing authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4"
              style={{ backgroundColor: "hsl(var(--primary))" }}
            >
              <svg
                className="h-8 w-8"
                style={{ color: "hsl(var(--primary-foreground))" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Authentication Successful!
            </h1>
            <p
              className="text-base"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Redirecting to your dashboard...
            </p>
          </div>

          <div
            className="rounded-lg border p-6 text-center"
            style={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
            }}
          >
            <div className="animate-pulse">
              <div
                className="h-2 rounded-full mx-auto mb-2"
                style={{ backgroundColor: "hsl(var(--primary))", width: "60%" }}
              ></div>
              <p
                className="text-sm"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Setting up your workspace...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4"
            style={{ backgroundColor: "hsl(var(--destructive))" }}
          >
            <svg
              className="h-8 w-8"
              style={{ color: "hsl(var(--destructive-foreground))" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "hsl(var(--destructive))" }}
          >
            Authentication Failed
          </h1>
          <p
            className="text-base"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {error}
          </p>
        </div>

        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
          }}
        >
          <button
            onClick={handleRetry}
            className="w-full py-3 px-4 rounded-md font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;

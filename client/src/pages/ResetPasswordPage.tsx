import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false);
        return;
      }

      try {
        await api.get(`/verify-reset-token/${token}`);
        setIsValidToken(true);
      } catch {
        setIsValidToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/reset-password", { token, password });
      toast.success("Password reset successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
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
              Verifying reset token...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
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
              Invalid Reset Link
            </h1>
            <p
              className="text-base"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              This password reset link is invalid or has expired
            </p>
          </div>

          <div
            className="rounded-lg border p-6 space-y-4"
            style={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
            }}
          >
            <p
              className="text-sm text-center"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Password reset links expire after 1 hour for security reasons.
            </p>
            <Link to="/forgot-password">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm hover:underline transition-colors"
                style={{ color: "hsl(var(--primary))" }}
              >
                Back to Login
              </Link>
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
                d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0a2 2 0 00-2 2m2-2a2 2 0 012 2m0 0V9a2 2 0 012-2m-2 2a2 2 0 002 2"
              />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Set New Password
          </h1>
          <p
            className="text-base"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Enter your new password below
          </p>
        </div>

        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block mb-2 font-medium"
                style={{ color: "hsl(var(--foreground))" }}
              >
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-medium"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Reset Password
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm hover:underline transition-colors"
                style={{ color: "hsl(var(--primary))" }}
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

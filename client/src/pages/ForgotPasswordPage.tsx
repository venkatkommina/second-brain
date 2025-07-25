import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/forgot-password", { email });
      setIsSubmitted(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to send reset email";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Check Your Email
            </h1>
            <p
              className="text-base"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              We've sent a password reset link to <strong>{email}</strong>
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
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full"
            >
              Send Another Email
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
            Reset Password
          </h1>
          <p
            className="text-base"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Enter your email address and we'll send you a link to reset your
            password
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
                htmlFor="email"
                className="block mb-2 font-medium"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Send Reset Link
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

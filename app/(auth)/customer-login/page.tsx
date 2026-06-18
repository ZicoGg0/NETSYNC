"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

type Step = "phone" | "otp";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), role: "CUSTOMER" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      if (data.data?.devOtp) {
        setDevOtp(data.data.devOtp);
      }

      toast.success("OTP sent to your phone!");
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);

      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code, role: "CUSTOMER" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      toast.success("Welcome to Netsync!");
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Net<span className="text-brand-500">sync</span>
          </Link>
          <p className="mt-2 text-surface-400">
            {step === "phone"
              ? "Enter your phone number to get started"
              : "Enter the verification code sent to your phone"}
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {devOtp && (
            <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
              Dev mode OTP: <strong>{devOtp}</strong>
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp}>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium text-surface-300"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="input-field mb-1"
                placeholder="08012345678 or +2348012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
              />
              <p className="mb-4 text-xs text-surface-500">
                Nigerian phone numbers only (+234 or 0 prefix)
              </p>
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="btn-primary w-full"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <label className="mb-3 block text-sm font-medium text-surface-300">
                Verification Code
              </label>
              <div className="mb-4 flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="input-field h-12 w-12 text-center text-lg font-semibold"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="btn-primary mb-3 w-full"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp(["", "", "", "", "", ""]);
                  setError("");
                  setDevOtp("");
                }}
                className="w-full text-center text-sm text-surface-400 hover:text-white"
              >
                Use a different number
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-surface-500">
          Are you a delivery provider?{" "}
          <Link
            href="/provider-login"
            className="text-brand-400 hover:text-brand-300"
          >
            Provider Login
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import logo from "../assets/logo.png"
import { useAuth } from "../context/AuthContext";
import { FaTimes, FaSpinner } from "react-icons/fa";

const ForgotPasswordModal = memo(function ForgotPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!forgotEmail.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setRequestLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/request-password-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to request OTP");
      }

      setSuccess("OTP sent to your email");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request OTP");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleVerifyOtpAndPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!forgotOtp || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setRequestLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp-and-change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to change password");
      }

      setSuccess("Password changed successfully");
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleClose = () => {
    setStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.forgotModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Reset Password</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <FaTimes size={20} />
          </button>
        </div>

        {success && <div className={styles.successMessage}>{success}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className={styles.modalForm}>
            <p className={styles.stepInfo}>
              Enter your email address to receive an OTP
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="forgotEmail">Email</label>
              <input
                type="email"
                id="forgotEmail"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={requestLoading}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleClose}
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={requestLoading}
              >
                {requestLoading ? (
                  <>
                    <FaSpinner className={styles.spinner} /> Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtpAndPassword} className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label htmlFor="forgotOtp">OTP Code</label>
              <input
                type="text"
                id="forgotOtp"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                disabled={requestLoading}
              />
              <small className={styles.otpHint}>
                Check your email for the OTP (expires in 5 minutes)
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="resetPassword">New Password</label>
              <input
                type="password"
                id="resetPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={requestLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="resetConfirmPassword">Confirm Password</label>
              <input
                type="password"
                id="resetConfirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={requestLoading}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setStep("email")}
                disabled={requestLoading}
              >
                Back
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={requestLoading}
              >
                {requestLoading ? (
                  <>
                    <FaSpinner className={styles.spinner} /> Updating...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"login" | "otp">("login");
  const [tempToken, setTempToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { setEmail: setAuthEmail } = useAuth();
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Step 1: Login with email + password
  const handleLoginSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login-step1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setTempToken(data.tempToken);
        setStep("otp");
      } else {
        alert(data.message ?? "Login failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
      else alert("Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login-step2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.accessToken);
        setAuthEmail(email);
        alert("Login successful");
        navigate("/"); // redirect to home page
      } else {
        alert(data.message || "OTP validation failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
      else alert("Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardContent}>
          {/* Left: Logo */}
          <div className={styles.logoWrapper}>
            <img src={logo} alt="DriveDeals" className={styles.logo} />
          </div>

          {/* Right: Form */}
          <div className={styles.formWrapper}>
            <h2 className={styles.title}>Login</h2>

            {step === "login" ? (
              <form onSubmit={handleLoginSetup} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button type="submit" className={styles.loginBtn} disabled={loading}>
                  {loading ? "Processing..." : "Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpStep} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="otp">An OTP has been sent to {email}</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                </div>

                <button type="submit" className={styles.loginBtn} disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}

            <p className={styles.signupText}>
              New to DriveDeals? <a href="/signup">Sign Up</a>
            {step === "login" && (
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
              >
                Forgot Password?
              </button>
            )}
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default Login;

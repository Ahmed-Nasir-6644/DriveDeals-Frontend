"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css"; // can reuse the same CSS
import logo from "../assets/logo.png"

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFName] = useState("");
  const [lastName, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegisterSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("A verification link has been sent to your email.");
        navigate("/login");
      } else {
        alert(data.message ?? "Registration failed");
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
            <h2 className={styles.title}>Sign Up</h2>

            <form className={styles.form} onSubmit={handleRegisterSetup}>
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFName(e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLName(e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

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

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </div>

              <button type="submit" className={styles.loginBtn} disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className={styles.signupText}>
              Already registered? <a href="/login">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

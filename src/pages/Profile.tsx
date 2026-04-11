"use client";

import { useState, useEffect, memo } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Profile.module.css";
import { FaLock, FaSpinner, FaPlus, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
}

const ChangePasswordModal = memo(function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  email,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, otp: string, newPassword: string) => Promise<void>;
  loading: boolean;
  email?: string | null;
}) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email not available");
      return;
    }

    try {
      setRequestLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/request-password-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to request OTP");
      }

      setStep("verify");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request OTP");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleVerifyAndChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || !newPassword || !confirmPassword) {
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
      await onSubmit(email || "", otp, newPassword);
      // Reset form on success
      setStep("request");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Change Password</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequestOtp} className={styles.modalForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <p className={styles.stepInfo}>
              An OTP will be sent to your email address.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
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
                  "Request OTP"
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndChangePassword} className={styles.modalForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="otp">OTP Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                disabled={loading}
              />
              <small className={styles.otpHint}>Check your email for the OTP (expires in 5 minutes)</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setStep("request")}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className={styles.spinner} /> Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

const ProfilePage = memo(function ProfilePage() {
  const { email } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [updateNameLoading, setUpdateNameLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setError("User not logged in. Please login first.");
      setLoading(false);
      return;
    }
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user-profile/get`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile({
          id: 1,
          first_name: data.firstName || "",
          last_name: data.lastName || "",
          email: data.email || email,
          profile_image: data.profilePicture || undefined,
        });
        setError("");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageLoading(true);
      setMessage("");
      setError("");

      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append("email", email || "");
      formData.append("file", file);
      
      // Call API to update profile picture with file upload
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user-profile/update-picture`, {
        method: "POST",
        body: formData,
        // Do not set Content-Type header; browser will set it automatically with boundary
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to upload image");
      }

      // Get the updated profile with Cloudinary URL from response
      const updatedProfile = await res.json();
      setProfile((prev) => prev ? {
        ...prev,
        profile_image: updatedProfile.profilePicture || updatedProfile.profile_image,
      } : null);
      setMessage("Profile image updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setImageLoading(false);
    }
  };

  const handleChangePassword = async (
    userEmail: string,
    otp: string,
    newPassword: string
  ) => {
    try {
      setPasswordLoading(true);
      setError("");
      setMessage("");

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp-and-change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          otp,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to change password");
      }

      setMessage("Password changed successfully");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim()) {
      setError("First and last names are required");
      return;
    }

    try {
      setUpdateNameLoading(true);
      setMessage("");
      setError("");

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update name");
      }

      // Update profile with new names
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              first_name: editFirstName.trim(),
              last_name: editLastName.trim(),
            }
          : null
      );

      setMessage("Name updated successfully");
      setIsEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setUpdateNameLoading(false);
    }
  };

  const handleEnterEditMode = () => {
    if (profile) {
      setEditFirstName(profile.first_name);
      setEditLastName(profile.last_name);
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFirstName("");
    setEditLastName("");
    setError("");
  };

  if (loading) {
    return <div className={styles.container}><p className={styles.loading}>Loading profile...</p></div>;
  }

  if (!profile) {
    return <div className={styles.container}><p className={styles.error}>Failed to load profile. Please try again.</p></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        {/* Header */}
        <div className={styles.header}>
          <h1>My Profile</h1>
        </div>

        {/* Messages */}
        {message && <div className={styles.successMessage}>{message}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Profile Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt="Profile"
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.placeholderImage}>
                <span>{profile.first_name.charAt(0)}{profile.last_name.charAt(0)}</span>
              </div>
            )}
            <label className={styles.uploadLabel} htmlFor="imageInput">
              <FaPlus size={18} />
            </label>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageLoading}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* User Info */}
        <div className={styles.infoSection}>
          {!isEditMode ? (
            <>
              <div className={styles.infoGroup}>
                <label>First Name</label>
                <p>{profile.first_name}</p>
              </div>

              <div className={styles.infoGroup}>
                <label>Last Name</label>
                <p>{profile.last_name}</p>
              </div>

              <div className={styles.infoGroup}>
                <label>Email</label>
                <p>{email || "Not available"}</p>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdateName}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  disabled={updateNameLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  disabled={updateNameLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <p>{email || "Not available"}</p>
              </div>

              <div className={styles.editActions}>
                <button
                  type="button"
                  className={styles.cancelEditBtn}
                  onClick={handleCancelEdit}
                  disabled={updateNameLoading}
                >
                  <FaTimes size={16} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={updateNameLoading}
                >
                  {updateNameLoading ? (
                    <>
                      <FaSpinner className={styles.spinner} /> Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {!isEditMode && (
            <button
              className={styles.editBtn}
              onClick={handleEnterEditMode}
            >
              <FaEdit size={16} />
              Edit Profile
            </button>
          )}
          <button
            className={styles.passwordBtn}
            onClick={() => setShowPasswordModal(true)}
          >
            <FaLock size={16} />
            Change Password
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
        loading={passwordLoading}
        email={email}
      />
    </div>
  );
});

export default ProfilePage;

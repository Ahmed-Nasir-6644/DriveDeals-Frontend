import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // react-router-dom
import styles from "../styles/MyAds.module.css"; // adjust path if needed
import { FaTimes, FaCar, FaGasPump, FaMapMarkerAlt, FaImages, FaCheckCircle, FaCoins } from "react-icons/fa";

// Enum placeholders
const FuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
const BodyTypes = ["Sedan", "SUV", "Crossover", "Hatchback", "Van", "Mini Van", "Coupe", "Car"];
const RegisteredIn = ["Lahore", "Punjab", "Sindh", "Islamabad", "KPK", "Balochistan", "Un-registered"];
const FeatureOptions = ["ABS","AM/FM Radio","Air Bags","Air Conditioning","Alloy Wheels","Immobilizer Key","Keyless Entry","Navigation System","Power Locks","Power Mirrors","Power Steering","Power Windows","Climate Control","Cruise Control","Front Camera","Speakers","Steering Switches","Sun Roof","Moon Roof","CoolBox"];
const Transmission = ["Manual", "Automatic"];

interface Ad {
  id: number;
  make: string;
  model: string;
  variant: string;
  color: string;
  engine_capacity: number;
  fuel_type: string;
  transmission: string;
  mileage: number;
  body_type: string;
  features: string[];
  images: string[];
  location: string;
  registered_in: string;
  model_year: number;
  description: string;
  price: number;
  created_at: Date;
  updated_at: Date;
  owner: { id: number; first_name: string; last_name: string };
}

export default function MyAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Ad | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [adCreationLoading, setAdCreationLoading] = useState(false);
  const [priceTarget, setPriceTarget] = useState<Ad | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");

  const [newAd, setNewAd] = useState({
    make: "",
    model: "",
    color: "",
    engine_capacity: 0,
    variant: "",
    fuel_type: FuelTypes[0],
    transmission: "",
    mileage: 0,
    body_type: BodyTypes[0],
    features: [] as string[],
    location: "",
    registered_in: RegisteredIn[0],
    model_year: new Date().getFullYear(),
    price: 0,
    description: "",
    files: [] as File[],
  });

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Fetch ads
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, skipping fetch");
      return;
    }
    fetch(`${import.meta.env.VITE_BACKEND_URL}/ads/get/adsByOwner`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch ads: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAds(data);
        } else {
          console.error("Unexpected response format:", data);
        }
      })
      .catch((err) => console.error("Error fetching ads:", err));
  }, []);

  const filteredAds = ads.filter((ad) => {
    const car = `${ad.make}${ad.model} ${ad.variant}`;
    return car.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setDeleteError("You must be logged in to delete an ad");
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError("");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ads/delete/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete ad");
      }

      setAds((prev) => prev.filter((ad) => ad.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete ad");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!priceTarget || newPrice <= 0) {
      setPriceError("Please enter a valid price");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      setPriceError("You must be logged in");
      return;
    }

    try {
      setPriceLoading(true);
      setPriceError("");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ads/update-price/${priceTarget.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ price: newPrice }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update price");
      }

      const updatedAd = await res.json();
      setAds((prev) => prev.map((ad) => (ad.id === updatedAd.id ? updatedAd : ad)));
      setPriceTarget(null);
      setNewPrice(0);
    } catch (err) {
      setPriceError(err instanceof Error ? err.message : "Failed to update price");
    } finally {
      setPriceLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to create an ad");

    setAdCreationLoading(true);
    try {
      const formData = new FormData();
      Object.entries(newAd).forEach(([key, value]) => {
        if (key !== "files") {
          // Ensure price is sent as a number
          if (key === "price" || key === "engine_capacity" || key === "mileage" || key === "model_year") {
            formData.append(key, String(Number(value)));
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      newAd.files.forEach((file) => formData.append("files", file));

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ads/post-ad`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error creating ad:", errorData);
        setAdCreationLoading(false);
        return;
      }

      const createdAd = await res.json();
      setAds((prev) => [...prev, createdAd]);
      setShowPopup(false);
      resetForm();
      setAdCreationLoading(false);
    } catch (err) {
      console.error(err);
      setAdCreationLoading(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setNewAd((prev) => ({
      ...prev,
      features: prev.features.includes(feature) ? prev.features.filter((f) => f !== feature) : [...prev.features, feature],
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Limit to 10 images maximum
      if (files.length > 10) {
        alert("Maximum 10 images allowed");
        return;
      }

      // Validate file sizes (max 5MB per image)
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const invalidFiles = files.filter(f => f.size > maxFileSize);
      
      if (invalidFiles.length > 0) {
        alert(`Some files exceed 5MB limit. Please compress your images.`);
        return;
      }

      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
      setNewAd((prev) => ({
        ...prev,
        files: files,
      }));
    }
  };

  const resetForm = () => {
    setNewAd({
      make: "",
      model: "",
      color: "",
      engine_capacity: 0,
      variant: "",
      fuel_type: FuelTypes[0],
      transmission: "",
      mileage: 0,
      body_type: BodyTypes[0],
      features: [],
      location: "",
      registered_in: RegisteredIn[0],
      model_year: new Date().getFullYear(),
      price: 0,
      description: "",
      files: [],
    });
    setImagePreviews([]);
    setCurrentStep(1);
  };

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>My Ads</h1>
        <p className={styles.subtitle}>Manage your posted ads</p>

        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Search by make, model..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {isLoggedIn && (
            <button
              className={styles.createButton}
              onClick={() => setShowPopup(true)}
            >
              ➕ Create Ad
            </button>
          )}
        </div>
      </section>

      <section className={styles.grid}>
        {filteredAds.length === 0 ? (
          <p className={styles.noAds}>No ads found.</p>
        ) : (
          filteredAds.map((ad) => (
            <div key={ad.id} className={styles.card}>
              <div className={styles.left}>
                <Link to = {`/ad/${ad.id}`} ><img
                  src={ad.images?.[0] || "/placeholder-car.png"}
                  alt={`${ad.make} ${ad.model}`}
                  className={styles.thumbnail}
                />
                </Link>
                <div className={styles.details}>
                  <h2>
                    {ad.make} {ad.model} {ad.variant} 
                  </h2>
                  <p className={styles.location}>📍 {ad.location} | {ad.model_year} | {ad.mileage} km</p>
                </div>
              </div>

              <div className={styles.right}>
                <p className={styles.price}>PKR {ad.price} lac</p>
                <Link to={`/ad/${ad.id}`} className={styles.viewButton}>
                  View Details
                </Link>
                <button
                  className={styles.changePriceButton}
                  onClick={() => {
                    setPriceTarget(ad);
                    setNewPrice(ad.price);
                    setPriceError("");
                  }}
                >
                  Change Price 💰
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => {
                    setDeleteTarget(ad);
                    setDeleteError("");
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {deleteTarget && (
        <div className={styles.deleteOverlay}>
          <div className={styles.deleteModal}>
            <h3>Delete this ad?</h3>
            <p>
              Are you sure you want to delete {deleteTarget.make} {deleteTarget.model} {deleteTarget.variant}?
            </p>
            {deleteError && <div className={styles.deleteError}>{deleteError}</div>}
            <div className={styles.deleteActions}>
              <button
                className={styles.cancelDeleteButton}
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {priceTarget && (
        <div className={styles.priceOverlay}>
          <div className={styles.priceModal}>
            <h3>Change Price for {priceTarget.make} {priceTarget.model}</h3>
            <p className={styles.priceInfo}>Current price: PKR {priceTarget.price} lac</p>
            <div className={styles.priceInputGroup}>
              <label>New Price (PKR Lacs) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 25.50"
                value={newPrice === 0 ? "" : newPrice}
                onChange={(e) => setNewPrice(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              />
            </div>
            {newPrice > 0 && (
              <div className={styles.priceDisplay}>
                <strong>₨ {(newPrice * 100000).toLocaleString()}</strong>
              </div>
            )}
            {priceError && <div className={styles.priceError}>{priceError}</div>}
            <div className={styles.priceActions}>
              <button
                className={styles.cancelPriceButton}
                onClick={() => setPriceTarget(null)}
                disabled={priceLoading}
              >
                Cancel
              </button>
              <button
                className={styles.confirmPriceButton}
                onClick={handleUpdatePrice}
                disabled={priceLoading}
              >
                {priceLoading ? "Updating..." : "Update Price"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Popup Form */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <button
              className={styles.closeButton}
              onClick={() => {
                setShowPopup(false);
                resetForm();
              }}
            >
              <FaTimes />
            </button>

            {/* Progress Indicator */}
            <div className={styles.progressContainer}>
              <h2 className={styles.popupTitle}>Create Your Ad</h2>
              <div className={styles.stepsIndicator}>
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className={`${styles.step} ${currentStep >= step ? styles.stepActive : ""}`}>
                    <div className={styles.stepNumber}>{step}</div>
                  </div>
                ))}
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                ></div>
              </div>
              <p className={styles.stepLabel}>Step {currentStep} of 5</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.stepsForm}>
              {/* STEP 1: Basic Info */}
              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeader}>
                    <FaCar className={styles.sectionIcon} />
                    <h3>Basic Information</h3>
                  </div>
                  <p className={styles.sectionDescription}>Tell us about your vehicle</p>

                  <div className={styles.formGroup}>
                    <label>Car Make *</label>
                    <input
                      type="text"
                      placeholder="e.g., Toyota, Honda, BMW"
                      value={newAd.make}
                      onChange={(e) => setNewAd({ ...newAd, make: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Model *</label>
                    <input
                      type="text"
                      placeholder="e.g., Civic, Accord"
                      value={newAd.model}
                      onChange={(e) => setNewAd({ ...newAd, model: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Model Year</label>
                      <input
                        type="number"
                        value={newAd.model_year}
                        onChange={(e) => setNewAd({ ...newAd, model_year: Number(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Color *</label>
                      <input
                        type="text"
                        placeholder="e.g., Black, Silver"
                        value={newAd.color}
                        onChange={(e) => setNewAd({ ...newAd, color: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Variant</label>
                    <input
                      type="text"
                      placeholder="e.g., GT, Sport, Limited"
                      value={newAd.variant}
                      onChange={(e) => setNewAd({ ...newAd, variant: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Specifications */}
              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeader}>
                    <FaGasPump className={styles.sectionIcon} />
                    <h3>Vehicle Specifications</h3>
                  </div>
                  <p className={styles.sectionDescription}>Engine and transmission details</p>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Fuel Type *</label>
                      <select
                        value={newAd.fuel_type}
                        onChange={(e) => setNewAd({ ...newAd, fuel_type: e.target.value })}
                      >
                        {FuelTypes.map((ft) => (
                          <option key={ft} value={ft}>
                            {ft}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Transmission *</label>
                      <select
                        value={newAd.transmission}
                        onChange={(e) => setNewAd({ ...newAd, transmission: e.target.value })}
                      >
                        <option value="">Select Transmission</option>
                        {Transmission.map((tr) => (
                          <option key={tr} value={tr}>
                            {tr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Engine Capacity (cc) *</label>
                    <input
                      type="number"
                      placeholder="e.g., 1800"
                      value={newAd.engine_capacity}
                      onChange={(e) => setNewAd({ ...newAd, engine_capacity: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Body Type</label>
                      <select
                        value={newAd.body_type}
                        onChange={(e) => setNewAd({ ...newAd, body_type: e.target.value })}
                      >
                        {BodyTypes.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Mileage (km)</label>
                      <input
                        type="number"
                        placeholder="e.g., 50000"
                        value={newAd.mileage}
                        onChange={(e) => setNewAd({ ...newAd, mileage: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Location & Price */}
              {currentStep === 3 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeader}>
                    <FaMapMarkerAlt className={styles.sectionIcon} />
                    <h3>Location & Price</h3>
                  </div>
                  <p className={styles.sectionDescription}>Where is your car and what's your asking price?</p>

                  <div className={styles.formGroup}>
                    <label>Location *</label>
                    <input
                      type="text"
                      placeholder="e.g., Lahore, Karachi"
                      value={newAd.location}
                      onChange={(e) => setNewAd({ ...newAd, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Registered In</label>
                    <select
                      value={newAd.registered_in}
                      onChange={(e) => setNewAd({ ...newAd, registered_in: e.target.value })}
                    >
                      {RegisteredIn.map((ri) => (
                        <option key={ri} value={ri}>
                          {ri}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Price (PKR Lacs) *</label>
                    <div className={styles.priceInputWrapper}>
                      <span className={styles.pricePrefix}>PKR</span>
                      <input
                        type="number"
                        placeholder="e.g., 25.50"
                        value={newAd.price === 0 ? "" : newAd.price}
                        onChange={(e) => setNewAd({ ...newAd, price: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                        step="0.01"
                        min="0"
                        required
                      />
                      <span className={styles.priceSuffix}>Lac</span>
                    </div>
                  </div>

                  {newAd.price > 0 && (
                    <div className={styles.priceDisplay}>
                      <strong>₨ {(newAd.price * 100000).toLocaleString()}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Images & Features */}
              {currentStep === 4 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeader}>
                    <FaImages className={styles.sectionIcon} />
                    <h3>Images & Features</h3>
                  </div>
                  <p className={styles.sectionDescription}>Upload photos and select features</p>

                  <div className={styles.formGroup}>
                    <label>Upload Car Images (min 1, max 10) *</label>
                    <div className={styles.imageUploadBox}>
                      <input
                        type="file"
                        id="imageInput"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className={styles.imageInput}
                      />
                      <label htmlFor="imageInput" className={styles.imageUploadLabel}>
                        <div className={styles.uploadIcon}>📸</div>
                        <p>Click to upload or drag & drop</p>
                        <span>JPG, PNG up to 5MB each (max 10 images)</span>
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className={styles.imagePreviewContainer}>
                        <p className={styles.previewLabel}>Selected Images ({imagePreviews.length})</p>
                        <div className={styles.imageGrid}>
                          {imagePreviews.map((preview, idx) => (
                            <div key={idx} className={styles.imagePreviewItem}>
                              <img src={preview} alt={`Preview ${idx}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.featureLabelContainer}>
                      <div className={styles.featureLabelText}>
                        <FaCoins className={styles.featureIcon} />
                        <label>Select Features</label>
                      </div>
                      <span className={styles.featureCount}>{newAd.features.length} selected</span>
                    </div>
                    <div className={styles.featuresGrid}>
                      {FeatureOptions.map((f) => (
                        <label key={f} className={styles.featureCheckbox}>
                          <input
                            type="checkbox"
                            checked={newAd.features.includes(f)}
                            onChange={() => toggleFeature(f)}
                          />
                          <span>{f}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Description & Review */}
              {currentStep === 5 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeader}>
                    <FaCheckCircle className={styles.sectionIcon} />
                    <h3>Description & Review</h3>
                  </div>
                  <p className={styles.sectionDescription}>Tell buyers more about your vehicle</p>

                  <div className={styles.formGroup}>
                    <label>Description *</label>
                    <textarea
                      placeholder="Describe the condition, maintenance history, special features, etc."
                      value={newAd.description}
                      onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                      required
                      rows={6}
                      maxLength={1000}
                    />
                    <p className={styles.charCounter}>
                      {newAd.description.length}/1000
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className={styles.summaryCard}>
                    <h4>Ad Summary</h4>
                    <div className={styles.summaryItem}>
                      <span>Vehicle:</span>
                      <strong>
                        {newAd.make} {newAd.model} {newAd.variant} ({newAd.model_year})
                      </strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Price:</span>
                      <strong>PKR {newAd.price} Lac</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Location:</span>
                      <strong>{newAd.location}</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Images:</span>
                      <strong>{newAd.files.length} uploaded</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Features:</span>
                      <strong>{newAd.features.length} selected</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className={styles.formNavigationFooter}>
                <button
                  type="button"
                  className={styles.prevButton}
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                >
                  ← Previous
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    className={styles.nextButton}
                    onClick={handleNextStep}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={adCreationLoading}
                  >
                    {adCreationLoading ? (
                      <>
                        <span className={styles.spinner}></span>
                        Creating...
                      </>
                    ) : (
                      "Create Ad 🚀"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

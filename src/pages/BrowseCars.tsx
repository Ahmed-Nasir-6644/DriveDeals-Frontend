"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/BrowseCars.module.css";
import { FaSlidersH, FaTimes } from "react-icons/fa";

// Pakistan cities
const PAKISTAN_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Multan",
  "Faisalabad",
  "Hyderabad",
  "Peshawar",
  "Quetta",
  "Mirpur",
  "Sargodha",
  "Sialkot",
  "Gujranwala",
  "Sukkur",
  "Larkana",
  "Dera Ismail Khan",
  "Mingora",
  "Mardan",
  "Jhang",
  "Bahawalpur",
  "Okara",
  "Sahiwal",
  "Kasur",
  "Wazirabad",
  "Sheikhupura",
  "Attock",
  "Mianwali",
  "Khushab",
  "Bhakkar",
  "Chakwal",
  "Jhelum",
  "Azad Kashmir",
];

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
  features: string | string[]; // backend may store JSON string or array
  images: string[]; // or pictures string; adjust if needed
  location: string;
  registered_in: string;
  model_year: number;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export default function BrowseCars() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [search, setSearch] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Applied filters (used for actual filtering)
  const [appliedMakeFilter, setAppliedMakeFilter] = useState("");
  const [appliedModelFilter, setAppliedModelFilter] = useState("");
  const [appliedLocationFilter, setAppliedLocationFilter] = useState("");
  const [appliedFuelFilter, setAppliedFuelFilter] = useState("");
  const [appliedTransmissionFilter, setAppliedTransmissionFilter] = useState("");
  const [appliedBodyTypeFilter, setAppliedBodyTypeFilter] = useState("");
  const [appliedRegisteredInFilter, setAppliedRegisteredInFilter] = useState("");
  const [appliedYearMin, setAppliedYearMin] = useState<number | "">("");
  const [appliedYearMax, setAppliedYearMax] = useState<number | "">("");
  const [appliedPriceMin, setAppliedPriceMin] = useState<number | "">("");
  const [appliedPriceMax, setAppliedPriceMax] = useState<number | "">("");
  const [appliedMileageMin, setAppliedMileageMin] = useState<number | "">("");
  const [appliedMileageMax, setAppliedMileageMax] = useState<number | "">("");

  // Temporary filter states (used in modal while editing)
  const [tempMakeFilter, setTempMakeFilter] = useState("");
  const [tempModelFilter, setTempModelFilter] = useState("");
  const [tempLocationFilter, setTempLocationFilter] = useState("");
  const [tempFuelFilter, setTempFuelFilter] = useState("");
  const [tempTransmissionFilter, setTempTransmissionFilter] = useState("");
  const [tempBodyTypeFilter, setTempBodyTypeFilter] = useState("");
  const [tempRegisteredInFilter, setTempRegisteredInFilter] = useState("");
  const [tempYearMin, setTempYearMin] = useState<number | "">("");
  const [tempYearMax, setTempYearMax] = useState<number | "">("");
  const [tempPriceMin, setTempPriceMin] = useState<number | "">("");
  const [tempPriceMax, setTempPriceMax] = useState<number | "">("");
  const [tempMileageMin, setTempMileageMin] = useState<number | "">("");
  const [tempMileageMax, setTempMileageMax] = useState<number | "">("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/ads/get/ads`)
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  // Helpers to normalize features field (backend may store JSON string)
  function parseFeatures(raw: string | string[] | undefined): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback: try splitting CSV-like string
      return raw
        .replace("[", "")
        .replace("]", "")
        .replaceAll('"', "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }

  // Build unique filter options from ads
  const {
    makes,
    modelsByMake,
    fuels,
    transmissions,
    bodyTypes,
    registeredIns,
    years,
    priceRange,
    mileageRange,
  } = useMemo(() => {
    const makesSet = new Set<string>();
    const modelsMap = new Map<string, Set<string>>();
    const locationsSet = new Set<string>();
    const fuelsSet = new Set<string>();
    const transSet = new Set<string>();
    const bodySet = new Set<string>();
    const regSet = new Set<string>();
    const yearsSet = new Set<number>();
    const featuresSet = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minMileage = Infinity;
    let maxMileage = -Infinity;

    ads.forEach((ad) => {
      // Normalize make: trim and consistent casing for deduplication
      if (ad.make) {
        const normalizedMake = ad.make.trim();
        makesSet.add(normalizedMake);
        if (!modelsMap.has(normalizedMake)) modelsMap.set(normalizedMake, new Set());
        if (ad.model) {
          const normalizedModel = ad.model.trim();
          modelsMap.get(normalizedMake)!.add(normalizedModel);
        }
      }
      // Only add locations that are in Pakistan cities list (case-insensitive check)
      if (ad.location) {
        const matchedCity = PAKISTAN_CITIES.find(
          (city) => city.toLowerCase() === ad.location.toLowerCase()
        );
        if (matchedCity) {
          locationsSet.add(matchedCity);
        }
      }
      if (ad.fuel_type) fuelsSet.add(ad.fuel_type.trim());
      if (ad.transmission) transSet.add(ad.transmission.trim());
      if (ad.body_type) bodySet.add(ad.body_type.trim());
      if (ad.registered_in) regSet.add(ad.registered_in.trim());
      if (ad.model_year) yearsSet.add(ad.model_year);
      const feats = parseFeatures(ad.features as any);
      feats.forEach((f) => featuresSet.add(f));
      if (typeof ad.price === "number") {
        minPrice = Math.min(minPrice, ad.price);
        maxPrice = Math.max(maxPrice, ad.price);
      }
      if (typeof ad.mileage === "number") {
        minMileage = Math.min(minMileage, ad.mileage);
        maxMileage = Math.max(maxMileage, ad.mileage);
      }
    });

    // Convert models map to plain object with arrays
    const modelsByMakeObj: Record<string, string[]> = {};
    modelsMap.forEach((set, mk) => {
      modelsByMakeObj[mk] = Array.from(set).sort();
    });

    return {
      makes: Array.from(makesSet).sort(),
      modelsByMake: modelsByMakeObj,
      locations: Array.from(locationsSet).sort(),
      fuels: Array.from(fuelsSet).sort(),
      transmissions: Array.from(transSet).sort(),
      bodyTypes: Array.from(bodySet).sort(),
      registeredIns: Array.from(regSet).sort(),
      years: Array.from(yearsSet).sort((a, b) => b - a), // descending
      featuresOptions: Array.from(featuresSet).sort(),
      priceRange:
        minPrice === Infinity ? { min: 0, max: 0 } : { min: minPrice, max: maxPrice },
      mileageRange:
        minMileage === Infinity ? { min: 0, max: 0 } : { min: minMileage, max: maxMileage },
    };
  }, [ads]);



  function resetFilters() {
    setAppliedMakeFilter("");
    setAppliedModelFilter("");
    setAppliedLocationFilter("");
    setAppliedFuelFilter("");
    setAppliedTransmissionFilter("");
    setAppliedBodyTypeFilter("");
    setAppliedRegisteredInFilter("");
    setAppliedYearMin("");
    setAppliedYearMax("");
    setAppliedPriceMin("");
    setAppliedPriceMax("");
    setAppliedMileageMin("");
    setAppliedMileageMax("");
    // Also reset temp filters in modal
    setTempMakeFilter("");
    setTempModelFilter("");
    setTempLocationFilter("");
    setTempFuelFilter("");
    setTempTransmissionFilter("");
    setTempBodyTypeFilter("");
    setTempRegisteredInFilter("");
    setTempYearMin("");
    setTempYearMax("");
    setTempPriceMin("");
    setTempPriceMax("");
    setTempMileageMin("");
    setTempMileageMax("");
    setSearch("");
  }

  // Open filter modal and initialize temp filters from applied filters
  function openFilterModal() {
    setTempMakeFilter(appliedMakeFilter);
    setTempModelFilter(appliedModelFilter);
    setTempLocationFilter(appliedLocationFilter);
    setTempFuelFilter(appliedFuelFilter);
    setTempTransmissionFilter(appliedTransmissionFilter);
    setTempBodyTypeFilter(appliedBodyTypeFilter);
    setTempRegisteredInFilter(appliedRegisteredInFilter);
    setTempYearMin(appliedYearMin);
    setTempYearMax(appliedYearMax);
    setTempPriceMin(appliedPriceMin);
    setTempPriceMax(appliedPriceMax);
    setTempMileageMin(appliedMileageMin);
    setTempMileageMax(appliedMileageMax);
    setShowFilterModal(true);
  }

  // Apply filters: copy temp filters to applied filters
  function applyFilters() {
    setAppliedMakeFilter(tempMakeFilter);
    setAppliedModelFilter(tempModelFilter);
    setAppliedLocationFilter(tempLocationFilter);
    setAppliedFuelFilter(tempFuelFilter);
    setAppliedTransmissionFilter(tempTransmissionFilter);
    setAppliedBodyTypeFilter(tempBodyTypeFilter);
    setAppliedRegisteredInFilter(tempRegisteredInFilter);
    setAppliedYearMin(tempYearMin);
    setAppliedYearMax(tempYearMax);
    setAppliedPriceMin(tempPriceMin);
    setAppliedPriceMax(tempPriceMax);
    setAppliedMileageMin(tempMileageMin);
    setAppliedMileageMax(tempMileageMax);
    setShowFilterModal(false);
  }

  // Close modal without applying filters
  function closeFilterModal() {
    setShowFilterModal(false);
  }

  // Main filtering logic - uses APPLIED filters only
  const filteredAds = ads.filter((ad) => {
    // Search (make model variant or location)
    const car = `${ad.make} ${ad.model} ${ad.variant}`.toLowerCase();
    const searchTerm = search.trim().toLowerCase();
    if (searchTerm) {
      const matchesSearch =
        car.includes(searchTerm) || ad.location.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Make / Model / Location filters (with normalization)
    if (appliedMakeFilter && ad.make.trim() !== appliedMakeFilter) return false;
    if (appliedModelFilter && ad.model.trim() !== appliedModelFilter) return false;
    // Location: contains check (case-insensitive) - allows partial matches
    if (appliedLocationFilter && !ad.location.trim().toLowerCase().includes(appliedLocationFilter.toLowerCase())) return false;

    // Fuel / Transmission / Body / Registered (with normalization)
    if (appliedFuelFilter && ad.fuel_type.trim() !== appliedFuelFilter) return false;
    if (appliedTransmissionFilter && ad.transmission.trim() !== appliedTransmissionFilter) return false;
    if (appliedBodyTypeFilter && ad.body_type.trim() !== appliedBodyTypeFilter) return false;
    if (appliedRegisteredInFilter && ad.registered_in.trim() !== appliedRegisteredInFilter) return false;

    // Year range
    if (appliedYearMin !== "" && typeof ad.model_year === "number" && ad.model_year < Number(appliedYearMin))
      return false;
    if (appliedYearMax !== "" && typeof ad.model_year === "number" && ad.model_year > Number(appliedYearMax))
      return false;

    // Price range
    if (appliedPriceMin !== "" && typeof ad.price === "number" && ad.price < Number(appliedPriceMin)) return false;
    if (appliedPriceMax !== "" && typeof ad.price === "number" && ad.price > Number(appliedPriceMax)) return false;

    // Mileage range
    if (appliedMileageMin !== "" && typeof ad.mileage === "number" && ad.mileage < Number(appliedMileageMin))
      return false;
    if (appliedMileageMax !== "" && typeof ad.mileage === "number" && ad.mileage > Number(appliedMileageMax))
      return false;

    return true;
  });

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Browse Cars</h1>

        <input
          type="text"
          placeholder="Search by make, model, variant, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchBar}
        />
      </div>

      {/* FILTER BUTTON */}
      <div className={styles.filterButtonContainer}>
        <button className={styles.filterButton} onClick={openFilterModal}>
          <FaSlidersH size={18} />
          Filters
        </button>
      </div>

      {/* FILTER MODAL */}
      {showFilterModal && (
        <div className={styles.modalOverlay} onClick={closeFilterModal}>
          <div className={styles.filterModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Filter Cars</h2>
              <button
                className={styles.closeBtn}
                onClick={closeFilterModal}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.filterGroup}>
                <label>Make</label>
                <select
                  value={tempMakeFilter}
                  onChange={(e) => {
                    setTempMakeFilter(e.target.value);
                    setTempModelFilter("");
                  }}
                >
                  <option value="">All</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Model</label>
                <select
                  value={tempModelFilter}
                  onChange={(e) => setTempModelFilter(e.target.value)}
                  disabled={!tempMakeFilter}
                >
                  <option value="">All</option>
                  {tempMakeFilter &&
                    (modelsByMake[tempMakeFilter] || []).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Location</label>
                <select value={tempLocationFilter} onChange={(e) => setTempLocationFilter(e.target.value)}>
                  <option value="">All</option>
                  {PAKISTAN_CITIES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Fuel Type</label>
                <select value={tempFuelFilter} onChange={(e) => setTempFuelFilter(e.target.value)}>
                  <option value="">All</option>
                  {fuels.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Transmission</label>
                <select value={tempTransmissionFilter} onChange={(e) => setTempTransmissionFilter(e.target.value)}>
                  <option value="">All</option>
                  {transmissions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Body Type</label>
                <select value={tempBodyTypeFilter} onChange={(e) => setTempBodyTypeFilter(e.target.value)}>
                  <option value="">All</option>
                  {bodyTypes.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Registered In</label>
                <select value={tempRegisteredInFilter} onChange={(e) => setTempRegisteredInFilter(e.target.value)}>
                  <option value="">All</option>
                  {registeredIns.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label>Year (min)</label>
                  <input
                    type="number"
                    placeholder={`${years[years.length - 1] ?? ""}`}
                    value={tempYearMin}
                    onChange={(e) => setTempYearMin(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label>Year (max)</label>
                  <input
                    type="number"
                    placeholder={`${years[0] ?? ""}`}
                    value={tempYearMax}
                    onChange={(e) => setTempYearMax(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>

              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label>Price (min)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.min ?? ""}`}
                    value={tempPriceMin}
                    onChange={(e) => setTempPriceMin(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label>Price (max)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.max ?? ""}`}
                    value={tempPriceMax}
                    onChange={(e) => setTempPriceMax(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>

              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label>Mileage (min)</label>
                  <input
                    type="number"
                    placeholder={`${mileageRange.min ?? ""}`}
                    value={tempMileageMin}
                    onChange={(e) => setTempMileageMin(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label>Mileage (max)</label>
                  <input
                    type="number"
                    placeholder={`${mileageRange.max ?? ""}`}
                    value={tempMileageMax}
                    onChange={(e) => setTempMileageMax(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.resetButton} onClick={resetFilters}>
                Reset Filters
              </button>
              <button className={styles.applyButton} onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST OF ADS */}
      <div className={styles.list}>
        {filteredAds.length === 0 ? (
          <p className={styles.message}>No results found.</p>
        ) : (
          filteredAds.map((ad) => (
            <div key={ad.id} className={styles.card}>
              <img
                src={ad.images?.[0] || "/placeholder-car.jpg"}
                alt={`${ad.make} ${ad.model}`}
                className={styles.image}
              />

              <div className={styles.info}>
                <h2 className={styles.carTitle}>
                  {ad.make} {ad.model} {ad.variant}
                </h2>

                <p className={styles.price}>PKR {ad.price} lacs</p>

                <p className={styles.details}>
                  {ad.model_year} • {ad.mileage} km • {ad.color}
                </p>

                <p className={styles.location}>
                  📍 {ad.location}, Registered in {ad.registered_in}
                </p>

                <p className={styles.desc}>{ad.description}</p>

                <Link to={`/ad/${ad.id}`} className={styles.button}>
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

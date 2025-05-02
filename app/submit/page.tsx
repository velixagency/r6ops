"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import imageCompression from "browser-image-compression";

export default function Submit() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    food: 0,
    oil: 0,
    steel: 0,
    mineral: 0,
    speed_up: 0, // Total speed up time in seconds
    building_speed_up: 0, // Building speed up time in seconds
    healing_speed_up: 0, // Healing speed up time in seconds
    recruitment_speed_up: 0, // Recruitment speed up time in seconds
    research_speed_up: 0, // Research speed up time in seconds
    vip_level: 0,
  });
  const [inputMode, setInputMode] = useState<"manual" | "screenshot">("manual");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageTitle, setCurrentImageTitle] = useState<string>(""); // Track the current image title
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dataComplete, setDataComplete] = useState(false);

  useEffect(() => {
    if (user) {
      console.log("User object:", user);
      console.log("User UID:", user.uid, "Length:", user.uid.length);
      const fetchResources = async () => {
        try {
          const response = await fetch(`/api/get-resources?user_id=${user.uid}`);
          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (parseErr) {
              errorData = { error: "Failed to parse error response from API" };
            }
            console.error("API error:", {
              status: response.status,
              statusText: response.statusText,
              body: errorData,
            });
            const errorMessage = errorData.message || errorData.error || `Failed to fetch resources: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
          }
          const result = await response.json();
          console.log("Raw API response:", result);
          if (result.data) {
            console.log("API response:", { data: result.data });
            setFormData((prev) => ({
              ...prev,
              food: result.data.food || prev.food,
              oil: result.data.oil || prev.oil,
              steel: result.data.steel || prev.steel,
              mineral: result.data.mineral || prev.mineral,
              speed_up: result.data.speed_up || prev.speed_up,
              building_speed_up: result.data.building_speed_up || prev.building_speed_up,
              healing_speed_up: result.data.healing_speed_up || prev.healing_speed_up,
              recruitment_speed_up: result.data.recruitment_speed_up || prev.recruitment_speed_up,
              research_speed_up: result.data.research_speed_up || prev.research_speed_up,
              vip_level: result.data.vip_level || prev.vip_level,
            }));
          } else {
            console.log("No resources found for user_id:", user.uid);
          }
        } catch (error: any) {
          console.error("Fetch error:", error.message);
          setFetchError(`Failed to load resources: ${error.message}`);
        }
      };
      fetchResources();
    }
  }, [user, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Check file sizes (10 MB limit per file)
      const oversizedFiles = Array.from(files).filter(file => file.size / 1024 / 1024 > 10);
      if (oversizedFiles.length > 0) {
        setError("One or more screenshots are too large. Please upload images smaller than 10 MB.");
        return;
      }
      setScreenshots(Array.from(files));
      // Trigger data extraction automatically
      handleExtractData(Array.from(files));
    }
  };

  // Helper function to format seconds into days, hours, minutes, seconds
  const formatDuration = (totalSeconds: number): string => {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    totalSeconds %= 24 * 60 * 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    totalSeconds %= 60 * 60;
    const minutes = Math.floor(totalSeconds / (60));
    const seconds = totalSeconds % 60;
    return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleExtractData = async (files: File[]) => {
    if (files.length === 0) {
      setError("Please upload at least one screenshot.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let extractedData = { ...formData };

      // Process each image sequentially
      for (const file of files) {
        // Update the loading text with the image title
        setCurrentImageTitle("Processing..."); // Initial placeholder while extracting text

        // Compress the image client-side
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1, // Compress to 1 MB
          maxWidthOrHeight: 1920, // Resize to max 1920px
        });

        // Convert the compressed file to base64
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        const base64Image = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });

        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64Image.split(",")[1];

        // Send the base64 data as JSON to the API
        const response = await fetch("/api/extract-screenshot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64Data }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to extract data from screenshot";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseErr) {
            errorMessage = `Failed to extract data: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const { data } = await response.json();

        // Infer the image title from the extracted text
        const extractedText = data.extractedText || "";
        let imageTitle = "Unknown Image";
        if (extractedText.toLowerCase().includes("resources and speed up info")) {
          imageTitle = "Resources and Speed Up Info";
        } else if (extractedText.toLowerCase().includes("vip")) {
          imageTitle = "City Overview";
        }
        setCurrentImageTitle(`Loading ${imageTitle}`);

        // Merge extracted data, prioritizing non-zero values
        extractedData = {
          ...extractedData,
          food: data.food !== 0 ? data.food : extractedData.food,
          oil: data.oil !== 0 ? data.oil : extractedData.oil,
          steel: data.steel !== 0 ? data.steel : extractedData.steel,
          mineral: data.mineral !== 0 ? data.mineral : extractedData.mineral,
          speed_up: data.speed_up !== 0 ? data.speed_up : extractedData.speed_up,
          building_speed_up: data.building_speed_up !== 0 ? data.building_speed_up : extractedData.building_speed_up,
          healing_speed_up: data.healing_speed_up !== 0 ? data.healing_speed_up : extractedData.healing_speed_up,
          recruitment_speed_up: data.recruitment_speed_up !== 0 ? data.recruitment_speed_up : extractedData.recruitment_speed_up,
          research_speed_up: data.research_speed_up !== 0 ? data.research_speed_up : extractedData.research_speed_up,
          vip_level: data.vip_level !== 0 ? data.vip_level : extractedData.vip_level,
        };
      }

      // Submit the extracted data to the database
      if (!user || !user.uid) {
        throw new Error("User authentication required. Please log in again.");
      }

      const response = await fetch("/api/submit-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          food: extractedData.food,
          oil: extractedData.oil,
          steel: extractedData.steel,
          mineral: extractedData.mineral,
          speed_up: extractedData.speed_up,
          building_speed_up: extractedData.building_speed_up,
          healing_speed_up: extractedData.healing_speed_up,
          recruitment_speed_up: extractedData.recruitment_speed_up,
          research_speed_up: extractedData.research_speed_up,
          vip_level: extractedData.vip_level,
          troop_levels: {},
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Submit error:", result);
        throw new Error(result.error || `Failed to submit resources: ${response.status} ${response.statusText}`);
      }

      // Show "Data Complete" message and redirect
      setDataComplete(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000); // Redirect after 2 seconds
    } catch (err: any) {
      console.error("Extraction error:", err);
      setError(`Failed to extract data: ${err.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.uid) {
      setError("User authentication required. Please log in again.");
      return;
    }
    try {
      const response = await fetch("/api/submit-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          food: formData.food,
          oil: formData.oil,
          steel: formData.steel,
          mineral: formData.mineral,
          speed_up: formData.speed_up,
          building_speed_up: formData.building_speed_up,
          healing_speed_up: formData.healing_speed_up,
          recruitment_speed_up: formData.recruitment_speed_up,
          research_speed_up: formData.research_speed_up,
          vip_level: formData.vip_level,
          troop_levels: {},
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Submit error:", result);
        throw new Error(result.error || `Failed to submit resources: ${response.status} ${response.statusText}`);
      }
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Submit error:", error);
      setError(`Failed to submit resources: ${error.message || "Unknown error"}`);
    }
  };

  if (loading) {
    return <div className="text-light-text text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-accent-cyan mb-6">Submit In-Game Data</h1>
        {user ? (
          <>
            <div className="mb-4">
              <p className="text-light-text">Logged in as: {user.email}</p>
            </div>
            {fetchError && <p className="text-red-500 mb-4">{fetchError}</p>}
            <div className="mb-4">
              <label className="mr-4">
                <input
                  type="radio"
                  value="manual"
                  checked={inputMode === "manual"}
                  onChange={() => setInputMode("manual")}
                  className="mr-2 accent-accent-green"
                />
                <span className="text-light-text">Manual Input</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="screenshot"
                  checked={inputMode === "screenshot"}
                  onChange={() => setInputMode("screenshot")}
                  className="mr-2 accent-accent-green"
                />
                <span className="text-light-text">Upload Screenshot</span>
              </label>
            </div>
            {inputMode === "manual" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-dark-panel p-4 rounded-lg border border-border-metallic shadow-metallic-glow">
                  <h2 className="text-xl font-semibold text-accent-cyan mb-3">Player Stats</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="vip_level" className="block text-light-text font-medium">VIP Level</label>
                      <input
                        type="number"
                        id="vip_level"
                        name="vip_level"
                        value={formData.vip_level}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-dark-panel p-4 rounded-lg border border-border-metallic shadow-metallic-glow">
                  <h2 className="text-xl font-semibold text-accent-cyan mb-3">Resources</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="food" className="block text-light-text font-medium">Food</label>
                      <input
                        type="number"
                        id="food"
                        name="food"
                        value={formData.food}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                    </div>
                    <div>
                      <label htmlFor="oil" className="block text-light-text font-medium">Oil</label>
                      <input
                        type="number"
                        id="oil"
                        name="oil"
                        value={formData.oil}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                    </div>
                    <div>
                      <label htmlFor="steel" className="block text-light-text font-medium">Steel</label>
                      <input
                        type="number"
                        id="steel"
                        name="steel"
                        value={formData.steel}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                    </div>
                    <div>
                      <label htmlFor="mineral" className="block text-light-text font-medium">Mineral</label>
                      <input
                        type="number"
                        id="mineral"
                        name="mineral"
                        value={formData.mineral}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-dark-panel p-4 rounded-lg border border-border-metallic shadow-metallic-glow">
                  <h2 className="text-xl font-semibold text-accent-cyan mb-3">Speed-Ups</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="speed_up" className="block text-light-text font-medium">Speed Up (seconds)</label>
                      <input
                        type="number"
                        id="speed_up"
                        name="speed_up"
                        value={formData.speed_up}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                      <p className="text-sm text-light-text">{formatDuration(formData.speed_up)}</p>
                    </div>
                    <div>
                      <label htmlFor="building_speed_up" className="block text-light-text font-medium">Building Speed Up (seconds)</label>
                      <input
                        type="number"
                        id="building_speed_up"
                        name="building_speed_up"
                        value={formData.building_speed_up}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                      <p className="text-sm text-light-text">{formatDuration(formData.building_speed_up)}</p>
                    </div>
                    <div>
                      <label htmlFor="healing_speed_up" className="block text-light-text font-medium">Healing Speed Up (seconds)</label>
                      <input
                        type="number"
                        id="healing_speed_up"
                        name="healing_speed_up"
                        value={formData.healing_speed_up}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                      <p className="text-sm text-light-text">{formatDuration(formData.healing_speed_up)}</p>
                    </div>
                    <div>
                      <label htmlFor="recruitment_speed_up" className="block text-light-text font-medium">Recruitment Speed Up (seconds)</label>
                      <input
                        type="number"
                        id="recruitment_speed_up"
                        name="recruitment_speed_up"
                        value={formData.recruitment_speed_up}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                      <p className="text-sm text-light-text">{formatDuration(formData.recruitment_speed_up)}</p>
                    </div>
                    <div>
                      <label htmlFor="research_speed_up" className="block text-light-text font-medium">Research Speed Up (seconds)</label>
                      <input
                        type="number"
                        id="research_speed_up"
                        name="research_speed_up"
                        value={formData.research_speed_up}
                        onChange={handleChange}
                        className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                      <p className="text-sm text-light-text">{formatDuration(formData.research_speed_up)}</p>
                    </div>
                  </div>
                </div>
                <button type="submit" className="bg-accent-cyan text-dark-bg font-semibold px-6 py-3 rounded-lg hover:bg-accent-green hover:text-dark-bg transition-colors shadow-cyan-glow">
                  Submit
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label htmlFor="screenshots" className="block text-light-text font-medium mb-2">Upload Screenshots</label>
                  <input
                    type="file"
                    id="screenshots"
                    accept="image/*"
                    multiple
                    onChange={handleScreenshotChange}
                    className="border border-border-metallic bg-dark-bg text-light-text p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  />
                </div>
                {isProcessing && (
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-light-text text-lg">{currentImageTitle}</p>
                  </div>
                )}
                {dataComplete && (
                  <div className="text-center">
                    <p className="text-accent-green text-lg font-semibold">Data Complete</p>
                    <p className="text-light-text">Redirecting to dashboard...</p>
                  </div>
                )}
                {error && <p className="text-red-500 mt-4">{error}</p>}
              </div>
            )}
          </>
        ) : (
          <p className="text-light-text">Loading...</p>
        )}
      </div>
    </div>
  );
}
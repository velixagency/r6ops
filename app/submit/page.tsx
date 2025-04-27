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
    uranium: 0,
    speed_up: 0, // Total speed up time in seconds
    building_speed_up: 0, // Building speed up time in seconds
    healing_speed_up: 0, // Healing speed up time in seconds
    recruitment_speed_up: 0, // Recruitment speed up time in seconds
    research_speed_up: 0, // Research speed up time in seconds
  });
  const [inputMode, setInputMode] = useState<"manual" | "screenshot">("manual");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
              uranium: result.data.uranium || prev.uranium,
              speed_up: result.data.speed_up || prev.speed_up,
              building_speed_up: result.data.building_speed_up || prev.building_speed_up,
              healing_speed_up: result.data.healing_speed_up || prev.healing_speed_up,
              recruitment_speed_up: result.data.recruitment_speed_up || prev.recruitment_speed_up,
              research_speed_up: result.data.research_speed_up || prev.research_speed_up,
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
    const file = e.target.files?.[0];
    if (file) {
      // Check file size before proceeding (10 MB limit)
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > 10) {
        setError("Screenshot is too large. Please upload an image smaller than 10 MB.");
        return;
      }
      setScreenshot(file);
    }
  };

  // Helper function to format seconds into days, hours, minutes, seconds
  const formatDuration = (totalSeconds: number): string => {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    totalSeconds %= 24 * 60 * 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    totalSeconds %= 60 * 60;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleExtractData = async () => {
    if (!screenshot) {
      setError("Please upload a screenshot first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Compress the image client-side
      const compressedFile = await imageCompression(screenshot, {
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
      setFormData((prev) => ({
        ...prev,
        food: data.food !== 0 ? data.food : prev.food,
        oil: data.oil !== 0 ? data.oil : prev.oil,
        steel: data.steel !== 0 ? data.steel : prev.steel,
        mineral: data.mineral !== 0 ? data.mineral : prev.mineral,
        uranium: data.uranium !== 0 ? data.uranium : prev.uranium,
        speed_up: data.speed_up !== 0 ? data.speed_up : prev.speed_up,
        building_speed_up: data.building_speed_up !== 0 ? data.building_speed_up : prev.building_speed_up,
        healing_speed_up: data.healing_speed_up !== 0 ? data.healing_speed_up : prev.healing_speed_up,
        recruitment_speed_up: data.recruitment_speed_up !== 0 ? data.recruitment_speed_up : prev.recruitment_speed_up,
        research_speed_up: data.research_speed_up !== 0 ? data.research_speed_up : prev.research_speed_up,
      }));
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
          uranium: formData.uranium,
          speed_up: formData.speed_up,
          building_speed_up: formData.building_speed_up,
          healing_speed_up: formData.healing_speed_up,
          recruitment_speed_up: formData.recruitment_speed_up,
          research_speed_up: formData.research_speed_up,
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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Resources</h1>
      {user ? (
        <>
          <div className="mb-4">
            <p className="text-gray-600">Logged in as: {user.email}</p>
          </div>
          {fetchError && <p className="text-red-500 mb-4">{fetchError}</p>}
          <div className="mb-4">
            <label className="mr-4">
              <input
                type="radio"
                value="manual"
                checked={inputMode === "manual"}
                onChange={() => setInputMode("manual")}
                className="mr-2"
              />
              Manual Input
            </label>
            <label>
              <input
                type="radio"
                value="screenshot"
                checked={inputMode === "screenshot"}
                onChange={() => setInputMode("screenshot")}
                className="mr-2"
              />
              Upload Screenshot
            </label>
          </div>
          {inputMode === "manual" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="food" className="block">Food</label>
                <input
                  type="number"
                  id="food"
                  name="food"
                  value={formData.food}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
              <div>
                <label htmlFor="oil" className="block">Oil</label>
                <input
                  type="number"
                  id="oil"
                  name="oil"
                  value={formData.oil}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
              <div>
                <label htmlFor="steel" className="block">Steel</label>
                <input
                  type="number"
                  id="steel"
                  name="steel"
                  value={formData.steel}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
              <div>
                <label htmlFor="mineral" className="block">Mineral</label>
                <input
                  type="number"
                  id="mineral"
                  name="mineral"
                  value={formData.mineral}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
              <div>
                <label htmlFor="uranium" className="block">Uranium</label>
                <input
                  type="number"
                  id="uranium"
                  name="uranium"
                  value={formData.uranium}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
              <div>
                <label htmlFor="speed_up" className="block">Speed Up (seconds)</label>
                <input
                  type="number"
                  id="speed_up"
                  name="speed_up"
                  value={formData.speed_up}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
                <p className="text-sm text-gray-600">{formatDuration(formData.speed_up)}</p>
              </div>
              <div>
                <label htmlFor="building_speed_up" className="block">Building Speed Up (seconds)</label>
                <input
                  type="number"
                  id="building_speed_up"
                  name="building_speed_up"
                  value={formData.building_speed_up}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
                <p className="text-sm text-gray-600">{formatDuration(formData.building_speed_up)}</p>
              </div>
              <div>
                <label htmlFor="healing_speed_up" className="block">Healing Speed Up (seconds)</label>
                <input
                  type="number"
                  id="healing_speed_up"
                  name="healing_speed_up"
                  value={formData.healing_speed_up}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
                <p className="text-sm text-gray-600">{formatDuration(formData.healing_speed_up)}</p>
              </div>
              <div>
                <label htmlFor="recruitment_speed_up" className="block">Recruitment Speed Up (seconds)</label>
                <input
                  type="number"
                  id="recruitment_speed_up"
                  name="recruitment_speed_up"
                  value={formData.recruitment_speed_up}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
                <p className="text-sm text-gray-600">{formatDuration(formData.recruitment_speed_up)}</p>
              </div>
              <div>
                <label htmlFor="research_speed_up" className="block">Research Speed Up (seconds)</label>
                <input
                  type="number"
                  id="research_speed_up"
                  name="research_speed_up"
                  value={formData.research_speed_up}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
                <p className="text-sm text-gray-600">{formatDuration(formData.research_speed_up)}</p>
              </div>
              <button type="submit" className="bg-accent text-white p-2 rounded">
                Submit
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">How to Upload a Screenshot</h2>
                <p className="mb-2">
                  To automatically extract your resource and speed-up values, please take screenshots of the "Resources" and "Speed Up" tabs on the "Resources and Speed Up Info" page in the game. Follow these steps:
                </p>
                <ol className="list-decimal list-inside mb-2">
                  <li>Go to the "Bag" section in the game.</li>
                  <li>Navigate to the "Resources" tab to view the "Resources and Speed Up Info" page.</li>
                  <li>Take a screenshot of the "Resources" tab, ensuring the resource values (Food, Oil, Steel, Minerals) are visible.</li>
                  <li>Switch to the "Speed Up" tab on the same page.</li>
                  <li>Take a screenshot of the "Speed Up" tab, ensuring the speed-up values (Speed Up, Building Speed Up, etc.) are visible.</li>
                  <li>Upload each screenshot separately using the field below to extract the respective data.</li>
                </ol>
                <p className="mb-2">Here are examples of what the screenshots should look like:</p>
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-1">"Resources" Tab Screenshot</h3>
                  <img
                    src="/images/resources-screenshot-example.png"
                    alt="Example screenshot of Resources tab"
                    className="w-full max-w-md rounded shadow"
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium mb-1">"Speed Up" Tab Screenshot</h3>
                  <img
                    src="/images/speed-up-screenshot-example.png"
                    alt="Example screenshot of Speed Up tab"
                    className="w-full max-w-md rounded shadow"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="screenshot" className="block">Upload Screenshot</label>
                <input
                  type="file"
                  id="screenshot"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="border p-2 w-full"
                />
              </div>
              {screenshot && (
                <div>
                  <p>Uploaded: {screenshot.name} {(screenshot.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={handleExtractData}
                    disabled={isProcessing}
                    className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Extract Data"}
                  </button>
                </div>
              )}
              {error && <p className="text-red-500">{error}</p>}
              {screenshot && !isProcessing && !error && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="food" className="block">Food (Extracted)</label>
                    <input
                      type="number"
                      id="food"
                      name="food"
                      value={formData.food}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="oil" className="block">Oil (Extracted)</label>
                    <input
                      type="number"
                      id="oil"
                      name="oil"
                      value={formData.oil}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="steel" className="block">Steel (Extracted)</label>
                    <input
                      type="number"
                      id="steel"
                      name="steel"
                      value={formData.steel}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="mineral" className="block">Mineral (Extracted)</label>
                    <input
                      type="number"
                      id="mineral"
                      name="mineral"
                      value={formData.mineral}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="uranium" className="block">Uranium (Extracted)</label>
                    <input
                      type="number"
                      id="uranium"
                      name="uranium"
                      value={formData.uranium}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="speed_up" className="block">Speed Up (seconds, Extracted)</label>
                    <input
                      type="number"
                      id="speed_up"
                      name="speed_up"
                      value={formData.speed_up}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                    <p className="text-sm text-gray-600">{formatDuration(formData.speed_up)}</p>
                  </div>
                  <div>
                    <label htmlFor="building_speed_up" className="block">Building Speed Up (seconds, Extracted)</label>
                    <input
                      type="number"
                      id="building_speed_up"
                      name="building_speed_up"
                      value={formData.building_speed_up}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                    <p className="text-sm text-gray-600">{formatDuration(formData.building_speed_up)}</p>
                  </div>
                  <div>
                    <label htmlFor="healing_speed_up" className="block">Healing Speed Up (seconds, Extracted)</label>
                    <input
                      type="number"
                      id="healing_speed_up"
                      name="healing_speed_up"
                      value={formData.healing_speed_up}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                    <p className="text-sm text-gray-600">{formatDuration(formData.healing_speed_up)}</p>
                  </div>
                  <div>
                    <label htmlFor="recruitment_speed_up" className="block">Recruitment Speed Up (seconds, Extracted)</label>
                    <input
                      type="number"
                      id="recruitment_speed_up"
                      name="recruitment_speed_up"
                      value={formData.recruitment_speed_up}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                    <p className="text-sm text-gray-600">{formatDuration(formData.recruitment_speed_up)}</p>
                  </div>
                  <div>
                    <label htmlFor="research_speed_up" className="block">Research Speed Up (seconds, Extracted)</label>
                    <input
                      type="number"
                      id="research_speed_up"
                      name="research_speed_up"
                      value={formData.research_speed_up}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                    <p className="text-sm text-gray-600">{formatDuration(formData.research_speed_up)}</p>
                  </div>
                  <button type="submit" className="bg-accent text-white p-2 rounded">
                    Submit
                  </button>
                </form>
              )}
            </div>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
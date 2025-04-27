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
            setFormData({
              food: result.data.food || 0,
              oil: result.data.oil || 0,
              steel: result.data.steel || 0,
              mineral: result.data.mineral || 0,
              uranium: result.data.uranium || 0,
            });
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
      setFormData({
        food: data.food || 0,
        oil: data.oil || 0,
        steel: data.steel || 0,
        mineral: data.mineral || 0,
        uranium: data.uranium || 0,
      });
    } catch (err: any) {
      console.error("Extraction error:", err);
      setError(`Failed to extract data: ${err.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
          troop_levels: {},
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Submit error:", result);
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
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
                <label htmlFor="steel" className="block"> стал Steel</label>
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
              <button type="submit" className="bg-accent text-white p-2 rounded">
                Submit
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">How to Upload a Screenshot</h2>
                <p className="mb-2">
                  To automatically extract your resource values, please take a screenshot of the "Resources and Speed Up Info" page in the game. Follow these steps:
                </p>
                <ol className="list-decimal list-inside mb-2">
                  <li>Go to the "Bag" section in the game.</li>
                  <li>Navigate to the "Resources" tab to view the "Resources and Speed Up Info" page.</li>
                  <li>Take a screenshot of this page, ensuring the resource values (Food, Oil, Steel, Minerals) are visible.</li>
                  <li>Upload the screenshot using the field below.</li>
                </ol>
                <p className="mb-2">Here’s an example of what the screenshot should look like:</p>
                <img
                  src="/images/resources-screenshot-example.png"
                  alt="Example screenshot of Resources and Speed Up Info page"
                  className="w-full max-w-md rounded shadow"
                />
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
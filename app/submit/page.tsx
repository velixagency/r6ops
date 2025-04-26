"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";

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
  const [fetchError, setFetchError] = useState<string | null>(null); // New state for fetch errors

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      console.log("Fetching resources for user_id:", user.uid);
      const fetchResources = async () => {
        try {
          const response = await fetch(`/api/get-resources?user_id=${user.uid}`);
          if (!response.ok) {
            const errorData = await response.json();
            console.error("API error:", {
              status: response.status,
              statusText: response.statusText,
              body: errorData,
            });
            throw new Error(errorData.error || `Failed to fetch resources: ${response.status} ${response.statusText}`);
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
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
    }
  };

  const extractDataFromScreenshot = async (formData: FormData): Promise<any> => {
    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY_1;
    const region = process.env.AZURE_DOCUMENT_INTELLIGENCE_REGION || "westus";

    if (!endpoint || !apiKey) {
      throw new Error("Azure Document Intelligence credentials are missing. Ensure AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_API_KEY_1 are set.");
    }

    console.log(`Initiating Azure AI Document Intelligence analysis in region: ${region}`);

    const analyzeUrl = `${endpoint}documentintelligence/documentModels/prebuilt-layout:analyze?api-version=2024-07-31-preview`;

    const analyzeResponse = await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      throw new Error(`Failed to analyze screenshot: ${analyzeResponse.statusText} - ${errorText}`);
    }

    const operationLocation = analyzeResponse.headers.get("Operation-Location");

    if (!operationLocation) {
      throw new Error("Operation-Location header not found in analyze response.");
    }

    console.log("Analysis started, polling for result...");

    let result;
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const pollResponse = await fetch(operationLocation, {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        throw new Error(`Failed to poll for result: ${pollResponse.statusText} - ${errorText}`);
      }

      result = await pollResponse.json();
      if (result.status === "succeeded") {
        console.log("Analysis succeeded.");
        break;
      } else if (result.status === "failed") {
        throw new Error("Document analysis failed: " + JSON.stringify(result.error));
      }
    }

    if (result.status !== "succeeded") {
      throw new Error("Document analysis did not complete in time.");
    }

    const extractedText = result.analyzeResult?.content || "";
    console.log("Extracted text:", extractedText);
    return parseOcrText(extractedText);
  };

  const parseOcrText = (text: string): any => {
    console.log("Parsing OCR text:", text);
    
    const lines = text.split("\n");
    let values: string[] = [];
    
    for (const line of lines) {
      const potentialValues = line.split(/\s+/).filter((word) => {
        return /^[0-9,.]+[MK]?$/.test(word) || /^[0-9,]+$/.test(word);
      });
      if (potentialValues.length >= 5) {
        values = potentialValues;
        break;
      }
    }

    if (values.length < 5) {
      throw new Error("Could not find enough resource values in the screenshot. Expected format: [food, oil, steel, mineral, uranium]");
    }

    const parseValue = (value: string): number => {
      value = value.replace(/,/g, "");
      if (value.endsWith("M")) {
        return parseFloat(value.replace("M", "")) * 1_000_000;
      } else if (value.endsWith("K")) {
        return parseFloat(value.replace("K", "")) * 1_000;
      }
      return parseInt(value) || 0;
    };

    return {
      food: parseValue(values[1]),
      oil: parseValue(values[2]),
      steel: parseValue(values[3]),
      mineral: parseValue(values[4]),
      uranium: parseValue(values[5]),
    };
  };

  const handleExtractData = async () => {
    if (!screenshot) {
      setError("Please upload a screenshot first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("screenshot", screenshot);

      const extractedData = await extractDataFromScreenshot(formDataToSend);

      setFormData({
        food: extractedData.food || 0,
        oil: extractedData.oil || 0,
        steel: extractedData.steel || 0,
        mineral: extractedData.mineral || 0,
        uranium: extractedData.uranium || 0,
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
              <button type="submit" className="bg-accent text-white p-2 rounded">
                Submit
              </button>
            </form>
          ) : (
            <div className="space-y-4">
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
                  <p>Uploaded: {screenshot.name}</p>
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
                      name Staffordshire="steel"
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
        <p>Redirecting to login...</p>
      )}
    </div>
  );
}
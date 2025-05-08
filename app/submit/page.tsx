"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import { useFormData } from "../../lib/useFormData";
import { parseOcrText } from "../../lib/parseOcrText";
import { FileUploader } from "../../components/FileUploader";
import { ProcessingIndicator } from "../../components/ProcessingIndicator";
import imageCompression from "browser-image-compression";

export default function Submit() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { formData, setFormData, fetchError } = useFormData(user);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageTitle, setCurrentImageTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dataComplete, setDataComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleExtractData = async (files: File[]) => {
    if (files.length === 0) {
      setError("Please upload at least one screenshot.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let extractedData = { ...formData };

      for (const file of files) {
        setCurrentImageTitle("Processing...");

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
        });

        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        const base64Image = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });

        if (!base64Image.startsWith("data:image/")) {
          throw new Error("Invalid image format: Base64 data does not start with 'data:image/'");
        }

        const base64Data = base64Image.split(",")[1];
        if (!base64Data) {
          throw new Error("Invalid base64 data: No data after splitting");
        }

        console.log("Base64 data length:", base64Data.length);
        console.log("Base64 data preview:", base64Data.substring(0, 100));

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
        const extractedText = data.extractedText || "";
        let imageTitle = "Unknown Image";
        if (extractedText.toLowerCase().includes("resources and speed up info")) {
          imageTitle = "Resources and Speed Up Info";
        } else if (extractedText.toLowerCase().includes("vip")) {
          imageTitle = "City Overview";
        } else if (extractedText.toLowerCase().includes("my info")) {
          imageTitle = "My Info";
        }
        setCurrentImageTitle(`Loading ${imageTitle}`);

        extractedData = {
          ...extractedData,
          ...parseOcrText(extractedText),
        };
      }

      if (!user || !user.id) {
        throw new Error("User authentication required. Please log in again.");
      }

      const response = await fetch("/api/submit-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          ...extractedData,
          troop_levels: {},
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Submit error:", result);
        throw new Error(result.error || `Failed to submit data: ${response.status} ${response.statusText}`);
      }

      setDataComplete(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Extraction error:", err);
      setError(`Failed to extract data: ${err.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
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
            <div className="space-y-6">
              <FileUploader
                onFilesSelected={(files) => {
                  setScreenshots(files);
                  handleExtractData(files);
                }}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
              />
              <ProcessingIndicator
                isProcessing={isProcessing}
                currentImageTitle={currentImageTitle}
                dataComplete={dataComplete}
              />
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
          </>
        ) : (
          <p className="text-light-text">Loading...</p>
        )}
      </div>
    </div>
  );
}
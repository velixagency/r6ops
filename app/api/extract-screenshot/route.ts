import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const screenshot = formData.get("screenshot");

    if (!screenshot || !(screenshot instanceof File)) {
      return NextResponse.json({ error: "No screenshot provided or invalid file" }, { status: 400 });
    }

    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY_1;
    const region = process.env.AZURE_DOCUMENT_INTELLIGENCE_REGION || "westus";

    if (!endpoint || !apiKey) {
      return NextResponse.json(
        { error: "Azure Document Intelligence credentials are missing" },
        { status: 500 }
      );
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
      console.error("Azure API error:", errorText);
      return NextResponse.json(
        { error: `Failed to analyze screenshot: ${analyzeResponse.statusText} - ${errorText}` },
        { status: analyzeResponse.status }
      );
    }

    const operationLocation = analyzeResponse.headers.get("Operation-Location");

    if (!operationLocation) {
      return NextResponse.json(
        { error: "Operation-Location header not found in analyze response" },
        { status: 500 }
      );
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
        console.error("Azure polling error:", errorText);
        return NextResponse.json(
          { error: `Failed to poll for result: ${pollResponse.statusText} - ${errorText}` },
          { status: pollResponse.status }
        );
      }

      result = await pollResponse.json();
      if (result.status === "succeeded") {
        console.log("Analysis succeeded.");
        break;
      } else if (result.status === "failed") {
        return NextResponse.json(
          { error: "Document analysis failed: " + JSON.stringify(result.error) },
          { status: 500 }
        );
      }
    }

    if (result.status !== "succeeded") {
      return NextResponse.json(
        { error: "Document analysis did not complete in time" },
        { status: 500 }
      );
    }

    const extractedText = result.analyzeResult?.content || "";
    console.log("Extracted text:", extractedText);

    const parseOcrText = (text: string): any => {
      console.log("Parsing OCR text:", text);

      const lines = text.split("\n");
      let values: string[] = [];

      for (const line of lines) {
        const potentialValues = line.split(/\s+/).filter((word) => {
          return /^[0-9,.]+[MK]?$/.test(word) || /^[0-9,]+$/.test(word);
        });
        if (potentialValues.length >= 6) {
          values = potentialValues;
          break;
        }
      }

      if (values.length < 6) {
        console.error("Found values:", values);
        throw new Error("Could not find enough resource values in the screenshot. Expected 6 values in the format: [unknown, food, oil, steel, mineral, uranium]");
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

      const parsedValues = {
        food: parseValue(values[1]),
        oil: parseValue(values[2]),
        steel: parseValue(values[3]),
        mineral: parseValue(values[4]),
        uranium: parseValue(values[5]),
      };

      console.log("Parsed resource values:", parsedValues);
      return parsedValues;
    };

    const parsedData = parseOcrText(extractedText);
    return NextResponse.json({ data: parsedData });
  } catch (err: any) {
    console.error("Unexpected error in extract-screenshot:", err);
    return NextResponse.json(
      { error: `Unexpected error: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
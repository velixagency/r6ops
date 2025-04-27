import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

// Initialize the Google Cloud Vision client using Application Default Credentials (ADC)
const client = new vision.ImageAnnotatorClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const screenshot = formData.get("screenshot");

    if (!screenshot || !(screenshot instanceof File)) {
      return NextResponse.json({ error: "No screenshot provided or invalid file" }, { status: 400 });
    }

    // Convert the File to a Buffer
    const buffer = Buffer.from(await screenshot.arrayBuffer());

    // Use Google Cloud Vision API to extract text from the image
    const [result] = await client.textDetection({
      image: {
        content: buffer,
      },
    });

    const extractedText = result.textAnnotations?.[0]?.description || "";
    console.log("Extracted text:", extractedText);

    const parseOcrText = (text: string): any => {
      console.log("Parsing OCR text:", text);

      const lines = text.split("\n");
      const data: { [key: string]: number } = {
        food: 0,
        oil: 0,
        steel: 0,
        mineral: 0,
        uranium: 0,
      };

      // Look for lines containing resource labels and extract the first numerical value after the label
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes("food")) {
          const match = line.match(/food\s+([\d,.]+[MK]?)/i);
          if (match) data.food = parseValue(match[1]);
        } else if (lowerLine.includes("oil")) {
          const match = line.match(/oil\s+([\d,.]+[MK]?)/i);
          if (match) data.oil = parseValue(match[1]);
        } else if (lowerLine.includes("steel")) {
          const match = line.match(/steel\s+([\d,.]+[MK]?)/i);
          if (match) data.steel = parseValue(match[1]);
        } else if (lowerLine.includes("mineral")) {
          const match = line.match(/mineral(?:s)?\s+([\d,.]+[MK]?)/i);
          if (match) data.mineral = parseValue(match[1]);
        } else if (lowerLine.includes("uranium")) {
          const match = line.match(/uranium\s+([\d,.]+[MK]?)/i);
          if (match) data.uranium = parseValue(match[1]);
        }
      }

      console.log("Parsed resource values:", data);
      return data;
    };

    const parseValue = (value: string): number => {
      value = value.replace(/,/g, "");
      if (value.endsWith("M")) {
        return parseFloat(value.replace("M", "")) * 1_000_000;
      } else if (value.endsWith("K")) {
        return parseFloat(value.replace("K", "")) * 1_000;
      }
      return parseInt(value) || 0;
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
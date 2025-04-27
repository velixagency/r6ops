import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

// Initialize the Google Cloud Vision client using Application Default Credentials (ADC)
const client = new vision.ImageAnnotatorClient();

export async function POST(request: Request) {
  try {
    // Parse the JSON body containing the base64 image
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    // Convert the base64 string to a Buffer
    const buffer = Buffer.from(image, "base64");

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

      const lines = text.split("\n").map(line => line.trim());
      const data: { [key: string]: number } = {
        food: 0,
        oil: 0,
        steel: 0,
        mineral: 0,
        uranium: 0,
      };

      // Iterate through lines and look for resource labels
      for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();
        let nextLine = i + 1 < lines.length ? lines[i + 1] : null;

        if (lowerLine.includes("food")) {
          if (nextLine) {
            const match = nextLine.match(/([\d,.]+[MK]?)/i);
            console.log(`Food line: "${lines[i]}", Next line: "${nextLine}", Match:`, match);
            if (match) data.food = parseValue(match[1]);
          }
        } else if (lowerLine.includes("oil")) {
          if (nextLine) {
            const match = nextLine.match(/([\d,.]+[MK]?)/i);
            console.log(`Oil line: "${lines[i]}", Next line: "${nextLine}", Match:`, match);
            if (match) data.oil = parseValue(match[1]);
          }
        } else if (lowerLine.includes("steel")) {
          if (nextLine) {
            const match = nextLine.match(/([\d,.]+[MK]?)/i);
            console.log(`Steel line: "${lines[i]}", Next line: "${nextLine}", Match:`, match);
            if (match) data.steel = parseValue(match[1]);
          }
        } else if (lowerLine.includes("mineral")) {
          if (nextLine) {
            const match = nextLine.match(/([\d,.]+[MK]?)/i);
            console.log(`Mineral line: "${lines[i]}", Next line: "${nextLine}", Match:`, match);
            if (match) data.mineral = parseValue(match[1]);
          }
        } else if (lowerLine.includes("uranium")) {
          if (nextLine) {
            const match = nextLine.match(/([\d,.]+[MK]?)/i);
            console.log(`Uranium line: "${lines[i]}", Next line: "${nextLine}", Match:`, match);
            if (match) data.uranium = parseValue(match[1]);
          }
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
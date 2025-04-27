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
      const lines = text.split("\n").map(line => line.trim());
      const data: { [key: string]: number } = {
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
      };

      // Helper function to find the next duration line starting from a given index
      const findNextDuration = (startIndex: number): { duration: string | null, nextIndex: number } => {
        for (let j = startIndex; j < lines.length; j++) {
          const match = lines[j].match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i);
          if (match) {
            return { duration: match[0], nextIndex: j + 1 };
          }
        }
        return { duration: null, nextIndex: startIndex };
      };

      // Iterate through lines and look for resource labels and speed-up values
      for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();

        // Resource parsing
        if (lowerLine.includes("food")) {
          let match = lines[i].match(/food\s*([\d,.]+[MK]?)(?=\s|$)/i);
          if (match) {
            data.food = parseValue(match[1]);
          } else {
            const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
            if (nextLine) {
              match = nextLine.match(/([\d,.]+[MK]?)/i);
              if (match) data.food = parseValue(match[1]);
            }
          }
        } else if (lowerLine.includes("oil")) {
          let match = lines[i].match(/oil\s*([\d,.]+[MK]?)(?=\s|$)/i);
          if (match) {
            data.oil = parseValue(match[1]);
          } else {
            const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
            if (nextLine) {
              match = nextLine.match(/([\d,.]+[MK]?)/i);
              if (match) data.oil = parseValue(match[1]);
            }
          }
        } else if (lowerLine.includes("steel")) {
          let match = lines[i].match(/steel\s*([\d,.]+[MK]?)(?=\s|$)/i);
          if (match) {
            data.steel = parseValue(match[1]);
          } else {
            const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
            if (nextLine) {
              match = nextLine.match(/([\d,.]+[MK]?)/i);
              if (match) data.steel = parseValue(match[1]);
            }
          }
        } else if (lowerLine.includes("mineral")) {
          let match = lines[i].match(/mineral(?:s)?\s*([\d,.]+[MK]?)(?=\s|$)/i);
          if (match) {
            data.mineral = parseValue(match[1]);
          } else {
            const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
            if (nextLine) {
              match = nextLine.match(/([\d,.]+[MK]?)/i);
              if (match) data.mineral = parseValue(match[1]);
            }
          }
        } else if (lowerLine.includes("uranium")) {
          let match = lines[i].match(/uranium\s*([\d,.]+[MK]?)(?=\s|$)/i);
          if (match) {
            data.uranium = parseValue(match[1]);
          } else {
            const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
            if (nextLine) {
              match = nextLine.match(/([\d,.]+[MK]?)/i);
              if (match) data.uranium = parseValue(match[1]);
            }
          }
        }
        // Speed-up parsing
        else if (lowerLine.includes("total speed up time")) {
          // Look for the next duration after "Total Speed Up Time"
          const { duration, nextIndex } = findNextDuration(i + 1);
          console.log(`Speed Up - Total Speed Up Time line: "${lines[i]}", Duration: "${duration}"`);
          if (duration) {
            const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i);
            console.log(`Speed Up - Regex match:`, match);
            if (match) {
              const days = match[1] ? parseInt(match[1].replace("d", "")) : 0;
              const timeParts = match[2].split(":").map(part => parseInt(part));
              const hours = timeParts[0] || 0;
              const minutes = timeParts[1] || 0;
              const seconds = timeParts[2] || 0;
              data.speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
              console.log(`Speed Up - Calculated: days=${days}, hours=${hours}, minutes=${minutes}, seconds=${seconds}, total=${data.speed_up}`);
            }
            i = nextIndex - 1; // Adjust the index to continue from the duration line
          }
        } else if (lowerLine.includes("building speed up")) {
          const { duration, nextIndex } = findNextDuration(i + 1);
          console.log(`Building Speed Up - Line: "${lines[i]}", Duration: "${duration}"`);
          if (duration) {
            const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i);
            console.log(`Building Speed Up - Regex match:`, match);
            if (match) {
              const days = match[1] ? parseInt(match[1].replace("d", "")) : 0;
              const timeParts = match[2].split(":").map(part => parseInt(part));
              const hours = timeParts[0] || 0;
              const minutes = timeParts[1] || 0;
              const seconds = timeParts[2] || 0;
              data.building_speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
              console.log(`Building Speed Up - Calculated: days=${days}, hours=${hours}, minutes=${minutes}, seconds=${seconds}, total=${data.building_speed_up}`);
            }
            i = nextIndex - 1;
          }
        } else if (lowerLine.includes("healing speed up")) {
          const { duration, nextIndex } = findNextDuration(i + 1);
          console.log(`Healing Speed Up - Line: "${lines[i]}", Duration: "${duration}"`);
          if (duration) {
            const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i);
            console.log(`Healing Speed Up - Regex match:`, match);
            if (match) {
              const days = match[1] ? parseInt(match[1].replace("d", "")) : 0;
              const timeParts = match[2].split(":").map(part => parseInt(part));
              const hours = timeParts[0] || 0;
              const minutes = timeParts[1] || 0;
              const seconds = timeParts[2] || 0;
              data.healing_speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
              console.log(`Healing Speed Up - Calculated: days=${days}, hours=${hours}, minutes=${minutes}, seconds=${seconds}, total=${data.healing_speed_up}`);
            }
            i = nextIndex - 1;
          }
        } else if (lowerLine.includes("recruitment speed up")) {
          const { duration, nextIndex } = findNextDuration(i + 1);
          console.log(`Recruitment Speed Up - Line: "${lines[i]}", Duration: "${duration}"`);
          if (duration) {
            const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i);
            console.log(`Recruitment Speed Up - Regex match:`, match);
            if (match) {
              const days = match[1] ? parseInt(match[1].replace("d", "")) : 0;
              const timeParts = match[2].split(":").map(part => parseInt(part));
              const hours = timeParts[0] || 0;
              const minutes = timeParts[1] || 0;
              const seconds = timeParts[2] || 0;
              data.recruitment_speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
              console.log(`Recruitment Speed Up - Calculated: days=${days}, hours=${hours}, minutes=${minutes}, seconds=${seconds}, total=${data.recruitment_speed_up}`);
            }
            i = nextIndex - 1;
          }
        } else if (lowerLine.includes("research speed up")) {
          const { duration, nextIndex } = findNextDuration(i + 1);
          console.log(`Research Speed Up - Line: "${lines[i]}", Duration: "${duration}"`);
          if (duration) {
            const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i);
            console.log(`Research Speed Up - Regex match:`, match);
            if (match) {
              const days = match[1] ? parseInt(match[1].replace("d", "")) : 0;
              const timeParts = match[2].split(":").map(part => parseInt(part));
              const hours = timeParts[0] || 0;
              const minutes = timeParts[1] || 0;
              const seconds = timeParts[2] || 0;
              data.research_speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
              console.log(`Research Speed Up - Calculated: days=${days}, hours=${hours}, minutes=${minutes}, seconds=${seconds}, total=${data.research_speed_up}`);
            }
            i = nextIndex - 1;
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
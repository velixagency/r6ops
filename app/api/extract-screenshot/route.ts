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
    let buffer;
    try {
      buffer = Buffer.from(image, "base64");
    } catch (err) {
      console.error("Failed to convert base64 to buffer:", err);
      return NextResponse.json({ error: "Invalid base64 image data" }, { status: 400 });
    }

    // Use Google Cloud Vision API to extract text from the image
    let result;
    try {
      [result] = await client.textDetection({
        image: {
          content: buffer,
        },
      });
    } catch (err) {
      console.error("Vision API error:", err);
      return NextResponse.json(
        { error: `Vision API error: ${err.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    const extractedText = result.textAnnotations?.[0]?.description || "";
    console.log("Extracted text:", extractedText);

    const parseOcrText = (text: string): any => {
      const lines = text.split("\n").map(line => line.trim());
      const data: { [key: string]: number } = {
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
      };

      // Helper function to find the next duration line starting from a given index
      const findNextDuration = (startIndex: number): { duration: string | null, nextIndex: number } => {
        for (let j = startIndex; j < lines.length; j++) {
          const match = lines[j].match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i);
          if (match) {
            return { duration: match[0], nextIndex: j + 1 };
          }
          // Also match MM:SS format (e.g., 50:00, 35:00)
          const shortMatch = lines[j].match(/(\d{1,2}:\d{2})/i);
          if (shortMatch) {
            return { duration: shortMatch[0], nextIndex: j + 1 };
          }
        }
        return { duration: null, nextIndex: startIndex };
      };

      // Helper function to find the next numerical value starting from a given index
      const findNextValue = (startIndex: number): { value: string | null, nextIndex: number } => {
        for (let j = startIndex; j < lines.length; j++) {
          const match = lines[j].match(/([\d,.]+[MK]?)/i);
          if (match) {
            return { value: match[1], nextIndex: j + 1 };
          }
        }
        return { value: null, nextIndex: startIndex };
      };

      // Iterate through lines and look for resource labels, speed-up values, and VIP level
      for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();

        // Resource parsing (look for "Total Resources" values, which are the second values after the label)
        if (lowerLine.includes("food")) {
          const { value: firstValue, nextIndex: idxAfterFirst } = findNextValue(i + 1);
          if (firstValue) {
            const { value: secondValue } = findNextValue(idxAfterFirst);
            if (secondValue) {
              data.food = parseValue(secondValue);
            }
          }
          i = idxAfterFirst - 1;
        } else if (lowerLine.includes("oil")) {
          const { value: firstValue, nextIndex: idxAfterFirst } = findNextValue(i + 1);
          if (firstValue) {
            const { value: secondValue } = findNextValue(idxAfterFirst);
            if (secondValue) {
              data.oil = parseValue(secondValue);
            }
          }
          i = idxAfterFirst - 1;
        } else if (lowerLine.includes("steel")) {
          const { value: firstValue, nextIndex: idxAfterFirst } = findNextValue(i + 1);
          if (firstValue) {
            const { value: secondValue } = findNextValue(idxAfterFirst);
            if (secondValue) {
              data.steel = parseValue(secondValue);
            }
          }
          i = idxAfterFirst - 1;
        } else if (lowerLine.includes("mineral")) {
          const { value: firstValue, nextIndex: idxAfterFirst } = findNextValue(i + 1);
          if (firstValue) {
            const { value: secondValue } = findNextValue(idxAfterFirst);
            if (secondValue) {
              data.mineral = parseValue(secondValue);
            }
          }
          i = idxAfterFirst - 1;
        }
        // Speed-up parsing
        else if (lowerLine.includes("total speed up time")) {
          // Look for the next "Speed Up" label to ensure we're matching the correct duration
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].toLowerCase().includes("speed up") && !lines[j].toLowerCase().includes("building") && !lines[j].toLowerCase().includes("healing") && !lines[j].toLowerCase().includes("recruitment") && !lines[j].toLowerCase().includes("research")) {
              const { duration, nextIndex } = findNextDuration(j + 1);
              if (duration) {
                console.log(`Parsing Speed Up duration: ${duration}`);
                const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i) || duration.match(/(\d{1,2}:\d{2})/i);
                if (match) {
                  let days = 0, hours = 0, minutes = 0, seconds = 0;
                  if (match[1] && match[1].endsWith("d")) {
                    // Format: "2d 12:40:00"
                    days = parseInt(match[1].replace("d", "")) || 0;
                    const timeParts = match[2].split(":").map(part => parseInt(part));
                    hours = timeParts[0] || 0;
                    minutes = timeParts[1] || 0;
                    seconds = timeParts[2] || 0;
                  } else if (match[0].includes(":")) {
                    // Format: "50:00" or "01:10:00"
                    const timeParts = match[0].split(":").map(part => parseInt(part));
                    if (timeParts.length === 3) {
                      hours = timeParts[0] || 0;
                      minutes = timeParts[1] || 0;
                      seconds = timeParts[2] || 0;
                    } else if (timeParts.length === 2) {
                      minutes = timeParts[0] || 0;
                      seconds = timeParts[1] || 0;
                    }
                  }
                  data.speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
                }
              }
              i = nextIndex - 1;
              break;
            }
          }
        } else if (lowerLine.includes("building speed up")) {
          const { duration, nextIndex } = findNextDuration(i + 1);
          if (duration) {
            console.log(`Parsing Building Speed Up duration: ${duration}`);
            const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i) || duration.match(/(\d{1,2}:\d{2})/i);
            if (match) {
              let days = 0, hours = 0, minutes = 0, seconds = 0;
              if (match[1] && match[1].endsWith("d")) {
                days = parseInt(match[1].replace("d", "")) || 0;
                const timeParts = match[2].split(":").map(part => parseInt(part));
                hours = timeParts[0] || 0;
                minutes = timeParts[1] || 0;
                seconds = timeParts[2] || 0;
              } else if (match[0].includes(":")) {
                const timeParts = match[0].split(":").map(part => parseInt(part));
                if (timeParts.length === 3) {
                  hours = timeParts[0] || 0;
                  minutes = timeParts[1] || 0;
                  seconds = timeParts[2] || 0;
                } else if (timeParts.length === 2) {
                  minutes = timeParts[0] || 0;
                  seconds = timeParts[1] || 0;
                }
              }
              data.building_speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
            }
            i = nextIndex - 1;
          }
        } else if (lowerLine.includes("healing speed up")) {
          const { duration, nextIndex } = findNextDuration(i + 1);
          if (duration) {
            console.log(`Parsing Healing Speed Up duration: ${duration}`);
            const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i) || duration.match(/(\d{1,2}:\d{2})/i);
            if (match) {
              let days = 0, hours = 0, minutes = 0, seconds = 0;
              if (match[1] && match[1].endsWith("d")) {
                days = parseInt(match[1].replace("d", "")) || 0;
                const timeParts = match[2].split(":").map(part => parseInt(part));
                hours = timeParts[0] || 0;
                minutes = timeParts[1] || 0;
                seconds = timeParts[2] || 0;
              } else if (match[0].includes(":")) {
                const timeParts = match[0].split(":").map(part => parseInt(part));
                if (timeParts.length === 3) {
                  hours = timeParts[0] || 0;
                  minutes = timeParts[1] || 0;
                  seconds = timeParts[2] || 0;
                } else if (timeParts.length === 2) {
                  minutes = timeParts[0] || 0;
                  seconds = timeParts[1] || 0;
                }
              }
              data.healing_speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
            }
            i = nextIndex - 1;
          }
        } else if (lowerLine.includes("recruitment speed up")) {
          const { duration, nextIndex } = findNextDuration(i + 1);
          if (duration) {
            console.log(`Parsing Recruitment Speed Up duration: ${duration}`);
            const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i) || duration.match(/(\d{1,2}:\d{2})/i);
            if (match) {
              let days = 0, hours = 0, minutes = 0, seconds = 0;
              if (match[1] && match[1].endsWith("d")) {
                days = parseInt(match[1].replace("d", "")) || 0;
                const timeParts = match[2].split(":").map(part => parseInt(part));
                hours = timeParts[0] || 0;
                minutes = timeParts[1] || 0;
                seconds = timeParts[2] || 0;
              } else if (match[0].includes(":")) {
                const timeParts = match[0].split(":").map(part => parseInt(part));
                if (timeParts.length === 3) {
                  hours = timeParts[0] || 0;
                  minutes = timeParts[1] || 0;
                  seconds = timeParts[2] || 0;
                } else if (timeParts.length === 2) {
                  minutes = timeParts[0] || 0;
                  seconds = timeParts[1] || 0;
                }
              }
              data.recruitment_speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
            }
            i = nextIndex - 1;
          }
        } else if (lowerLine.includes("research speed up")) {
          const { duration, nextIndex } = findNextDuration(i + 1);
          if (duration) {
            console.log(`Parsing Research Speed Up duration: ${duration}`);
            const match = duration.match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i) || duration.match(/(\d{1,2}:\d{2})/i);
            if (match) {
              let days = 0, hours = 0, minutes = 0, seconds = 0;
              if (match[1] && match[1].endsWith("d")) {
                days = parseInt(match[1].replace("d", "")) || 0;
                const timeParts = match[2].split(":").map(part => parseInt(part));
                hours = timeParts[0] || 0;
                minutes = timeParts[1] || 0;
                seconds = timeParts[2] || 0;
              } else if (match[0].includes(":")) {
                const timeParts = match[0].split(":").map(part => parseInt(part));
                if (timeParts.length === 3) {
                  hours = timeParts[0] || 0;
                  minutes = timeParts[1] || 0;
                  seconds = timeParts[2] || 0;
                } else if (timeParts.length === 2) {
                  minutes = timeParts[0] || 0;
                  seconds = timeParts[1] || 0;
                }
              }
              data.research_speed_up = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
            }
            i = nextIndex - 1;
          }
        }
        // VIP Level parsing
        else if (lowerLine.includes("vip")) {
          const match = lines[i].match(/VIP\s*(\d+)/i);
          if (match) {
            data.vip_level = parseInt(match[1]) || 0;
          }
        }
      }

      console.log("Parsed resource values:", data);
      return data;
    };

    const parseValue = (value: string): number => {
      value = value.replace(/,/g, ""); // Remove commas
      if (value.endsWith("M")) {
        return parseFloat(value.replace("M", "")) * 1_000_000;
      } else if (value.endsWith("K")) {
        return parseFloat(value.replace("K", "")) * 1_000;
      }
      return parseFloat(value) || 0;
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
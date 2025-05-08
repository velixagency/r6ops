import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

// Initialize the Google Cloud Vision client using Application Default Credentials (ADC)
const client = new vision.ImageAnnotatorClient();

// Log credential setup for debugging
console.log("Google Cloud Vision client initialized. Credentials:", process.env.GOOGLE_APPLICATION_CREDENTIALS || "No GOOGLE_APPLICATION_CREDENTIALS set");

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    // Validate base64 string
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(image)) {
      console.error("Invalid base64 string received:", image.substring(0, 100));
      return NextResponse.json({ error: "Invalid base64 image data: Malformed base64 string" }, { status: 400 });
    }

    const buffer = Buffer.from(image, "base64");

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
      const data: { [key: string]: any } = {
        food: 0,
        oil: 0,
        steel: 0,
        mineral: 0,
        speed_up: 0,
        building_speed_up: 0,
        healing_speed_up: 0,
        recruitment_speed_up: 0,
        research_speed_up: 0,
        vip_level: 0,
        user_id_value: 0,
        nation: '',
        power_rank: 0,
        battle_power: 0,
        enemy_units_killed: 0,
        defense_victory: 0,
        siege_victory: 0,
        losses: 0,
        sieges_failed: 0,
        individual_reputation: 0,
        defense_against_biochemical_zombies_boost: 0,
        enemy_melee_attack_reduction: 0,
        enemy_mid_range_attack_reduction: 0,
        enemy_long_range_attack_reduction: 0,
        enemy_biochemical_zombie_attack_reduction: 0,
        enemy_melee_defense_reduction: 0,
        enemy_mid_range_defense_reduction: 0,
        enemy_long_range_defense_reduction: 0,
        enemy_biochemical_zombie_defense_reduction: 0,
        oil_boost: 0,
        oil_boost_bonus: 0,
        steel_boost: 0,
        steel_boost_bonus: 0,
        mineral_production: 0,
        mineral_production_bonus: 0,
        food_boost: 0,
        food_boost_bonus: 0,
        food_gather_bonus: 0,
        oil_gather_bonus: 0,
        steel_gather_bonus: 0,
        mineral_gather_bonus: 0,
        gold_gather_bonus: 0,
        building_speed_additional_bonus: 0,
        technology_research: 0,
        load_boost: 0,
        monster_attack_speed: 0,
        mobility_recovery: '',
        healing_speed: 0,
        increase_max_wounded_units: 0,
        increase_max_wounded_units_bonus: 0,
        vehicle_queue: 0,
        vehicle_queue_bonus: 0,
        fleet_troops_units_limit: 0,
        fleet_troops_units_limit_bonus: 0,
        cross_nation_battle_troops_expansion: 0,
        fleet_speed: 0,
        recruitment_speed_up_stat: 0,
        melee_attack: 0,
        melee_defense: 0,
        melee_hp: 0,
        mid_range_attack: 0,
        mid_range_defense: 0,
        mid_range_hp: 0,
        long_range_attack: 0,
        long_range_defense: 0,
        long_range_hp: 0,
        increases_damage_to_long_range_troops: 0,
        increases_damage_to_mid_range_troops: 0,
        increases_damage_to_melee_troops: 0,
        reduces_damage_taken_from_long_range_troops: 0,
        reduces_damage_taken_from_mid_range_troops: 0,
        reduces_damage_taken_from_melee_troops: 0,
        biochemical_zombies_recruit_speed_boost: 0,
        biochemical_materials_collection_rate_boost: 0,
        biochemical_zombies_attack_boost: 0,
        biochemical_zombies_hp_boost: 0,
        biochemical_zombies_defense_boost: 0,
        biochemical_materials_collection_boost: 0,
        biochemical_zombies_recruit_limit_boost: 0,
        biochemical_zombie_army_limit_boost: 0,
        biochemical_zombies_limit_boost: 0,
        all_troops_block: 0,
        all_troops_block_percentage: 0,
        all_troops_disruptor_resistance: 0,
        all_troops_disruptor_resistance_percentage: 0,
        all_troops_misfire_resistance: 0,
        all_troops_misfire_resistance_percentage: 0,
        cross_nation_battle_melee_attack: 0,
        cross_nation_battle_melee_defense: 0,
        cross_nation_battle_melee_hp: 0,
        cross_nation_battle_mid_range_attack: 0,
        cross_nation_battle_mid_range_defense: 0,
        cross_nation_battle_mid_range_hp: 0,
        cross_nation_battle_long_range_attack: 0,
        cross_nation_battle_long_range_defense: 0,
        cross_nation_battle_long_range_hp: 0,
        cross_nation_battle_biochemical_zombies_attack: 0,
        cross_nation_battle_biochemical_zombies_defense: 0,
        cross_nation_battle_biochemical_zombies_hp: 0,
        attack_against_melee_boost: 0,
        attack_against_mid_range_boost: 0,
        attack_against_long_range_boost: 0,
        attack_against_biochemical_zombies_boost: 0,
        defense_against_melee_boost: 0,
        defense_against_mid_range_boost: 0,
        defense_against_long_range_boost: 0,
        exp_current: 0,
        exp_total: 0,
        gas_current: 0,
        gas_total: 0,
      };

      const findNextDuration = (startIndex: number): { duration: string | null, nextIndex: number } => {
        for (let j = startIndex; j < lines.length; j++) {
          const match = lines[j].match(/(\d+d)?\s*(\d{1,2}:\d{2}:\d{2})/i);
          if (match) {
            return { duration: match[0], nextIndex: j + 1 };
          }
          const shortMatch = lines[j].match(/(\d{1,2}:\d{2})/i);
          if (shortMatch) {
            return { duration: shortMatch[0], nextIndex: j + 1 };
          }
        }
        return { duration: null, nextIndex: startIndex };
      };

      const findNextValue = (startIndex: number): { value: string | null, nextIndex: number } => {
        for (let j = startIndex; j < lines.length; j++) {
          const match = lines[j].match(/([\d,.]+[MK]?)/i);
          if (match) {
            return { value: match[1], nextIndex: j + 1 };
          }
        }
        return { value: null, nextIndex: startIndex };
      };

      const parsePercentageOrNumber = (value: string): number => {
        value = value.replace(/,/g, "").replace("%", "");
        return parseFloat(value) || 0;
      };

      const parseValueWithUnit = (value: string, unit: string): number => {
        value = value.replace(/,/g, "").replace(unit, "");
        return parseFloat(value) || 0;
      };

      const parseCombinedValue = (value: string): { base: number, bonus: number } => {
        const parts = value.replace(/,/g, "").split("+");
        return {
          base: parseFloat(parts[0]) || 0,
          bonus: parts[1] ? parseFloat(parts[1]) || 0 : 0,
        };
      };

      const parseValueWithPercentage = (value: string): { base: number, percentage: number } => {
        const match = value.match(/([\d.]+)\s*\(([\d.]+)%\)/i);
        if (match) {
          return {
            base: parseFloat(match[1]) || 0,
            percentage: parseFloat(match[2]) || 0,
          };
        }
        return { base: 0, percentage: 0 };
      };

      const parseSlashValue = (value: string): { current: number, total: number } => {
        const match = value.match(/([\d,]+)\/([\d,]+)/);
        if (match) {
          return {
            current: parseInt(match[1].replace(/,/g, "")) || 0,
            total: parseInt(match[2].replace(/,/g, "")) || 0,
          };
        }
        return { current: 0, total: 0 };
      };

      for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();

        if (lowerLine.includes("food") && !lowerLine.includes("food boost") && !lowerLine.includes("food gather")) {
          const { value: firstValue, nextIndex: idxAfterFirst } = findNextValue(i + 1);
          if (firstValue) {
            const { value: secondValue } = findNextValue(idxAfterFirst);
            if (secondValue) {
              data.food = parseValue(secondValue);
            }
          }
          i = idxAfterFirst - 1;
        } else if (lowerLine.includes("oil") && !lowerLine.includes("oil boost") && !lowerLine.includes("oil gather")) {
          const { value: firstValue, nextIndex: idxAfterFirst } = findNextValue(i + 1);
          if (firstValue) {
            const { value: secondValue } = findNextValue(idxAfterFirst);
            if (secondValue) {
              data.oil = parseValue(secondValue);
            }
          }
          i = idxAfterFirst - 1;
        } else if (lowerLine.includes("steel") && !lowerLine.includes("steel boost") && !lowerLine.includes("steel gather")) {
          const { value: firstValue, nextIndex: idxAfterFirst } = findNextValue(i + 1);
          if (firstValue) {
            const { value: secondValue } = findNextValue(idxAfterFirst);
            if (secondValue) {
              data.steel = parseValue(secondValue);
            }
          }
          i = idxAfterFirst - 1;
        } else if (lowerLine.includes("mineral") && !lowerLine.includes("mineral production") && !lowerLine.includes("mineral gather")) {
          const { value: firstValue, nextIndex: idxAfterFirst } = findNextValue(i + 1);
          if (firstValue) {
            const { value: secondValue } = findNextValue(idxAfterFirst);
            if (secondValue) {
              data.mineral = parseValue(secondValue);
            }
          }
          i = idxAfterFirst - 1;
        } else if (lowerLine.includes("total speed up time")) {
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].toLowerCase().includes("speed up") && !lines[j].toLowerCase().includes("building") && !lines[j].toLowerCase().includes("healing") && !lines[j].toLowerCase().includes("recruitment") && !lines[j].toLowerCase().includes("research")) {
              const { duration, nextIndex } = findNextDuration(j + 1);
              if (duration) {
                console.log(`Parsing Speed Up duration: ${duration}`);
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
        } else if (lowerLine.includes("vip")) {
          const match = lines[i].match(/VIP\s*(\d+)/i);
          if (match) {
            data.vip_level = parseInt(match[1]) || 0;
          }
        } else if (lowerLine.includes("user id")) {
          const match = lines[i].match(/USER ID:\s*(\d+)/i);
          if (match) {
            data.user_id_value = parseInt(match[1]) || 0;
          }
        } else if (lowerLine.includes("nation")) {
          const match = lines[i].match(/NATION:\s*(#\d+)/i);
          if (match) {
            data.nation = match[1] || '';
          }
        } else if (lowerLine.includes("power rank")) {
          const match = lines[i + 1].match(/RANK\s*(\d+)/i);
          if (match) {
            data.power_rank = parseInt(match[1]) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("battle power")) {
          const match = lines[i + 1].match(/([\d,]+)/);
          if (match) {
            data.battle_power = parseInt(match[1].replace(/,/g, "")) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("enemy units killed")) {
          const match = lines[i + 1].match(/([\d,]+)/);
          if (match) {
            data.enemy_units_killed = parseInt(match[1].replace(/,/g, "")) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("defense victory")) {
          const match = lines[i + 1].match(/(\d+)/);
          if (match) {
            data.defense_victory = parseInt(match[1]) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("siege victory")) {
          const match = lines[i + 1].match(/([\d,]+)/);
          if (match) {
            data.siege_victory = parseInt(match[1].replace(/,/g, "")) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("losses")) {
          const match = lines[i + 1].match(/([\d,]+)/);
          if (match) {
            data.losses = parseInt(match[1].replace(/,/g, "")) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("sieges failed")) {
          const match = lines[i + 1].match(/(\d+)/);
          if (match) {
            data.sieges_failed = parseInt(match[1]) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("individual reputation")) {
          const match = lines[i + 1].match(/([\d,]+)/);
          if (match) {
            data.individual_reputation = parseInt(match[1].replace(/,/g, "")) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("exp")) {
          const match = lines[i + 1].match(/([\d,]+)\/([\d,]+)/);
          if (match) {
            const { current, total } = parseSlashValue(match[0]);
            data.exp_current = current;
            data.exp_total = total;
            i += 1;
          }
        } else if (lowerLine.includes("gas")) {
          const match = lines[i + 1].match(/(\d+)\/(\d+)/);
          if (match) {
            const { current, total } = parseSlashValue(match[0]);
            data.gas_current = current;
            data.gas_total = total;
            i += 1;
          }
        } else if (lowerLine.includes("defense against biochemical zombies boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.defense_against_biochemical_zombies_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("enemy melee attack reduction")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.enemy_melee_attack_reduction = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("enemy mid-range attack reduction")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.enemy_mid_range_attack_reduction = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("enemy long-range attack reduction")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.enemy_long_range_attack_reduction = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("enemy biochemical zombie attack reduction")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.enemy_biochemical_zombie_attack_reduction = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("enemy melee defense reduction")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.enemy_melee_defense_reduction = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("enemy mid-range defense reduction")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.enemy_mid_range_defense_reduction = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("enemy long-range defense reduction")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.enemy_long_range_defense_reduction = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("enemy biochemical zombie defense reduction")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.enemy_biochemical_zombie_defense_reduction = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("oil boost")) {
          const match = lines[i + 1].match(/([\d,]+)\/h\s*\+([\d.]+)\/h/i);
          if (match) {
            data.oil_boost = parseValueWithUnit(match[1], "/h");
            data.oil_boost_bonus = parseFloat(match[2]) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("steel boost")) {
          const match = lines[i + 1].match(/([\d,]+)\/h\s*\+([\d.]+)\/h/i);
          if (match) {
            data.steel_boost = parseValueWithUnit(match[1], "/h");
            data.steel_boost_bonus = parseFloat(match[2]) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("mineral production")) {
          const match = lines[i + 1].match(/([\d,]+)\/h\s*\+([\d.]+)\/h/i);
          if (match) {
            data.mineral_production = parseValueWithUnit(match[1], "/h");
            data.mineral_production_bonus = parseFloat(match[2]) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("food boost")) {
          const match = lines[i + 1].match(/([\d,]+)\/h\s*\+([\d.]+)\/h/i);
          if (match) {
            data.food_boost = parseValueWithUnit(match[1], "/h");
            data.food_boost_bonus = parseFloat(match[2]) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("food gather bonus")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.food_gather_bonus = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("oil gather bonus")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.oil_gather_bonus = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("steel gather bonus")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.steel_gather_bonus = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("mineral gather bonus")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.mineral_gather_bonus = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("gold gather bonus")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.gold_gather_bonus = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("building speed additional bonus")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.building_speed_additional_bonus = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("technology research")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.technology_research = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("load boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.load_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("monster attack speed")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.monster_attack_speed = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("mobility recovery")) {
          const match = lines[i + 1].match(/\+(\d+\/\d+Sec)/i);
          if (match) {
            data.mobility_recovery = match[1] || '';
            i += 1;
          }
        } else if (lowerLine.includes("healing speed")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.healing_speed = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("increase max wounded units")) {
          const match = lines[i + 1].match(/([\d,]+)\s*\+([\d,]+)/i);
          if (match) {
            const { base, bonus } = parseCombinedValue(match[0]);
            data.increase_max_wounded_units = base;
            data.increase_max_wounded_units_bonus = bonus;
            i += 1;
          }
        } else if (lowerLine.includes("vehicle queue")) {
          const match = lines[i + 1].match(/(\d+)\s*\+(\d+)/i);
          if (match) {
            const { base, bonus } = parseCombinedValue(match[0]);
            data.vehicle_queue = base;
            data.vehicle_queue_bonus = bonus;
            i += 1;
          }
        } else if (lowerLine.includes("fleet troops units limit")) {
          const match = lines[i + 1].match(/([\d,]+)\s*\+([\d,]+)/i);
          if (match) {
            const { base, bonus } = parseCombinedValue(match[0]);
            data.fleet_troops_units_limit = base;
            data.fleet_troops_units_limit_bonus = bonus;
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle troops expansion")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+)/);
          if (match) {
            data.cross_nation_battle_troops_expansion = parseInt(match[1]) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("fleet speed")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.fleet_speed = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("recruitment speed up")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.recruitment_speed_up_stat = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("melee attack")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.melee_attack = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("melee defense")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.melee_defense = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("melee hp")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.melee_hp = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("mid-range attack")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.mid_range_attack = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("mid-range defense")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.mid_range_defense = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("mid-range hp")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.mid_range_hp = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("long-range attack")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.long_range_attack = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("long-range defense")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.long_range_defense = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("long-range hp")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.long_range_hp = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("increases damage to long-range troops")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.increases_damage_to_long_range_troops = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("increases damage to mid-range troops")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.increases_damage_to_mid_range_troops = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("increases damage to melee troops")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.increases_damage_to_melee_troops = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("reduces damage taken from long-range troops")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.reduces_damage_taken_from_long_range_troops = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("reduces damage taken from mid-range troops")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.reduces_damage_taken_from_mid_range_troops = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("reduces damage taken from melee troops")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.reduces_damage_taken_from_melee_troops = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("biochemical zombies recruit speed boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.biochemical_zombies_recruit_speed_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("biochemical materials collection rate boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.biochemical_materials_collection_rate_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("biochemical zombies attack boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.biochemical_zombies_attack_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("biochemical zombies hp boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.biochemical_zombies_hp_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("biochemical zombies defense boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.biochemical_zombies_defense_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("biochemical materials collection boost")) {
          const match = lines[i + 1].match(/\+([\d,]+)/i);
          if (match) {
            data.biochemical_materials_collection_boost = parseInt(match[1].replace(/,/g, "")) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("biochemical zombies recruit limit boost")) {
          const match = lines[i + 1].match(/\+([\d,]+)/i);
          if (match) {
            data.biochemical_zombies_recruit_limit_boost = parseInt(match[1].replace(/,/g, "")) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("biochemical zombie army limit boost")) {
          const match = lines[i + 1].match(/\+([\d,]+)/i);
          if (match) {
            data.biochemical_zombie_army_limit_boost = parseInt(match[1].replace(/,/g, "")) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("biochemical zombies limit boost")) {
          const match = lines[i + 1].match(/\+([\d,]+)/i);
          if (match) {
            data.biochemical_zombies_limit_boost = parseInt(match[1].replace(/,/g, "")) || 0;
            i += 1;
          }
        } else if (lowerLine.includes("all troops block")) {
          const match = lines[i + 1].match(/([\d.]+)\s*\(([\d.]+)%\)/i);
          if (match) {
            const { base, percentage } = parseValueWithPercentage(match[0]);
            data.all_troops_block = base;
            data.all_troops_block_percentage = percentage;
            i += 1;
          }
        } else if (lowerLine.includes("all troops disruptor resistance")) {
          const match = lines[i + 1].match(/([\d.]+)\s*\(([\d.]+)%\)/i);
          if (match) {
            const { base, percentage } = parseValueWithPercentage(match[0]);
            data.all_troops_disruptor_resistance = base;
            data.all_troops_disruptor_resistance_percentage = percentage;
            i += 1;
          }
        } else if (lowerLine.includes("all troops misfire resistance")) {
          const match = lines[i + 1].match(/([\d.]+)\s*\(([\d.]+)%\)/i);
          if (match) {
            const { base, percentage } = parseValueWithPercentage(match[0]);
            data.all_troops_misfire_resistance = base;
            data.all_troops_misfire_resistance_percentage = percentage;
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle melee attack")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_melee_attack = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle melee defense")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_melee_defense = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle melee hp")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_melee_hp = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle mid-range attack")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_mid_range_attack = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle mid-range defense")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_mid_range_defense = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle mid-range hp")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_mid_range_hp = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle long-range attack")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_long_range_attack = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle long-range defense")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_long_range_defense = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle long-range hp")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_long_range_hp = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle biochemical zombies attack")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_biochemical_zombies_attack = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle biochemical zombies defense")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_biochemical_zombies_defense = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("cross-nation battle biochemical zombies hp")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.cross_nation_battle_biochemical_zombies_hp = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("attack against melee boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.attack_against_melee_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("attack against mid-range boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.attack_against_mid_range_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("attack against long-range boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.attack_against_long_range_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("attack against biochemical zombies boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.attack_against_biochemical_zombies_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("defense against melee boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.defense_against_melee_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("defense against mid-range boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.defense_against_mid_range_boost = parsePercentageOrNumber(match[1]);
            i += 1;
          }
        } else if (lowerLine.includes("defense against long-range boost")) {
          const match = lines[i + 1].match(/([+-]?\d*\.?\d+%)/);
          if (match) {
            data.defense_against_long_range_boost = parsePercentageOrNumber(match[1]);
            i += 1;
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
      return parseFloat(value) || 0;
    };

    const parsedData = parseOcrText(extractedText);
    return NextResponse.json({ data: parsedData, extractedText });
  } catch (err: any) {
    console.error("Unexpected error in extract-screenshot:", err);
    return NextResponse.json(
      { error: `Unexpected error: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
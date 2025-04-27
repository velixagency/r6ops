import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://berwkudcdaemhgqoiwkn.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  if (typeof user_id !== "string" || user_id.length !== 28) {
    console.error("Invalid user_id format:", user_id);
    return NextResponse.json({ error: "Invalid user_id format: must be a 28-character string" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message || "Failed to fetch resources from database" }, { status: 500 });
    }

    // Ensure all fields are included in the response, defaulting to 0 if not present
    const responseData = {
      food: data?.food || 0,
      oil: data?.oil || 0,
      steel: data?.steel || 0,
      mineral: data?.mineral || 0,
      uranium: data?.uranium || 0,
      speed_up: data?.speed_up || 0,
      building_speed_up: data?.building_speed_up || 0,
      healing_speed_up: data?.healing_speed_up || 0,
      recruitment_speed_up: data?.recruitment_speed_up || 0,
      research_speed_up: data?.research_speed_up || 0,
      troop_levels: data?.troop_levels || {},
    };

    return NextResponse.json({ data: responseData });
  } catch (err: any) {
    console.error("Unexpected error in GET /api/get-resources:", JSON.stringify(err, null, 2));
    return NextResponse.json({ error: `Unexpected error: ${err.message || "Unknown error"}` }, { status: 500 });
  }
}
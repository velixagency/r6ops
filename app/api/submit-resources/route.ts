import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://berwkudcdaemhgqoiwkn.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { user_id, food, oil, steel, mineral, uranium, troop_levels } = await request.json();

    if (!user_id || typeof user_id !== "string" || user_id.length !== 28) {
      return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
    }

    const { error } = await supabase.from("resources").insert({
      user_id,
      food: Number(food) || 0,
      oil: Number(oil) || 0,
      steel: Number(steel) || 0,
      mineral: Number(mineral) || 0,
      uranium: Number(uranium) || 0,
      troop_levels: troop_levels || {},
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Insert error:", JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Resources submitted successfully" });
  } catch (err: any) {
    console.error("Unexpected error:", JSON.stringify(err, null, 2));
    return NextResponse.json({ error: `Unexpected error: ${err.message || "Unknown error"}` }, { status: 500 });
  }
}
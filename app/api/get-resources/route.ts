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

    // Ensure all fields are included in the response, defaulting to 0 or empty strings if not present
    const responseData = {
      food: data?.food || 0,
      oil: data?.oil || 0,
      steel: data?.steel || 0,
      mineral: data?.mineral || 0,
      speed_up: data?.speed_up || 0,
      building_speed_up: data?.building_speed_up || 0,
      healing_speed_up: data?.heating_speed_up || 0,
      recruitment_speed_up: data?.recruitment_speed_up || 0,
      research_speed_up: data?.research_speed_up || 0,
      vip_level: data?.vip_level || 0,
      troop_levels: data?.troop_levels || {},
      user_id_value: data?.user_id_value || 0,
      nation: data?.nation || '',
      power_rank: data?.power_rank || 0,
      battle_power: data?.battle_power || 0,
      enemy_units_killed: data?.enemy_units_killed || 0,
      defense_victory: data?.defense_victory || 0,
      siege_victory: data?.siege_victory || 0,
      losses: data?.losses || 0,
      sieges_failed: data?.sieges_failed || 0,
      individual_reputation: data?.individual_reputation || 0,
      defense_against_biochemical_zombies_boost: data?.defense_against_biochemical_zombies_boost || 0,
      enemy_melee_attack_reduction: data?.enemy_melee_attack_reduction || 0,
      enemy_mid_range_attack_reduction: data?.enemy_mid_range_attack_reduction || 0,
      enemy_long_range_attack_reduction: data?.enemy_long_range_attack_reduction || 0,
      enemy_biochemical_zombie_attack_reduction: data?.enemy_biochemical_zombie_attack_reduction || 0,
      enemy_melee_defense_reduction: data?.enemy_melee_defense_reduction || 0,
      enemy_mid_range_defense_reduction: data?.enemy_mid_range_defense_reduction || 0,
      enemy_long_range_defense_reduction: data?.enemy_long_range_defense_reduction || 0,
      enemy_biochemical_zombie_defense_reduction: data?.enemy_biochemical_zombie_defense_reduction || 0,
      oil_boost: data?.oil_boost || 0,
      oil_boost_bonus: data?.oil_boost_bonus || 0,
      steel_boost: data?.steel_boost || 0,
      steel_boost_bonus: data?.steel_boost_bonus || 0,
      mineral_production: data?.mineral_production || 0,
      mineral_production_bonus: data?.mineral_production_bonus || 0,
      food_boost: data?.food_boost || 0,
      food_boost_bonus: data?.food_boost_bonus || 0,
      food_gather_bonus: data?.food_gather_bonus || 0,
      oil_gather_bonus: data?.oil_gather_bonus || 0,
      steel_gather_bonus: data?.steel_gather_bonus || 0,
      mineral_gather_bonus: data?.mineral_gather_bonus || 0,
      gold_gather_bonus: data?.gold_gather_bonus || 0,
      building_speed_additional_bonus: data?.building_speed_additional_bonus || 0,
      technology_research: data?.technology_research || 0,
      load_boost: data?.load_boost || 0,
      monster_attack_speed: data?.monster_attack_speed || 0,
      mobility_recovery: data?.mobility_recovery || '',
      healing_speed: data?.healing_speed || 0,
      increase_max_wounded_units: data?.increase_max_wounded_units || 0,
      increase_max_wounded_units_bonus: data?.increase_max_wounded_units_bonus || 0,
      vehicle_queue: data?.vehicle_queue || 0,
      vehicle_queue_bonus: data?.vehicle_queue_bonus || 0,
      fleet_troops_units_limit: data?.fleet_troops_units_limit || 0,
      fleet_troops_units_limit_bonus: data?.fleet_troops_units_limit_bonus || 0,
      cross_nation_battle_troops_expansion: data?.cross_nation_battle_troops_expansion || 0,
      fleet_speed: data?.fleet_speed || 0,
      recruitment_speed_up_stat: data?.recruitment_speed_up_stat || 0,
      melee_attack: data?.melee_attack || 0,
      melee_defense: data?.melee_defense || 0,
      melee_hp: data?.melee_hp || 0,
      mid_range_attack: data?.mid_range_attack || 0,
      mid_range_defense: data?.mid_range_defense || 0,
      mid_range_hp: data?.mid_range_hp || 0,
      long_range_attack: data?.long_range_attack || 0,
      long_range_defense: data?.long_range_defense || 0,
      long_range_hp: data?.long_range_hp || 0,
      increases_damage_to_long_range_troops: data?.increases_damage_to_long_range_troops || 0,
      increases_damage_to_mid_range_troops: data?.increases_damage_to_mid_range_troops || 0,
      increases_damage_to_melee_troops: data?.increases_damage_to_melee_troops || 0,
      reduces_damage_taken_from_long_range_troops: data?.reduces_damage_taken_from_long_range_troops || 0,
      reduces_damage_taken_from_mid_range_troops: data?.reduces_damage_taken_from_mid_range_troops || 0,
      reduces_damage_taken_from_melee_troops: data?.reduces_damage_taken_from_melee_troops || 0,
      biochemical_zombies_recruit_speed_boost: data?.biochemical_zombies_recruit_speed_boost || 0,
      biochemical_materials_collection_rate_boost: data?.biochemical_materials_collection_rate_boost || 0,
      biochemical_zombies_attack_boost: data?.biochemical_zombies_attack_boost || 0,
      biochemical_zombies_hp_boost: data?.biochemical_zombies_hp_boost || 0,
      biochemical_zombies_defense_boost: data?.biochemical_zombies_defense_boost || 0,
      biochemical_materials_collection_boost: data?.biochemical_materials_collection_boost || 0,
      biochemical_zombies_recruit_limit_boost: data?.biochemical_zombies_recruit_limit_boost || 0,
      biochemical_zombie_army_limit_boost: data?.biochemical_zombie_army_limit_boost || 0,
      biochemical_zombies_limit_boost: data?.biochemical_zombies_limit_boost || 0,
      all_troops_block: data?.all_troops_block || 0,
      all_troops_block_percentage: data?.all_troops_block_percentage || 0,
      all_troops_disruptor_resistance: data?.all_troops_disruptor_resistance || 0,
      all_troops_disruptor_resistance_percentage: data?.all_troops_disruptor_resistance_percentage || 0,
      all_troops_misfire_resistance: data?.all_troops_misfire_resistance || 0,
      all_troops_misfire_resistance_percentage: data?.all_troops_misfire_resistance_percentage || 0,
      cross_nation_battle_melee_attack: data?.cross_nation_battle_melee_attack || 0,
      cross_nation_battle_melee_defense: data?.cross_nation_battle_melee_defense || 0,
      cross_nation_battle_melee_hp: data?.cross_nation_battle_melee_hp || 0,
      cross_nation_battle_mid_range_attack: data?.cross_nation_battle_mid_range_attack || 0,
      cross_nation_battle_mid_range_defense: data?.cross_nation_battle_mid_range_defense || 0,
      cross_nation_battle_mid_range_hp: data?.cross_nation_battle_mid_range_hp || 0,
      cross_nation_battle_long_range_attack: data?.cross_nation_battle_long_range_attack || 0,
      cross_nation_battle_long_range_defense: data?.cross_nation_battle_long_range_defense || 0,
      cross_nation_battle_long_range_hp: data?.cross_nation_battle_long_range_hp || 0,
      cross_nation_battle_biochemical_zombies_attack: data?.cross_nation_battle_biochemical_zombies_attack || 0,
      cross_nation_battle_biochemical_zombies_defense: data?.cross_nation_battle_biochemical_zombies_defense || 0,
      cross_nation_battle_biochemical_zombies_hp: data?.cross_nation_battle_biochemical_zombies_hp || 0,
      attack_against_melee_boost: data?.attack_against_melee_boost || 0,
      attack_against_mid_range_boost: data?.attack_against_mid_range_boost || 0,
      attack_against_long_range_boost: data?.attack_against_long_range_boost || 0,
      attack_against_biochemical_zombies_boost: data?.attack_against_biochemical_zombies_boost || 0,
      defense_against_melee_boost: data?.defense_against_melee_boost || 0,
      defense_against_mid_range_boost: data?.defense_against_mid_range_boost || 0,
      defense_against_long_range_boost: data?.defense_against_long_range_boost || 0,
      exp_current: data?.exp_current || 0,
      exp_total: data?.exp_total || 0,
      gas_current: data?.gas_current || 0,
      gas_total: data?.gas_total || 0,
    };

    return NextResponse.json({ data: responseData });
  } catch (err: any) {
    console.error("Unexpected error in GET /api/get-resources:", JSON.stringify(err, null, 2));
    return NextResponse.json({ error: `Unexpected error: ${err.message || "Unknown error"}` }, { status: 500 });
  }
}
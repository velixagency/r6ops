"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [resources, setResources] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchResources = async () => {
        try {
          const response = await fetch(`/api/get-resources?user_id=${user.uid}`);
          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (parseErr) {
              errorData = { error: "Failed to parse error response from API" };
            }
            console.error("API error:", {
              status: response.status,
              statusText: response.statusText,
              body: errorData,
            });
            const errorMessage = errorData.message || errorData.error || `Failed to fetch resources: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
          }
          const result = await response.json();
          console.log("API response:", result);
          if (result.data) {
            setResources(result.data);
          }
        } catch (err: any) {
          console.error("Fetch error:", err);
          setError(err.message || "Failed to load resources");
        }
      };
      fetchResources();
    }
  }, [user, loading, router]);

  // Helper function to format seconds into the desired format
  const formatDuration = (totalSeconds: number): string => {
    if (totalSeconds === 0) {
      return "0";
    }

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    totalSeconds %= 24 * 60 * 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    totalSeconds %= 60 * 60;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // If there are days, show the full format
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    // If there are hours, show HH:MM:SS
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    // If less than an hour, show MM:SS
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper function to format percentage values
  const formatPercentage = (value: number, sign: boolean = true): string => {
    if (value === 0) return sign ? "+0%" : "0%";
    return sign ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  // Helper function to format combined values (e.g., "10,000+211,342")
  const formatCombinedValue = (base: number, bonus: number, suffix: string = ''): string => {
    return `${base.toLocaleString()}${bonus !== 0 ? `<span className="text-green-500">+${bonus.toLocaleString()}</span>` : ''}${suffix}`;
  };

  // Helper function to format combined values with percentage (e.g., "24.0 (2.3%)")
  const formatValueWithPercentage = (base: number, percentage: number): string => {
    return `${base.toFixed(1)} (${percentage.toFixed(1)}%)`;
  };

  if (loading) {
    return <div className="text-light-text text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between w-full py-2 px-5 border-b border-[#2F383F] bg-gradient-to-r from-[#1B2023] via-[#313C47] to-[#1B2023] shadow-[0_0_6px_0_#000]">
        <img src="/images/back-button.jpg" alt="back to homepage" />
        <h1>Dashboard</h1>
        <img src="/images/back-button.jpg" alt="back to homepage" className="opacity-0" />
      </div>
      <div className="dashboard-userbar w-full py-3 px-5 bg-[rgba(54,56,59,0.5)] flex items-center justify-between">
        <div className="user-info flex gap-5">
          <div className="avatar-container h-[88px] w-[88px]">
            <img src="/images/avatar-frame.png" className="avatar" height="88" width="88" title="user avatar" />
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <h2 className="username text-[#CFCFCF] text-[32px] font-[700] tracking-[0.96px] leading-none">{user?.email?.split('@')[0] || 'N/A'}</h2>
            <div className="h-[2px] border-b border-[#393A41] bg-[#242427]"></div>
            <div className="flex items-center justify-between gap-5">
              <span className="userid text-[#CFCFCF] font-[400] text-[14px] tracking-[0.75px]">
                User ID: {resources?.user_id_value ? resources.user_id_value.toLocaleString() : 'N/A'}
              </span>
              <span className="nation text-[#CFCFCF] font-[400] text-[14px] tracking-[0.75px]">
                Nation: {resources?.nation || 'N/A'}
              </span>
              {resources && (
                <span className="nation text-[#CFCFCF] font-[400] text-[14px] tracking-[0.75px]">
                  VIP: {resources.vip_level || 0}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 justify-center ml-10">
            <div className="blue-bar flex gap-3 text-[#CFCFCF] font-[400] text-[14px] tracking-[0.75px]">
              Exp 
              <div className="bar w-[290px] rounded-[1px] border border-[#444548] bg-[#1C1F21] text-center relative">
                <div className="fill absolute left-0 top-0 w-[75%] h-full bg-[#3B7B91] z-0"></div>
                <div className="details relative z-10 text-[14px] tracking-[0.75px]">
                  <span className="current">{resources?.exp_current ? resources.exp_current.toLocaleString() : '0'}</span> / <span className="total">{resources?.exp_total ? resources.exp_total.toLocaleString() : '0'}</span>
                </div>
              </div>
            </div>
            <div className="green-bar flex gap-3 text-[#CFCFCF] font-[400] text-[14px] tracking-[0.75px]">
              Gas 
              <div className="bar w-[290px] rounded-[1px] border border-[#444548] bg-[#1C1F21] text-center relative">
                <div className="fill absolute left-0 top-0 w-full h-full bg-[#3B9146] z-0"></div>
                <div className="details relative z-10 text-[14px] tracking-[0.75px]">
                  <span className="current">{resources?.gas_current || 100}</span> / <span className="total">{resources?.gas_total || 100}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="button-group flex align-center gap-2">
          <Link href="/submit" className="btn-green">Submit Data</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
        {error && <div className="w-full text-center md:col-span-2 lg:col-span-3"><p className="text-red-500 mb-4">{error}</p></div>}
        {resources ? (
          <>
            <div className="bg-dark-panel p-6">
              <h2 className="text-2xl mb-4">My Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-light-text">
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Power Ranking:</span> Rank {resources.power_rank || 0}
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Battle Power:</span> {resources.battle_power ? resources.battle_power.toLocaleString() : '0'}
                </p>
                <div className="h-[2px] col-span-2 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Enemy Units Killed:</span> {resources.enemy_units_killed ? resources.enemy_units_killed.toLocaleString() : '0'}
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Defense Victory:</span> {resources.defense_victory || 0}
                </p>
                <div className="h-[2px] col-span-2 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Siege Victory:</span> {resources.siege_victory ? resources.siege_victory.toLocaleString() : '0'}
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Losses:</span> {resources.losses ? resources.losses.toLocaleString() : '0'}
                </p>
                <div className="h-[2px] col-span-2 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Sieges Failed:</span> {resources.sieges_failed || 0}
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Individual Reputation:</span> {resources.individual_reputation ? resources.individual_reputation.toLocaleString() : '0'}
                </p>
              </div>
            </div>
            <div className="bg-dark-panel p-6">
              <h2 className="text-2xl mb-4">Resources</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-light-text">
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Food:</span> {resources.food ? resources.food.toLocaleString() : '0'}
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Oil:</span> {resources.oil ? resources.oil.toLocaleString() : '0'}
                </p>
                <div className="h-[2px] col-span-2 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Steel:</span> {resources.steel ? resources.steel.toLocaleString() : '0'}
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Mineral:</span> {resources.mineral ? resources.mineral.toLocaleString() : '0'}
                </p>
              </div>
            </div>
            <div className="bg-dark-panel p-6">
              <h2 className="text-2xl mb-4">Speed-Ups</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-light-text">
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Speed Up:</span> {formatDuration(resources.speed_up)}
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Building Speed Up:</span> {formatDuration(resources.building_speed_up)}
                </p>
                <div className="h-[2px] col-span-2 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Healing Speed Up:</span> {formatDuration(resources.healing_speed_up)}
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Recruitment Speed Up:</span> {formatDuration(resources.recruitment_speed_up)}
                </p>
                <div className="h-[2px] col-span-2 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Research Speed Up:</span> {formatDuration(resources.research_speed_up)}
                </p>
              </div>
            </div>
            <div className="bg-dark-panel p-6 sm:col-span-2 lg:col-span-3">
              <h2 className="text-2xl mb-4">Military Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-light-text">
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Vehicle Queue:</span> {resources.vehicle_queue || 0}<span className="text-green-500">{resources.vehicle_queue_bonus ? `+${resources.vehicle_queue_bonus}` : '+0'}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Fleet Troops Units Limit:</span> {resources.fleet_troops_units_limit ? resources.fleet_troops_units_limit.toLocaleString() : '0'}<span className="text-green-500">{resources.fleet_troops_units_limit_bonus ? `+${resources.fleet_troops_units_limit_bonus.toLocaleString()}` : '+0'}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Troops Expansion:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_troops_expansion)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Fleet Speed:</span> <span className="text-green-500">{formatPercentage(resources.fleet_speed)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Recruitment Speed Up:</span> <span className="text-green-500">{formatPercentage(resources.recruitment_speed_up_stat)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Melee Attack:</span> <span className="text-green-500">{formatPercentage(resources.melee_attack)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Melee Defense:</span> <span className="text-green-500">{formatPercentage(resources.melee_defense)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Melee HP:</span> <span className="text-green-500">{formatPercentage(resources.melee_hp)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Mid-Range Attack:</span> <span className="text-green-500">{formatPercentage(resources.mid_range_attack)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Mid-Range Defense:</span> <span className="text-green-500">{formatPercentage(resources.mid_range_defense)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Mid-Range HP:</span> <span className="text-green-500">{formatPercentage(resources.mid_range_hp)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Long-Range Attack:</span> <span className="text-green-500">{formatPercentage(resources.long_range_attack)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Long-Range Defense:</span> <span className="text-green-500">{formatPercentage(resources.long_range_defense)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Long-Range HP:</span> <span className="text-green-500">{formatPercentage(resources.long_range_hp)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Increases Damage to Long-Range Troops:</span> <span className="text-green-500">{formatPercentage(resources.increases_damage_to_long_range_troops)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Increases Damage to Mid-Range Troops:</span> <span className="text-green-500">{formatPercentage(resources.increases_damage_to_mid_range_troops)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0 Regional/Provincial Stats .75px] px-4">
                  <span className="block">Increases Damage to Melee Troops:</span> <span className="text-green-500">{formatPercentage(resources.increases_damage_to_melee_troops)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Reduces Damage taken from Long-Range Troops:</span> <span className="text-green-500">{formatPercentage(resources.reduces_damage_taken_from_long_range_troops)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Reduces Damage taken from Mid-Range Troops:</span> <span className="text-green-500">{formatPercentage(resources.reduces_damage_taken_from_mid_range_troops)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Reduces Damage taken from Melee Troops:</span> <span className="text-green-500">{formatPercentage(resources.reduces_damage_taken_from_melee_troops)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Biochemical Zombies Recruit Speed Boost:</span> <span className="text-green-500">{formatPercentage(resources.biochemical_zombies_recruit_speed_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Biochemical Materials Collection Rate Boost:</span> <span className="text-green-500">{formatPercentage(resources.biochemical_materials_collection_rate_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Biochemical Zombies Attack Boost:</span> <span className="text-green-500">{formatPercentage(resources.biochemical_zombies_attack_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Biochemical Zombies HP Boost:</span> <span className="text-green-500">{formatPercentage(resources.biochemical_zombies_hp_boost)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Biochemical Zombies Defense Boost:</span> <span className="text-green-500">{formatPercentage(resources.biochemical_zombies_defense_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Biochemical Materials Collection Boost:</span> <span className="text-green-500">{resources.biochemical_materials_collection_boost ? `+${resources.biochemical_materials_collection_boost.toLocaleString()}` : '+0'}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Biochemical Zombies Recruit Limit Boost:</span> <span className="text-green-500">{resources.biochemical_zombies_recruit_limit_boost ? `+${resources.biochemical_zombies_recruit_limit_boost.toLocaleString()}` : '+0'}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Biochemical Zombie Army Limit Boost:</span> <span className="text-green-500">{resources.biochemical_zombie_army_limit_boost ? `+${resources.biochemical_zombie_army_limit_boost.toLocaleString()}` : '+0'}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Biochemical Zombies Limit Boost:</span> <span className="text-green-500">{resources.biochemical_zombies_limit_boost ? `+${resources.biochemical_zombies_limit_boost.toLocaleString()}` : '+0'}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">All Troops Block:</span> <span className="text-green-500">{formatValueWithPercentage(resources.all_troops_block, resources.all_troops_block_percentage)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">All Troops Disruptor Resistance:</span> <span className="text-green-500">{formatValueWithPercentage(resources.all_troops_disruptor_resistance, resources.all_troops_disruptor_resistance_percentage)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">All Troops Misfire Resistance:</span> <span className="text-green-500">{formatValueWithPercentage(resources.all_troops_misfire_resistance, resources.all_troops_misfire_resistance_percentage)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Melee Attack:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_melee_attack)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Melee Defense:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_melee_defense)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Melee HP:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_melee_hp)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Mid-Range Attack:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_mid_range_attack)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Mid-Range Defense:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_mid_range_defense)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Mid-Range HP:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_mid_range_hp)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Long-Range Attack:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_long_range_attack)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Long-Range Defense:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_long_range_defense)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Long-Range HP:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_long_range_hp)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Biochemical Zombies Attack:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_biochemical_zombies_attack)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Biochemical Zombies Defense:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_biochemical_zombies_defense)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Cross-Nation Battle Biochemical Zombies HP:</span> <span className="text-green-500">{formatPercentage(resources.cross_nation_battle_biochemical_zombies_hp)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Attack Against Melee Boost:</span> <span className="text-green-500">{formatPercentage(resources.attack_against_melee_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Attack Against Mid-Range Boost:</span> <span className="text-green-500">{formatPercentage(resources.attack_against_mid_range_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Attack Against Long-Range Boost:</span> <span className="text-green-500">{formatPercentage(resources.attack_against_long_range_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Attack Against Biochemical Zombies Boost:</span> <span className="text-green-500">{formatPercentage(resources.attack_against_biochemical_zombies_boost)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Defense Against Melee Boost:</span> <span className="text-green-500">{formatPercentage(resources.defense_against_melee_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Defense Against Mid-Range Boost:</span> <span className="text-green-500">{formatPercentage(resources.defense_against_mid_range_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Defense Against Long-Range Boost:</span> <span className="text-green-500">{formatPercentage(resources.defense_against_long_range_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Defense Against Biochemical Zombies Boost:</span> <span className="text-green-500">{formatPercentage(resources.defense_against_biochemical_zombies_boost)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Enemy Melee Attack Reduction:</span> <span className="text-green-500">{formatPercentage(resources.enemy_melee_attack_reduction)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Enemy Mid-Range Attack Reduction:</span> <span className="text-green-500">{formatPercentage(resources.enemy_mid_range_attack_reduction)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Enemy Long-Range Attack Reduction:</span> <span className="text-green-500">{formatPercentage(resources.enemy_long_range_attack_reduction)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Enemy Biochemical Zombie Attack Reduction:</span> <span className="text-green-500">{formatPercentage(resources.enemy_biochemical_zombie_attack_reduction)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Enemy Melee Defense Reduction:</span> <span className="text-green-500">{formatPercentage(resources.enemy_melee_defense_reduction)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Enemy Mid-Range Defense Reduction:</span> <span className="text-green-500">{formatPercentage(resources.enemy_mid_range_defense_reduction)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Enemy Long-Range Defense Reduction:</span> <span className="text-green-500">{formatPercentage(resources.enemy_long_range_defense_reduction)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Enemy Biochemical Zombie Defense Reduction:</span> <span className="text-green-500">{formatPercentage(resources.enemy_biochemical_zombie_defense_reduction)}</span>
                </p>
              </div>
            </div>
            <div className="bg-dark-panel p-6 lg:col-span-3">
              <h2 className="text-2xl mb-4">Resources Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-light-text">
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Oil Boost:</span> {resources.oil_boost ? resources.oil_boost.toLocaleString() : '0'}/h<span className="text-green-500">{resources.oil_boost_bonus ? `+${resources.oil_boost_bonus.toLocaleString()}` : '+0'}/h</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Steel Boost:</span> {resources.steel_boost ? resources.steel_boost.toLocaleString() : '0'}/h<span className="text-green-500">{resources.steel_boost_bonus ? `+${resources.steel_boost_bonus.toLocaleString()}` : '+0'}/h</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Mineral Production:</span> {resources.mineral_production ? resources.mineral_production.toLocaleString() : '0'}/h<span className="text-green-500">{resources.mineral_production_bonus ? `+${resources.mineral_production_bonus.toLocaleString()}` : '+0'}/h</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Food Boost:</span> {resources.food_boost ? resources.food_boost.toLocaleString() : '0'}/h<span className="text-green-500">{resources.food_boost_bonus ? `+${resources.food_boost_bonus.toLocaleString()}` : '+0'}/h</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Food Gather Bonus:</span> <span className="text-green-500">{formatPercentage(resources.food_gather_bonus)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Oil Gather Bonus:</span> <span className="text-green-500">{formatPercentage(resources.oil_gather_bonus)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Steel Gather Bonus:</span> <span className="text-green-500">{formatPercentage(resources.steel_gather_bonus)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Mineral Gather Bonus:</span> <span className="text-green-500">{formatPercentage(resources.mineral_gather_bonus)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Gold Gather Bonus:</span> <span className="text-green-500">{formatPercentage(resources.gold_gather_bonus)}</span>
                </p>
              </div>
            </div>
            <div className="bg-dark-panel p-6 lg:col-span-3">
              <h2 className="text-2xl mb-4">Development Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-light-text">
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Building Speed Additional Bonus:</span> <span className="text-green-500">{formatPercentage(resources.building_speed_additional_bonus)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Technology Research:</span> <span className="text-green-500">{formatPercentage(resources.technology_research)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Load Boost:</span> <span className="text-green-500">{formatPercentage(resources.load_boost)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Monster Attack Speed:</span> <span className="text-green-500">{formatPercentage(resources.monster_attack_speed)}</span>
                </p>
                <div className="h-[2px] col-span-2 lg:col-span-4 bg-[#171C20] border-b border-[#2C3136]"></div>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Mobility Recovery:</span> <span className="text-green-500">{resources.mobility_recovery ? `+${resources.mobility_recovery}` : '+0'}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Healing Speed:</span> <span className="text-green-500">{formatPercentage(resources.healing_speed)}</span>
                </p>
                <p className="text-[#74B1C8] [text-shadow:0px_4px_4px_#252D41] tracking-[0.75px] px-4">
                  <span className="block">Increase Max Wounded Units:</span> {resources.increase_max_wounded_units ? resources.increase_max_wounded_units.toLocaleString() : '0'}<span className="text-green-500">{resources.increase_max_wounded_units_bonus ? `+${resources.increase_max_wounded_units_bonus.toLocaleString()}` : '+0'}</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-light-text">No data found.</p>
        )}
      </div>
    </div>
  );
}
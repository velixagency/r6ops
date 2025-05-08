"use client";

import { useState, useEffect } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { supabase } from "../../lib/supabaseClient";

type GameData = {
  id: number;
  user_id: string;
  table: string;
  created_at: string;
};

const columnHelper = createColumnHelper<GameData>();

const columns = [
  columnHelper.accessor("user_id", {
    header: "User ID",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("table", {
    header: "Table",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("created_at", {
    header: "Created At",
    cell: info => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <button
        onClick={() => handleDeleteRecord(row.original.id, row.original.table)}
        className="text-red-500 hover:underline"
      >
        Delete
      </button>
    ),
  }),
];

const handleDeleteRecord = async (id: number, table: string) => {
  if (confirm(`Are you sure you want to delete this record from ${table}?`)) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id);
    if (error) {
      alert(`Failed to delete record: ${error.message}`);
    } else {
      alert("Record deleted successfully");
      window.location.reload(); // Refresh to update the table
    }
  }
};

export default function GameDataTable() {
  const [data, setData] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const tables = ["player_info", "player_resources", "player_stats"];
      const allData: GameData[] = [];

      for (const table of tables) {
        const { data: tableData, error } = await supabase
          .from(table)
          .select("id, user_id, created_at");
        
        if (error) {
          console.error(`Error fetching ${table} data:`, error);
        } else {
          const formattedData = tableData.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            table,
            created_at: item.created_at,
          }));
          allData.push(...formattedData);
        }
      }

      setData(allData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <div className="text-light-text text-lg">Loading game data...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="p-3 text-left text-light-text bg-border-metallic border-b border-border-metallic"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-accent-cyan/10">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-3 text-light-text border-b border-border-metallic">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <p className="text-light-text text-center mt-4">No game data found.</p>
      )}
    </div>
  );
}
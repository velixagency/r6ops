"use client";

import { useState, useEffect } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { supabase } from "../../lib/supabaseClient";
import { AppUser } from "../../lib/types";

const columnHelper = createColumnHelper<AppUser>();

const columns = [
  columnHelper.accessor("email", {
    header: "Email",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("role", {
    header: "Role",
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
        onClick={() => handleDeleteUser(row.original.id)}
        className="text-red-500 hover:underline"
      >
        Delete
      </button>
    ),
  }),
];

const handleDeleteUser = async (userId: string) => {
  if (confirm("Are you sure you want to delete this user?")) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      alert(`Failed to delete user: ${error.message}`);
    } else {
      alert("User deleted successfully");
      window.location.reload(); // Refresh to update the table
    }
  }
};

export default function UsersTable() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        const formattedUsers = data.users.map(user => ({
          id: user.id,
          email: user.email || '',
          role: user.user_metadata?.role || 'user',
          created_at: user.created_at,
        }));
        setUsers(formattedUsers);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <div className="text-light-text text-lg">Loading users...</div>;
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
      {users.length === 0 && (
        <p className="text-light-text text-center mt-4">No users found.</p>
      )}
    </div>
  );
}
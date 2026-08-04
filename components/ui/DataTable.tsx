"use client";

import { Table, flexRender } from "@tanstack/react-table";

interface DataTableProps<T> {
  table: Table<T>;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({ table, onRowClick }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`
                      sticky top-0 z-10
                      bg-gray-50/95
                      px-6 py-3
                      text-sm
                      font-semibold
                      uppercase
                      tracking-wide
                      text-gray-500
                      ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:text-indigo-600"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}

                      {{
                        asc: "↑",
                        desc: "↓",
                      }[header.column.getIsSorted() as string] ?? ""}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                data-row-id={(row.original as { id: number }).id}
                onClick={() => onRowClick?.(row.original)}
                className="
                  cursor-pointer
                  border-b border-gray-100
                  transition duration-150 ease-in-out
                  last:border-0
                  hover:bg-slate-50
                "
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-3 align-top text-sm text-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getRowModel().rows.length === 0 && (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-slate-50 px-8 py-16 text-center text-slate-600">
          <div className="mb-3 text-4xl">📄</div>

          <p className="text-lg font-semibold text-slate-900">No data found</p>

          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
}

// src/components/ui/TableCrud.tsx

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Save, X } from "lucide-react"; // Removed PlusCircle as it's not used here
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Dialog from "@radix-ui/react-dialog";

// EnvironmentLog interface is still specific, but not directly used for props.data
// It's fine to keep if you have internal logic that relies on it.
interface EnvironmentLog {
  id: string;
  temperature: string;
  humidity: string;
  time: string;
  date: string;
}

interface TableProps {
  itemsPerPage: number;
  col: string[];
  action: boolean;
  Pagination: boolean;
  data: Record<string, any>[]; // Data is an array of objects
  // You might want to add props for update/delete actions
  onUpdate?: (id: string, updatedData: Record<string, any>) => void;
  onDelete?: (id: string) => void;
  editableDropdowns?: Record<string, { label: string; value: string }[]>;
}

const TableCrud = (props: TableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  // Removed newLog state as adding new logs is handled by DataEntryForm now
  // const [newLog, setNewLog] = useState<Partial<EnvironmentLog>>({ ... });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = props.itemsPerPage;

  // Local state for editable rows, initialized from props.data
  // This allows local changes before dispatching to Redux
  const [editableRows, setEditableRows] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    // Update local editableRows whenever props.data changes
    // This is crucial for reflecting Redux state updates in the table
    setEditableRows(props.data);
  }, [props.data]);

  const handleEditLog = (id: string) => setEditingId(id);

  const handleSaveEdit = (id: string, updatedRow: Record<string, any>) => {
    setEditingId(null);
    // Call the optional onUpdate prop if provided
    if (props.onUpdate) {
      props.onUpdate(id, updatedRow);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    // When canceling, revert changes by re-syncing with original props.data
    // Find the original row from props.data and update the editableRows
    setEditableRows((prevRows) =>
      prevRows.map((row) => props.data.find((d) => d.id === row.id) || row)
    );
  };

  const handleDeleteLog = (id: string) => {
    // Call the optional onDelete prop if provided
    if (props.onDelete) {
      props.onDelete(id);
    }
    // Optimistically update UI, Redux state change will re-render
    setEditableRows(editableRows.filter((row) => row.id !== id));
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setEditableRows(
      editableRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // Removed handleAddLog and handleNewLogChange as new additions are handled by DataEntryForm

  const paginatedLogs = editableRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(editableRows.length / itemsPerPage);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data History</CardTitle>
        <CardDescription>View and manage recorded data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {props.col.map((colName, i) => (
                    <TableHead key={i} className="text-center">
                      {colName}
                    </TableHead>
                  ))}
                  {props.action && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((row) => (
                  <TableRow key={row.id} className="text-center">
                    {props.col.map((colName, i) => (
                      <TableCell key={i}>
                        {editingId === row.id ? (
                          props.editableDropdowns &&
                          props.editableDropdowns[colName] ? (
                            <select
                              value={row[colName] ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  row.id,
                                  colName,
                                  e.target.value
                                )
                              }
                              className="border px-2 py-1 rounded-md w-full"
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              {props.editableDropdowns[colName].map(
                                (option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                )
                              )}
                            </select>
                          ) : (
                            <Input
                              type={
                                colName.toLowerCase().includes("time")
                                  ? "time"
                                  : colName.toLowerCase().includes("date")
                                  ? "date"
                                  : colName
                                      .toLowerCase()
                                      .includes("quantity") ||
                                    colName.toLowerCase().includes("count") ||
                                    colName
                                      .toLowerCase()
                                      .includes("temperature") ||
                                    colName.toLowerCase().includes("humidity")
                                  ? "number"
                                  : "text"
                              }
                              value={row[colName] ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  row.id,
                                  colName,
                                  e.target.value
                                )
                              }
                              {...(colName.toLowerCase().includes("quantity") ||
                              colName.toLowerCase().includes("temperature") ||
                              colName.toLowerCase().includes("humidity")
                                ? { step: "0.01" }
                                : {})}
                            />
                          )
                        ) : (
                          String(row[colName] ?? "-")
                        )}
                      </TableCell>
                    ))}
                    {props.action && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {editingId === row.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSaveEdit(row.id, row)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditLog(row.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog.Root>
                                <Dialog.Trigger asChild>
                                  {/* This button will be the trigger for the dialog */}
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </Dialog.Trigger>
                                <Dialog.Portal>
                                  <Dialog.Overlay className="inset-0 fixed bg-black/50" />
                                  <Dialog.Content className="fixed duration-500 top-1/2 w-[400px] text-left left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-md shadow-lg">
                                    <Dialog.Title className="text-[16px] text-gray-950 font-semibold ">
                                      Are You Sure You want to
                                      <span className="text-red-600">
                                        Delete?
                                      </span>
                                    </Dialog.Title>
                                    <p className="text-md mb-5 font-normal text-gray-600">
                                      This action will not be undone 🚩
                                    </p>

                                    <div className="text-right mt-6 space-x-4">
                                      <Dialog.Close asChild>
                                        <Button
                                          variant="outline"
                                          className="hover:bg-slate-100 px-4 py-2 rounded-md"
                                        >
                                          Cancel
                                        </Button>
                                      </Dialog.Close>
                                      <Button
                                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md"
                                        onClick={() => handleDeleteLog(row.id)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </Dialog.Content>
                                </Dialog.Portal>
                              </Dialog.Root>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {editableRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={props.col.length + (props.action ? 1 : 0)}
                      className="text-center h-24"
                    >
                      No data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {props.Pagination && (
            <div className="flex justify-between mt-4">
              <Button
                className="hover:bg-green-600 hover:text-white"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm mt-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                className="hover:bg-green-600 hover:text-white"
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TableCrud;

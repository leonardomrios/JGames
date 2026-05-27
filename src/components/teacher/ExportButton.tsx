"use client";

import { useState } from "react";
import { exportClassroomCSV } from "@/server/actions/export";

interface ExportButtonProps {
  classroomId: string;
  classroomName: string;
}

export function ExportButton({
  classroomId,
  classroomName,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const csv = await exportClassroomCSV(classroomId);
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `progreso-${classroomName.replace(/\s+/g, "-").toLowerCase()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exportando CSV:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="font-display bg-primary hover:bg-primary-dark disabled:bg-ink/20 text-white px-6 py-2 rounded-2xl transition-all active:scale-95 shadow-sm"
    >
      {loading ? "Exportando..." : "📥 Exportar CSV"}
    </button>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branchId: string;
}

interface ValidationResult {
  row: number;
  errors: string[];
  data: any;
}

export function BulkUploadModal({ isOpen, onClose, onSuccess, branchId }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<{
    valid: any[];
    invalid: ValidationResult[];
    total: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<{
    success: number;
    failed: number;
    errors: any[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        return;
      }
      setFile(selectedFile);
      setValidationResults(null);
      setUploadSummary(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        validateData(jsonData);
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error("Error parsing file:", err);
      alert("Failed to parse Excel file.");
      setIsProcessing(false);
    }
  };

  const validateData = (data: any[]) => {
    const valid: any[] = [];
    const invalid: ValidationResult[] = [];
    const emails = new Set<string>();

    data.forEach((row, index) => {
      const errors: string[] = [];
      const rowNum = index + 2; // +1 for 0-index, +1 for header row

      if (!row.Name || typeof row.Name !== "string" || row.Name.trim() === "") {
        errors.push("Name is required.");
      }
      
      const email = row.Email?.toString().toLowerCase().trim();
      if (!email) {
        errors.push("Email is required.");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Invalid email format.");
      } else if (emails.has(email)) {
        errors.push("Duplicate email in spreadsheet.");
      } else {
        emails.add(email);
      }

      if (row.Phone && !/^\+?[\d\s-]{10,15}$/.test(row.Phone.toString())) {
        errors.push("Invalid phone format.");
      }

      if (errors.length > 0) {
        invalid.push({ row: rowNum, errors, data: row });
      } else {
        valid.push({
          name: row.Name,
          email: email,
          phone: row.Phone?.toString() || "",
          membership_status: row.Status?.toLowerCase() || "none",
          plan_name: row.Plan || "none"
        });
      }
    });

    setValidationResults({ valid, invalid, total: data.length });
    setIsProcessing(false);
  };

  const handleUpload = async () => {
    if (!validationResults || validationResults.valid.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: validationResults.valid, branchId })
      });

      const data = await res.json();
      if (data.ok) {
        setUploadSummary({
          success: data.success,
          failed: data.failed,
          errors: data.errors || []
        });
        if (data.success > 0) {
          onSuccess();
        }
      } else {
        alert(data.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { Name: "John Doe", Email: "john@example.com", Phone: "9876543210", Status: "active", Plan: "Monthly Plan" },
      { Name: "Jane Smith", Email: "jane@example.com", Phone: "9123456789", Status: "none", Plan: "none" }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "player_registration_template.xlsx");
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={onClose} />
      <Card className="relative w-full max-w-2xl bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Bulk User Registration</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Upload Excel to register multiple players</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!file && (
            <div 
              className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-academy-gold/50 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  setFile(droppedFile);
                  parseFile(droppedFile);
                }
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} className="text-academy-gold" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest mb-2">Click or drag file to upload</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Support .xlsx and .xls (Max 10MB)</p>
              
              <Button 
                variant="outline" 
                className="mt-6 text-[10px] font-black uppercase tracking-widest h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTemplate();
                }}
              >
                <Download size={14} className="mr-2" /> Download Template
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="py-12 text-center space-y-4">
              <Loader2 size={40} className="text-academy-gold animate-spin mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Processing spreadsheet...</p>
            </div>
          )}

          {validationResults && !isProcessing && !uploadSummary && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Records</p>
                  <p className="text-2xl font-black">{validationResults.total}</p>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-1">Valid</p>
                  <p className="text-2xl font-black text-emerald-500">{validationResults.valid.length}</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-1">Invalid</p>
                  <p className="text-2xl font-black text-red-500">{validationResults.invalid.length}</p>
                </div>
              </div>

              {validationResults.invalid.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <AlertCircle size={14} /> Validation Errors
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {validationResults.invalid.map((err, i) => (
                      <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px]">
                        <p className="font-black text-red-400 mb-1">Row {err.row}: {err.data.Name || "Unknown"}</p>
                        <ul className="list-disc list-inside text-gray-400 space-y-0.5">
                          {err.errors.map((e, j) => <li key={j}>{e}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black"
                  onClick={() => {
                    setFile(null);
                    setValidationResults(null);
                  }}
                >
                  Change File
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/20"
                  disabled={validationResults.valid.length === 0 || isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="mr-2" /> Register {validationResults.valid.length} Users
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {uploadSummary && (
            <div className="py-6 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Upload Complete</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Processing results for your upload</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-1">Successful</p>
                  <p className="text-3xl font-black text-emerald-500">{uploadSummary.success}</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-1">Failed</p>
                  <p className="text-3xl font-black text-red-500">{uploadSummary.failed}</p>
                </div>
              </div>

              {uploadSummary.errors.length > 0 && (
                <div className="text-left space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Error Details</p>
                  <div className="max-h-32 overflow-y-auto p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] text-gray-400 space-y-1">
                    {uploadSummary.errors.map((err, i) => (
                      <p key={i}><span className="font-black text-red-400">{err.email}:</span> {err.error}</p>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                variant="secondary" 
                className="w-full h-12 uppercase tracking-widest text-[10px] font-black"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

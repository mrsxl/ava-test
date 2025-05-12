/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AlertCircleIcon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";

interface UploadFileProps {
	onFileUpload: (data: Record<string, any>[], file: File) => void;
}

export default function UploadFile({ onFileUpload }: UploadFileProps) {
	const maxSize = 10 * 1024 * 1024; // 10MB default
	// const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const formatBytes = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];

		if (!selectedFile) {
			return;
		}

		// Validate file size
		if (selectedFile.size > maxSize) {
			setError(
				`File size exceeds the maximum allowed size (${formatBytes(maxSize)})`
			);
			return;
		}

		setError(null);

		// Process file
		processFile(selectedFile);
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const droppedFile = e.dataTransfer.files?.[0];
		if (!droppedFile) return;

		// Validate file size
		if (droppedFile.size > maxSize) {
			setError(
				`File size exceeds the maximum allowed size (${formatBytes(maxSize)})`
			);
			return;
		}

		setError(null);

		// Process file
		processFile(droppedFile);
	};

	const processFile = (fileToProcess: File) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			const arrayBuffer = e.target?.result;
			if (arrayBuffer) {
				const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
				const firstSheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[firstSheetName];
				const data = window.XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
				console.log(data, "data----");
				onFileUpload(data, fileToProcess);
			}
		};

		reader.readAsArrayBuffer(fileToProcess);
	};

	const openFileDialog = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="flex flex-col gap-2">
			{/* Drop area */}
			<div
				role="button"
				onClick={openFileDialog}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				data-dragging={isDragging || undefined}
				className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
			>
				<input
					ref={fileInputRef}
					type="file"
					className="sr-only"
					accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
					onChange={handleFileChange}
					aria-label="Upload file"
				/>

				<div className="flex flex-col items-center justify-center text-center">
					<div
						className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
						aria-hidden="true"
					>
						<UploadIcon className="size-4 opacity-60" />
					</div>
					<p className="mb-1.5 text-sm font-medium">Upload file</p>
					<p className="text-muted-foreground text-xs">
						Drag & drop or click to browse (max. {formatBytes(maxSize)})
					</p>
				</div>
			</div>

			{error && (
				<div
					className="text-destructive flex items-center gap-1 text-xs"
					role="alert"
				>
					<AlertCircleIcon className="size-3 shrink-0" />
					<span>{error}</span>
				</div>
			)}
		</div>
	);
}

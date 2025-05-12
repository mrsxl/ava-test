/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import UploadFile from "@/components/upload-file";
import { useState } from "react";
import { getInsights, InsightInfo, PatternInfo } from "@antv/ava";
import { InsightCard } from "@antv/ava-react";
import { Button } from "@/components/ui/button";
import { XIcon, AlertCircleIcon } from "lucide-react";

type ViewMode = "upload" | "insight" | "error";

export default function Home() {
	const [insight, setInsight] = useState<InsightInfo<PatternInfo>>();
	const [viewMode, setViewMode] = useState<ViewMode>("upload");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [uploadedFileDetails, setUploadedFileDetails] = useState<{ name: string; size: number; type: string } | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [processingTime, setProcessingTime] = useState<number | null>(null);

	const handleFileUpload = async (csvData: Record<string, any>[], file: File) => {
		// Convert CSV data to array of objects
		if (csvData.length > 1) {
			setUploadedFileDetails({ name: file.name, size: file.size, type: file.type });
			setIsLoading(true);
			setProcessingTime(null);
			const startTime = performance.now();

			try {
				// Simulate async operation for getInsights if it's synchronous but long-running
				const insightResult = await new Promise<ReturnType<typeof getInsights>>((resolve) => {
					setTimeout(() => {
						resolve(getInsights(csvData));
					}, 0);
				});
				console.log(insightResult, "insightResult--")
				if (
					insightResult &&
					insightResult.insights &&
					insightResult.insights.length > 0
				) {
					const insightData = insightResult.insights[0];
					setInsight(insightData);
					setViewMode("insight");
					// console.log("Insights:", insightData, new Date().getTime());
				} else {
					setErrorMessage("当前文件生成的insight是undefined");
					setViewMode("error");
					console.log("No insights found", new Date().getTime());
				}
			} catch (error) {
				setErrorMessage(
					`分析数据出错: ${
						error instanceof Error ? error.message : String(error)
					}`
				);
				setViewMode("error");
				console.error("Error generating insights:", error);
			} finally {
				const endTime = performance.now();
				setProcessingTime(endTime - startTime);
				setIsLoading(false);
			}
		}
	};

	const handleCloseInsight = () => {
		setInsight(undefined);
		setViewMode("upload");
		setUploadedFileDetails(null);
		setProcessingTime(null);
		setIsLoading(false);
	};

	const handleCloseError = () => {
		setErrorMessage("");
		setViewMode("upload");
		setUploadedFileDetails(null);
		setProcessingTime(null);
		setIsLoading(false);
	};

	const formatBytes = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	console.log(isLoading, "isLoading--")

	return (
		<div className="flex flex-col items-center justify-center h-screen w-xl mx-auto gap-4">
			{uploadedFileDetails && (
				<div className="mt-4 p-4 border rounded-md w-full max-w-md bg-gray-50">
					<h3 className="text-lg font-semibold mb-2">已上传文件信息:</h3>
					<p><strong>名称:</strong> {uploadedFileDetails.name}</p>
					<p><strong>大小:</strong> {formatBytes(uploadedFileDetails.size)}</p>
					<p><strong>类型:</strong> {uploadedFileDetails.type}</p>
					{processingTime !== null && viewMode !== 'upload' && (
						<p><strong>分析耗时:</strong> {(processingTime / 1000).toFixed(2)} 秒</p>
					)}
				</div>
			)}
			{isLoading && (
				<div className="flex items-center justify-center p-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
					<p className="ml-2">分析中，请稍候...</p>
				</div>
			)}
			{viewMode === "upload" && !isLoading && (
				<>
					<UploadFile onFileUpload={handleFileUpload} />
				</>
			)}

			{viewMode === "insight" && insight && !isLoading && (
				<div className="relative w-full">
					<Button className="mb-4" onClick={handleCloseInsight}>
						Try New File
					</Button>
					<InsightCard insightInfo={insight} />
				</div>
			)}

			{viewMode === "error" && !isLoading && (
				<div className="border border-red-200 bg-red-50 rounded-lg p-6 max-w-lg relative">
					<Button
						variant="ghost"
						size="icon"
						className="absolute top-2 right-2 text-red-500"
						onClick={handleCloseError}
					>
						<XIcon className="size-4" />
					</Button>
					<div className="flex items-start gap-3">
						<AlertCircleIcon className="text-red-500 size-6 mt-0.5" />
						<div>
							<h3 className="font-medium text-red-800 mb-1">数据分析错误</h3>
							<p className="text-red-700">{errorMessage}</p>
							<Button
								variant="outline"
								className="mt-4 text-red-700 border-red-300 hover:bg-red-100"
								onClick={handleCloseError}
							>
								返回上传
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

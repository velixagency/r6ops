import { useState, useRef } from "react";

type FileUploaderProps = {
  onFilesSelected: (files: File[]) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
};

export const FileUploader = ({ onFilesSelected, isDragging, setIsDragging }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const oversizedFiles = Array.from(files).filter(file => file.size / 1024 / 1024 > 10);
      if (oversizedFiles.length > 0) {
        alert("One or more screenshots are too large. Please upload images smaller than 10 MB.");
        return;
      }
      onFilesSelected(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const oversizedFiles = Array.from(files).filter(file => file.size / 1024 / 1024 > 10);
      if (oversizedFiles.length > 0) {
        alert("One or more screenshots are too large. Please upload images smaller than 10 MB.");
        return;
      }
      onFilesSelected(Array.from(files));
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 
        ${isDragging ? 'border-accent-cyan bg-accent-cyan/10' : 'border-border-metallic bg-dark-bg'} 
        hover:border-accent-cyan hover:bg-accent-cyan/10 shadow-metallic-glow cursor-pointer`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        id="screenshots"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <div className="flex flex-col items-center gap-3">
        <svg
          className="w-12 h-12 text-accent-cyan"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-light-text font-medium text-lg">
          Drag & drop your screenshots here or click to upload
        </p>
        <p className="text-sm text-gray-400">
          (Supports multiple images, max 10 MB each)
        </p>
      </div>
    </div>
  );
};
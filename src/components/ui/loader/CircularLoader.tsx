"use client";

import React from "react";

interface CircularLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export default function CircularLoader({ 
  size = "md", 
  className = "",
  text 
}: CircularLoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-solid border-current border-r-transparent text-brand-500`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
}


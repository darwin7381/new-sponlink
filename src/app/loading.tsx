"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground">Loading...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we process your request</p>
      </div>
    </div>
  );
} 
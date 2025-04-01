'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@/lib/types/users";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/search-input";

interface HeroProps {
  user: User | null;
}

export function Hero({ user }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/events?search=${encodeURIComponent(value)}`);
    }
  };

  // 渲染按鈕，只在客戶端渲染時依賴用戶狀態
  const renderButtons = () => {
    if (!mounted) {
      // 服務端渲染時或組件未掛載時顯示占位按鈕
      return (
        <>
          <Link href="/events" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
            Browse Events
          </Link>
          <Link href="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary-foreground hover:bg-primary-foreground/90 md:py-4 md:text-lg md:px-10">
            Get Started
          </Link>
        </>
      );
    }

    // 客戶端渲染時，根據用戶狀態顯示不同按鈕
    return (
      <>
        <Link href="/events" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
          Browse Events
        </Link>
        {user ? (
          <Link href="/organizer/events/create" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary-foreground hover:bg-primary-foreground/90 md:py-4 md:text-lg md:px-10">
            Create Event
          </Link>
        ) : (
          <Link href="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary-foreground hover:bg-primary-foreground/90 md:py-4 md:text-lg md:px-10">
            Get Started
          </Link>
        )}
      </>
    );
  };

  return (
    <div className="relative">
      <div className="absolute inset-0">
        <div className="w-full h-full relative">
          <Image
            src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"
            alt="Event background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
        <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="block text-white">EventConnect</span>
          <span className="block text-indigo-200">Where Events Meet Sponsors</span>
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-center text-xl text-indigo-100 sm:max-w-3xl">
          The ultimate platform connecting event organizers with sponsors. Create, manage, and discover events that align with your goals and interests.
        </p>
        
        {/* Add Search Box */}
        <div className="mt-8 max-w-lg mx-auto px-4">
          <SearchInput 
            placeholder="Search events by title, category, or location..." 
            containerClassName="shadow-lg rounded-md overflow-hidden"
            className="h-12 backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/20 rounded-r-none"
            buttonClassName="h-12 bg-white/30 hover:bg-white/40 text-white border-white/30 border-l-0 rounded-l-none min-w-[120px]"
            iconClassName="bg-white/40 rounded-full p-1"
            onSearch={handleSearch}
            showSearchButton={true}
            searchButtonText="Explore"
          />
        </div>
        
        <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
          <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
            {renderButtons()}
          </div>
        </div>
      </div>
    </div>
  );
} 
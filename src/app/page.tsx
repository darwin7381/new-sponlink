"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/services/authService";
import { User } from "@/lib/types/users";
import { getAllEvents } from "@/services/eventService";
import { getFeaturedEventSeries } from "@/services/eventSeriesService";
import { EventStatus, Event, EventSeries } from "@/types/event";
import { Hero } from "@/components/layout/Hero";
import { FeaturedEvents } from "@/components/events/FeaturedEvents";
import { FeaturedEventSeries } from "@/components/events/FeaturedEventSeries";
import { FeaturedHoriEvents } from "@/components/events/FeaturedHoriEvents";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [featuredSeries, setFeaturedSeries] = useState<EventSeries[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        // Get current user
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Get events
        const events = await getAllEvents({ status: EventStatus.PUBLISHED });
        setFeaturedEvents(events);
        
        // 获取推荐的活动系列
        const series = await getFeaturedEventSeries();
        setFeaturedSeries(series);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // 避免水合錯誤
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-background">
      {/* Hero section */}
      <Hero user={user} />

      {/* Featured Events Section */}
      <FeaturedEvents events={featuredEvents} />
      
      {/* Featured Horizontal Events Section */}
      <FeaturedHoriEvents events={featuredEvents} />
      
      {/* Featured Event Series Section */}
      <FeaturedEventSeries series={featuredSeries} />

      {/* How It Works Section */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
              Simple steps to connect events with sponsors.
            </p>
          </div>
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto">
                  1
                </div>
                <h3 className="mt-6 text-lg font-medium text-foreground">Create or Browse</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Organizers create events with details, while sponsors browse opportunities.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto">
                  2
                </div>
                <h3 className="mt-6 text-lg font-medium text-foreground">Connect</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Sponsors find events that match their interests and add sponsorship packages to cart.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto">
                  3
                </div>
                <h3 className="mt-6 text-lg font-medium text-foreground">Collaborate</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Schedule meetings to discuss details and finalize sponsorships for mutual benefit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-primary-foreground sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Create an account today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-foreground/80">
            Join our platform to start connecting events with sponsors. Create meaningful partnerships that drive success.
          </p>
          <Link href="/register" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary-foreground hover:bg-primary-foreground/90 sm:w-auto">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

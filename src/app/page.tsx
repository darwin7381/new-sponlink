"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/services/authService";
import { User, USER_ROLES } from "@/lib/types/users";
import { getAllEvents } from "@/lib/services/eventService";

interface FeaturedEvent {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Get events
        const events = await getAllEvents();
        
        // Format for frontend display
        const formattedEvents = events.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description.substring(0, 120) + '...',
          image: event.cover_image || '/images/event-placeholder.jpg',
          date: new Date(event.start_time).toISOString().split('T')[0],
          location: event.location.name
        }));
        
        setFeaturedEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-background">
      {/* Hero section */}
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 mix-blend-multiply" />
        </div>
        <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
          <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block text-primary-foreground">EventConnect</span>
            <span className="block text-primary-foreground/80">Where Events Meet Sponsors</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-center text-xl text-primary-foreground/90 sm:max-w-3xl">
            The ultimate platform connecting event organizers with sponsors. Create, manage, and discover events that align with your goals and interests.
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <Link href="/events" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
                Browse Events
              </Link>
              {user ? (
                user.role === USER_ROLES.ORGANIZER ? (
                  <Link href="/organizer/create-event" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary-foreground hover:bg-primary-foreground/90 md:py-4 md:text-lg md:px-10">
                    Create Event
                  </Link>
                ) : (
                  <Link href="/cart" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary-foreground hover:bg-primary-foreground/90 md:py-4 md:text-lg md:px-10">
                    View Cart
                  </Link>
                )
              ) : (
                <Link href="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary-foreground hover:bg-primary-foreground/90 md:py-4 md:text-lg md:px-10">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Featured Events</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
              Discover upcoming events looking for sponsors.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <div key={event.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                <div className="flex-shrink-0 h-48 relative">
                  <Image 
                    className="w-full h-full object-cover" 
                    src={event.image} 
                    alt={event.title}
                    fill
                  />
                </div>
                <div className="flex-1 bg-card p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </p>
                    <Link href={`/events/${event.id}`} className="block mt-2">
                      <p className="text-xl font-semibold text-foreground">{event.title}</p>
                      <p className="mt-3 text-base text-muted-foreground">{event.description}</p>
                    </Link>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/events" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90">
              View All Events
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12 bg-secondary/30">
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

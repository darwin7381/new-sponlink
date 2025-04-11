'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createEvent } from "@/services/eventService";
import { addEventToSeries } from "@/services/eventSeriesService";
import { EventStatus, Location, OWNER_TYPE } from "@/types/event";
import { getCurrentUser } from "@/lib/services/authService";
import { scrapeLumaEvent } from "@/services/lumaService";
import { convertToDatetimeLocalFormat, getBrowserTimezone } from "@/utils/dateUtils";
import EventForm from "@/components/events/EventForm";
import { EventFormData, SponsorshipPlanForm } from "@/types/forms";
import { User } from "@/lib/types/users";

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "",
    end_time: "",
    category: "",
    tags: "",
    timezone: getBrowserTimezone(),
    location: {
      id: "",
      name: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined
    } as Location
  });
  
  // 初始化贊助計劃狀態
  const [sponsorshipPlans, setSponsorshipPlans] = useState<SponsorshipPlanForm[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [seriesId, setSeriesId] = useState<string | null>(null);

  // Check user identity
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setError("Error occurred during authentication");
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Get series ID from URL parameters
  useEffect(() => {
    const seriesIdParam = searchParams.get('seriesId');
    if (seriesIdParam) {
      setSeriesId(seriesIdParam);
    }
  }, [searchParams]);

  // Handle import from Luma
  const handleImportFromLuma = async (lumaUrl: string) => {
    if (!lumaUrl || !lumaUrl.includes('lu.ma') || !currentUser) {
      throw new Error("Please provide a valid Luma event URL");
    }

    try {
      setIsImporting(true);

      const eventData = await scrapeLumaEvent(lumaUrl, currentUser.id);
      
      if (!eventData) {
        throw new Error("Unable to import event data from the provided URL");
      }
      
      const timezone = eventData.timezone || 'UTC';
      const startTime = convertToDatetimeLocalFormat(eventData.start_time, timezone);
      const endTime = convertToDatetimeLocalFormat(eventData.end_time, timezone);
      
      setFormData({
        title: eventData.title,
        description: eventData.description,
        cover_image: eventData.cover_image || formData.cover_image,
        start_time: startTime,
        end_time: endTime,
        category: eventData.category,
        tags: eventData.tags.join(", "),
        timezone: timezone,
        location: eventData.location
      });
      
      if (eventData.sponsorship_plans && eventData.sponsorship_plans.length > 0) {
        const importedPlans = eventData.sponsorship_plans.map(plan => ({
          id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          title: plan.title || 'Sponsorship Plan',
          description: plan.description || '',
          price: plan.price || 0,
          max_sponsors: plan.max_sponsors || 1,
          benefits: plan.benefits || []
        }));
        setSponsorshipPlans(importedPlans);
      }
    } finally {
      setIsImporting(false);
    }
  };

  // Handle form submission
  const handleCreateEvent = async (formData: EventFormData, updatedSponsorshipPlans?: SponsorshipPlanForm[]) => {
    try {
      setIsSubmitting(true);
      setError("");
      
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      if (!currentUser) {
        setError("Not logged in or session expired");
        setIsSubmitting(false);
        return;
      }
      
      const convertedSponsorshipPlans = updatedSponsorshipPlans ? updatedSponsorshipPlans.map(plan => {
        const planId = plan.id.startsWith('temp_') ? `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` : plan.id;
        
        return {
          id: planId,
          title: plan.title,
          description: plan.description,
          price: Number(plan.price),
          max_sponsors: Number(plan.max_sponsors),
          benefits: plan.benefits,
          event_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ownerId: currentUser.id,
          ownerType: OWNER_TYPE.USER
        };
      }) : [];
      
      const eventData = {
        organizer_id: currentUser.id,
        title: formData.title,
        description: formData.description,
        cover_image: formData.cover_image,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        location: formData.location,
        status: EventStatus.DRAFT,
        category: formData.category,
        tags,
        sponsorship_plans: convertedSponsorshipPlans, 
        timezone: formData.timezone,
        ownerId: currentUser.id,
        ownerType: OWNER_TYPE.USER,
        event_series_id: seriesId || undefined
      };
      
      const createdEvent = await createEvent(eventData);
      
      if (createdEvent) {
        if (seriesId) {
          await addEventToSeries(seriesId, createdEvent.id);
          router.push(`/event-series/${seriesId}`);
        } else {
          router.push(`/organizer/events/${createdEvent.id}`);
        }
      } else {
        setError("Error creating event. Please try again later.");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Error creating event. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Page content component
  const EventCreationContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-background">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground">Loading...</h2>
            <p className="text-muted-foreground">Verifying your identity</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-background min-h-screen pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EventForm
            initialData={formData}
            initialSponsorshipPlans={sponsorshipPlans}
            onSubmit={handleCreateEvent}
            isLoading={isSubmitting}
            error={error}
            submitButtonText="Create Event"
            cancelButtonText="Cancel"
            onCancel={() => seriesId ? router.push(`/event-series/${seriesId}`) : router.push("/organizer/events")}
            showSponsorshipPlans={true}
            title={seriesId ? "Submit Event to Series" : "Create New Event"}
            showImportLuma={true}
            onImportLuma={handleImportFromLuma}
            importLumaIsLoading={isImporting}
          />
        </div>
      </div>
    );
  };

  return (
    <EventCreationContent />
  );
} 
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getEventById, updateEvent } from "@/services/eventService";
import { Event, Location } from "@/types/event";
import { isAuthenticated, getCurrentUser } from "@/lib/services/authService";
import EventForm from "@/components/events/EventForm";
import { EventFormData, SponsorshipPlanForm } from "@/types/forms";
import { convertToDatetimeLocalFormat } from "@/utils/dateUtils";
import { scrapeLumaEvent } from "@/services/lumaService";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    cover_image: "",
    start_time: "",
    end_time: "",
    category: "",
    tags: "",
    timezone: "UTC",
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
  const [sponsorshipPlans, setSponsorshipPlans] = useState<SponsorshipPlanForm[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

  // Check user authentication and get current user
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }
        
        const userData = await getCurrentUser();
        if (!userData) {
          router.push('/login');
          return;
        }
        
        setCurrentUser(userData);
      } catch (e) {
        console.error("Error checking authentication:", e);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // Get event details
  useEffect(() => {
    async function fetchEventDetails() {
      if (!isAuthenticated()) {
        return;
      }
      
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setEventId(id);
        
        const fetchedEvent = await getEventById(id);
        
        if (!fetchedEvent) {
          throw new Error("Event not found");
        }

        setEvent(fetchedEvent);
        
        // 轉換贊助計劃數據為表單格式
        const formattedSponsorshipPlans = fetchedEvent.sponsorship_plans 
          ? fetchedEvent.sponsorship_plans.map(plan => ({
              id: plan.id,
              title: plan.title,
              description: plan.description,
              price: plan.price,
              max_sponsors: plan.max_sponsors || 1,
              benefits: plan.benefits
            }))
          : [];
          
        setSponsorshipPlans(formattedSponsorshipPlans);
        
        // Initialize form data
        setFormData({
          title: fetchedEvent.title,
          description: fetchedEvent.description,
          cover_image: fetchedEvent.cover_image,
          start_time: new Date(fetchedEvent.start_time).toISOString().slice(0, 16),
          end_time: new Date(fetchedEvent.end_time).toISOString().slice(0, 16),
          category: fetchedEvent.category || "",
          tags: fetchedEvent.tags?.join(", ") || "",
          timezone: fetchedEvent.timezone || "UTC",
          location: {
            id: fetchedEvent.location.id || "",
            name: fetchedEvent.location.name,
            address: fetchedEvent.location.address,
            city: fetchedEvent.location.city || "",
            country: fetchedEvent.location.country || "",
            postal_code: fetchedEvent.location.postal_code || "",
            latitude: fetchedEvent.location.latitude,
            longitude: fetchedEvent.location.longitude
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
        console.error("Error fetching event:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEventDetails();
  }, [params]);

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
      
      // Update form data, but keep original ID and other event-specific data
      const newFormData = {
        ...formData,
        title: eventData.title || formData.title,
        description: eventData.description || formData.description,
        cover_image: eventData.cover_image || formData.cover_image,
        start_time: startTime || formData.start_time,
        end_time: endTime || formData.end_time,
        category: eventData.category || formData.category,
        tags: eventData.tags?.join(", ") || formData.tags,
        timezone: timezone || formData.timezone,
        location: eventData.location || formData.location
      };
      
      // 確保更新狀態
      setFormData(newFormData);
      
      // 如果 Luma 活動有贊助計劃數據，也導入它
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
    } catch (error) {
      console.error("Error during Luma import:", error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  // Handle form submission
  const handleUpdateEvent = async (formData: EventFormData, updatedSponsorshipPlans?: SponsorshipPlanForm[]) => {
    if (!event) return;
    
    try {
      setIsSaving(true);
      setError("");
      
      // Process tags
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
      
      // 轉換贊助計劃為 API 所需格式
      const apiSponsorshipPlans = updatedSponsorshipPlans ? updatedSponsorshipPlans.map(plan => {
        return {
          id: plan.id,
          title: plan.title,
          description: plan.description,
          price: Number(plan.price),
          max_sponsors: Number(plan.max_sponsors),
          benefits: plan.benefits,
          event_id: event.id,
          ownerId: event.ownerId,
          ownerType: event.ownerType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }) : event.sponsorship_plans;
      
      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        cover_image: formData.cover_image,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        category: formData.category,
        timezone: formData.timezone,
        tags,
        location: formData.location,
        sponsorship_plans: apiSponsorshipPlans
      };
      
      const updatedEvent = await updateEvent(event.id, updateData);
      
      if (updatedEvent) {
        router.push(`/organizer/events/${event.id}`);
      } else {
        setError("Error updating event. Please try again later.");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Error updating event. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="bg-background text-foreground min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/organizer/events")}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <EventForm
          initialData={formData}
          initialSponsorshipPlans={sponsorshipPlans}
          onSubmit={handleUpdateEvent}
          isLoading={isSaving}
          error={error}
          submitButtonText="Save Changes"
          cancelButtonText="Cancel"
          onCancel={() => router.push(`/organizer/events/${eventId}`)}
          showSponsorshipPlans={true}
          title="Edit Event"
          showImportLuma={true}
          onImportLuma={handleImportFromLuma}
          importLumaIsLoading={isImporting}
        />
      </div>
    </div>
  );
} 
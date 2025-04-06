'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getEventById, updateEvent } from "@/services/eventService";
import { Event, Location } from "@/types/event";
import { isAuthenticated, getCurrentUser } from "@/lib/services/authService";
import LocationSelector from "@/components/maps/LocationSelector";
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cover_image: "",
    start_time: "",
    end_time: "",
    category: "",
    tags: "",
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

  // Check user authentication
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
        return; // If user is not authenticated, don't fetch details
      }
      
      try {
        // In Next.js 15, we need to await params
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setEventId(id); // Store ID for later use
        
        const fetchedEvent = await getEventById(id);
        
        if (!fetchedEvent) {
          throw new Error("Event not found");
        }

        setEvent(fetchedEvent);
        // Initialize form data
        setFormData({
          title: fetchedEvent.title,
          description: fetchedEvent.description,
          cover_image: fetchedEvent.cover_image,
          start_time: new Date(fetchedEvent.start_time).toISOString().slice(0, 16),
          end_time: new Date(fetchedEvent.end_time).toISOString().slice(0, 16),
          category: fetchedEvent.category || "",
          tags: fetchedEvent.tags?.join(", ") || "",
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;
    
    try {
      setIsSaving(true);
      setError("");
      
      // Process tags
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
      
      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        cover_image: formData.cover_image,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        category: formData.category,
        tags,
        location: formData.location
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <Button variant="outline" onClick={() => router.push(`/organizer/events/${eventId}`)}>
            Cancel
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <Card className="border border-border bg-card text-card-foreground">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="bg-background"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Event Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                    className="bg-background"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cover_image">Cover Image</Label>
                  <ImageUploadDropzone
                    onUploadComplete={(imageUrl) => {
                      setFormData(prev => ({
                        ...prev,
                        cover_image: imageUrl
                      }));
                    }}
                    className="mt-1"
                    dropzoneText="拖放圖片到此處上傳"
                    buttonText="或點擊選擇圖片"
                    showPreview={true}
                    initialImage={formData.cover_image}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      required
                      className="bg-background"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      required
                      className="bg-background"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="bg-background"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Technology, Innovation, AI"
                      className="bg-background"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Location Information</h3>
                  
                  <LocationSelector 
                    location={formData.location} 
                    onChange={(newLocation) => {
                      setFormData(prev => ({
                        ...prev,
                        location: newLocation
                      }));
                    }}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/organizer/events/${eventId}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
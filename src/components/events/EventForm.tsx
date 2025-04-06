'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { Event, Location, EventStatus, OWNER_TYPE } from "@/types/event";
import LocationSelector from "@/components/maps/LocationSelector";
import { Clock, AlertCircle } from "lucide-react";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventFormData, SponsorshipPlanForm } from "@/types/forms";

// Export types for backward compatibility
export type { EventFormData, SponsorshipPlanForm };

interface EventFormProps {
  initialData: EventFormData;
  initialSponsorshipPlans?: SponsorshipPlanForm[];
  onSubmit: (formData: EventFormData, sponsorshipPlans?: SponsorshipPlanForm[]) => Promise<void>;
  isLoading: boolean;
  error?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel: () => void;
  showSponsorshipPlans?: boolean;
  title?: string;
  showImportLuma?: boolean;
  onImportLuma?: (lumaUrl: string) => Promise<void>;
  importLumaIsLoading?: boolean;
}

export default function EventForm({
  initialData,
  initialSponsorshipPlans = [],
  onSubmit,
  isLoading,
  error = "",
  submitButtonText = "Create Event",
  cancelButtonText = "Cancel",
  onCancel,
  showSponsorshipPlans = true,
  title = "Create New Event",
  showImportLuma = false,
  onImportLuma,
  importLumaIsLoading = false
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>(initialData);
  const [sponsorshipPlans, setSponsorshipPlans] = useState<SponsorshipPlanForm[]>(initialSponsorshipPlans);
  const [newBenefit, setNewBenefit] = useState("");
  
  // Luma import 相關狀態
  const [lumaImportDialogOpen, setLumaImportDialogOpen] = useState(false);
  const [lumaUrl, setLumaUrl] = useState("");
  const [importError, setImportError] = useState("");

  // 監聽 initialData 變化，更新表單數據
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("initialData changed in EventForm");
    }
    setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("initialSponsorshipPlans changed in EventForm");
    }
    if (initialSponsorshipPlans && initialSponsorshipPlans.length > 0) {
      setSponsorshipPlans(initialSponsorshipPlans);
    }
  }, [initialSponsorshipPlans]);

  // Handle Luma import dialog toggle
  const handleLumaImportDialog = (isOpen: boolean) => {
    setLumaImportDialogOpen(isOpen);
    if (!isOpen) {
      setLumaUrl("");
      setImportError("");
    }
  };

  // Handle import from Luma
  const handleImportFromLuma = async () => {
    if (!lumaUrl || !lumaUrl.includes('lu.ma') || !onImportLuma) {
      setImportError("Please provide a valid Luma event URL");
      return;
    }

    try {
      // Call the parent import function
      await onImportLuma(lumaUrl);
      
      // Close dialog
      handleLumaImportDialog(false);
    } catch (error) {
      console.error("Luma import error:", error);
      // Show more specific error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred during import";
      
      setImportError(`Import failed: ${errorMessage}`);
    }
  };

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

  // Timezone change handler
  const handleTimezoneChange = (newTimezone: string) => {
    setFormData(prev => ({
      ...prev,
      timezone: newTimezone
    }));
  };

  // Add sponsorship plan
  const addSponsorshipPlan = () => {
    const newPlan: SponsorshipPlanForm = {
      id: `temp_${Date.now()}`,
      title: "",
      description: "",
      price: 0,
      max_sponsors: 1,
      benefits: []
    };
    
    setSponsorshipPlans([...sponsorshipPlans, newPlan]);
  };

  // Update sponsorship plan
  const updateSponsorshipPlan = (index: number, field: string, value: string | number) => {
    const updatedPlans = [...sponsorshipPlans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      [field]: value
    };
    setSponsorshipPlans(updatedPlans);
  };

  // Remove sponsorship plan
  const removeSponsorshipPlan = (index: number) => {
    const updatedPlans = [...sponsorshipPlans];
    updatedPlans.splice(index, 1);
    setSponsorshipPlans(updatedPlans);
  };

  // Add benefit item
  const addBenefit = (index: number) => {
    if (newBenefit.trim() === "") return;
    
    const updatedPlans = [...sponsorshipPlans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      benefits: [...updatedPlans[index].benefits, newBenefit.trim()]
    };
    
    setSponsorshipPlans(updatedPlans);
    setNewBenefit("");
  };

  // Remove benefit item
  const removeBenefit = (planIndex: number, benefitIndex: number) => {
    const updatedPlans = [...sponsorshipPlans];
    const updatedBenefits = [...updatedPlans[planIndex].benefits];
    updatedBenefits.splice(benefitIndex, 1);
    
    updatedPlans[planIndex] = {
      ...updatedPlans[planIndex],
      benefits: updatedBenefits
    };
    
    setSponsorshipPlans(updatedPlans);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that end time must be after start time
    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);
    
    if (endTime <= startTime) {
      // Usually this would set an error state, but we're passing handling to parent
      alert("End time must be after start time");
      return;
    }
    
    // Submit to parent with sponsorship plans if enabled
    if (showSponsorshipPlans) {
      await onSubmit(formData, sponsorshipPlans);
    } else {
      await onSubmit(formData);
    }
  };

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {title}
          </h1>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="border-border hover:bg-accent"
          >
            {cancelButtonText}
          </Button>
        </div>
        
        {/* Import from Luma button */}
        {showImportLuma && onImportLuma && (
          <div className="mb-6">
            <Button 
              variant="outline" 
              className="w-full border-dashed border-primary text-primary hover:bg-primary/10"
              onClick={() => handleLumaImportDialog(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import from Luma
            </Button>
          </div>
        )}

        {/* Luma import dialog */}
        {showImportLuma && onImportLuma && (
          <Dialog open={lumaImportDialogOpen} onOpenChange={handleLumaImportDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Event from Luma</DialogTitle>
                <DialogDescription>
                  Enter a Luma event URL to automatically populate event details
                </DialogDescription>
              </DialogHeader>
              
              {importError && (
                <Alert variant="destructive" className="my-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Input
                    id="luma-url"
                    placeholder="https://lu.ma/your-event"
                    value={lumaUrl}
                    onChange={(e) => setLumaUrl(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => handleLumaImportDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleImportFromLuma}
                  disabled={importLumaIsLoading}
                >
                  {importLumaIsLoading ? "Importing..." : "Import"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <Card className="border border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-foreground">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 bg-background border-border"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-foreground">Event Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                    className="mt-1 bg-background border-border"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cover_image" className="text-foreground">Cover Image</Label>
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
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timezone" className="text-foreground">Event Timezone</Label>
                    <div className="mt-1">
                      <TimezoneSelect 
                        value={formData.timezone} 
                        onChange={handleTimezoneChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="inline-block mr-1 h-3 w-3" />
                      Select the primary timezone for the event, participants will view event times based on this timezone
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time" className="text-foreground">Start Time</Label>
                      <Input
                        id="start_time"
                        name="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-background border-border"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="end_time" className="text-foreground">End Time</Label>
                      <Input
                        id="end_time"
                        name="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-background border-border"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-foreground">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags" className="text-foreground">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Technology, Innovation, AI"
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                </div>
                
                <LocationSelector 
                  location={formData.location} 
                  onChange={(newLocation) => {
                    setFormData(prev => ({
                      ...prev,
                      location: newLocation
                    }));
                  }}
                />
                
                {showSponsorshipPlans && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-lg font-medium text-foreground mb-4">Sponsorship Plans</h3>
                    
                    {sponsorshipPlans.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-border rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a4 4 0 00-4-4H8a4 4 0 00-4 4v12h8zm0 0V5.5A2.5 2.5 0 0114.5 3h1A2.5 2.5 0 0118 5.5V8m-6 0h6m0 0v12a2 2 0 01-2 2h-4a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-muted-foreground mb-4">You haven&apos;t added any sponsorship plans yet</p>
                        <Button onClick={addSponsorshipPlan} type="button">
                          Add Sponsorship Plan
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {sponsorshipPlans.map((plan, index) => (
                          <div key={plan.id} className="p-5 border border-border rounded-md relative">
                            <button
                              type="button"
                              onClick={() => removeSponsorshipPlan(index)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                              aria-label="Delete sponsorship plan"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            
                            <h4 className="text-md font-semibold mb-4">Sponsorship Plan {index + 1}</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label htmlFor={`plan-title-${index}`}>Plan Name</Label>
                                <Input
                                  id={`plan-title-${index}`}
                                  value={plan.title}
                                  onChange={(e) => updateSponsorshipPlan(index, 'title', e.target.value)}
                                  placeholder="Diamond Sponsor"
                                  required
                                  className="mt-1 bg-background border-border"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`plan-price-${index}`}>Price (TWD)</Label>
                                <Input
                                  id={`plan-price-${index}`}
                                  type="number"
                                  min="0"
                                  value={plan.price}
                                  onChange={(e) => updateSponsorshipPlan(index, 'price', e.target.value)}
                                  placeholder="50000"
                                  required
                                  className="mt-1 bg-background border-border"
                                />
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <Label htmlFor={`plan-description-${index}`}>Plan Description</Label>
                              <Textarea
                                id={`plan-description-${index}`}
                                value={plan.description}
                                onChange={(e) => updateSponsorshipPlan(index, 'description', e.target.value)}
                                placeholder="Provides the highest level of brand exposure and exclusive benefits..."
                                rows={2}
                                required
                                className="mt-1 bg-background border-border"
                              />
                            </div>
                            
                            <div className="mb-4">
                              <Label htmlFor={`plan-max-sponsors-${index}`}>Maximum Number of Sponsors</Label>
                              <Input
                                id={`plan-max-sponsors-${index}`}
                                type="number"
                                min="1"
                                value={plan.max_sponsors}
                                onChange={(e) => updateSponsorshipPlan(index, 'max_sponsors', e.target.value)}
                                required
                                className="mt-1 bg-background border-border"
                              />
                            </div>
                            
                            <div>
                              <Label>Benefits</Label>
                              <div className="mt-2 space-y-2">
                                {plan.benefits.map((benefit, benefitIndex) => (
                                  <div key={benefitIndex} className="flex items-center gap-2">
                                    <div className="bg-primary/10 text-primary rounded-md px-3 py-1 flex-grow flex items-center">
                                      <span>{benefit}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeBenefit(index, benefitIndex)}
                                        className="ml-auto text-muted-foreground hover:text-destructive"
                                        aria-label="Remove benefit"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="E.g.: Main stage speaking opportunity, VIP dinner seats, etc."
                                    value={newBenefit}
                                    onChange={(e) => setNewBenefit(e.target.value)}
                                    className="flex-grow bg-background border-border"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addBenefit(index)}
                                    className="shrink-0"
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={addSponsorshipPlan}
                          className="w-full border-dashed"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Another Sponsorship Plan
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-border hover:bg-accent"
                >
                  {cancelButtonText}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="relative"
                >
                  {isLoading ? (
                    <>
                      <span className="opacity-0">{submitButtonText}</span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    </>
                  ) : submitButtonText}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
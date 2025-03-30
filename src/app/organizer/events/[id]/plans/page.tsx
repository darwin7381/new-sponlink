'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getEventById, getSponsorshipPlans, createSponsorshipPlan, updateSponsorshipPlan, deleteSponsorshipPlan } from "@/services/eventService";
import { Event, SponsorshipPlan } from "@/types/event";
import { isAuthenticated, getCurrentUser } from "@/lib/services/authService";

export default function ManagePlansPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [plans, setPlans] = useState<SponsorshipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SponsorshipPlan | null>(null);
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    price: 0,
    benefits: "",
    max_sponsors: 1,
    current_sponsors: 0
  });
  const [editPlan, setEditPlan] = useState({
    title: "",
    description: "",
    price: 0,
    benefits: "",
    max_sponsors: 1,
    current_sponsors: 0
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

  // Get event and sponsorship plans
  useEffect(() => {
    async function fetchEventAndPlans() {
      if (!isAuthenticated()) {
        return; // If user is not authenticated, don't fetch data
      }
      
      setError("");
      
      try {
        // In Next.js 15, we need to await params
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setEventId(id); // Store ID for later use
        
        // Get event details
        const eventData = await getEventById(id);
        if (!eventData) {
          setError("Event not found");
          return;
        }
        
        setEvent(eventData);
        
        // Get sponsorship plans
        const plansData = await getSponsorshipPlans(id);
        setPlans(plansData || []);
      } catch (error) {
        console.error("Error fetching event and plans:", error);
        setError("Failed to load event and sponsorship plans. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEventAndPlans();
  }, [params]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'max_sponsors' || name === 'current_sponsors') {
      setNewPlan(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setNewPlan(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle creating new sponsorship plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Convert benefits string to array
      const benefitsArray = newPlan.benefits
        .split('\n')
        .map(benefit => benefit.trim())
        .filter(benefit => benefit !== "");
      
      // Prepare new plan data
      const planData = {
        event_id: eventId,
        title: newPlan.title,
        price: Number(newPlan.price),
        description: newPlan.description,
        benefits: benefitsArray,
        max_sponsors: Number(newPlan.max_sponsors),
        current_sponsors: 0
      };
      
      // Create new plan
      const createdPlan = await createSponsorshipPlan(eventId, planData);
      
      if (createdPlan) {
        // Update plans list
        setPlans(prevPlans => [...prevPlans, createdPlan]);
        
        // Reset form
        setNewPlan({
          title: "",
          description: "",
          price: 0,
          benefits: "",
          max_sponsors: 1,
          current_sponsors: 0
        });
        
        // Close dialog
        handleCloseAddDialog();
      }
    } catch (error) {
      console.error("Error creating sponsorship plan:", error);
      setError("Failed to create sponsorship plan. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  // 開始編輯贊助計劃
  const handleEditClick = (plan: SponsorshipPlan) => {
    setCurrentPlan(plan);
    setEditPlan({
      title: plan.title,
      description: plan.description,
      price: plan.price,
      benefits: plan.benefits.join('\n'),
      max_sponsors: plan.max_sponsors || 1,
      current_sponsors: plan.current_sponsors || 0
    });
    setIsEditDialogOpen(true);
  };

  // 處理編輯表單輸入變化
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'max_sponsors' || name === 'current_sponsors') {
      setEditPlan(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setEditPlan(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 處理更新贊助計劃
  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPlan) return;
    
    try {
      setIsSaving(true);
      
      // 將福利字符串轉換為數組
      const benefitsArray = editPlan.benefits
        .split('\n')
        .map(benefit => benefit.trim())
        .filter(benefit => benefit !== "");
      
      // 準備更新數據
      const planData = {
        title: editPlan.title,
        price: Number(editPlan.price),
        description: editPlan.description,
        benefits: benefitsArray,
        max_sponsors: Number(editPlan.max_sponsors),
        current_sponsors: Number(editPlan.current_sponsors)
      };
      
      // 更新計劃
      const updatedPlan = await updateSponsorshipPlan(eventId, currentPlan.id, planData);
      
      if (updatedPlan) {
        // 更新計劃列表
        setPlans(prevPlans => 
          prevPlans.map(plan => 
            plan.id === updatedPlan.id ? updatedPlan : plan
          )
        );
        
        // 關閉對話框
        handleDialogClose();
      }
    } catch (error) {
      console.error("更新贊助計劃時出錯:", error);
      setError("更新贊助計劃失敗。請稍後再試。");
    } finally {
      setIsSaving(false);
    }
  };

  // 處理刪除贊助計劃
  const handleDeletePlan = async (planId: string) => {
    if (!confirm("確定要刪除此贊助計劃嗎？此操作無法撤銷。")) return;
    
    try {
      setIsDeleting(true);
      
      // 刪除計劃
      const success = await deleteSponsorshipPlan(eventId, planId);
      
      if (success) {
        // 更新計劃列表
        setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      } else {
        setError("刪除贊助計劃失敗。請稍後再試。");
      }
    } catch (error) {
      console.error("刪除贊助計劃時出錯:", error);
      setError("刪除贊助計劃失敗。請稍後再試。");
    } finally {
      setIsDeleting(false);
    }
  };

  // 在對話框關閉時
  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setCurrentPlan(null);
  };

  const handleOpenAddDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsDialogOpen(false);
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

  if (!event) {
    return (
      <div className="bg-background text-foreground min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border border-border bg-card text-card-foreground">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium">Event Not Found</h2>
              <p className="mt-2 text-muted-foreground">
                This event may have been deleted or you don&apos;t have permission to view it.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/organizer/events")}>
                Back to Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="outline" onClick={() => router.push(`/organizer/events/${event.id}`)}>
              Back to Event Details
            </Button>
            <h1 className="mt-4 text-3xl font-bold">Manage Sponsorship Plans</h1>
            <p className="mt-2 text-muted-foreground">Event: {event.title}</p>
          </div>
          <Button variant="default" onClick={handleOpenAddDialog}>
            Add Sponsorship Plan
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {plans.length === 0 ? (
          <Card className="border border-border bg-card text-card-foreground">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium">No Sponsorship Plans Yet</h2>
              <p className="mt-2 text-muted-foreground">
                Click the &quot;Add Sponsorship Plan&quot; button to create your first sponsorship plan.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Card key={plan.id} className="overflow-hidden border border-border bg-card text-card-foreground">
                <CardHeader className="pb-3 bg-muted/30">
                  <div className="flex justify-between items-start">
                    <CardTitle>{plan.title}</CardTitle>
                    <div className="text-xl font-bold">${plan.price.toLocaleString()}</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Benefits:</h3>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {(plan.max_sponsors !== undefined && plan.current_sponsors !== undefined) && (
                    <div className="text-sm text-muted-foreground mb-4">
                      Sponsors: {plan.current_sponsors} / {plan.max_sponsors}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(plan)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={isDeleting}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Sponsorship Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-remove-scroll-bar="keep-scroll-bar">
          <DialogHeader>
            <DialogTitle>Add Sponsorship Plan</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreatePlan} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Plan Name</Label>
              <Input
                id="title"
                name="title"
                value={newPlan.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Plan Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newPlan.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={newPlan.price}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="benefits">Benefits (one per line)</Label>
              <Textarea
                id="benefits"
                name="benefits"
                value={newPlan.benefits}
                onChange={handleInputChange}
                rows={4}
                placeholder="Main stage speaking opportunity&#10;VIP dinner seats&#10;Brand prominently displayed in all promotional materials"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_sponsors">Maximum Sponsors</Label>
                <Input
                  id="max_sponsors"
                  name="max_sponsors"
                  type="number"
                  min="1"
                  value={newPlan.max_sponsors}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="current_sponsors">Current Sponsors</Label>
                <Input
                  id="current_sponsors"
                  name="current_sponsors"
                  type="number"
                  min="0"
                  max={newPlan.max_sponsors}
                  value={newPlan.current_sponsors}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseAddDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Creating..." : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 編輯贊助計劃對話框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-remove-scroll-bar="keep-scroll-bar">
          <DialogHeader>
            <DialogTitle>編輯贊助計劃</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdatePlan} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="edit-title">計劃名稱</Label>
              <Input
                id="edit-title"
                name="title"
                value={editPlan.title}
                onChange={handleEditInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">計劃描述</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editPlan.description}
                onChange={handleEditInputChange}
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-price">價格</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                min="0"
                value={editPlan.price}
                onChange={handleEditInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-benefits">福利（每行一項）</Label>
              <Textarea
                id="edit-benefits"
                name="benefits"
                value={editPlan.benefits}
                onChange={handleEditInputChange}
                rows={4}
                placeholder="主舞台演講機會&#10;VIP晚宴席位&#10;品牌在所有宣傳材料中突出顯示"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-max_sponsors">最大贊助商數量</Label>
                <Input
                  id="edit-max_sponsors"
                  name="max_sponsors"
                  type="number"
                  min="1"
                  value={editPlan.max_sponsors}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-current_sponsors">當前贊助商數量</Label>
                <Input
                  id="edit-current_sponsors"
                  name="current_sponsors"
                  type="number"
                  min="0"
                  max={editPlan.max_sponsors}
                  value={editPlan.current_sponsors}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                取消
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "更新中..." : "更新計劃"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
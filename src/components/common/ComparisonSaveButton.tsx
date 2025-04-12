'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ComparisonResult } from '@/types/userPreferences';
import { saveComparisonResult } from '@/services/userPreferenceService';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ComparisonSaveButtonProps {
  comparisonItems: Array<{
    type: string;
    id: string;
    metadata: Record<string, unknown>;
  }>;
  comparisonCriteria: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  onSaveComplete?: (result: ComparisonResult) => void;
}

/**
 * Comparison Result Save Button Component
 * Used to save comparison results on the comparison page
 */
export function ComparisonSaveButton({ 
  comparisonItems,
  comparisonCriteria,
  className = '',
  size = 'md',
  variant = 'outline',
  onSaveComplete
}: ComparisonSaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comparisonName, setComparisonName] = useState('');
  const router = useRouter();
  const { user, isLoggedIn, showLoginModal } = useAuth();

  // Set icon size based on button size
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  // Handle opening save dialog
  const handleOpenSaveDialog = () => {
    // Must be logged in to save comparison results
    if (!isLoggedIn) {
      toast.error('Please log in first', {
        description: 'You need to be logged in to save comparison results'
      });
      showLoginModal();
      return;
    }
    
    // Open dialog
    setDialogOpen(true);
    
    // Generate default comparison name
    const defaultName = `Comparison Result (${new Date().toLocaleDateString('en-US')})`;
    setComparisonName(defaultName);
  };

  // Handle saving comparison result
  const handleSaveComparison = async () => {
    try {
      // Validate form
      if (!comparisonName.trim()) {
        toast.error('Please enter a comparison name');
        return;
      }
      
      setIsLoading(true);
      
      // Get user information
      if (!user) {
        toast.error('Unable to get user information', {
          description: 'Please log in again and try'
        });
        return;
      }
      
      // Prepare comparison data for saving
      const comparisonData = {
        name: comparisonName,
        items: comparisonItems,
        comparison_criteria: comparisonCriteria
      };
      
      // Save comparison result
      const result = await saveComparisonResult(user.id, comparisonData);
      
      // Notify success
      toast.success('Comparison result saved', {
        description: 'You can view it in "My Saved Items"'
      });
      
      // Close dialog
      setDialogOpen(false);
      
      // Callback
      if (onSaveComplete) {
        onSaveComplete(result);
      }
    } catch (error) {
      console.error('Error saving comparison result:', error);
      toast.error('Save failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={handleOpenSaveDialog}
        className={className}
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
      >
        <Save size={getIconSize()} className="mr-2" />
        Save Comparison
      </Button>
      
      {/* Save Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Comparison Result</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comparison-name" className="text-right">
                Comparison Name
              </Label>
              <Input
                id="comparison-name"
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                Items Included
              </div>
              <div className="col-span-3 text-sm">
                {comparisonItems.length} items
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSaveComparison}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 
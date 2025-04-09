'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SavedItemType } from '@/types/userPreferences';
import { saveItem, removeSavedItem, isItemSaved } from '@/services/userPreferenceService';
import { isAuthenticated, getCurrentUser } from '@/lib/services/authService';
import { toast } from 'sonner';

// Custom filled bookmark icon
const BookmarkFilled = (props: any) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
};

interface SaveButtonProps {
  itemId: string;
  itemType: SavedItemType;
  metadata: {
    title: string;
    thumbnail?: string;
    date?: string;
  };
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  onSaveChange?: (isSaved: boolean) => void;
}

/**
 * Save button component
 * Used on event cards, event detail pages, etc. to save items to user's bookmarks
 */
export function SaveButton({ 
  itemId,
  itemType,
  metadata,
  className = '',
  iconOnly = false,
  size = 'md',
  variant = 'outline',
  onSaveChange
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Set icon size based on button size
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  // Check user authentication and saved status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const authenticated = isAuthenticated();
        
        if (authenticated) {
          // Get user info
          const userData = await getCurrentUser();
          if (userData) {
            setUserId(userData.id);
            
            // Check if item is saved
            const saved = await isItemSaved(userData.id, itemId, itemType);
            setIsSaved(saved);
            
            // Notify parent component of status change
            if (onSaveChange) {
              onSaveChange(saved);
            }
          }
        }
      } catch (error) {
        console.error("Authentication check error:", error);
      }
    };
    
    checkAuth();
    
    // Listen for saved items update events
    const handleSavedItemsUpdate = () => {
      checkAuth();
    };
    
    window.addEventListener('savedItemsUpdate', handleSavedItemsUpdate);
    window.addEventListener('authChange', handleSavedItemsUpdate);
    
    return () => {
      window.removeEventListener('savedItemsUpdate', handleSavedItemsUpdate);
      window.removeEventListener('authChange', handleSavedItemsUpdate);
    };
  }, [itemId, itemType, onSaveChange]);

  // Handle save/unsave toggle
  const handleSaveToggle = async () => {
    // Must be logged in to save
    if (!isAuthenticated()) {
      toast.error('Please sign in', {
        description: 'You need to be signed in to save items'
      });
      router.push('/login');
      return;
    }
    
    if (!userId) {
      toast.error('Unable to get user info', {
        description: 'Please sign in and try again'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isSaved) {
        // Remove from saved items
        await removeSavedItem(userId, itemId, itemType);
        setIsSaved(false);
        toast.success('Removed', {
          description: 'Item removed from your saved items'
        });
        
        if (onSaveChange) {
          onSaveChange(false);
        }
      } else {
        // this function requires metadata as an argument
        await saveItem(userId, itemId, itemType, metadata);
        setIsSaved(true);
        toast.success('Saved', {
          description: 'Item added to your saved items'
        });
        
        if (onSaveChange) {
          onSaveChange(true);
        }
      }
    } catch (error) {
      console.error("Save operation error:", error);
      toast.error('Operation failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Icon-only button variant
  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSaveToggle}
        disabled={isLoading}
        className={className}
        aria-label={isSaved ? "Unsave" : "Save"}
      >
        {isSaved ? (
          <BookmarkFilled size={getIconSize()} className="text-primary" />
        ) : (
          <Bookmark size={getIconSize()} />
        )}
      </Button>
    );
  }

  // Full button with text
  return (
    <Button
      variant={isSaved ? "default" : variant}
      onClick={handleSaveToggle}
      disabled={isLoading}
      className={className}
      size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
    >
      {isSaved ? (
        <>
          <BookmarkFilled size={getIconSize()} className="mr-2" />
          Saved
        </>
      ) : (
        <>
          <Bookmark size={getIconSize()} className="mr-2" />
          Save
        </>
      )}
    </Button>
  );
} 
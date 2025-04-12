'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SavedItemType } from '@/types/userPreferences';
import { saveItem, removeSavedItem, isItemSaved } from '@/services/userPreferenceService';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

// 擴展 SVG 屬性接口以包含 size 屬性
interface CustomSVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// Custom filled bookmark icon
const BookmarkFilled = (props: CustomSVGProps) => {
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
  const router = useRouter();
  const { isLoggedIn, user, showLoginModal } = useAuth();

  // Set icon size based on button size
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  // Listen for saved items update events
  useEffect(() => {
    const handleSavedItemsUpdate = async () => {
      if (isLoggedIn && user) {
        try {
          const saved = await isItemSaved(user.id, itemId, itemType);
          setIsSaved(saved);
          if (onSaveChange) {
            onSaveChange(saved);
          }
        } catch (error) {
          console.error("Error checking saved status:", error);
        }
      }
    };
    
    // Check status when component mounts if user is already authenticated
    if (isLoggedIn && user) {
      handleSavedItemsUpdate();
    }
    
    window.addEventListener('savedItemsUpdate', handleSavedItemsUpdate);
    window.addEventListener('authChange', handleSavedItemsUpdate);
    
    return () => {
      window.removeEventListener('savedItemsUpdate', handleSavedItemsUpdate);
      window.removeEventListener('authChange', handleSavedItemsUpdate);
    };
  }, [itemId, itemType, onSaveChange, isLoggedIn, user]);

  // Handle save/unsave toggle
  const handleSaveToggle = async () => {
    // Must be logged in to save
    if (!isLoggedIn) {
      toast.error('Please login', {
        description: 'You need to be logged in to save items'
      });
      showLoginModal();
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (!user) {
        toast.error('Unable to get user information', {
          description: 'Please try again after logging in'
        });
        showLoginModal();
        return;
      }
      
      // Check current saved status
      const savedStatus = await isItemSaved(user.id, itemId, itemType);
      
      if (savedStatus) {
        // Remove from saved items
        await removeSavedItem(user.id, itemId, itemType);
        setIsSaved(false);
        toast.success('Removed', {
          description: 'Item has been removed from your collection'
        });
        
        if (onSaveChange) {
          onSaveChange(false);
        }
      } else {
        // Save item
        await saveItem(user.id, itemId, itemType, metadata);
        setIsSaved(true);
        toast.success('Saved', {
          description: 'Item has been added to your collection'
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
        aria-label={isSaved ? "取消保存" : "保存"}
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
          已保存
        </>
      ) : (
        <>
          <Bookmark size={getIconSize()} className="mr-2" />
          保存
        </>
      )}
    </Button>
  );
} 
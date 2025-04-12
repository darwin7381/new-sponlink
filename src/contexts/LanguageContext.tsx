'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage } from '@/utils/languageUtils';

// Language storage key
const LANGUAGE_STORAGE_KEY = 'app_language_preference';

// Default language
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// Language context type
interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

// Create language context
const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

// Language provider props
interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Language Provider component
 * Manages the application's language state
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [initialized, setInitialized] = useState(false);

  // Initialize language from localStorage on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error retrieving language preference:', error);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Set language handler
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    
    // Save to localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Show children only after initialization
  if (!initialized && typeof window !== 'undefined') {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Custom hook to use the language context
 * Returns the current language and a function to change it
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

/**
 * Get current language without the hook
 * For use in non-React components or utility functions
 * Always defaults to English if not running in browser or if preference not found
 */
export function getCurrentLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === 'zh') {
      return 'zh';
    }
  } catch (error) {
    console.error('Error retrieving language preference:', error);
  }

  return DEFAULT_LANGUAGE;
} 
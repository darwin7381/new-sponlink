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
  isProviderMounted: boolean;
}

// Create language context
const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  isProviderMounted: false
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
  const parentContext = useContext(LanguageContext);

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
    }
  }, []);

  // 檢查是否已有父級LanguageProvider
  if (parentContext.isProviderMounted) {
    console.warn('Nested LanguageProvider detected! Using the parent provider to avoid duplicate rendering.');
    return <>{children}</>; // 直接渲染子元素，不創建新的Provider
  }

  // 不再使用initialized狀態和條件渲染
  // 移除: if (!initialized && typeof window !== 'undefined') { return null; }

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage,
      isProviderMounted: true // 標記Provider已掛載
    }}>
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
  
  return {
    language: context.language,
    setLanguage: context.setLanguage
  };
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
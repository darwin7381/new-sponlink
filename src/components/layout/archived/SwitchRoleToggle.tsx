"use client";

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SwitchViewToggleProps {
  currentView: 'organizer' | 'sponsor';
}

export default function SwitchViewToggle({ currentView }: SwitchViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = () => {
    if (currentView === 'organizer') {
      router.push('/sponsor');
    } else {
      router.push('/organizer');
    }
  };

  // 使用原網站的SVG實現
  return (
    <div className="flex items-center">
      <Link 
        href={currentView === 'organizer' ? '/sponsor' : '/organizer'}
        className="flex items-center text-white hover:text-white/90 transition-colors px-4 py-2"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        {currentView === 'organizer' ? '切換到贊助商視角' : '切換到主辦方視角'}
      </Link>
    </div>
  );
} 
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface SwitchRoleToggleProps {
  currentRole: 'organizer' | 'sponsor';
}

export default function SwitchRoleToggle({ currentRole }: SwitchRoleToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = () => {
    if (currentRole === 'organizer') {
      router.push('/sponsor');
    } else {
      router.push('/organizer');
    }
  };

  return (
    <div className="flex items-center justify-end px-4">
      <Button 
        onClick={handleSwitch}
        variant="outline"
        className="text-sm py-1 h-auto flex items-center gap-2"
      >
        <span className="hidden sm:inline">切換到</span>
        {currentRole === 'organizer' ? '贊助商中心' : '主辦方中心'}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
        </svg>
      </Button>
    </div>
  );
} 
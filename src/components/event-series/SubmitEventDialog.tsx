'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PlusCircle, Calendar } from 'lucide-react';
import { Event } from '@/types/event';
import { getOrganizerEvents } from '@/services/eventService';
import { addEventToSeries } from '@/services/eventSeriesService';
import { getCurrentUser } from '@/lib/services/authService';
import { format } from 'date-fns';

interface SubmitEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
}

const SubmitEventDialog: React.FC<SubmitEventDialogProps> = ({
  isOpen,
  onOpenChange,
  seriesId
}) => {
  const router = useRouter();
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 获取用户的活动列表
  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        setErrorMessage('');
        
        // 获取当前用户
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setErrorMessage('需要登錄才能提交活動');
          setIsLoading(false);
          return;
        }
        
        // 获取用户组织的活动
        const events = await getOrganizerEvents(currentUser.id);
        // 过滤掉已经在系列中的活动
        setOrganizerEvents(events.filter(event => event.event_series_id !== seriesId));
      } catch (error) {
        console.error('Error fetching organizer events:', error);
        setErrorMessage('獲取活動列表失敗');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizerEvents();
  }, [isOpen, seriesId]);

  // 处理复选框变更
  const handleCheckboxChange = (eventId: string) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  // 处理提交事件
  const handleSubmitEvents = async () => {
    if (selectedEvents.length === 0) {
      setErrorMessage('請至少選擇一個活動');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // 将选择的活动添加到系列中
      for (const eventId of selectedEvents) {
        await addEventToSeries(seriesId, eventId);
      }
      
      // 重新加载页面以显示更新
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting events to series:', error);
      setErrorMessage('提交活動失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 跳转到创建活动页面
  const handleCreateEvent = () => {
    router.push(`/organizer/events/create?seriesId=${seriesId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>提交活動到此系列</DialogTitle>
          <DialogDescription>
            選擇您想要添加到此系列的活動，或者創建新活動
          </DialogDescription>
        </DialogHeader>
        
        {errorMessage && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
            {errorMessage}
          </div>
        )}
        
        <div className="py-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">載入活動中...</p>
            </div>
          ) : organizerEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-4">您還沒有可以提交的活動</p>
              <Button onClick={handleCreateEvent} variant="outline">
                <PlusCircle className="w-4 h-4 mr-2" />
                創建新活動
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {organizerEvents.map(event => (
                <div key={event.id} className="flex items-start space-x-3 p-3 rounded-md border border-muted hover:bg-muted/20">
                  <Checkbox
                    id={`event-${event.id}`}
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => handleCheckboxChange(event.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`event-${event.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {event.title}
                    </Label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {event.start_time && (
                        <span className="block">
                          {format(new Date(event.start_time), 'yyyy年MM月dd日 HH:mm')}
                        </span>
                      )}
                      {event.location?.name && (
                        <span className="block mt-1">{event.location.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Button onClick={handleCreateEvent} variant="outline" className="w-full">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  創建新活動
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          {organizerEvents.length > 0 && (
            <Button
              onClick={handleSubmitEvents}
              disabled={selectedEvents.length === 0 || isSubmitting}
              className="relative"
            >
              {isSubmitting ? (
                <>
                  <span className="opacity-0">提交所選活動</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </>
              ) : `提交所選活動 (${selectedEvents.length})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitEventDialog; 
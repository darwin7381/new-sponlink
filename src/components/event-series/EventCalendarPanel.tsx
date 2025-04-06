'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapboxEventMap from '@/components/maps/MapboxEventMap';
import { Event } from '@/types/event';
import SubmitEventDialog from './SubmitEventDialog';

interface EventCalendarPanelProps {
  events: Event[];
  currentMonth: Date;
  selectedDate: Date | null;
  showMode: "upcoming" | "past";
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  setSelectedDate: (date: Date | null) => void;
  setShowMode: (mode: "upcoming" | "past") => void;
  seriesId: string;
  onFilterByEventIds?: (eventIds: string[]) => void;
}

const EventCalendarPanel: React.FC<EventCalendarPanelProps> = ({
  events,
  currentMonth,
  selectedDate,
  showMode,
  handlePrevMonth,
  handleNextMonth,
  setSelectedDate,
  setShowMode,
  seriesId,
  onFilterByEventIds
}) => {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [localSelectedDate, setLocalSelectedDate] = useState<Date | null>(selectedDate);
  
  // 同步本地選中日期與父組件
  useEffect(() => {
    setLocalSelectedDate(selectedDate);
  }, [selectedDate]);
  
  // 處理地圖標記點擊
  const handleMarkerClick = (eventIds: string[]) => {
    if (onFilterByEventIds) {
      onFilterByEventIds(eventIds);
    }
  };

  // 處理日期點擊
  const handleDateClick = (date: Date, eventsOnDay: Event[]) => {
    console.log("Date clicked:", format(date, 'yyyy-MM-dd'));
    console.log("Current selected date:", selectedDate ? format(selectedDate, 'yyyy-MM-dd') : "none");
    
    // 如果已經選中該日期，則清除選擇
    if (selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
      console.log("Clearing date selection");
      setSelectedDate(null);
      setLocalSelectedDate(null);
      // 清除篩選
      if (onFilterByEventIds) {
        onFilterByEventIds([]);
      }
    } else {
      // 選擇該日期
      console.log("Setting new date selection");
      setSelectedDate(date);
      setLocalSelectedDate(date);
      
      // 篩選該天的事件
      if (onFilterByEventIds) {
        const eventIds = eventsOnDay.map(event => event.id);
        onFilterByEventIds(eventIds);
      }
    }
  };

  // 清除日期選擇
  const clearDateSelection = () => {
    console.log("Clearing date selection from X button");
    setSelectedDate(null);
    setLocalSelectedDate(null);
    // 清除篩選
    if (onFilterByEventIds) {
      onFilterByEventIds([]);
    }
  };

  // 調試查看當前狀態
  console.log("Rendering calendar with selected date:", localSelectedDate ? format(localSelectedDate, 'yyyy-MM-dd') : "none");

  return (
    <div className="w-full md:w-72 flex-shrink-0">
      {/* 提交活動按鈕 */}
      <div className="text-center">
        <Button 
          className="w-full text-sm h-9"
          variant="outline"
          onClick={() => setSubmitDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Submit Event
        </Button>
      </div>
      
      {/* 提交活動彈窗 */}
      <SubmitEventDialog 
        isOpen={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        seriesId={seriesId}
      />
      
      {/* 固定容器 - 包含日曆和地圖 */}
      <div className="sticky top-20 mt-6 space-y-6">
        {/* 日曆組件 */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          {/* 日曆頂部 - 月份和導航 */}
          <div className="p-3 border-b border-border flex justify-between items-center">
            <h3 className="font-medium text-sm">{format(currentMonth, 'MMMM')}</h3>
            <div className="flex space-x-2">
              <button
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-secondary/20 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                title="Previous month"
                aria-label="View previous month"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-secondary/20 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" 
                title="Next month"
                aria-label="View next month"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* 日曆主體 */}
          <div className="p-3">
            {/* 週日標題 */}
            <div className="grid grid-cols-7 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={day + index} className="text-xs text-muted-foreground">{day}</div>
              ))}
            </div>
            
            {/* 日曆天數網格 */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* 上個月的日期 */}
              {(() => {
                const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
                const days = [];
                
                for (let i = 0; i < firstDay; i++) {
                  const day = prevMonthLastDay - firstDay + i + 1;
                  days.push(
                    <div key={`prev-${day}`} className="h-6 w-6 text-muted-foreground/50 flex items-center justify-center">
                      {day}
                    </div>
                  );
                }
                
                return days;
              })()}
              
              {/* 當前月份的日期 */}
              {(() => {
                const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                const days = [];
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  
                  // 檢查這一天是否有事件
                  const eventsOnDay = events.filter(event => {
                    if (!event.start_time) return false;
                    const eventDate = new Date(event.start_time);
                    return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  });
                  
                  const hasEvents = eventsOnDay.length > 0;
                  
                  // 檢查是否為選中的日期
                  const isSelected = localSelectedDate && 
                    format(date, 'yyyy-MM-dd') === format(localSelectedDate, 'yyyy-MM-dd');
                  
                  // 檢查是否為今天
                  const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  
                  days.push(
                    <div 
                      key={`day-${day}`}
                      className={`h-6 w-6 rounded-full relative flex items-center justify-center ${hasEvents ? "cursor-pointer" : ""} 
                        ${isSelected ? "bg-primary text-primary-foreground font-medium" : 
                          isToday ? "border border-primary text-primary" : 
                            hasEvents ? "text-white hover:bg-white/20" : "text-muted-foreground"
                        }
                      `}
                      onClick={() => {
                        if (hasEvents) {
                          handleDateClick(date, eventsOnDay);
                        }
                      }}
                    >
                      {day}
                      {hasEvents && !isSelected && (
                        <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
                      )}
                    </div>
                  );
                }
                
                return days;
              })()}
              
              {/* 下個月的日期 */}
              {(() => {
                const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDay();
                const daysToAdd = 6 - lastDay;
                const days = [];
                
                for (let i = 1; i <= daysToAdd; i++) {
                  days.push(
                    <div key={`next-${i}`} className="h-6 w-6 text-muted-foreground/50 flex items-center justify-center">
                      {i}
                    </div>
                  );
                }
                
                return days;
              })()}
            </div>
          </div>
          
          {/* 日曆底部 - 選中日期顯示或切換按鈕 */}
          <div className="p-3 border-t border-border">
            {localSelectedDate ? (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {format(localSelectedDate, 'MMMM d, yyyy')}
                </span>
                <button 
                  className="h-5 w-5 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors"
                  onClick={clearDateSelection}
                  title="Clear date selection"
                  aria-label="Clear date selection"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between">
                <button
                  className={`text-xs py-1 px-4 h-7 rounded transition-colors ${
                    showMode === "upcoming" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/20"
                  }`}
                  onClick={() => setShowMode("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  className={`text-xs py-1 px-4 h-7 rounded transition-colors ${
                    showMode === "past" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/20"
                  }`}
                  onClick={() => setShowMode("past")}
                >
                  Past
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 活動地點地圖組件 */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <div className="aspect-video w-full relative bg-neutral-900">
            <MapboxEventMap 
              locations={events
                .filter(event => event.location && (event.location.latitude && event.location.longitude))
                .map(event => ({
                  id: event.id,
                  title: event.title,
                  location: event.location
                }))}
              height="100%"
              width="100%"
              onMarkerClick={handleMarkerClick}
              seriesId={seriesId}
              stableLocations={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCalendarPanel; 
'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapboxEventMap from '@/components/maps/MapboxEventMap';
import { Event } from '@/types/event';

interface EventCalendarPanelProps {
  events: Event[];
  currentMonth: Date;
  selectedDate: Date | null;
  showMode: "upcoming" | "past";
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  setSelectedDate: (date: Date | null) => void;
  setShowMode: (mode: "upcoming" | "past") => void;
}

const EventCalendarPanel: React.FC<EventCalendarPanelProps> = ({
  events,
  currentMonth,
  selectedDate,
  showMode,
  handlePrevMonth,
  handleNextMonth,
  setSelectedDate,
  setShowMode
}) => {
  return (
    <div className="w-full md:w-72 flex-shrink-0">
      {/* 提交活動按鈕 */}
      <div className="bg-card border border-border rounded-md p-4 text-center">
        <h3 className="font-medium mb-2 text-sm">Submit your event to this calendar</h3>
        <p className="text-xs text-muted-foreground mb-3">Want to add your event to this series?</p>
        <Link href="/create-event">
          <Button 
            className="w-full text-sm h-9"
            variant="outline"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Submit Event
          </Button>
        </Link>
      </div>
      
      {/* 固定容器 - 包含日曆和地圖 */}
      <div className="sticky top-20 mt-6 space-y-6">
        {/* 日曆組件 */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <div className="p-3 border-b border-border flex justify-between items-center">
            <h3 className="font-medium text-sm">{format(currentMonth, 'MMMM')}</h3>
            <div className="flex space-x-2">
              <div
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-secondary/20 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                title="Previous month"
                aria-label="View previous month"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </div>
              <div
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-secondary/20 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" 
                title="Next month"
                aria-label="View next month"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* 如果有選中日期，顯示日期和取消按鈕 */}
          {selectedDate && (
            <div className="p-2 bg-primary/10 flex justify-between items-center">
              <span className="text-xs font-medium">{format(selectedDate, 'MMMM d')}</span>
              <Button 
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-primary/20"
                onClick={() => setSelectedDate(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <div className="p-3">
            {/* 週日標題 */}
            <div className="grid grid-cols-7 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={day + index} className="text-xs text-muted-foreground">{day}</div>
              ))}
            </div>
            
            {/* 日曆天數 */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* 計算本月第一天是星期幾 */}
              {(() => {
                // 獲取當月第一天是星期幾 (0-6)
                const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                // 上個月的最後幾天
                const prevMonthDays = [];
                const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
                
                for (let i = 0; i < firstDay; i++) {
                  const day = prevMonthLastDay - firstDay + i + 1;
                  prevMonthDays.push(
                    <div key={`prev-${day}`} className="h-6 w-6 text-muted-foreground/50 flex items-center justify-center">
                      {day}
                    </div>
                  );
                }
                
                return prevMonthDays;
              })()}
              
              {/* 當月的天數 */}
              {(() => {
                // 當月的天數
                const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                const days = [];
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  
                  // 檢查這一天是否有事件
                  const hasEvents = events.some(event => {
                    if (!event.start_time) return false;
                    const eventDate = new Date(event.start_time);
                    return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  });
                  
                  // 檢查是否為選中的日期
                  const isSelected = selectedDate && 
                    format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  
                  // 檢查是否為今天
                  const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  
                  days.push(
                    <div 
                      key={`day-${day}`}
                      className={`h-6 w-6 rounded-full relative flex items-center justify-center ${
                        isSelected ? "bg-primary text-primary-foreground" :
                        isToday ? "border border-primary text-primary" :
                        hasEvents ? "text-primary hover:bg-primary/20 cursor-pointer" :
                        "text-foreground"
                      }`}
                      onClick={() => {
                        // 只有包含事件的日期可以點擊
                        if (hasEvents) {
                          // 如果已經選中，則清除選擇
                          if (isSelected) {
                            setSelectedDate(null);
                          } else {
                            setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                          }
                        }
                      }}
                    >
                      {day}
                      {/* 有活動的日期顯示小圓點 */}
                      {hasEvents && !isSelected && (
                        <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
                      )}
                    </div>
                  );
                }
                
                return days;
              })()}
              
              {/* 下個月的前幾天 */}
              {(() => {
                const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDay();
                const nextMonthDays = [];
                const daysToAdd = 6 - lastDay;
                
                for (let i = 1; i <= daysToAdd; i++) {
                  nextMonthDays.push(
                    <div key={`next-${i}`} className="h-6 w-6 text-muted-foreground/50 flex items-center justify-center">
                      {i}
                    </div>
                  );
                }
                
                return nextMonthDays;
              })()}
            </div>
          </div>
          
          <div className="p-3 border-t border-border flex justify-between">
            <button
              className={`text-xs py-1 px-4 h-7 rounded transition-colors ${showMode === "upcoming" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/20"}`}
              onClick={() => setShowMode("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`text-xs py-1 px-4 h-7 rounded transition-colors ${showMode === "past" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/20"}`}
              onClick={() => setShowMode("past")}
            >
              Past
            </button>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCalendarPanel; 
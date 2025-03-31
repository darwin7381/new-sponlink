"use client";

import { useState, useEffect } from "react";
import { getAllEventSeries } from "@/services/eventSeriesService";
import { EventStatus, EventSeries, EventSeriesType } from "@/types/event";
import { EventSeriesCard } from "@/components/events/EventSeriesCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventSeriesPage() {
  const [eventSeries, setEventSeries] = useState<EventSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<EventSeries[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventSeries = async () => {
      try {
        setLoading(true);
        const series = await getAllEventSeries({
          status: EventStatus.PUBLISHED
        });
        setEventSeries(series);
        setFilteredSeries(series);
      } catch (error) {
        console.error('Error fetching event series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventSeries();
  }, []);

  useEffect(() => {
    // 篩選邏輯
    let results = [...eventSeries];
    
    // 按系列類型篩選
    if (selectedType !== "all") {
      results = results.filter(series => series.series_type === selectedType);
    }
    
    // 搜尋詞篩選
    if (searchTerm.trim() !== "") {
      const normalized = searchTerm.toLowerCase();
      results = results.filter(series => 
        series.title.toLowerCase().includes(normalized) ||
        series.description.toLowerCase().includes(normalized) ||
        series.tags.some(tag => tag.toLowerCase().includes(normalized)) ||
        series.locations.some(location => location.toLowerCase().includes(normalized))
      );
    }
    
    setFilteredSeries(results);
  }, [searchTerm, selectedType, eventSeries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 搜索逻辑已经在useEffect中实现
  };

  // 所有可用的系列類型列表
  const seriesTypes = [
    { value: "all", label: "全部類型" },
    { value: EventSeriesType.BLOCKCHAIN_WEEK, label: "區塊鏈週" },
    { value: EventSeriesType.HACKATHON_SERIES, label: "黑客松系列" },
    { value: EventSeriesType.CONFERENCE_SERIES, label: "會議系列" },
    { value: EventSeriesType.ROADSHOW, label: "路演" },
    { value: EventSeriesType.CUSTOM, label: "自定義" },
  ];

  const getSeriesCount = (type: string) => {
    if (type === "all") return eventSeries.length;
    return eventSeries.filter(series => series.series_type === type).length;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 頂部標題區域 */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">活動系列</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          探索各種精彩的區塊鏈和 Web3 活動系列，包括會議、黑客松和區塊鏈週等。
        </p>
      </div>
      
      {/* 搜索和過濾區 */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                type="text"
                placeholder="搜索活動系列..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </form>
          
          <div className="md:w-56">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="全部類型" />
              </SelectTrigger>
              <SelectContent>
                {seriesTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} ({getSeriesCount(type.value)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* 類型快速篩選 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {seriesTypes.map((type) => (
          <Badge 
            key={type.value}
            variant={selectedType === type.value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedType(type.value)}
          >
            {type.label} ({getSeriesCount(type.value)})
          </Badge>
        ))}
      </div>
      
      {/* 加載狀態 */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      )}
      
      {/* 活動系列列表 */}
      {!loading && (
        <>
          {filteredSeries.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-lg">
              <h3 className="text-xl font-medium mb-2">未找到符合條件的活動系列</h3>
              <p className="text-muted-foreground">
                請嘗試使用不同的搜索關鍵詞，或者重設篩選條件。
              </p>
              {searchTerm || selectedType !== "all" ? (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                  }}
                >
                  清除篩選條件
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSeries.map((series) => (
                <EventSeriesCard key={series.id} series={series} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 
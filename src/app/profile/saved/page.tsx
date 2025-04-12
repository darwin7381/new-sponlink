'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSavedItems, removeSavedItem } from '@/services/userPreferenceService';
import { SavedItem, SavedItemType } from '@/types/userPreferences';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Filter, MapPin, Search, Trash2, Bookmark, BookmarkPlus, ChevronRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SavedItemsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, isLoggedIn, showLoginModal } = useAuth();

  // Load user data and saved items
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isLoggedIn) {
          showLoginModal();
          return;
        }

        if (!user) {
          showLoginModal();
          return;
        }

        loadSavedItems(user.id);
      } catch (error) {
        console.error('Authentication check error:', error);
        showLoginModal();
      }
    };

    checkAuth();
  }, [router, isLoggedIn, user, showLoginModal]);

  // Load saved items
  const loadSavedItems = async (uid: string) => {
    setIsLoading(true);
    try {
      const items = await getSavedItems(uid);
      setSavedItems(items);
    } catch (error) {
      console.error('獲取收藏項目錯誤:', error);
      toast.error('無法載入收藏項目');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove saved item
  const handleRemoveItem = async (itemId: string, itemType: SavedItemType) => {
    if (!user) return;

    try {
      await removeSavedItem(user.id, itemId, itemType);
      toast.success('項目已從收藏中移除');
      // Update list
      setSavedItems(prev => prev.filter(item => !(item.item_id === itemId && item.item_type === itemType)));
    } catch (error) {
      console.error('移除收藏項目錯誤:', error);
      toast.error('移除收藏項目失敗');
    }
  };

  // Filter activity items
  const getFilteredItems = () => {
    let filtered = savedItems;

    // Filter by activity tag
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.item_type === activeTab);
    }

    // Filter by search keyword
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.metadata.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Get tag counts
  const getTabCounts = () => {
    const counts = {
      all: savedItems.length,
      event: 0,
      comparison_result: 0,
      sponsorship_plan: 0,
      organizer: 0,
      collection: 0,
      search_query: 0
    };

    savedItems.forEach(item => {
      if (counts.hasOwnProperty(item.item_type)) {
        counts[item.item_type as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const tabCounts = getTabCounts();
  const filteredItems = getFilteredItems();

  // Format date display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (e) {
      return dateString;
    }
  };

  // Get item icon
  const getItemIcon = (type: SavedItemType) => {
    switch (type) {
      case SavedItemType.EVENT:
        return <Calendar className="h-4 w-4 mr-1" />;
      case SavedItemType.COMPARISON_RESULT:
        return <Filter className="h-4 w-4 mr-1" />;
      case SavedItemType.SPONSORSHIP_PLAN:
        return <BookmarkPlus className="h-4 w-4 mr-1" />;
      case SavedItemType.ORGANIZER:
        return <MapPin className="h-4 w-4 mr-1" />;
      default:
        return <Bookmark className="h-4 w-4 mr-1" />;
    }
  };

  // Get item detail page link
  const getItemLink = (item: SavedItem) => {
    switch (item.item_type) {
      case SavedItemType.EVENT:
        return `/events/${item.item_id}`;
      case SavedItemType.COMPARISON_RESULT:
        return `/compare?id=${item.item_id}`;
      case SavedItemType.SPONSORSHIP_PLAN:
        return `/sponsor/event/${item.item_id.split('-')[0]}`;
      case SavedItemType.ORGANIZER:
        return `/organizer/${item.item_id}`;
      default:
        return '#';
    }
  };

  // Get item type Chinese name
  const getItemTypeName = (type: SavedItemType) => {
    switch (type) {
      case SavedItemType.EVENT:
        return '活動';
      case SavedItemType.COMPARISON_RESULT:
        return '比較結果';
      case SavedItemType.SPONSORSHIP_PLAN:
        return '贊助方案';
      case SavedItemType.ORGANIZER:
        return '主辦方';
      case SavedItemType.COLLECTION:
        return '集合';
      case SavedItemType.SEARCH_QUERY:
        return '搜索條件';
      default:
        return '未知類型';
    }
  };

  // Loading display
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">我的收藏</h1>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page title */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">我的收藏</h1>
        <Button variant="outline" onClick={() => router.push('/profile')}>
          返回個人資料
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索收藏項目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-3 sm:flex">
          <TabsTrigger value="all">
            全部 <Badge variant="outline" className="ml-2">{tabCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value={SavedItemType.EVENT}>
            活動 <Badge variant="outline" className="ml-2">{tabCounts.event}</Badge>
          </TabsTrigger>
          <TabsTrigger value={SavedItemType.COMPARISON_RESULT}>
            比較結果 <Badge variant="outline" className="ml-2">{tabCounts.comparison_result}</Badge>
          </TabsTrigger>
          <TabsTrigger value={SavedItemType.SPONSORSHIP_PLAN}>
            贊助方案 <Badge variant="outline" className="ml-2">{tabCounts.sponsorship_plan}</Badge>
          </TabsTrigger>
          <TabsTrigger value={SavedItemType.ORGANIZER}>
            主辦方 <Badge variant="outline" className="ml-2">{tabCounts.organizer}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* All category content */}
        <TabsContent value="all" className="mt-0">
          {renderItemList(filteredItems)}
        </TabsContent>
        
        {/* Activity category */}
        <TabsContent value={SavedItemType.EVENT} className="mt-0">
          {renderItemList(filteredItems)}
        </TabsContent>
        
        {/* Comparison result category */}
        <TabsContent value={SavedItemType.COMPARISON_RESULT} className="mt-0">
          {renderItemList(filteredItems)}
        </TabsContent>
        
        {/* Sponsorship plan category */}
        <TabsContent value={SavedItemType.SPONSORSHIP_PLAN} className="mt-0">
          {renderItemList(filteredItems)}
        </TabsContent>
        
        {/* Organizer category */}
        <TabsContent value={SavedItemType.ORGANIZER} className="mt-0">
          {renderItemList(filteredItems)}
        </TabsContent>
      </Tabs>
    </div>
  );

  // Render saved item list
  function renderItemList(items: SavedItem[]) {
    if (items.length === 0) {
      return (
        <div className="text-center py-20 border rounded-lg border-dashed">
          <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">沒有收藏項目</h3>
          <p className="text-muted-foreground mb-6">您尚未收藏任何{activeTab === 'all' ? '項目' : getItemTypeName(activeTab as SavedItemType)}</p>
          <Button onClick={() => router.push('/events')}>瀏覽活動</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full">
              {/* Card title */}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 flex items-center w-fit">
                      {getItemIcon(item.item_type)}
                      {getItemTypeName(item.item_type)}
                    </Badge>
                    <CardTitle className="line-clamp-2 text-base">{item.metadata.title}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveItem(item.item_id, item.item_type);
                    }}
                    aria-label="移除收藏"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              
              {/* Card content */}
              <CardContent className="pb-2 pt-0 flex-grow">
                {item.metadata.date && (
                  <p className="text-sm text-muted-foreground flex items-center mb-2">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {formatDate(item.metadata.date)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  收藏於 {formatDate(item.saved_at)}
                </p>
              </CardContent>
              
              {/* Card actions */}
              <CardFooter className="pt-2 pb-3 mt-auto">
                <Link 
                  href={getItemLink(item)} 
                  className="w-full"
                >
                  <Button variant="outline" className="w-full flex justify-between">
                    查看詳情
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    );
  }
} 
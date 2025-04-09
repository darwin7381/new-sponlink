'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FolderPlus, 
  Folder, 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2,
  Check,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  SavedItemType, 
  CustomCollection
} from '@/types/userPreferences';
import { 
  getUserCollections, 
  createCustomCollection,
  addItemToCollection,
  removeItemFromCollection 
} from '@/services/userPreferenceService';
import { isAuthenticated, getCurrentUser } from '@/lib/services/authService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CollectionManagerProps {
  initialItemType?: SavedItemType;
  initialItemId?: string;
  onCollectionChange?: (collection: CustomCollection) => void;
}

/**
 * 集合管理器組件
 * 用於建立、編輯和管理自定義集合
 */
export function CollectionManager({ 
  initialItemType,
  initialItemId,
  onCollectionChange
}: CollectionManagerProps) {
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false);
  const [addToCollectionDialogOpen, setAddToCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<CustomCollection | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const router = useRouter();

  // 檢查用戶身份和載入集合
  useEffect(() => {
    const checkAuthAndLoadCollections = async () => {
      try {
        // 檢查用戶是否已登入
        const authenticated = isAuthenticated();
        
        if (authenticated) {
          // 獲取用戶信息
          const userData = await getCurrentUser();
          if (userData) {
            setUserId(userData.id);
            
            // 獲取用戶的集合
            loadUserCollections(userData.id);
          }
        } else {
          // 未登入狀態，清空集合列表
          setCollections([]);
        }
      } catch (error) {
        console.error("身份檢查或載入集合錯誤:", error);
      }
    };
    
    checkAuthAndLoadCollections();
    
    // 監聽身份變化
    window.addEventListener('authChange', checkAuthAndLoadCollections);
    
    return () => {
      window.removeEventListener('authChange', checkAuthAndLoadCollections);
    };
  }, []);

  // 載入用戶集合
  const loadUserCollections = async (userId: string) => {
    try {
      setIsLoading(true);
      const userCollections = await getUserCollections(userId);
      setCollections(userCollections);
    } catch (error) {
      console.error("載入集合錯誤:", error);
      toast.error('載入集合失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 處理創建新集合
  const handleCreateCollection = async () => {
    if (!userId) {
      toast.error('請先登入', {
        description: '創建集合需要登入'
      });
      router.push('/login');
      return;
    }
    
    try {
      // 驗證表單
      if (!newCollectionName.trim()) {
        toast.error('請輸入集合名稱');
        return;
      }
      
      setIsLoading(true);
      
      // 創建新集合
      const initialItems = initialItemId && initialItemType 
        ? [{ type: initialItemType, id: initialItemId }] 
        : [];
      
      const newCollection = await createCustomCollection(
        userId,
        newCollectionName,
        newCollectionDescription,
        initialItems
      );
      
      // 更新集合列表
      setCollections(prev => [...prev, newCollection]);
      
      // 提示創建成功
      toast.success('集合已創建', {
        description: initialItems.length > 0 ? '項目已添加到新集合' : undefined
      });
      
      // 關閉對話框
      setNewCollectionDialogOpen(false);
      
      // 清空表單
      setNewCollectionName('');
      setNewCollectionDescription('');
      
      // 回調
      if (onCollectionChange) {
        onCollectionChange(newCollection);
      }
    } catch (error) {
      console.error("創建集合錯誤:", error);
      toast.error('創建失敗', {
        description: error instanceof Error ? error.message : '發生未知錯誤'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 處理添加項目到集合
  const handleAddToCollection = async (collection: CustomCollection) => {
    if (!initialItemId || !initialItemType) {
      toast.error('無項目可添加');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 添加項目到集合
      const updatedCollection = await addItemToCollection(
        collection.id,
        initialItemType,
        initialItemId
      );
      
      // 更新集合列表
      setCollections(prev => 
        prev.map(c => c.id === updatedCollection.id ? updatedCollection : c)
      );
      
      // 提示添加成功
      toast.success('已添加到集合', {
        description: `項目已添加到「${collection.name}」`
      });
      
      // 關閉對話框
      setAddToCollectionDialogOpen(false);
      
      // 回調
      if (onCollectionChange) {
        onCollectionChange(updatedCollection);
      }
    } catch (error) {
      console.error("添加到集合錯誤:", error);
      toast.error('添加失敗', {
        description: error instanceof Error ? error.message : '發生未知錯誤'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 處理從集合中移除項目
  const handleRemoveFromCollection = async (collection: CustomCollection) => {
    if (!initialItemId || !initialItemType) {
      toast.error('無項目可移除');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 從集合中移除項目
      const success = await removeItemFromCollection(
        collection.id,
        initialItemType,
        initialItemId
      );
      
      if (success) {
        // 重新獲取更新後的集合
        const updatedCollections = await getUserCollections(userId!);
        setCollections(updatedCollections);
        
        // 提示移除成功
        toast.success('已從集合移除', {
          description: `項目已從「${collection.name}」移除`
        });
        
        // 回調
        const updatedCollection = updatedCollections.find(c => c.id === collection.id);
        if (updatedCollection && onCollectionChange) {
          onCollectionChange(updatedCollection);
        }
      } else {
        toast.error('移除失敗');
      }
    } catch (error) {
      console.error("從集合移除錯誤:", error);
      toast.error('移除失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 開啟創建新集合對話框
  const openCreateCollectionDialog = () => {
    if (!isAuthenticated()) {
      toast.error('請先登入', {
        description: '創建集合需要登入'
      });
      router.push('/login');
      return;
    }
    
    setNewCollectionDialogOpen(true);
    setNewCollectionName('');
    setNewCollectionDescription('');
  };

  // 開啟添加到集合對話框
  const openAddToCollectionDialog = () => {
    if (!isAuthenticated()) {
      toast.error('請先登入', {
        description: '添加到集合需要登入'
      });
      router.push('/login');
      return;
    }
    
    if (!initialItemId || !initialItemType) {
      toast.error('未選擇項目', {
        description: '請先選擇要添加到集合的項目'
      });
      return;
    }
    
    setAddToCollectionDialogOpen(true);
  };

  // 檢查項目是否在集合中
  const isItemInCollection = (collection: CustomCollection) => {
    if (!initialItemId || !initialItemType) return false;
    
    return collection.items.some(
      item => item.id === initialItemId && item.type === initialItemType
    );
  };

  // 新增集合按鈕
  const CreateCollectionButton = () => (
    <Button
      variant="outline"
      onClick={openCreateCollectionDialog}
      className="w-full justify-start"
    >
      <Plus className="mr-2 h-4 w-4" />
      創建新集合
    </Button>
  );

  // 集合卡片
  const CollectionCard = ({ collection }: { collection: CustomCollection }) => {
    const isInCollection = isItemInCollection(collection);
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <FolderOpen className="mr-2 h-4 w-4" />
            {collection.name}
          </CardTitle>
          {collection.description && (
            <CardDescription className="text-xs line-clamp-1">
              {collection.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-xs text-muted-foreground">
            {collection.items.length} 個項目
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          {initialItemId && initialItemType && (
            <>
              {isInCollection ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromCollection(collection)}
                  disabled={isLoading}
                  className="text-destructive"
                >
                  <X className="mr-1 h-3 w-3" />
                  從集合移除
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddToCollection(collection)}
                  disabled={isLoading}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  添加到集合
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        {initialItemId && initialItemType && (
          <Button
            variant="outline"
            onClick={openAddToCollectionDialog}
            className="w-full justify-start"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            添加到集合
          </Button>
        )}
        
        <CreateCollectionButton />
      </div>
      
      {/* 創建新集合對話框 */}
      <Dialog open={newCollectionDialogOpen} onOpenChange={setNewCollectionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>創建新集合</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collection-name" className="text-right">
                名稱
              </Label>
              <Input
                id="collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collection-description" className="text-right">
                描述
              </Label>
              <Textarea
                id="collection-description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                className="col-span-3 min-h-[80px]"
              />
            </div>
            
            {initialItemId && initialItemType && (
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="text-right text-sm text-muted-foreground">
                  初始項目
                </div>
                <div className="col-span-3 text-sm">
                  將自動添加當前項目到此集合
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCreateCollection}
              disabled={isLoading}
            >
              {isLoading ? '創建中...' : '創建集合'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 添加到集合對話框 */}
      <Dialog open={addToCollectionDialogOpen} onOpenChange={setAddToCollectionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加到集合</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">尚未創建任何集合</p>
                <CreateCollectionButton />
              </div>
            ) : (
              <>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collections.map(collection => (
                      <CollectionCard key={collection.id} collection={collection} />
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="mt-4 pt-4 border-t">
                  <CreateCollectionButton />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
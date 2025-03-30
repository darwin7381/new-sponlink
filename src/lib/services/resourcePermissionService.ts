'use client';

import { getStoredUser } from './authService';
import { PERMISSION, RESOURCE_TYPE, DYNAMIC_ROLE } from '@/lib/types/users';
import { OWNER_TYPE, BaseResource } from '@/types/event';

/**
 * 檢查用戶是否擁有資源
 */
export const isResourceOwner = <T extends BaseResource>(
  resource: T,
  userId?: string
): boolean => {
  // 如果未提供userId，則使用當前登錄用戶
  const user = userId ? { id: userId } : getStoredUser();
  if (!user) return false;
  
  return resource.ownerId === user.id && resource.ownerType === OWNER_TYPE.USER;
};

/**
 * 檢查用戶是否為組織成員
 */
export const isOrganizationMember = (
  organizationId: string,
  userId?: string
): boolean => {
  // 模擬實現 - 實際應查詢用戶的組織成員資格
  return false;
};

/**
 * 檢查用戶在組織中的角色
 */
export const getUserRoleInOrganization = (
  organizationId: string,
  userId?: string
): DYNAMIC_ROLE | null => {
  // 模擬實現 - 實際應查詢用戶在組織中的角色
  return null;
};

/**
 * 檢查用戶是否有資源權限
 */
export const hasResourcePermission = <T extends BaseResource>(
  resource: T,
  permission: PERMISSION,
  userId?: string
): boolean => {
  const user = getStoredUser();
  if (!user) return false;
  
  const userIdToCheck = userId || user.id;
  
  // 資源所有者具有所有權限
  if (isResourceOwner(resource, userIdToCheck)) {
    return true;
  }
  
  // 組織資源的權限檢查
  if (resource.ownerType === OWNER_TYPE.ORGANIZATION) {
    const role = getUserRoleInOrganization(resource.ownerId, userIdToCheck);
    
    // 組織管理員具有所有權限
    if (role === DYNAMIC_ROLE.ADMIN) {
      return true;
    }
    
    // 組織成員具有有限權限
    if (role === DYNAMIC_ROLE.MEMBER) {
      return permission === PERMISSION.VIEW || permission === PERMISSION.CREATE;
    }
    
    // 協作者只有查看權限
    if (role === DYNAMIC_ROLE.COLLABORATOR) {
      return permission === PERMISSION.VIEW;
    }
  }
  
  // 對於查看權限，所有已登錄用戶都可訪問公開資源
  if (permission === PERMISSION.VIEW && resource.resourceType === RESOURCE_TYPE.EVENT) {
    return true;
  }
  
  return false;
};

/**
 * 檢查用戶是否可以創建特定類型的資源
 */
export const canCreateResource = (
  resourceType: RESOURCE_TYPE,
  ownerType: OWNER_TYPE,
  ownerId: string,
  userId?: string
): boolean => {
  const user = getStoredUser();
  if (!user) return false;
  
  const userIdToCheck = userId || user.id;
  
  // 用戶可以創建自己的資源
  if (ownerType === OWNER_TYPE.USER && ownerId === userIdToCheck) {
    return true;
  }
  
  // 用戶可以為其所屬的組織創建資源(如果具有適當權限)
  if (ownerType === OWNER_TYPE.ORGANIZATION) {
    const role = getUserRoleInOrganization(ownerId, userIdToCheck);
    return role === DYNAMIC_ROLE.ADMIN || role === DYNAMIC_ROLE.MEMBER;
  }
  
  return false;
};

/**
 * 為資源創建者設置適當的所有權信息
 */
export const setResourceOwnership = <T extends Partial<BaseResource>>(
  resource: T,
  userId: string,
  ownerType: OWNER_TYPE = OWNER_TYPE.USER,
  ownerId?: string
): T => {
  const now = new Date().toISOString();
  
  return {
    ...resource,
    ownerId: ownerId || userId,
    ownerType,
    created_at: now,
    updated_at: now
  };
}; 
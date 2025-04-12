/**
 * Server-side authentication utilities
 * These functions are designed to be used in Server Components
 */

import { auth } from "@/app/api/auth/[...nextauth]/route";
import { User, SystemRole } from "@/lib/types/users";

/**
 * Get the user's authentication session on the server
 * This is the recommended way to check authentication in Server Components
 * 
 * @returns Object containing session information and helper methods
 */
export async function getAuthSession() {
  const session = await auth();
  
  // Convert session.user to our User type if authenticated
  const user: User | null = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    preferred_language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    systemRole: session.user.systemRole as SystemRole || SystemRole.USER,
  } : null;
  
  return {
    /**
     * The current session or null if not authenticated
     */
    session,
    
    /**
     * The current user or null if not authenticated
     */
    user,
    
    /**
     * Whether the user is authenticated
     */
    isAuthenticated: !!session?.user,
    
    /**
     * Whether the user is a system admin
     */
    isAdmin: session?.user?.systemRole === SystemRole.ADMIN,
  };
}

/**
 * Checks if a user is authorized to view or manage a resource
 * 
 * @param resourceOwnerId The ID of the resource owner to check against
 * @returns Object with authorization flags
 */
export async function checkResourceAuthorization(resourceOwnerId?: string) {
  const { user, isAuthenticated } = await getAuthSession();

  // Return object with authorization flags
  return {
    /**
     * Whether the user is authenticated
     */
    isAuthenticated,
    
    /**
     * Whether the user is the owner of the resource
     */
    isOwner: resourceOwnerId ? user?.id === resourceOwnerId : false,
    
    /**
     * Whether the user can view the resource (all authenticated users can view)
     */
    canView: isAuthenticated,
    
    /**
     * Whether the user can edit the resource (only resource owners can edit)
     */
    canEdit: resourceOwnerId ? user?.id === resourceOwnerId : false,
  };
} 
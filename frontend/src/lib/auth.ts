export interface UserSession {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'MANAGER' | 'SALESPERSON' | 'TECHNICIAN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  permissions: string[];
}

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pro_shop_token');
};

export const getStoredUser = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('pro_shop_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setAuthSession = (token: string, user: UserSession): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pro_shop_token', token);
  localStorage.setItem('pro_shop_user', JSON.stringify(user));
};

export const clearAuthSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pro_shop_token');
  localStorage.removeItem('pro_shop_user');
};

export const isAdmin = (user?: UserSession | null): boolean => {
  if (!user) return false;
  return user.role === 'OWNER' || user.role === 'ADMIN';
};

export const hasPermission = (user: UserSession | null | undefined, permissionKey: string): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (user.permissions?.includes('*')) return true;
  return user.permissions?.includes(permissionKey) ?? false;
};

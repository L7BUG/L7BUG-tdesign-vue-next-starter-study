import { authApi } from '@/api/system/auth';

export function getMenuList() {
  return authApi.getMenuList();
}

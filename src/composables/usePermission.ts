import { useUserStore } from '@/store';

export function usePermission() {
  const userStore = useUserStore();

  function hasButtonPermission(perm: string): boolean {
    if (userStore.userInfo?.id === -1) return true;
    return userStore.authorities?.includes(perm) ?? false;
  }

  return {
    hasButtonPermission,
    authorities: userStore.authorities,
  };
}

const api = {
  login: '/system/auth/login',
  logout: '/system/auth/logout',
};
import { request } from '@/utils/request';

export function loginByPassword(username: string, password: string) {
  return request.post<string>({
    url: api.login,
    params: {
      username,
      password,
    },
  });
}

export function logout() {
  return request.delete<void>({
    url: api.logout,
  });
}

import type { RouteItem } from '@/api/model/permissionModel';
import type { LoginRequest } from '@/api/system/model/authModel';
import type { CurrentUserInfo } from '@/api/system/model/userModel';
import { request } from '@/utils/request';

const api = {
  login: '/system-service/auth/login',
  logout: '/system-service/auth/logout',
  currentUserInfo: '/system-service/user/current-user-info',
  menuList: '/system-service/menu-list',
};

class AuthApi {
  async login(data: LoginRequest): Promise<string> {
    return request.post<string>({
      url: api.login,
      params: data,
    });
  }

  async logout(): Promise<void> {
    return request.delete<void>({
      url: api.logout,
    });
  }

  async getCurrentUserInfo(): Promise<CurrentUserInfo> {
    return request.get<CurrentUserInfo>({
      url: api.currentUserInfo,
    });
  }

  async getMenuList(): Promise<RouteItem[]> {
    return request.get<RouteItem[]>({
      url: api.menuList,
    });
  }
}

const authApi = new AuthApi();
export { authApi };

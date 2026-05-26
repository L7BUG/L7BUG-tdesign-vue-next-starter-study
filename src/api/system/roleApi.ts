import type { MenuNodeResponse } from '@/api/system/model/menuModel';
import type { RoleCreateRequest, RoleInfo, RoleUpdateRequest } from '@/api/system/model/roleModel';
import { request } from '@/utils/request';

const api = {
  base: '/system-service/role',
};

class RoleApi {
  async getRoot(): Promise<RoleInfo> {
    return request.get<RoleInfo>({
      url: `${api.base}/root`,
    });
  }

  async getById(id: number | string): Promise<RoleInfo> {
    return request.get<RoleInfo>({
      url: `${api.base}/${id}`,
    });
  }

  async create(role: RoleCreateRequest): Promise<RoleInfo> {
    return request.post<RoleInfo>({
      url: api.base,
      params: role,
    });
  }

  async update(id: number | string, role: RoleUpdateRequest): Promise<RoleInfo> {
    return request.put<RoleInfo>({
      url: `${api.base}/${id}`,
      params: role,
    });
  }

  async deleteById(id: number | string): Promise<boolean> {
    return request.delete<boolean>({
      url: `${api.base}/${id}`,
    });
  }

  async moveFather(id: number | string, fatherId: number | string): Promise<boolean> {
    return request.put<boolean>({
      url: `${api.base}/${id}/father/${fatherId}`,
    });
  }

  async addSortVal(id: number | string, sort: number): Promise<boolean> {
    return request.put<boolean>({
      url: `${api.base}/${id}/sort/${sort}`,
    });
  }

  async getMenuIdsByRoleId(id: number | string): Promise<number[]> {
    return request.get<number[]>({
      url: `${api.base}/${id}/menus`,
    });
  }

  async getMenuTreeByRoleId(id: number | string): Promise<MenuNodeResponse> {
    return request.get<MenuNodeResponse>({
      url: `${api.base}/${id}/menus/tree`,
    });
  }

  async addMenu(id: number | string, menuId: number | string): Promise<void> {
    return request.post<void>({
      url: `${api.base}/${id}/menus/${menuId}`,
    });
  }

  async removeMenu(id: number | string, menuId: number | string): Promise<void> {
    return request.delete<void>({
      url: `${api.base}/${id}/menus/${menuId}`,
    });
  }
}

const roleApi = new RoleApi();
export { roleApi };

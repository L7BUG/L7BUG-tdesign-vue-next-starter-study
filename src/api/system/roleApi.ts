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

  async update(id: number | string, role: RoleUpdateRequest): Promise<boolean> {
    return request.put<boolean>({
      url: `${api.base}/${id}`,
      params: role,
    });
  }

  async deleteById(id: number | string): Promise<boolean> {
    return request.delete<boolean>({
      url: `${api.base}/${id}`,
    });
  }

  async addRoleSortVal(id: number | string, sort: number): Promise<boolean> {
    return request.put<boolean>({
      url: `${api.base}/${id}/sort/${sort}`,
    });
  }
}

const roleApi = new RoleApi();
export { roleApi };

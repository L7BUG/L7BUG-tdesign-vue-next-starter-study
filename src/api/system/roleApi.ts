import type { RoleCreateRequest, RoleInfo } from '@/api/system/model/roleModel';
import { request } from '@/utils/request';

const api = {
  base: '/system-service/role',
};

class RoleApi {
  async create(role: RoleCreateRequest): Promise<RoleInfo> {
    return request.post<RoleInfo>({
      url: api.base,
      params: role,
    });
  }

  async getById(id: number): Promise<RoleInfo> {
    return request.get<RoleInfo>({
      url: `${api.base}/${id}`,
    });
  }
}

const roleApi = new RoleApi();
export { roleApi };

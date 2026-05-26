import type {
  PageData,
  SystemUserCreate,
  SystemUserInfo,
  SystemUserQuery,
  SystemUserUpdate,
} from '@/api/system/model/userModel';
import { request } from '@/utils/request';

const api = {
  base: '/system-service/user',
};

class UserApi {
  async page(query: SystemUserQuery): Promise<PageData<SystemUserInfo>> {
    return request.get<PageData<SystemUserInfo>>({
      url: api.base,
      params: query,
    });
  }

  async create(info: SystemUserCreate): Promise<void> {
    return request.post<void>({
      url: api.base,
      params: info,
    });
  }

  async update(id: number, info: SystemUserUpdate): Promise<void> {
    return request.put<void>({
      url: `${api.base}/${id}`,
      params: info,
    });
  }

  async deleteById(id: number): Promise<void> {
    return request.delete<void>({
      url: `${api.base}/${id}`,
    });
  }
}

const userApi = new UserApi();
export { userApi };

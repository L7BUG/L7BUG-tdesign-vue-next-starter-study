import { cursor } from 'sisteransi';

import type {
  CurrentUserInfo,
  PageData,
  SystemUserInfo,
  SystemUserQuery,
  SystemUserUpdate,
} from '@/api/system/model/userModel';
import { request } from '@/utils/request';

const api = {
  base: '/user',
  currentUserInfo: '/user/current-user-info',
};

class UserApi {
  public async currentUserInfo() {
    return request.get<CurrentUserInfo>({
      url: api.currentUserInfo,
    });
  }

  public async page(query: SystemUserQuery) {
    return request.get<PageData<SystemUserInfo>>({
      url: api.base,
      params: query,
    });
  }

  public async updateStatus(id: string, status: boolean): Promise<void> {
    return this.saveUserInfo({ status: status ? 1 : 0 }, id);
  }

  public async saveUserInfo(info: SystemUserUpdate, id?: string): Promise<void> {
    if (id) {
      return request.put<void>({
        url: `${api.base}/${id}`,
        params: info,
      });
    } else {
      return request.post<void>({
        url: `${api.base}`,
        params: info,
      });
    }
  }

  public async deleteById(id: string): Promise<void> {
    return request.delete<void>({
      url: `${api.base}/${id}`,
    });
  }
}
const userApi = new UserApi();
export { userApi };

import type { CurrentUserInfo, PageData, SystemUserInfo, SystemUserQuery } from '@/api/system/model/userModel';

const api = {
  currentUserInfo: '/user/current-user-info',
  page: '/user',
};
import { request } from '@/utils/request';

class UserApi {
  public async currentUserInfo() {
    return request.get<CurrentUserInfo>({
      url: api.currentUserInfo,
    });
  }

  public async page(query: SystemUserQuery) {
    return request.get<PageData<SystemUserInfo>>({
      url: api.page,
      params: query,
    });
  }
}
const userApi = new UserApi();
export { userApi };

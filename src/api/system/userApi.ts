import type { UserInfo } from '@/api/system/model/userModel';

const api = {
  currentUserInfo: '/user/current-user-info',
};
import { request } from '@/utils/request';

export function currentUserInfo() {
  return request.get<UserInfo>({
    url: api.currentUserInfo,
  });
}

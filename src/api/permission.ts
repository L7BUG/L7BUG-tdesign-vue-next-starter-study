import type { RouteItem } from '@/api/model/permissionModel';
import { request } from '@/utils/request';

const Api = {
  MenuList: '/menu-list',
};

export function getMenuList() {
  return request.get<Array<RouteItem>>({
    url: Api.MenuList,
  });
}

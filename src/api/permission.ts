import type { RouteItem } from '@/api/model/permissionModel';
import { request } from '@/utils/request';

const Api = {
  MenuList: '/system/menu-list',
};

export function getMenuList() {
  return request.get<Array<RouteItem>>({
    url: Api.MenuList,
  });
}

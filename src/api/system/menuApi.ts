import type { MenuNodeRequest, MenuNodeResponse } from '@/api/system/model/menuModel';
import { request } from '@/utils/request';

const api = {
  base: '/system-service/menu',
};

class MenuApi {
  async getRoot(): Promise<MenuNodeResponse> {
    return request.get<MenuNodeResponse>({
      url: `${api.base}/root`,
    });
  }

  async getById(id: number | string): Promise<MenuNodeResponse> {
    return request.get<MenuNodeResponse>({
      url: `${api.base}/${id}`,
    });
  }

  async createMenu(menu: MenuNodeRequest): Promise<MenuNodeResponse> {
    return request.post<MenuNodeResponse>({
      url: api.base,
      params: menu,
    });
  }

  async updateMenu(id: number | string, menu: MenuNodeRequest): Promise<boolean> {
    return request.put<boolean>({
      url: `${api.base}/${id}`,
      params: menu,
    });
  }

  async deleteById(id: number | string): Promise<boolean> {
    return request.delete<boolean>({
      url: `${api.base}/${id}`,
    });
  }

  async addMenuSortVal(id: number | string, sort: number): Promise<boolean> {
    return request.put<boolean>({
      url: `${api.base}/${id}/sort/${sort}`,
    });
  }
}

const menuApi = new MenuApi();
export { menuApi };

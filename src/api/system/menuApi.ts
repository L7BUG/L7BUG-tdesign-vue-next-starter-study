import type { MenuNodeRequest, MenuNodeResponse } from '@/api/system/model/menuModel';
import { request } from '@/utils/request';

const api = {
  base: '/menu',
};
class MenuApi {
  public async getRoot(): Promise<MenuNodeResponse> {
    return request.get<MenuNodeResponse>({
      url: `${api.base}/root`,
    });
  }

  public async getById(id: string): Promise<MenuNodeResponse> {
    return request.get<MenuNodeResponse>({
      url: `${api.base}/${id}`,
    });
  }

  public async createMenu(menu: MenuNodeRequest): Promise<MenuNodeResponse> {
    return request.post<MenuNodeResponse>({
      url: `${api.base}`,
      params: menu,
    });
  }

  public async updateMenu(id: string, menu: MenuNodeRequest): Promise<MenuNodeResponse> {
    return request.put<MenuNodeResponse>({
      url: `${api.base}/${id}`,
      params: menu,
    });
  }

  public async deleteById(id: string): Promise<boolean> {
    return request.delete<boolean>({
      url: `${api.base}/${id}`,
    });
  }

  public async addMenuSortVal(id: string, sort: number): Promise<boolean> {
    return request.put<boolean>({
      url: `${api.base}/${id}/sort/${sort}`,
    });
  }
}
const menuApi = new MenuApi();

export { menuApi };

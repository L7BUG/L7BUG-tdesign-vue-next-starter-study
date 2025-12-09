import type { MenuNodeResponse } from '@/api/system/model/menuModel';
import { request } from '@/utils/request';

const api = {
  base: '/menu',
};
class MenuApi {
  public async getAllRootNodes(): Promise<MenuNodeResponse[]> {
    return request.get<MenuNodeResponse[]>({
      url: api.base,
    });
  }

  public async deleteById(id: string): Promise<boolean> {
    return request.delete<boolean>({
      url: `${api.base}/${id}`,
    });
  }
}
const menuApi = new MenuApi();

export { menuApi };

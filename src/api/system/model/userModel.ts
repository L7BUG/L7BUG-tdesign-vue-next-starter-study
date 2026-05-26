export interface CurrentUserInfo {
  id: number;
  username: string;
  nickname: string;
  authorities: string[];
}

export interface SystemUserInfo {
  id: number | string;
  username: string;
  nickname: string;
  status: number;
  createTime: string;
}

export interface PageQuery {
  pageNum: number;
  pageSize: number;
}

export interface PageData<T> {
  total: number;
  data: T[];
}

export interface SystemUserQuery extends PageQuery {
  username?: string;
}

export interface SystemUserCreate {
  username: string;
  nickname: string;
  rawPassword: string;
  status: number;
}

export interface SystemUserUpdate {
  username?: string;
  nickname?: string;
  rawPassword?: string;
  status?: number;
}

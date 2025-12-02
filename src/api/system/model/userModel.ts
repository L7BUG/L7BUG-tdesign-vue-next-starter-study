export interface CurrentUserInfo {
  id: string;
  username: string;
  nickname: string;
  authorities: string[];
}

export interface SystemUserInfo {
  id: string;
  username: string;
  nickname: string;
  status: number;
  createTime: number;
}
export interface PageQuery {
  current: number;
  size: number;
  column: string;
  asc: boolean;
}

export interface PageData<T> {
  total: number;
  data: T[];
}

export interface SystemUserQuery extends PageQuery {
  username?: string;
}

export interface SystemUserUpdate {
  username?: string;
  nickname?: string;
  rawPassword?: string;
  status?: number;
}

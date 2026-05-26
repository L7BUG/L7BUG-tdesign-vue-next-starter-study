export interface RoleCreateRequest {
  name: string;
  fatherId?: number | null;
  sort?: number;
  remark?: string;
}

export interface RoleInfo {
  id: number;
  name: string;
  fatherId: number | null;
  fullId: string;
  status: string;
  sort: number;
  remark: string;
  children: RoleInfo[];
}

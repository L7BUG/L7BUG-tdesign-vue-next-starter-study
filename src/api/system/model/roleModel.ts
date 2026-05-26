export interface RoleCreateRequest {
  name: string;
  fatherId?: number | string | null;
  sort?: number;
  remark?: string;
}

export interface RoleUpdateRequest {
  name?: string;
  fatherId?: number | string | null;
  sort?: number;
  remark?: string;
}

export interface RoleInfo {
  id: number | string;
  name: string;
  fatherId: number | string | null;
  fullId: string;
  status: string;
  sort: number;
  remark: string;
  children: RoleInfo[];
  label?: string;
  value?: string;
}

interface MenuNodeRequest {
  fatherId?: string;
  fullId?: string;
  path?: string;
  name?: string;
  component?: string;
  type?: string;
  enable?: string;
  sort?: string;
  meta?: string;
}
export interface MenuNodeResponse extends MenuNodeRequest {
  id?: string;
  children?: MenuNodeResponse[];
  label?: string;
  value?: string;
}

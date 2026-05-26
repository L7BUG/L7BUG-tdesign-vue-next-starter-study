export interface Title {
  zh_CN?: string;
  en_US?: string;
}

export interface Meta {
  title?: Title;
  icon?: string;
}

export interface MenuNodeRequest {
  fatherId?: number | null;
  fullId?: string;
  path?: string;
  name?: string;
  component?: string;
  type?: string;
  enable?: boolean;
  sort?: number;
  meta?: Meta;
}

export interface MenuNodeResponse extends MenuNodeRequest {
  id?: number;
  children?: MenuNodeResponse[];
  label?: string;
  value?: string;
}

import { Observable as O } from 'rxjs/Rx';

export interface Props {
  location: string;
}

export interface SocketData {
  data: Array<string>;
}

export interface State {
  list: Array<O<any>> | undefined;
  currentPage: number;
  pageElements: Array<JSX.Element>;
  paginationElements: Array<JSX.Element>;
  pageSet: number;
  pathName: string;
  data: Array<string>;
  activePage: string;
  openModal: boolean;
}


export interface Props {
  activeProject: string;
  open: boolean;
  closeModal: (() => void);
  socket: any;
}

export interface BaseData {
  title: string;
  pageid: number;
  name: string;
}

export interface ProjectRevisions {
  comment: string;
  minor: string;
  parentid: number;
  revid: number;
  timestamp: string;
  user: string;
}

export interface PageData {
  lastrevid: number;
  length: number;
  pageid: number;
  pagelanguage: string;
  pagelanguagedir: string;
  revisions: Array<ProjectRevisions>;
  title: string;
}

export interface State {
  modal: boolean;
  nestedModal: boolean;
  data: Array<PageData>;
  listElements: Array<JSX.Element>;
  activePage: PageData | undefined;
}
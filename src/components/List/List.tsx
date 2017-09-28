import React, { Component } from 'react';
import { Observable as O } from 'rxjs/Rx';
import {
  ListGroup,
  ListGroupItem,
  Pagination,
  PaginationItem,
  PaginationLink
} from 'reactstrap';

import { Props, State, SocketData } from './interfaces';

import styles from './styles';

import ProjectPages from '../ProjectPages/ProjectPages';

export default class List extends Component<Props, State> {
  constructor(props: any) {
    super();
    this.state = {
      list: undefined,
      currentPage: 1,
      pageElements: [],
      paginationElements: [],
      pageSet: 0,
      pathName: props.location.pathName,
      data: [],
      activePage: '',
      openModal: false
    };
  }

  private socketSubject: any;

  componentDidMount() {
    this.socketSubject = O.webSocket('wss://wiki-meta-explorer.herokuapp.com/');
    this.getProjectList();
  }

  private getProjectList = () => {
    this.setState({ currentPage: 0 });
    this.socketSubject.next(
      JSON.stringify({
        id: 'id2',
        name: 'project.list'
      })
    );
    this.socketSubject.first().subscribe((val: { data: Array<SocketData> }) => {
      this.setState({ data: val.data }, () => this.handlePageChange(1));
    });
  };

  private createPages = () => {
    const { data, currentPage, pageSet } = this.state;
    const indexPageNum = currentPage - 1;
    const skipBy = indexPageNum * 10 + pageSet * 5;
    const currentPageData: Array<SocketData> = data.slice(skipBy, skipBy + 10);
    let pageElements: Array<JSX.Element> = currentPageData.map((item: SocketData) => (
      <ListGroupItem
        tag="a"
        action
        onClick={(e: React.SyntheticEvent<any>): void => this.activatePage(e)}>
        {item}
      </ListGroupItem>
    ));
    this.setState({ pageElements });
    this.renderPagination();
  };

  private previousPageSet = () => {
    const { pageSet } = this.state;
    const toPageSet: number = pageSet - 1 >= 0 ? pageSet - 1 : 0;
    this.setState(
      { pageSet: toPageSet, currentPage: toPageSet * 5 },
      this.renderPagination
    );
  };

  private nextPageSet = () => {
    const { pageSet } = this.state;
    const toPageSet: number = pageSet + 1;
    this.setState(
      { pageSet: toPageSet, currentPage: toPageSet * 5 },
      this.renderPagination
    );
  };

  private renderPagination = () => {
    const { list, currentPage, pageSet, data } = this.state;
    let elements: Array<any> = [];
    elements.push(
      <PaginationItem>
        <PaginationLink previous onClick={this.previousPageSet}>
          {'<<'}
        </PaginationLink>
      </PaginationItem>
    );
    let counter: number = 0;
    const skipBy = currentPage * 10 + pageSet * 5;
    O.range(1, data.length)
      .skip(skipBy)
      .take(50)
      .finally(() => {
        elements.push(
          <PaginationItem>
            <PaginationLink next onClick={this.nextPageSet}>
              {'>>'}
            </PaginationLink>
          </PaginationItem>
        );
        this.setState({ paginationElements: elements });
      })
      .subscribe((val: number) => {
        counter += 1;
        if (counter % 10 === 0) {
          const pageNum: number = counter / 10 + pageSet * 5;
          const active: boolean = pageNum === currentPage;
          elements.push(
            <PaginationItem active={active}>
              <PaginationLink
                onClick={(e: React.SyntheticEvent<any>): void => {
                  let target = e.target as HTMLInputElement;
                  return this.handlePageChange(Number(target.innerText));
                }}>
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        }
      });
  };

  private activatePage = (e: React.SyntheticEvent<any>) => {
    let target = e.target as HTMLInputElement;
    this.setState({ activePage: target.innerText, openModal: true });
  };

  private handlePageChange = (page: number) =>
    this.setState({ currentPage: page }, this.createPages);

  public closeModal = () => this.setState({ openModal: false });

  render() {
    const {
      pageElements,
      paginationElements,
      activePage,
      openModal
    } = this.state;
    return (
      <div style={styles.container}>
        <h1>Wikipedia Projects</h1>
        <ListGroup>{pageElements && pageElements.map(elem => elem)}</ListGroup>
        <br />
        <Pagination>
          {paginationElements && paginationElements.map(elem => elem)}
        </Pagination>
        {openModal && (
          <ProjectPages
            socket={this.socketSubject}
            activeProject={activePage}
            open={openModal}
            closeModal={this.closeModal}
          />
        )}
      </div>
    );
  }
}

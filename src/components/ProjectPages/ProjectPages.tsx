import React, { Component } from 'react';
import { Observable as O } from 'rxjs/Rx';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListGroup,
  ListGroupItem,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import _ from 'lodash';

import {
  Props,
  BaseData,
  ProjectRevisions,
  PageData,
  State
} from './interfaces';

class ProjectPages extends Component<Props, State> {
  private projectUpdates: any;
  private pagesUpdates: any;

  constructor(props: any) {
    super(props);
    this.state = {
      modal: true,
      nestedModal: false,
      data: [],
      listElements: [],
      activePage: undefined
    };
  }

  componentDidMount() {
    const { activeProject, socket } = this.props;
    this.projectUpdates = socket.filter(
      (val: BaseData) => val.name === 'project.update'
    );
    this.pagesUpdates = socket.filter(
      (val: BaseData) => val.name === 'page.update'
    );
    socket.next(
      JSON.stringify({
        id: 'id1',
        name: 'project.subscribe',
        args: {
          project: activeProject
        }
      })
    );
    this.projectUpdates.subscribe((data: { data: Array<PageData> }) =>
      this.setState({ data: data.data }, this.createProjectList)
    );
    this.pagesUpdates.subscribe((data: { data: PageData }) =>
      this.setState({ activePage: data.data })
    );
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    const { activePage, modal } = this.state;
    if (activePage && !modal) {
      this.pagesUpdates.next(
        JSON.stringify({
          id: 'id2',
          name: 'page.unsubscribe',
          args: {
            pageId: activePage.pageid
          }
        })
      );
    }
  }

  componentWillUnmount() {
    this.pagesUpdates.unsubscribe();
    this.projectUpdates.unsubscribe();
  }

  private createProjectList = () => {
    const { data } = this.state;
    let listElements: Array<JSX.Element> = data.map((item: { title: string }) => (
      <ListGroupItem
        onClick={(e: React.SyntheticEvent<any>): void => this.activatePage(e)}>
        {item.title}
      </ListGroupItem>
    ));
    this.setState({ listElements });
  };

  private activatePage = (e: React.SyntheticEvent<any>) => {
    const { data } = this.state;
    let target = e.target as HTMLInputElement;
    const activePage = _.find(data, elem => elem.title === target.innerText);
    this.setState({ activePage });
    this.toggleNested();
  };

  private toggle = () => {
    if (this.state.modal) this.props.closeModal();
    this.setState({
      modal: !this.state.modal
    });
  };

  private toggleNested = () => {
    const { activePage, nestedModal } = this.state;
    if (nestedModal && activePage && this.pagesUpdates) {
      this.pagesUpdates.next(
        JSON.stringify({
          id: 'id2',
          name: 'page.unsubscribe',
          args: {
            pageId: activePage.pageid
          }
        })
      );
    }
    this.setState({
      nestedModal: !this.state.nestedModal
    });
  };

  private toggleSubscribe = (e: React.SyntheticEvent<any>) => {
    const { activePage } = this.state;
    let target = e.target as HTMLInputElement;
    if (target.checked && activePage) {
      this.pagesUpdates.next(
        JSON.stringify({
          id: 'id1445',
          name: 'page.subscribe',
          args: {
            pageId: activePage.pageid
          }
        })
      );
    } else if (activePage && !target.checked) {
      this.pagesUpdates.next(
        JSON.stringify({
          id: 'id144',
          name: 'page.unsubscribe',
          args: {
            pageId: activePage.pageid
          }
        })
      );
    }
  };

  render() {
    const { listElements, activePage } = this.state;
    const { activeProject } = this.props;
    return (
      <div>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>
            Pages List for {activeProject}
          </ModalHeader>
          <ModalBody>
            <ListGroup>
              {listElements && listElements.map(elem => elem)}
            </ListGroup>
            <Modal isOpen={this.state.nestedModal} toggle={this.toggleNested}>
              <ModalHeader>
                {activePage && activePage.title} MetaData
              </ModalHeader>
              <ModalBody>{JSON.stringify(activePage, null, 4)}</ModalBody>
              <ModalFooter>
                <Label check>
                  <Input
                    type="checkbox"
                    id="checkbox2"
                    onChange={this.toggleSubscribe}
                  />{' '}
                  Subscribe to Live Changes
                </Label>
                <Button color="primary" onClick={this.toggleNested}>
                  Done
                </Button>
              </ModalFooter>
            </Modal>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle}>
              Done
            </Button>{' '}
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ProjectPages;

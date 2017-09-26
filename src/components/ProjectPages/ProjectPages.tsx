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

interface Props {
  activeProject: string;
  open: boolean;
  closeModal: (() => void);
}

interface PageData {
  title: string;
  pageid: number;
  name: string;
}

interface State {
  modal: boolean;
  nestedModal: boolean;
  data: Array<PageData>;
  listElements: Array<string>;
  activePage: PageData | undefined;
}

class ProjectPages extends Component<Props, State> {
  private socket: any;
  private pageSubscription: any;
  private pageSub: any;
  private unmounted: boolean = false;
  private counter: number = 0;

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
    const { activeProject } = this.props;
    this.socket = O.webSocket('wss://wiki-meta-explorer.herokuapp.com/');
    this.socket.next(
      JSON.stringify({
        id: 'id1',
        name: 'page.list',
        args: {
          project: activeProject
        }
      })
    );
    this.socket
      .first()
      .subscribe((data: any) =>
        this.setState({ data: data.data }, this.createList)
      );
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    const { activePage, modal } = this.state;
    if (activePage && !modal) {
      console.log('happened cwupd');
      this.socket.next(
        JSON.stringify({
          id: this.counter,
          name: 'page.unsubscribe',
          args: {
            pageId: activePage.pageid
          }
        })
      );
      this.socket.unsubscribe();
    }
  }

  createList = () => {
    const { data } = this.state;
    let elements: Array<any> = data.map((item: { title: string }) => (
      <ListGroupItem
        onClick={(e: React.SyntheticEvent<any>): void => this.activatePage(e)}>
        {item.title}
      </ListGroupItem>
    ));
    this.setState({ listElements: elements });
  };

  activatePage = (e: React.SyntheticEvent<any>) => {
    const { data } = this.state;
    let target = e.target as HTMLInputElement;
    const activePage = _.find(data, elem => elem.title === target.innerText);
    this.setState({ activePage });
    this.toggleNested();
  };

  toggle = () => {
    if (this.state.modal) this.props.closeModal();
    this.setState({
      modal: !this.state.modal
    });
  };

  toggleNested = () => {
    const { activePage } = this.state;
    if (this.state.nestedModal && activePage && this.socket) {
      console.log('happened togglenested');
      this.socket.next(
        JSON.stringify({
          id: this.counter,
          name: 'page.unsubscribe',
          args: {
            pageId: activePage.pageid
          }
        })
      );
      this.socket.unsubscribe();
    }
    this.setState({
      nestedModal: !this.state.nestedModal
    });
  };

  toggleSubscribe = (e: React.SyntheticEvent<any>) => {
    const { activePage } = this.state;
    let target = e.target as HTMLInputElement;
    this.counter += 1;
    if (target.checked && activePage) {
      this.socket.next(
        JSON.stringify({
          id: 'id1',
          name: 'page.subscribe',
          args: {
            pageId: activePage.pageid
          }
        })
      );
      this.socket
        .subscribe((data: { data: PageData }) => {
        console.log(data)
        this.setState({ activePage: data.data });
      }, (err: any) => console.log(err),
      () => console.log('completed'))
    } else if (activePage && !target.checked) {
      console.log('happened !checked');
      this.socket.next(
        JSON.stringify({
          id: 'id1',
          name: 'page.unsubscribe',
          args: {
            pageId: activePage.pageid
          }
        })
      );
      this.socket.unsubscribe();
    }
  };

  render() {
    const { listElements, activePage } = this.state;
    return (
      <div>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Pages List for Projects</ModalHeader>
          <ModalBody>
            <ListGroup>
              {listElements && listElements.map(elem => elem)}
            </ListGroup>
            <Modal isOpen={this.state.nestedModal} toggle={this.toggleNested}>
              <ModalHeader>
                {activePage && activePage.title} MetaData
              </ModalHeader>
              <ModalBody>{JSON.stringify(activePage, null, 2)}</ModalBody>
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
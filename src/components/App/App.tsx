import React, { Component } from 'react';
import List from '../List/List';

interface Props {
  location: string;
}

export default class App extends Component<Props> {
  render() {
    const { location } = this.props;
    return (
      <div>
        <List location={location} />
      </div>);
  }
}

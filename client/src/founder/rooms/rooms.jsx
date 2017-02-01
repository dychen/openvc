import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import Sidebar from './sidebar.jsx';
import MessageSection from './messages.jsx';
import JoinChannelSection from './join.jsx';

import './rooms.scss';

class FounderRoomsApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      view: 'messages', // TODO: Move to React Router + Redux. Doing this for
                        //       now because of the difficulty in passing props
                        //       via React Router.
      contacts: [],
      channels: [],
      messages: [],
      currentChannelId: 1,
      user: {
        id: 1,
        name: 'Daniel Chen',
        photoUrl: 'https://media.licdn.com/media/p/7/005/0b1/15a/0634b6f.jpg',
        company: 'Mixpanel',
        companyId: 1
      }
    };

    this.changeView = this.changeView.bind(this);
    this.createChannel = this.createChannel.bind(this);
    this.deleteChannel = this.deleteChannel.bind(this);
    this.joinChannel = this.joinChannel.bind(this);
    this.leaveChannel = this.leaveChannel.bind(this);
    this.changeChannel = this.changeChannel.bind(this);
    this.postMessage = this.postMessage.bind(this);

    this.filterChannelById = this.filterChannelById.bind(this);
    this.filterChannelMessages = this.filterChannelMessages.bind(this);

    fetch('/data/founder/rooms/contacts.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ contacts: json });
    }); // TODO: Handle errors

    fetch('/data/founder/rooms/channels.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ channels: json });
    }); // TODO: Handle errors

    fetch('/data/founder/rooms/messages.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ messages: json });
    }); // TODO: Handle errors
  }

  changeView(newView) {
    this.setState({ view: newView });
  }

  createChannel(newChannel) {
    // TOOD: Handle in backend
    const newState = Immutable.fromJS(this.state)
      .update('channels', channels => channels.push(newChannel));
    this.setState(newState.toJS());
  }

  deleteChannel(channelId) {
    // TOOD: Handle in backend
    const newChannels = this.state.channels.filter(channel =>
      channel.id !== channelId
    );
    const newState = Immutable.fromJS(this.state)
      .update('channels', value => newChannels);
    this.setState(newState.toJS());
  }

  joinChannel(channelId) {
    // TOOD: Handle in backend
    const channelIdx = this.state.channels.findIndex(channel =>
      channel.id === channelId
    );
    var newState = Immutable.fromJS(this.state)
      .updateIn(['channels', channelIdx, 'joined'], value => true);
    newState = newState.set('currentChannelId', channelId);
    newState = newState.set('view', 'messages');
    this.setState(newState.toJS());
  }

  leaveChannel(channelId) {
    // TOOD: Handle in backend
    const channelIdx = this.state.channels.findIndex(channel =>
      channel.id === channelId
    );
    var newState = Immutable.fromJS(this.state)
      .updateIn(['channels', channelIdx, 'joined'], value => false);
    newState = newState.set('currentChannelId', this.state.channels[0].id);
    newState = newState.set('view', 'messages');
    this.setState(newState.toJS());
  }

  changeChannel(channelId) {
    this.setState({ currentChannelId: channelId });
  }

  postMessage(newMessage) {
    // TOOD: Handle in backend
    const newState = Immutable.fromJS(this.state)
      .update('messages', messages => messages.push(newMessage));
    this.setState(newState.toJS());
  }

  filterChannelById(channels, channelId) {
    const filtered = channels.filter(channel => channel.id === channelId);
    return filtered.length > 0 ? filtered[0] : {
      id: -1,
      owner: '',
      ownerId: -1,
      name: '',
      memberIds: [],
      type: '',
      createdDate: '',
      purpose: ''
    };
  }

  filterChannelMessages(messages, channel) {
    return messages.filter(message => message.channelId === channel.id);
  }

  render() {
    const joinedChannels = this.state.channels.filter(channel =>
      channel.joined === true
    );

    var mainView;
    switch (this.state.view) {
      case 'joinInternalChannel':
        const internalNotJoinedChannels = this.state.channels.filter(channel =>
          channel.type === 'internal' && channel.joined === false
        );
        mainView = (
          <JoinChannelSection channels={internalNotJoinedChannels}
                              joinChannel={this.joinChannel} />
        );
        break;
      case 'messages':
      default:
        const currentChannel = this.filterChannelById(
          this.state.channels, this.state.currentChannelId
        );
        const currentChannelMessages = this.filterChannelMessages(
          this.state.messages, currentChannel
        );

        mainView = (
          <MessageSection messages={currentChannelMessages}
                          channel={currentChannel}
                          user={this.state.user}
                          postMessage={this.postMessage} />
        );
    }

    return (
      <div className="ovc-rooms-container">
        <Sidebar currentChannelId={this.state.currentChannelId}
                 channels={joinedChannels}
                 changeView={this.changeView}
                 leaveChannel={this.leaveChannel}
                 changeChannel={this.changeChannel} />
        {mainView}
      </div>
    );
  }
}

export default FounderRoomsApp;

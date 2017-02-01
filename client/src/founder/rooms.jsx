import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './rooms.scss';

const SELF_NAME = 'Founder';
const OTHER_NAME = 'Investor';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.leaveChannel = this.leaveChannel.bind(this);
  }

  leaveChannel(e) {
    e.stopPropagation(); // Don't bubble down to changeChannel handler
    const channelId = Number(e.currentTarget.id);
    this.props.leaveChannel(channelId);
  }

  render() {
    const internalChannels = this.props.channels.filter(channel =>
      channel.type === 'internal'
    ).map(channel =>
      (
        <span className="ovc-rooms-sidebar-channel" key={channel.id}
              id={channel.id} onClick={this.props.changeChannel} >
          <span className="sidebar-change-channel">{channel.name}</span>
          <i className="sidebar-leave-channel ion-android-cancel"
             id={channel.id}
             onClick={this.leaveChannel} />
        </span>
      )
    );
    const externalChannels = this.props.channels.filter(channel =>
      channel.type === 'external'
    ).map(channel =>
      (
        <span className="ovc-rooms-sidebar-channel" key={channel.id}
              id={channel.id} onClick={this.props.changeChannel} >
          <span className="sidebar-change-channel">{channel.name}</span>
          <i className="sidebar-leave-channel ion-android-cancel"
             id={channel.id}
             onClick={this.leaveChannel} />
        </span>
      )
    );
    const directMessages = this.props.channels.filter(channel =>
      channel.type === 'message'
    ).map(channel =>
      (
        <span className="ovc-rooms-sidebar-channel" key={channel.id}
              id={channel.id} onClick={this.props.changeChannel} >
          <span className="sidebar-change-channel">{channel.name}</span>
          <i className="sidebar-leave-channel ion-android-cancel"
             id={channel.id}
             onClick={this.leaveChannel} />
        </span>
      )
    );

    return (
      <div className="ovc-rooms-sidebar">
        <span className="ovc-rooms-sidebar-title">
          {SELF_NAME} Channels
        </span>
        {internalChannels}
        <span className="ovc-rooms-sidebar-title">
          {OTHER_NAME} Channels
        </span>
        {externalChannels}
        <span className="ovc-rooms-sidebar-title">
          Direct Messages
        </span>
        {directMessages}
      </div>
    );
  }
}

class MessageSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messageInput: ''
    };
    this._messageContainer = null; // DOM component for message scrolling, set
                                   // in refs

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  handleMessageChange(e) {
    this.setState({ messageInput: e.currentTarget.value });
  }

  postMessage(e) {
    if (e.key === 'Enter') {
      const message = e.currentTarget.value;

      if (message && message.length > 0) {
        this.props.postMessage({
          'id': Math.floor(Math.random() * 1000000000000),
          'sender': this.props.user.name,
          'senderId': this.props.user.id,
          'senderPhotoUrl': this.props.user.photoUrl,
          'channel': this.props.channel.name,
          'channelId': this.props.channel.id,
          'message': message,
          'postedAt': new Date().toString() // TOOD: Change back to date
        });

        this.setState({ messageInput: '' });
      }
    }
  }

  scrollToBottom() {
    // This scrolls past the bottom (which is _messageContainer.scrollHeight
    // - _messageContainer.clientHeight), but works because it automatically
    // gets truncated as per the scrollTop spec.
    const scrollHeight = this._messageContainer.scrollHeight;
    ReactDOM.findDOMNode(this._messageContainer).scrollTop = scrollHeight;
  }

  render() {
    const messages = this.props.messages.map(message =>
      (
        <span className="ovc-rooms-message" key={message.id}>
          <img className="message-photo" src={message.senderPhotoUrl} />
          <div className="message-data">
            <div>
              <span className="message-bold">{message.sender}</span>
              &nbsp;&nbsp;&nbsp;
              <i className="message-light">{message.postedAt}</i>
            </div>
            <div>{message.message}</div>
          </div>
        </span>
      )
    );

    return (
      <div className="ovc-rooms-main">
        <div className="ovc-rooms-message-container"
             ref={(c) => this._messageContainer = c}>
          <div className="ovc-rooms-message-subcontainer">
            <div className="ovc-rooms-channel-header">
              <div className="message-channel-title">
                {this.props.channel.name}
              </div>
              Welcome to the beginning of the channel.&nbsp;
              <a className="message-channel-text">
                {this.props.channel.owner}
              </a>
              &nbsp;created this channel on&nbsp;
              {this.props.channel.createdDate}. Purpose:&nbsp;
              <i className="message-channel-text">
                {this.props.channel.purpose}
              </i>
            </div>
            <div className="ovc-rooms-messages">
              {messages}
            </div>
          </div>
        </div>
        <div className="ovc-rooms-message-input">
          <input value={this.state.messageInput}
                 onChange={this.handleMessageChange}
                 onKeyPress={this.postMessage} />
        </div>
      </div>
    );
  }
}

class FounderRoomsApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      company: 'Mixpanel',
      contacts: [],
      channels: [],
      messages: [],
      currentChannelId: 1,
      user: {
        id: 1,
        name: 'Daniel Chen',
        photoUrl: 'https://media.licdn.com/media/p/7/005/0b1/15a/0634b6f.jpg'
      }
    };

    this.createChannel = this.createChannel.bind(this);
    this.deleteChannel = this.deleteChannel.bind(this);
    this.joinChannel = this.createChannel.bind(this);
    this.leaveChannel = this.deleteChannel.bind(this);
    this.changeChannel = this.changeChannel.bind(this);
    this.postMessage = this.postMessage.bind(this);

    this.filterJoinedChannels = this.filterJoinedChannels.bind(this);
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

  joinChannel(newChannel) {
    // TOOD: Handle in backend
    const newState = Immutable.fromJS(this.state)
      .update('channels', channels => channels.push(newChannel));
    this.setState(newState.toJS());
  }

  leaveChannel(channelId) {
    // TOOD: Handle in backend
    const newChannels = this.state.channels.filter(channel =>
      channel.id !== channelId
    );
    const newState = Immutable.fromJS(this.state)
      .update('channels', value => newChannels);
    this.setState(newState.toJS());
  }

  changeChannel(e) {
    this.setState({ currentChannelId: Number(e.currentTarget.id) });
  }

  postMessage(newMessage) {
    // TOOD: Handle in backend
    const newState = Immutable.fromJS(this.state)
      .update('messages', messages => messages.push(newMessage));
    this.setState(newState.toJS());
  }

  filterJoinedChannels(channels) {
    return channels.filter(channel => channel.joined === true);
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
    const joinedChannels = this.filterJoinedChannels(this.state.channels);
    const currentChannel = this.filterChannelById(this.state.channels,
                                                  this.state.currentChannelId);
    const currentChannelMessages = this.filterChannelMessages(
      this.state.messages, currentChannel
    );

    return (
      <div className="ovc-rooms-container">
        <Sidebar channels={joinedChannels}
                 createChannel={this.createChannel}
                 deleteChannel={this.deleteChannel}
                 joinChannel={this.joinChannel}
                 leaveChannel={this.leaveChannel}
                 changeChannel={this.changeChannel} />
        <MessageSection messages={currentChannelMessages}
                        channel={currentChannel}
                        user={this.state.user}
                        postMessage={this.postMessage} />
      </div>
    );
  }
}

export default FounderRoomsApp;

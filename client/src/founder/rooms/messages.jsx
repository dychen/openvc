import React from 'react';
import ReactDOM from 'react-dom';

import './messages.scss';

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

export default MessageSection;


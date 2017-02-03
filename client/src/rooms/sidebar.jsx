import React from 'react';

import './sidebar.scss';

const SELF_NAME = 'Company';
const OTHER_NAME = 'External';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.joinChannel = this.joinChannel.bind(this);
    this.leaveChannel = this.leaveChannel.bind(this);
    this.changeChannel = this.changeChannel.bind(this);
  }

  joinChannel(e) {
    // TODO: Handle DMs
    this.props.changeView('joinInternalChannel');
  }

  leaveChannel(e) {
    e.stopPropagation(); // Don't bubble down to changeChannel handler
    const channelId = Number(e.currentTarget.id);
    this.props.leaveChannel(channelId);
  }

  changeChannel(e) {
    this.props.changeView('messages'); // Change back to messages view
    this.props.changeChannel(Number(e.currentTarget.id));
  }

  render() {
    const internalChannels = this.props.channels.filter(channel =>
      channel.type === 'internal'
    ).map(channel => {
      const channelClass = (
        channel.id === this.props.currentChannelId
        ? 'ovc-rooms-sidebar-channel selected'
        : 'ovc-rooms-sidebar-channel'
      );
      return (
        <span className={channelClass} key={channel.id} id={channel.id}
              onClick={this.changeChannel} >
          <span className="sidebar-change-channel">{channel.name}</span>
          <i className="sidebar-leave-channel ion-android-cancel"
             id={channel.id}
             onClick={this.leaveChannel} />
        </span>
      );
    });
    const externalChannels = this.props.channels.filter(channel =>
      channel.type === 'external'
    ).map(channel => {
      const channelClass = (
        channel.id === this.props.currentChannelId
        ? 'ovc-rooms-sidebar-channel selected'
        : 'ovc-rooms-sidebar-channel'
      );
      return (
        <span className={channelClass} key={channel.id} id={channel.id}
              onClick={this.changeChannel} >
          <span className="sidebar-change-channel">{channel.name}</span>
          <i className="sidebar-leave-channel ion-android-cancel"
             id={channel.id}
             onClick={this.leaveChannel} />
        </span>
      );
    });
    const directMessages = this.props.channels.filter(channel =>
      channel.type === 'message'
    ).map(channel => {
      const channelClass = (
        channel.id === this.props.currentChannelId
        ? 'ovc-rooms-sidebar-channel selected'
        : 'ovc-rooms-sidebar-channel'
      );
      return (
        <span className={channelClass} key={channel.id} id={channel.id}
              onClick={this.changeChannel} >
          <span className="sidebar-change-channel">{channel.name}</span>
          <i className="sidebar-leave-channel ion-android-cancel"
             id={channel.id}
             onClick={this.leaveChannel} />
        </span>
      );
    });

    return (
      <div className="ovc-rooms-sidebar">
        <span className="ovc-rooms-sidebar-title">
          <span className="sidebar-join-channel"
                onClick={this.joinChannel}>
            {SELF_NAME} Channels
          </span>
          <i className="sidebar-add-channel ion-plus-circled" />
        </span>
        {internalChannels}
        <span className="ovc-rooms-sidebar-title">
          <span className="sidebar-join-channel">{OTHER_NAME} Channels</span>
          <i className="sidebar-add-channel ion-plus-circled" />
        </span>
        {externalChannels}
        <span className="ovc-rooms-sidebar-title">
          <span className="sidebar-join-channel"
                onClick={this.joinChannel}>
            Direct Messages
          </span>
          <i className="sidebar-add-channel ion-plus-circled" />
        </span>
        {directMessages}
      </div>
    );
  }
}

export default Sidebar;


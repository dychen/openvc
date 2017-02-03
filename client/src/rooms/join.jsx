import React from 'react';

import './join.scss';

class JoinChannelSection extends React.Component {
  constructor(props) {
    super(props);

    this.joinChannel = this.joinChannel.bind(this);
  }

  joinChannel(e) {
    this.props.joinChannel(Number(e.currentTarget.id));
  }

  render() {
    const channels = this.props.channels.map(channel =>
      (
        <div className="ovc-rooms-join-channel-item" key={channel.id}
             id={channel.id} onClick={this.joinChannel}>
          <span className="join-channel-item-title">#{channel.name}</span>
          <span className="join-channel-item-subtitle">
            Created by {channel.owner} on {channel.createdDate}
          </span>
          <span className="join-channel-item-purpose">
            {channel.purpose}
          </span>
        </div>
      )
    );

    return (
      <div className="ovc-rooms-join-channel">
        <div className="ovc-rooms-join-channel-header">
          Select a channel ({this.props.channels.length} available)
        </div>
        <div className="ovc-rooms-join-channel-list">
          {channels}
        </div>
      </div>
    );
  }
}

export default JoinChannelSection;


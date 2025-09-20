import React from 'react';
import styled from 'styled-components';
import { Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';

const GridContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
  overflow: auto;
  background: #0f0f0f;
`;

const VideoWrapper = styled.div`
  position: relative;
  background: #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
  min-height: 200px;
  border: 2px solid ${props => props.isLocal ? '#667eea' : 'transparent'};
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #1a1a1a;
`;

const VideoInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserName = styled.span`
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const StatusIcons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.8)'};
  color: white;
  font-size: 12px;
`;

const ScreenShareIndicator = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PlaceholderVideo = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

function VideoGrid({ 
  localStream, 
  remoteStreams, 
  participants, 
  localVideoRef,
  isScreenSharing 
}) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAudioStatus = (stream) => {
    if (!stream) return false;
    const audioTrack = stream.getAudioTracks()[0];
    return audioTrack ? audioTrack.enabled : false;
  };

  const getVideoStatus = (stream) => {
    if (!stream) return false;
    const videoTrack = stream.getVideoTracks()[0];
    return videoTrack ? videoTrack.enabled : false;
  };

  const renderVideo = (stream, user, isLocal = false) => {
    const hasVideo = getVideoStatus(stream);
    const hasAudio = getAudioStatus(stream);

    return (
      <VideoWrapper key={user.id} isLocal={isLocal}>
        {hasVideo ? (
          <VideoElement
            ref={isLocal ? localVideoRef : null}
            autoPlay
            muted={isLocal}
            playsInline
          />
        ) : (
          <PlaceholderVideo>
            <Avatar>{getInitials(user.name)}</Avatar>
            {user.name}
          </PlaceholderVideo>
        )}
        
        <VideoInfo>
          <UserName>{user.name} {isLocal ? '(You)' : ''}</UserName>
          <StatusIcons>
            <StatusIcon active={hasAudio}>
              {hasAudio ? <Mic size={12} /> : <MicOff size={12} />}
            </StatusIcon>
            <StatusIcon active={hasVideo}>
              {hasVideo ? <Video size={12} /> : <VideoOff size={12} />}
            </StatusIcon>
          </StatusIcons>
        </VideoInfo>
        
        {isLocal && isScreenSharing && (
          <ScreenShareIndicator>
            <Monitor size={12} />
            Screen Sharing
          </ScreenShareIndicator>
        )}
      </VideoWrapper>
    );
  };

  // Create local user object
  const localUser = { id: 'local', name: 'You' };
  
  // Combine local and remote participants
  const allParticipants = [localUser, ...participants];
  
  return (
    <GridContainer>
      {allParticipants.map((participant) => {
        const isLocal = participant.id === 'local';
        const stream = isLocal ? localStream : remoteStreams.get(participant.id);
        
        return renderVideo(stream, participant, isLocal);
      })}
    </GridContainer>
  );
}

export default VideoGrid;

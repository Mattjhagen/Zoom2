import React from 'react';
import styled from 'styled-components';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  PhoneOff 
} from 'lucide-react';

const ControlsContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ControlButton = styled.button`
  background: ${props => {
    if (props.danger) return '#ff4757';
    if (props.active) return '#667eea';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${props => {
      if (props.danger) return '#ff3742';
      if (props.active) return '#5a6fd8';
      return 'rgba(255, 255, 255, 0.2)';
    }};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1000;

  ${ControlButton}:hover & {
    opacity: 1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const LeaveButton = styled(ControlButton)`
  background: #ff4757;
  margin-left: 1rem;
  
  &:hover {
    background: #ff3742;
  }
`;

function Controls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveRoom
}) {
  return (
    <ControlsContainer>
      <ButtonGroup>
        <ControlButton
          active={!isMuted}
          onClick={onToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          <Tooltip>{isMuted ? 'Unmute' : 'Mute'}</Tooltip>
        </ControlButton>

        <ControlButton
          active={!isVideoOff}
          onClick={onToggleVideo}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          <Tooltip>{isVideoOff ? 'Turn on camera' : 'Turn off camera'}</Tooltip>
        </ControlButton>

        <ControlButton
          active={isScreenSharing}
          onClick={onToggleScreenShare}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          <Tooltip>{isScreenSharing ? 'Stop sharing' : 'Share screen'}</Tooltip>
        </ControlButton>
      </ButtonGroup>

      <LeaveButton
        danger
        onClick={onLeaveRoom}
        title="Leave meeting"
      >
        <PhoneOff size={20} />
        <Tooltip>Leave meeting</Tooltip>
      </LeaveButton>
    </ControlsContainer>
  );
}

export default Controls;

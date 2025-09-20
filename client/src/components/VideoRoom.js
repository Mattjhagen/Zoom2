import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import styled from 'styled-components';
import VideoGrid from './VideoGrid';
import Controls from './Controls';
import Chat from './Chat';
import { Users, MessageCircle, X } from 'lucide-react';

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RoomTitle = styled.h2`
  color: white;
  font-size: 1.2rem;
  margin: 0;
`;

const ParticipantCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? '#667eea' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.active ? '#5a6fd8' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const CloseButton = styled.button`
  background: #ff4757;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #ff3742;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  position: relative;
`;

const VideoContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ChatContainer = styled.div`
  width: ${props => props.isOpen ? '350px' : '0'};
  background: rgba(0, 0, 0, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transition: width 0.3s ease;
  overflow: hidden;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingText = styled.div`
  color: white;
  font-size: 1.2rem;
`;

function VideoRoom() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const userName = searchParams.get('name') || 'Anonymous';
  const userId = useRef(Math.random().toString(36).substr(2, 9));
  
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const peerConnections = useRef(new Map());
  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Get user media and join room
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Unable to access camera and microphone. Please check permissions.');
        navigate('/');
      }
    };

    if (socket) {
      initializeMedia();
    }
  }, [socket, navigate]);

  // Join room when socket and stream are ready
  useEffect(() => {
    if (socket && localStream) {
      socket.emit('join-room', roomId, userId.current, userName);
    }
  }, [socket, localStream, roomId, userName]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleUserConnected = (connectedUserId, connectedUserName) => {
      console.log('User connected:', connectedUserId, connectedUserName);
      setParticipants(prev => [...prev, { id: connectedUserId, name: connectedUserName }]);
    };

    const handleUserDisconnected = (disconnectedUserId) => {
      console.log('User disconnected:', disconnectedUserId);
      setParticipants(prev => prev.filter(p => p.id !== disconnectedUserId));
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(disconnectedUserId);
        return newMap;
      });
      peerConnections.current.delete(disconnectedUserId);
    };

    const handleCurrentUsers = (users) => {
      setParticipants(users);
    };

    const handleOffer = async (data) => {
      await handleOfferReceived(data);
    };

    const handleAnswer = async (data) => {
      await handleAnswerReceived(data);
    };

    const handleIceCandidate = async (data) => {
      await handleIceCandidateReceived(data);
    };

    socket.on('user-connected', handleUserConnected);
    socket.on('user-disconnected', handleUserDisconnected);
    socket.on('current-users', handleCurrentUsers);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('user-connected', handleUserConnected);
      socket.off('user-disconnected', handleUserDisconnected);
      socket.off('current-users', handleCurrentUsers);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [socket]);

  // WebRTC functions
  const createPeerConnection = useCallback(async (userId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev.set(userId, remoteStream)));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: roomId,
          targetUserId: userId
        });
      }
    };

    peerConnections.current.set(userId, peerConnection);
    return peerConnection;
  }, [localStream, socket, roomId]);

  const handleOfferReceived = async (data) => {
    const { offer, fromUserId } = data;
    const peerConnection = await createPeerConnection(fromUserId);
    
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.emit('answer', {
      answer: answer,
      roomId: roomId,
      targetUserId: fromUserId
    });
  };

  const handleAnswerReceived = async (data) => {
    const { answer, fromUserId } = data;
    const peerConnection = peerConnections.current.get(fromUserId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidateReceived = async (data) => {
    const { candidate, fromUserId } = data;
    const peerConnection = peerConnections.current.get(fromUserId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  // Send offer to new user
  useEffect(() => {
    if (socket && localStream && participants.length > 0) {
      const sendOfferToNewUser = async (participant) => {
        if (participant.id !== userId.current) {
          const peerConnection = await createPeerConnection(participant.id);
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          socket.emit('offer', {
            offer: offer,
            roomId: roomId,
            targetUserId: participant.id
          });
        }
      };

      // Send offers to all current participants
      participants.forEach(sendOfferToNewUser);
    }
  }, [participants, socket, localStream, roomId, createPeerConnection]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        socket.emit('toggle-audio', !audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        socket.emit('toggle-video', !videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        
        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        peerConnections.current.forEach(peerConnection => {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Handle screen share end
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          if (localStream) {
            const localVideoTrack = localStream.getVideoTracks()[0];
            peerConnections.current.forEach(peerConnection => {
              const sender = peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
              );
              if (sender) {
                sender.replaceTrack(localVideoTrack);
              }
            });
          }
        };
      } else {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const leaveRoom = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    peerConnections.current.forEach(peerConnection => {
      peerConnection.close();
    });
    navigate('/');
  };

  if (isLoading) {
    return (
      <LoadingOverlay>
        <LoadingText>Connecting to room...</LoadingText>
      </LoadingOverlay>
    );
  }

  return (
    <Container>
      <Header>
        <RoomInfo>
          <RoomTitle>Room: {roomId}</RoomTitle>
          <ParticipantCount>
            <Users size={16} />
            {participants.length + 1} participants
          </ParticipantCount>
        </RoomInfo>
        <HeaderControls>
          <ToggleButton
            active={isChatOpen}
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageCircle size={20} />
          </ToggleButton>
          <CloseButton onClick={leaveRoom}>
            <X size={20} />
          </CloseButton>
        </HeaderControls>
      </Header>

      <MainContent>
        <VideoContainer>
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            participants={participants}
            localVideoRef={localVideoRef}
            isScreenSharing={isScreenSharing}
          />
          <Controls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onLeaveRoom={leaveRoom}
          />
        </VideoContainer>
        
        <ChatContainer isOpen={isChatOpen}>
          <Chat socket={socket} userName={userName} />
        </ChatContainer>
      </MainContent>
    </Container>
  );
}

export default VideoRoom;

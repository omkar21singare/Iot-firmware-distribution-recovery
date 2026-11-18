import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SystemEvent } from '../types';

interface SocketContextType {
  isConnected: boolean;
  lastMessage: any;
  liveEvents: SystemEvent[];
  activeSessionsLive: any[];
  workerPoolLive: any;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  lastMessage: null,
  liveEvents: [],
  activeSessionsLive: [],
  workerPoolLive: null
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [liveEvents, setLiveEvents] = useState<SystemEvent[]>([]);
  const [activeSessionsLive, setActiveSessionsLive] = useState<any[]>([]);
  const [workerPoolLive, setWorkerPoolLive] = useState<any>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    let socket: WebSocket;

    const connectWS = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setIsConnected(true);
          console.log('[WS] Real-time connection established.');
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);

            if (data.type === 'TRANSFER_MONITOR_UPDATE') {
              setActiveSessionsLive(data.active_sessions || []);
              setWorkerPoolLive(data.worker_pool || null);
            } else if (data.type === 'SYSTEM_EVENT') {
              const newEvt: SystemEvent = {
                timestamp: new Date().toLocaleTimeString(),
                level: data.level || 'INFO',
                category: data.category || 'SYSTEM',
                message: data.message,
                device_code: data.device_code
              };
              setLiveEvents((prev) => [newEvt, ...prev.slice(0, 49)]);
            } else if (data.type === 'ROLLBACK_TRIGGERED') {
              const rbEvt: SystemEvent = {
                timestamp: new Date().toLocaleTimeString(),
                level: 'ERROR',
                category: 'ROLLBACK',
                message: `Automatic Rollback executed for ${data.device_code}: ${data.reason}`,
                device_code: data.device_code
              };
              setLiveEvents((prev) => [rbEvt, ...prev.slice(0, 49)]);
            }
          } catch (e) {
            console.error('[WS Parse Error]', e);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          setTimeout(connectWS, 3000);
        };

        socket.onerror = (err) => {
          console.warn('[WS Error]', err);
          socket.close();
        };
      } catch (e) {
        console.error('[WS Init Error]', e);
      }
    };

    connectWS();

    return () => {
      if (socket) socket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, lastMessage, liveEvents, activeSessionsLive, workerPoolLive }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

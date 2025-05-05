import { useEffect, useRef } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8080';

const useWebSocket = (url, onMessage, onConnect) => {
  const ws = useRef(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        const path = json.path;

        ws.current = new WebSocket(`${WS_BASE_URL}/${path}`);

        ws.current.onopen = () => {
          console.log('WebSocket connection established');
          if (onConnect) onConnect();
        };

        ws.current.onmessage = onMessage;

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.current.onclose = () => {
          console.log('WebSocket connection closed');
        };

      } catch (error) {
        console.error('Ошибка при получении пути:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  return ws;
};

export default useWebSocket;
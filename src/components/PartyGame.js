import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import GameLayout from './GameLayout';
import useWebSocket from '../hooks/useWebSocket';
import { createEventHandler } from '../handlers/eventHandlers';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8080';

const PartyGame = () => {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState("");
  const [songResult, setSongResult] = useState(null);
  const [currentWord, setCurrentWord] = useState("");
  const [fetchedContent, setFetchedContent] = useState('');
  const [isContentVisible, setIsContentVisible] = useState(false);
  const timeoutRef = useRef(null);
  const { inviteCode: pathInviteCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryInviteCode = searchParams.get('inviteCode');

  const customHandlers = (data) => {
    if (data.eventType === "SHOW_INVITE_CODE_RESPONSE") {
      setFetchedContent(data.payload.code);
      setIsContentVisible(true);
      copyToClipboard(data.payload.code);
      timeoutRef.current = setTimeout(() => setIsContentVisible(false), 5000);
    }
  };

  const eventHandler = createEventHandler({
    setResults,
    setSongResult,
    setCurrentWord,
    customHandlers
  });

  const ws = useWebSocket(
    `${API_BASE_URL}/sessions/peek-party-session-room?inviteCode=${queryInviteCode}`,
    eventHandler
  );

  // Добавляем недостающие обработчики
  const handleSearch = useCallback((query) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const event = {
        eventType: "SEARCH_REQUEST_BROADCAST",
        payload: { message: query }
      };
      ws.current.send(JSON.stringify(event));
    }
  }, [ws]);

  const handleSearchSong = useCallback((query) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const event = {
        eventType: "SONG_REQUEST_BROADCAST",
        payload: { message: query }
      };
      ws.current.send(JSON.stringify(event));
    }
  }, [ws]);

  const handleSelect = useCallback((result) => {
    setSelectedResult(result);
    handleSearchSong(result.id);
  }, [handleSearchSong]);

  const handleWord = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const event = { eventType: "WORD_REQUEST_BROADCAST" };
      ws.current.send(JSON.stringify(event));
    }
  }, [ws]);

  const handleGoBack = useCallback(() => {
    ws.current?.close();
  }, [ws]);

  // Добавляем недостающую функцию
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  }, []);

  // Добавляем обработчик показа invite code
  const handleShowInviteCode = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const event = { eventType: "SHOW_INVITE_CODE_REQUEST_TARGET" };
      ws.current.send(JSON.stringify(event));
    }
  }, [ws]);

  // Очистка таймера
  useEffect(() => {
      return () => {
          if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
          }
      };
  }, []);

  return (
    <GameLayout
        onGoBack={handleGoBack}
        onWord={handleWord}
        currentWord={currentWord}
        onSearch={handleSearch}
        results={results}
        onSelect={handleSelect}
        selectedResult={selectedResult}
        songResult={songResult}
    >
        {/* Блок для отображения invite code */}
        <div 
            className="fetch-container"
            onClick={handleShowInviteCode}
            style={{ 
                cursor: 'pointer',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                margin: '10px 0'
            }}
        >
            {isContentVisible ? (
                <div>{fetchedContent}</div>
            ) : (
                <div>Кликните для получения кода приглашения</div>
            )}
        </div>
    </GameLayout>
);
};

export default PartyGame;
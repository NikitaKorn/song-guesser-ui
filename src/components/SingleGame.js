import React, { useState, useCallback, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import GameLayout from './GameLayout';
import useWebSocket from '../hooks/useWebSocket';
import { createEventHandler } from '../handlers/eventHandlers';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8080';

const SingleGame = () => {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState("");
  const [songResult, setSongResult] = useState(null);
  const [currentWord, setCurrentWord] = useState("");
  const navigate = useNavigate();

  const handleError = useCallback((message) => {
    alert(`Ошибка: ${message}`); // Дублируем алерт для надежности
    setTimeout(() => {
      navigate('/', { replace: true }); // Задержка перед редиректом
    }, 100);
  }, [navigate]);

  // Создаем обработчик событий
  const eventHandler = createEventHandler({
    setResults,
    setSongResult,
    setCurrentWord,
    onError: handleError // Прямая передача обработчика
  });

  const ws = useWebSocket(
    `${API_BASE_URL}/sessions/peek-solo-session-room`,
    eventHandler
  );

  // Добавляем недостающие обработчики
  const handleSearch = useCallback((query) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const event = {
        eventType: "SEARCH_REQUEST_TARGET",
        payload: { message: query }
      };
      ws.current.send(JSON.stringify(event));
    }
  }, [ws]);

  const handleSearchSong = useCallback((query) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const event = {
        eventType: "SONG_REQUEST_TARGET",
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
      const event = { eventType: "WORD_REQUEST_TARGET" };
      ws.current.send(JSON.stringify(event));
    }
  }, [ws]);

  const handleGoBack = useCallback(() => {
    ws.current?.close();
  }, [ws]);

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
      onError={handleError}
    />
  );
};

export default SingleGame;
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import SelectedResult from './SelectedResult';
import WordComponent from './WordComponent';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8080';

const SingleGame = () => {
    const [results, setResults] = useState([]); // Результаты поиска
    const [selectedResult, setSelectedResult] = useState(""); // Выбранный результат
    const [songResult, setSongResult] = useState(null); // Выбранный результат
    const [currentWord, setCurrentWord] = useState("");
    const ws = useRef(null); // Используем useRef для хранения WebSocket

    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode');
    }
  
    let event = {
      eventType: '',
      payload: {
        message: ''
      }
    };

    let event2 = {
      eventType: '',
    };
  
    useEffect(() => {
      console.log("useEffect выполняется"); // Логируем выполнение useEffect
  
      // Получаем путь для WebSocket
      fetch(`${API_BASE_URL}/sessions/peek-solo-session-room`)
        .then(response => response.json())
        .then(json => {
          const path = json.path; // Получаем путь из ответа сервера
  
          // Создаем WebSocket соединение
          ws.current = new WebSocket(`${WS_BASE_URL}/${path}`);
  
          ws.current.onopen = () => {
            console.log('WebSocket connection established');
          };
  
          ws.current.onmessage = (event) => {
            handleEvent(event);
          };
  
          ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
          };
  
          ws.current.onclose = () => {
            console.log('WebSocket connection closed');
          };
  
          // Закрываем соединение при размонтировании компонента
          return () => {
            if (ws.current) {
              ws.current.close();
            }
          };
        })
        .catch(error => {
          console.error('Ошибка при получении пути:', error);
        });
    }, []); // Пустой массив зависимостей
  
    const handleEvent = (event) => {
      try {
        const data = JSON.parse(event.data); // Парсим ответ от сервера
        console.log('Received data:', data); // Логируем для отладки
  
        if (data.eventType === "SEARCH_RESPONSE") {
          console.info('SEARCH_RESPONSE type', data);
          const newResults = data.payload.hits.map((item) => ({
            title: item.result.full_title,
            url: item.result.url,
            id: item.result.id,
          }));
          console.info(newResults);
          setResults(newResults); // Обновляем состояние с новыми результатами
        } else if (data.eventType === "SONG_RESPONSE") {
          console.info('SONG_RESPONSE type', data);
          const newResults = {
            title: data.payload.title,
            url: data.payload.url,
          };
          setSongResult(newResults);
        } else if (data.eventType === "WORD_RESPONSE") {
          console.info('WORD_RESPONSE type', data);
          setCurrentWord(data.payload.word);
        }
      } catch (error) {
        console.error('Error parsing server response:', error);
      }
    };
  
    const handleSearch = (query) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        event.eventType = "SEARCH_REQUEST_TARGET";
        event.payload.message = query;
        ws.current.send(JSON.stringify(event)); // Отправляем запрос на сервер
      } else {
        console.error('WebSocket is not open');
      }
    };
  
    const handleSearchSong = (query) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        event.eventType = "SONG_REQUEST_TARGET";
        event.payload.message = query;
        ws.current.send(JSON.stringify(event)); // Отправляем запрос на сервер
      } else {
        console.error('WebSocket is not open');
      }
    };
  
    const handleSelect = (result) => {
      setSelectedResult(result); // Обновляем выбранный результат
      handleSearchSong(result.id);
      console.log('Выбран результат:', result);
    };
  
    const handleWord = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        event2.eventType = "WORD_REQUEST_TARGET";
        ws.current.send(JSON.stringify(event2)); // Отправляем запрос на сервер
      } else {
        console.error('WebSocket is not open');
      }
    };

      // Обработчик для кнопки "назад"
  const handleGoBack = () => {
    if (ws.current) {
      ws.current.close();
      console.log('WebSocket connection closed manually');
    }
  };
  
    return (
      <div>
        <Link to="/" className="nav-back"onClick={handleGoBack}>
          ← Вернуться на главную
        </Link>
        <h1>Поиск текста песни</h1>
        <WordComponent onSearch={handleWord} currentWord={currentWord} />
        <SearchForm onSearch={handleSearch} />
        <SearchResults results={results} onSelect={handleSelect} />
        <SelectedResult selectedResult={selectedResult} songResult={songResult} />
      </div>
    );
  }
  
  export default SingleGame;
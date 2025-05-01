import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import SelectedResult from './SelectedResult';
import WordComponent from './WordComponent';
import { useParams, useSearchParams } from 'react-router-dom';

const PartyGame = () => {
    const [results, setResults] = useState([]); // Результаты поиска
    const [selectedResult, setSelectedResult] = useState(""); // Выбранный результат
    const [songResult, setSongResult] = useState(null); // Выбранный результат
    const [currentWord, setCurrentWord] = useState("");
    const ws = useRef(null); // Используем useRef для хранения WebSocket
  
    let event = {
      eventType: '',
      payload: {
        message: ''
      }
    };

    let event2 = {
      eventType: '',
    };

    const [fetchedContent, setFetchedContent] = useState('');
    const [isContentVisible, setIsContentVisible] = useState(false);
    const timeoutRef = useRef(null);
    const { inviteCode: pathInviteCode } = useParams();
    // Получаем параметр из query-строки
  const [searchParams] = useSearchParams();
  const queryInviteCode = searchParams.get('inviteCode');

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const copyToClipboard = async (text) => {
      try {
          await navigator.clipboard.writeText(text);
          console.log('Текст скопирован в буфер');
          // Можно добавить визуальное подтверждение вместо console.log
      } catch (err) {
          console.error('Ошибка копирования:', err);
      }
  };

    // Новая функция для обработки fetch запроса
    const handleShowInviteCode = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          event2.eventType = "SHOW_INVITE_CODE_REQUEST_TARGET";
          ws.current.send(JSON.stringify(event2)); // Отправляем запрос на сервер
        } else {
          console.error('WebSocket is not open');
        }
    };
  
    useEffect(() => {
      console.log("useEffect выполняется"); // Логируем выполнение useEffect
  
      // Получаем путь для WebSocket
      fetch(`http://localhost:8080/sessions/peek-party-session-room?inviteCode=${queryInviteCode}`)
        .then(response => response.json())
        .then(json => {
          const path = json.path; // Получаем путь из ответа сервера
  
          // Создаем WebSocket соединение
          ws.current = new WebSocket('ws://localhost:8080/' + path);
  
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
        } else if (data.eventType === "SHOW_INVITE_CODE_RESPONSE") {
          console.info('SHOW_INVITE_CODE_RESPONSE type', data);
          setFetchedContent(data.payload.code);
                setIsContentVisible(true);
                copyToClipboard(data.payload.code);
                // Скрываем контент через 5 секунд
                timeoutRef.current = setTimeout(() => {
                    setIsContentVisible(false);
                }, 5000);
        }
      } catch (error) {
        console.error('Error parsing server response:', error);
      }
    };
  
    const handleSearch = (query) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        event.eventType = "SEARCH_REQUEST_BROADCAST";
        console.log(query);
        event.payload.message = query;
        ws.current.send(JSON.stringify(event)); // Отправляем запрос на сервер
      } else {
        console.error('WebSocket is not open');
      }
    };
  
    const handleSearchSong = (query) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        event.eventType = "SONG_REQUEST_BROADCAST";
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
        event2.eventType = "WORD_REQUEST_BROADCAST";
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
        <Link to="/" className="nav-back" onClick={handleGoBack}>
            ← Вернуться на главную
        </Link>
        
        {/* Новое поле для отображения контента */}
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
                <div>Кликните для получения данных</div>
            )}
        </div>

        <h1>Поиск текста песни</h1>
        <WordComponent onSearch={handleWord} currentWord={currentWord} />
        <SearchForm onSearch={handleSearch} />
        <SearchResults results={results} onSelect={handleSelect} />
        <SelectedResult selectedResult={selectedResult} songResult={songResult} />
    </div>
);
  }
  
  export default PartyGame;
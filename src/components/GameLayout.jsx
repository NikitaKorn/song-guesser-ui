import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WordComponent from './WordComponent';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import SelectedResult from './SelectedResult';

const GameLayout = ({ 
  children,
  onGoBack,
  onWord,
  currentWord,
  onSearch,
  results,
  onSelect,
  selectedResult,
  songResult,
  onError
}) => {
  const navigate = useNavigate(); // Хук для навигации

  // Обработчик ошибок по умолчанию
  const defaultErrorHandler = (message) => {
    window.alert(message);
    navigate('/'); // Переход на главную после OK
  };

  return (
    <div>
      <Link to="/" className="nav-back" onClick={onGoBack}>
        ← Вернуться на главную
      </Link>
      {children}
      <h1>Поиск текста песни</h1>
      <WordComponent 
        onSearch={onWord} 
        currentWord={currentWord} 
        onError={onError || defaultErrorHandler} // Пробрасываем обработчик
      />
      <SearchForm onSearch={onSearch} />
      <SearchResults results={results} onSelect={onSelect} />
      <SelectedResult selectedResult={selectedResult} songResult={songResult} />
    </div>
  );
};

// common/handlers/eventHandlers.js
export const createEventHandler = (setters) => (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log('Received data:', data);

    if (data.eventType === "ERROR") {
      console.log('Обработка ошибки');
      setters.onError?.(data.payload?.message || 'Неизвестная ошибка');
      return;
    }

    switch(data.eventType) {
      case "ERROR":
        if (setters.onError && data.payload?.message) {
          setters.onError(data.payload.message); // Вызываем обработчик
        } else {
          console.error('Unhandled error:', data);
        }
        break;
      case "SEARCH_RESPONSE":
        setters.setResults(data.payload.hits.map(item => ({
          title: item.result.full_title,
          url: item.result.url,
          id: item.result.id,
        })));
        break;
      case "SONG_RESPONSE":
        setters.setSongResult({
          title: data.payload.title,
          url: data.payload.url,
        });
        break;
      case "WORD_RESPONSE":
        setters.setCurrentWord(data.payload.word);
        break;
      default:
        if (setters.customHandlers) {
          setters.customHandlers(data);
        }
    }
  } catch (error) {
    console.error('Error parsing server response:', error);
  }
};

export default GameLayout;
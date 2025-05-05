import { useCallback } from 'react';

export const createEventHandler = (setters) => (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received data:', data);
  
      switch(data.eventType) {
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
        case "ERROR":
          const errorMessage = data.payload?.message || 'Произошла неизвестная ошибка';
          alert(`Ошибка: ${errorMessage}`); // Добавляем алерт
          setters.onError?.(errorMessage);
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

  export const useWebSocketHandlers = (ws) => {
    const createEventSender = useCallback((eventType) => 
      (payload = null) => {
        try {
          if (ws.current?.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
              eventType,
              payload: payload && JSON.parse(JSON.stringify(payload)) // Remove circular references
            });
            ws.current.send(message);
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      },
      [ws]
    );
  
    return {
      handleSearch: createEventHandler('SEARCH_REQUEST_TARGET'),
      handleSearchSong: createEventHandler('SONG_REQUEST_TARGET'),
      handleWord: createEventHandler('WORD_REQUEST_TARGET'),
      handleError: createEventSender('ERROR_REPORT'), // For client-side error reporting
      createEventSender
    };
  };
import React, { useState, useEffect } from "react";
import microphoneIcon from "../assets/microphone.png"; // Импортируем PNG-изображение

function SearchForm({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false); // Состояние записи
  const [recognition, setRecognition] = useState(null); // Объект распознавания

  // Инициализация распознавания речи
  useEffect(() => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      console.log("Распознавание речи НЕ поддерживается");
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true; // Непрерывное распознавание
    recognitionInstance.interimResults = true; // Промежуточные результаты
    recognitionInstance.lang = "ru"; // Язык распознавания

    // Обработка результатов
    recognitionInstance.onresult = (event) => {
      const results = event.results;
      if (!results || results.length === 0) return;

      const lastResult = results[results.length - 1];
      if (!lastResult || lastResult.length === 0) return;

      const firstAlternative = lastResult[0];
      if (!firstAlternative) return;

      const newTranscript = firstAlternative.transcript;
      setQuery(newTranscript); // Обновляем значение поля ввода
    };

    // Обработка ошибок
    recognitionInstance.onerror = (event) => {
      console.error("Ошибка распознавания:", event.error);
      setIsRecording(false); // Останавливаем запись при ошибке
    };

    // Обработка завершения
    recognitionInstance.onend = () => {
      setIsRecording(false); // Останавливаем запись
    };

    setRecognition(recognitionInstance); // Сохраняем объект распознавания
  }, []);

  // Запуск записи
  const startRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
      console.log("Запись начата");
    }
  };

  // Остановка записи
  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      console.log("Запись остановлена");
    }
  };

  // Автоматический поиск через 2 секунды после изменения query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim() !== "") { // Проверяем, что поле не пустое
        onSearch(query); // Вызываем функцию поиска
      }
    }, 1000); // Задержка 2 секунды

    return () => clearTimeout(delayDebounceFn); // Очищаем таймер при изменении query
  }, [query]); // Зависимость от query

  const handleSubmit = (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query} // Привязываем значение к состоянию query
        onChange={(e) => setQuery(e.target.value)} // Обновляем состояние query
        placeholder="Введите текст песни"
      />
      <button
        onMouseDown={startRecording} // Начало записи при нажатии
        onMouseUp={stopRecording} // Остановка записи при отпускании
        onTouchStart={startRecording} // Для мобильных устройств
        onTouchEnd={stopRecording} // Для мобильных устройств
        className={`record-button ${isRecording ? "recording" : ""}`} // Динамический класс
      >
        {/* Используем PNG-изображение как иконку */}
        <img src={microphoneIcon} alt="Микрофон" className="microphone-icon" />
      </button>
    </form>
  );
}

export default SearchForm;
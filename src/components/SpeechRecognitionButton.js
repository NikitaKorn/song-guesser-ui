import React, { useState, useEffect } from "react";

const SpeechRecognitionButton = ( {setQuery} ) => {
  const [isRecording, setIsRecording] = useState(false); // Состояние записи
  const [transcript, setTranscript] = useState(""); // Распознанный текст
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
      setTranscript(newTranscript); // Обновляем распознанный текст
      setQuery(transcript);
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

  return (
    <div>
      <button
        onMouseDown={startRecording} // Начало записи при нажатии
        onMouseUp={stopRecording} // Остановка записи при отпускании
        onTouchStart={startRecording} // Для мобильных устройств
        onTouchEnd={stopRecording} // Для мобильных устройств
        className={`record-button ${isRecording ? "recording" : ""}`} // Динамический класс
      >
        {isRecording ? "Отпустите, чтобы остановить" : "Нажмите и удерживайте"}
      </button>
    </div>
  );
};

export default SpeechRecognitionButton;
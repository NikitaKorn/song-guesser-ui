import React, { useState, useEffect } from 'react';
import ReactPlayer from "react-player";

const Embedvideo = ({ url }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false); // Сбрасываем состояние при изменении URL
  }, [url]);

  return (
    <div className="player-wrapper">
      <ReactPlayer
        className="react-player"
        url={url}
        width="1200px"
        height="600px"
        controls={true}
        onReady={() => setIsReady(true)}
      />
      {!isReady && <p>Загрузка видео...</p>}
    </div>
  );
};

function SelectedResult({ selectedResult, songResult }) {
  return (
    <div className="selected-result">
      <h2>Выбранный результат:</h2>
      <p>
        <a href={selectedResult.url} target="_blank" rel="noopener noreferrer">
          {selectedResult.title}
        </a>
      </p>
      {songResult && (
        <div>
          <Embedvideo url={songResult.url} />
        </div>
      )}
    </div>
  );
}

export default SelectedResult;
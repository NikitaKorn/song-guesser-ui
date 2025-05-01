import React from 'react';

function WordComponent({ currentWord, onSearch }) {
  return (
    <div className="word-component clickable-block" onClick={onSearch}>
      <p>{currentWord}</p>
    </div>
  );
}

export default WordComponent;
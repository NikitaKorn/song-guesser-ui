import React from 'react';

function SearchResults({ results, onSelect }) {
  return (
    <div className="search-results">
      <h2>Результаты поиска:</h2>
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              {result.title}
            </a>
            <button className="select-button" onClick={() => onSelect(result)}>
              Выбрать
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchResults;
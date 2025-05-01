// components/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inviteCode, setInviteCode] = useState('');

  // Проверяем наличие кода в URL при загрузке
  useEffect(() => {
    const code = searchParams.get('inviteCode');
    if (code) {
      navigate(`/multi?inviteCode=${code}`);
    }
  }, [searchParams, navigate]);

  const handleJoinParty = (e) => {
    e.preventDefault();
    if (inviteCode) {
      navigate(`/multi?inviteCode=${inviteCode}`);
    }
  };

  return (
    <div className="home-container">
      <h1>Добро пожаловать!</h1>
      
      <div className="game-modes">
        <button onClick={() => navigate('/single')}>Одиночная игра</button>
        <button onClick={() => navigate('/multi')}>Создать комнату</button>
      </div>

      <div className="invite-section">
        <h3>Присоединиться по коду:</h3>
        <form onSubmit={handleJoinParty}>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Введите инвайт-код"
          />
          <button type="submit">Присоединиться</button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
import React from 'react';
import './App.css';
import HomePage from './components/HomePage';
import SingleGame from './components/SingleGame';
import PartyGame from './components/PartyGame';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/single" element={<SingleGame />} />
          <Route path="/multi" element={<PartyGame />} />
          <Route path="/multi/:inviteCode" element={<PartyGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
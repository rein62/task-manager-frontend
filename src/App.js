import React from 'react';
import Header from './Header';
import Dashboard from './Dashboard';  // ← эта строка должна быть
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Dashboard />  {/* ← и эта */}
    </div>
  );
}

export default App;
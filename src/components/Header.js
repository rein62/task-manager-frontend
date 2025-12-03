import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header fade-in">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2L38 12V28L20 38L2 28V12L20 2Z" fill="url(#gradient)" stroke="url(#gradient)" strokeWidth="2"/>
                <path d="M20 10L28 15V25L20 30L12 25V15L20 10Z" fill="white" stroke="white" strokeWidth="2"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-primary">Rein</span>
              <span className="logo-secondary">Platform</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
'use client'

import { useEffect } from "react";
import "../css/LanguageToggle.css";

export default function LanguageToggle({ isLatin, setIsLatin }) {

  function toggleLanguage() {
    localStorage.setItem('cachedLanguage', (!isLatin ? 'latin' : 'greek'));
    setIsLatin(!isLatin);
  };

  return (
    <div>
        <label className="toggle-label">{isLatin ? "Latin" : "Greek"}</label>
        <div className='toggle-container'>
            <div className={`toggle-switch ${isLatin ? "" : "toggle-switch-active"}`} onClick={toggleLanguage}>
                <div className="toggle-circle"></div>
            </div>
        </div>
      
    </div>
  );
};
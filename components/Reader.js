'use client'

import LanguageToggle from './LanguageToggle';
import { latinToGreek, greekToLatin } from '../js/alphabetConversions';

import { useState, useEffect } from 'react';

export default function Reader() {

    function setInitialLanguage() {
        const cachedLanguage = localStorage.getItem('cachedLanguage');
        if (cachedLanguage) {
            return cachedLanguage == 'latin';
        }
        return true
    }
    const [isLatin, setIsLatin] = useState(setInitialLanguage())

    const [text, setText] = useState('');

    useEffect(() => {
        if (!isLatin) {
            const greekText = text.split('').map(char => latinToGreek[char] || char).join('');
            setText(greekText);
        } else if (isLatin) {
            const latinText = text.split('').map(char => greekToLatin[char] || char).join('');
            setText(latinText);
        }
    }, [isLatin, text]);

    return (
        <div className='reader-container'>
            <LanguageToggle isLatin={isLatin} setIsLatin={setIsLatin}/>
            <textarea
                className={`reader ${text ? (isLatin ? 'latin-reader' : 'greek-reader') : ''}`}
                value={text} 
                onChange={(e) => setText(e.target.value)} 
            />
        </div>
    );
};

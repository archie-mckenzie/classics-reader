'use client'

import LanguageToggle from './LanguageToggle';
import { latinToGreek, greekToLatin } from '../js/client/alphabetConversions';

import { useState, useEffect } from 'react';
import SingleWordDisplay from './SingleWordDisplay';

export default function Reader() {

    const [text, setText] = useState('');
    const [isLaunched, setIsLaunched] = useState(false)
    const maxLength = 500;

    const [isLatin, setIsLatin] = useState(true)

    const [singleWordAnalysis, setSingleWordAnalysis] = useState(null)

    useEffect(() => {
        const cachedLanguage = localStorage.getItem('cachedLanguage');
        if (cachedLanguage) {
            setIsLatin(cachedLanguage === 'latin');
        }
    }, [])

    useEffect(() => {
        if (!isLatin) {
            const greekText = text.split('').map(char => latinToGreek[char] || char).join('');
            setText(greekText);
        } else if (isLatin) {
            const latinText = text.split('').map(char => greekToLatin[char] || char).join('');
            setText(latinText);
        }
    }, [isLatin, text]);

    function updateText(event) {
        if (event.target.value.length <= maxLength) {
            setText(event.target.value);
        }
    }

    function launchReader() {
        async function requestAnalysis() {
            try {
                const response = await fetch('api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        text: text,
                        isLatin: isLatin,
                    }),
                });
                const data = await response.json();
                if (data.error) {
                    setIsLaunched(false)
                } else {
                    if (data.isSingleWord) {
                        setSingleWordAnalysis(data.analysis)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (!isLaunched) {
            requestAnalysis()
            setIsLaunched(true)
        }
    }

    function reset() {
        setText('')
        setSingleWordAnalysis(null)
        setIsLaunched(false)
    }

    return (
        <div className='reader-container'>
            <LanguageToggle isLatin={isLatin} setIsLatin={setIsLatin} readOnly={isLaunched}/>
            <textarea
                className={`reader ${text ? (isLatin ? 'latin-reader' : 'greek-reader') : ''}`}
                value={text} 
                onChange={isLaunched ? (event) => {reset(); updateText(event)} : updateText} 
                placeholder='...'
            />
            <div className='underneath-textarea'>{maxLength - text.length} characters remaining</div>
            {
                text && !isLaunched &&
                <div onClick={launchReader} className={`submit-button ${text ? (isLatin ? 'latin-background' : 'greek-background') : ''}`}>
                    <div>
                        Analyze
                    </div>
                </div>
            }
            {
                isLaunched && singleWordAnalysis &&
                <SingleWordDisplay analysis={singleWordAnalysis} reset={reset}/>
            }
        </div>
    );
};

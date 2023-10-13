'use client'

import LanguageToggle from './LanguageToggle';
import { latinToGreek, greekToLatin } from '../js/client/alphabetConversions';

import { useState, useEffect } from 'react';
import SingleWordDisplay from './SingleWordDisplay';
import ParagraphDisplay from './ParagraphDisplay';

function LoadingDots() {
    
    const [dots, setDots] = useState('.')

    useEffect(() => {
        let timer;
        function updateDots() {
            setDots((prev) => {
                if (prev == '...') {
                    return ''
                } else {
                    return `${prev}.`
                }
            })
        };
        timer = setInterval(updateDots, 333);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className='loading-dots'>{dots}</div>
    )
}

export default function Reader({ language = 'latin' }) {

    const [text, setText] = useState('');
    const [isLaunched, setIsLaunched] = useState(false)
    const maxLength = 300;

    const [isLatin, setIsLatin] = useState(language == 'latin')

    // mutually exclusive
    const [singleWordAnalysis, setSingleWordAnalysis] = useState(null) 
    const [paragraphAnalysis, setParagraphAnalysis] = useState(null)

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
                    } else {
                        setParagraphAnalysis(data)
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
        setText('');
        setSingleWordAnalysis(null);
        setParagraphAnalysis(null);
        setIsLaunched(false);
    }

    return (
        <div className='reader-container'>
            <LanguageToggle isLatin={isLatin} setIsLatin={setIsLatin} reset={isLaunched ? reset : null}/>
            <textarea
                className={`reader ${isLatin ? 'latin-reader' : 'greek-reader'} ${text ? (isLatin ? 'latin-border' : 'greek-border') : ''} ${paragraphAnalysis ? 'grey-text' : ''}`}
                value={text} 
                onChange={isLaunched ? (event) => {reset(); updateText(event)} : updateText} 
                placeholder={isLatin ? 'Arma virumque cano...' : 'μῆνιν ἄειδε θεὰ...'}
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
                isLaunched && !singleWordAnalysis && !paragraphAnalysis &&
                <LoadingDots />
            }
            {
                isLaunched && singleWordAnalysis && 
                <SingleWordDisplay analysis={singleWordAnalysis} reset={reset}/>
            }
            {
                isLaunched && paragraphAnalysis && !singleWordAnalysis &&
                <ParagraphDisplay data={paragraphAnalysis}/>
            }
        </div>
    );
};

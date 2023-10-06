'use client'

import { useState, useEffect } from 'react'

function ParsingWindow({ data = null, position = null }) {

    console.log(data)
    
    if (!data || !data.parsing || !data.meaning || !data.dictionaryForm || !position || !position.top || !position.left) {
        return (
            <span className={'popup'}
                style={{
                    position: "absolute",
                    top: position.top,
                    left: position.left,
            }}>
                Unable to parse
            </span>
        );
    }

    return (
        <span className={'popup'}
            style={{
            position: "absolute",
            top: position.top,
            left: position.left,
        }}>
            { 
                data.transliteration &&
                <>
                    <i>{data.transliteration}</i>
                    <br/>
                </>
                ||
                <>
                    <i>{data.word}</i>
                    <br/>
                </>
            }
            <b>Parsing: </b>{data.parsing}
            <br/>
            <b>Meaning: </b>{data.meaning}
            <br/>
            <b>Dictionary Form: </b>{data.dictionaryForm}
        </span>
    );
}


export default function ParagraphDisplay({ data = null }) {

    function Word({ wordObject }) {
        const [isBold, setIsBold] = useState(false);
        const [windowPosition, setWindowPosition] = useState({ top: 0, left: 0 });
        const [parsing, setParsing] = useState(null);
      
        const handleClick = (event) => {
            event.stopPropagation();
            const wordElement = event.target;
            const wordRect = wordElement.getBoundingClientRect();
            const left = Math.min(wordRect.left + window.scrollX, window.innerWidth - 200);
            const top = wordRect.top + window.scrollY + 30;
            setWindowPosition({ top, left });
            setIsBold(true);
        };
      
        const handleGlobalClick = () => {
          setIsBold(false);
        };
      
        useEffect(() => {
          window.addEventListener('click', handleGlobalClick);
          window.addEventListener('resize', handleGlobalClick);
          return () => {
            window.removeEventListener('click', handleGlobalClick);
            window.removeEventListener('resize', handleGlobalClick);
          };
        }, []);
      
        useEffect(() => {
          async function fetchParsing() {
            const response = await fetch('api/parse', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                wordObject: wordObject,
                isLatin: data.isLatin,
                _id: data._id,
              }),
            });
            const parsing = await response.json()
            setParsing(parsing)
          }
          if (isBold) {
            fetchParsing();
          }
        }, [isBold]);
      
        return (
          <>
            { isBold && parsing &&
                <ParsingWindow data={parsing} position={windowPosition} />
            }
            <span onClick={handleClick} className='clickable-word'>
              {Array.from(wordObject.word).map((char, index) => {
                return /\p{L}/u.test(char) ? (
                  <span key={index} style={{ fontWeight: isBold ? 'bold' : 'normal' }}>{char}</span>
                ) : (
                  <span key={index}>{char}</span>
                );
              })}
              {' '}
            </span>
          </>
        );
    }

    const [displayEnglishText, setDisplayEnglishText] = useState('')
    const [shouldDisplayEnglish, setShouldDisplayEnglish] = useState(false)

    function updateDisplayEnglishText() {
        setDisplayEnglishText((prev) => {
            if (prev == '...') {
                return ''
            } else {
                return `${prev}.`
            }
        })
    }

    const [englishTranslation, setEnglishTranslation] = useState('');

    useEffect(() => {
        let timer;
        let inProgress = false;
        async function fetchEnglishTranslation() {
            if (inProgress || englishTranslation) return;
            inProgress = true;
            const response = await fetch('api/english', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                      _id: data._id,
                      isLatin: data.isLatin
                }),
            });
            const result = await response.json();
            if (result.englishTranslation) {
                setEnglishTranslation(result.englishTranslation)
                setDisplayEnglishText('Display English?')
            } else {
                updateDisplayEnglishText()
            }
            inProgress = false;
        };
        if (!englishTranslation) {
            timer = setInterval(fetchEnglishTranslation, 333);
        }
        return () => clearInterval(timer);
    }, [englishTranslation]);

    return (
        <div className='paragraph-display'>
            <div >
                {data.wordObjects.map((wordObject, index) => {
                    return <Word wordObject={wordObject} key={index} />
                })}
            </div>
            <div className='underneath-paragraph-word-parsing'>
                <span style={{"fontSize": "smaller", "marginRight": "5px"}}>ⓘ </span> Click on a word to parse it
            </div>
            <hr/>
            {
                shouldDisplayEnglish && englishTranslation && 
                <div>
                    
                    {englishTranslation}
                </div>
            }
            <div className='underneath-paragraph-word-parsing'>
                <span 
                    style={{"cursor": `${englishTranslation ? 'pointer' : 'normal'}`}}
                    onClick={() => {
                        if (englishTranslation) { setShouldDisplayEnglish(prev => !prev) }
                    }}
                >
                    {
                        !shouldDisplayEnglish 
                        && 
                        <span>{displayEnglishText}</span>
                        ||
                        <span>Hide English?</span>
                    }
                </span>
            </div>
        </div>
  );
};
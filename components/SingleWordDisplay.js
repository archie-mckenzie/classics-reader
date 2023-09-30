'use client'

export default function SingleWordDisplay({ analysis = null, reset }) {

  return (
    <div className='single-word-display'>
        { analysis &&
            <div>
                <div className='single-word-display-title'>{analysis.word}</div>
                { analysis.transliteration &&
                    <div><i>{analysis.transliteration}</i></div>
                }
                <div><b>Parsing: </b>{analysis.parsing}</div>
                <div><b>Meaning: </b>{analysis.meaning}</div>
                <div><b>Dictionary Form: </b>{analysis.dictionaryForm}</div>
                { reset &&
                    <div className='underneath-single-word-parsing'>
                        <span style={{"cursor": "pointer"}} onClick={reset}>Parse another word?</span>
                    </div>
                }
            </div>
        }
    </div>
  );
};
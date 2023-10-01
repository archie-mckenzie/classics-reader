import { removePunctuation } from './gpt/parse';

const unidecode = require('unidecode');

function hasCombiningReversedCommaAbove(word) {
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const normalizedChar = char.normalize('NFD');
      if (normalizedChar.includes('\u0314')) {
        return true;
      }
    }
    return false;
}

// Transliterate a Greek word into English, so e.g. 'ἀνθρώπων' becomes 'anthropon'
// e.g. 'Ἡροδότου' becomes 'Herodotou'
export default function transliterate(word) {
    const transliteration = unidecode(removePunctuation(word));
    
    if (hasCombiningReversedCommaAbove(word)) {
      const firstCharIsUpper = transliteration[0].toUpperCase() === transliteration[0];
      return firstCharIsUpper ? 'H' + transliteration.toLowerCase() : 'h' + transliteration;
    } else {
      return transliteration;
    }
}

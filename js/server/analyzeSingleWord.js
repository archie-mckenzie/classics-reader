import connectToMongoDB from "./mongodb"
import parse from "./gpt/parse"
import transliterate from "./transliterate";

export default async function analyzeSingleWord(_id, word, isLatin) {
    try {
        const client = await connectToMongoDB;
        const words = client.db('reader').collection(`${isLatin ? 'latin' : 'greek'}_words`);
        const wordRecord = await words.findOne({ "word": word });
        if (wordRecord) {
            if (isLatin) {
                return {
                    word: word,
                    parsing: wordRecord.parsing,
                    meaning: wordRecord.meaning,
                    dictionaryForm: wordRecord.dictionaryForm
                }
            } else {
                return {
                    word: word,
                    parsing: wordRecord.parsing,
                    meaning: wordRecord.meaning,
                    transliteration: wordRecord.transliteration,
                    dictionaryForm: wordRecord.dictionaryForm
                }
            }
        } else {
            const analysis = await parse(word, isLatin);
            if (isLatin) {
                words.insertOne({
                    _id: _id,
                    text_id: '',
                    word: word,
                    parsing: analysis.parsing,
                    meaning: analysis.meaning,
                    dictionaryForm: analysis.dictionaryForm
                })
                return {
                    word: word,
                    parsing: analysis.parsing,
                    meaning: analysis.meaning,
                    dictionaryForm: analysis.dictionaryForm
                }
            } else {
                const transliteration = transliterate(word)
                words.insertOne({
                    _id: _id,
                    text_id: '',
                    word: word,
                    parsing: analysis.parsing,
                    meaning: analysis.meaning,
                    transliteration: transliteration,
                    dictionaryForm: analysis.dictionaryForm
                })
                return {
                    word: word,
                    parsing: analysis.parsing,
                    meaning: analysis.meaning,
                    transliteration: transliteration,
                    dictionaryForm: analysis.dictionaryForm
                }
            }
        }
    } catch (error) {
        return null
    }
    
}
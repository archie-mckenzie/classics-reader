import { NextResponse } from 'next/server';
import connectToMongoDB from '../../../../js/server/mongodb';
import transliterate from '../../../../js/server/transliterate';
import parse, { removePunctuation } from '../../../../js/server/gpt/parse';

function isValid(body) {
    if (!body) return false;
    if (typeof body._id != 'string') return false;
    if (!body.wordObject) return false;
    if (typeof body.wordObject._id != 'string') return false;
    if (typeof body.wordObject.word != 'string') return false;
    if (typeof body.isLatin != 'boolean') return false;
    return true;
}

export async function POST(req) {

    const body = await req.json();

    if (!isValid(body)) {
        return NextResponse.json({
            "error": "Invalid request!"
        })
    }

    const _id = body._id;
    const wordObject = body.wordObject;
    const isLatin = body.isLatin;

    try {
        const client = await connectToMongoDB;
        const paragraphs = client.db('reader').collection(`${isLatin ? 'latin' : 'greek'}_paragraphs`);
        const paragraph = await paragraphs.findOne({ "_id": _id });
        if (!paragraph) {
            return NextResponse.json({
                "error": "No such paragraph exists!"
            })
        }
        const wordIndex = parseInt(wordObject._id.split('-')[2])
        if (wordObject.word != paragraph.text.split(/\s|\n/)[wordIndex]) {
            console.log(wordIndex)
            return NextResponse.json({
                "error": "Invalid request!"
            })
        }
        const text = paragraph.text;
        const words = client.db('reader').collection(`${isLatin ? 'latin' : 'greek'}_words`);
        const wordRecord = await words.findOne({ "_id": wordObject._id });
        if (wordRecord) {
            if (isLatin) {
                return NextResponse.json({
                    word: wordRecord.word,
                    parsing: wordRecord.parsing,
                    meaning: wordRecord.meaning,
                    dictionaryForm: wordRecord.dictionaryForm
                })
            } else {
                return NextResponse.json({
                    word: wordRecord.word,
                    parsing: wordRecord.parsing,
                    meaning: wordRecord.meaning,
                    transliteration: wordRecord.transliteration,
                    dictionaryForm: wordRecord.dictionaryForm
                })
            }
        } else {
            const returnedWord = removePunctuation(wordObject.word)
            const analysis = await parse(wordObject.word, isLatin, text, wordIndex, paragraph.english_translation);
            if (isLatin) {
                words.insertOne({
                    _id: wordObject._id,
                    text_id: _id,
                    word: returnedWord,
                    parsing: analysis.parsing,
                    meaning: analysis.meaning,
                    dictionaryForm: analysis.dictionaryForm
                })
                return NextResponse.json({
                    word: returnedWord,
                    parsing: analysis.parsing,
                    meaning: analysis.meaning,
                    dictionaryForm: analysis.dictionaryForm
                })
            } else {
                const transliteration = transliterate(wordObject.word)
                words.insertOne({
                    _id: wordObject._id,
                    text_id: _id,
                    word: returnedWord,
                    parsing: analysis.parsing,
                    meaning: analysis.meaning,
                    transliteration: transliteration,
                    dictionaryForm: analysis.dictionaryForm
                })
                return NextResponse.json({
                    word: returnedWord,
                    parsing: analysis.parsing,
                    meaning: analysis.meaning,
                    transliteration: transliteration,
                    dictionaryForm: analysis.dictionaryForm
                })
            }
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            "error": "Internal server error!"
        })
    }
}
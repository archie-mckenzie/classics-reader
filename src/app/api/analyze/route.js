import { NextResponse } from 'next/server';
import analyzeSingleWord from '../../../../js/server/analyzeSingleWord';
import analyzeParagraph from '../../../../js/server/analyzeParagraph';

const crypto = require('crypto')

function isValid(body) {
    if (!body) return false;
    if (typeof body.isLatin != 'boolean') return false;
    if (typeof body.text != 'string') return false;
    if (body.text.length > 450) return false;
    return true;
}

export async function POST(req) {

    const body = await req.json();

    if (!isValid(body)) {
        return NextResponse.json({
            "error": "Submit a valid request please."
        })
    }

    const text = body.text.trim();
    const isSingleWord = text.includes(' ') ? false : true;
    const _id = isSingleWord ? `w-${crypto.randomUUID()}` : `p-${crypto.createHash('sha256').update(text).digest('hex')}`

    if (isSingleWord) {
        return NextResponse.json({
            "_id": _id,
            "isSingleWord": isSingleWord, // always true
            "analysis": await analyzeSingleWord(_id, text, body.isLatin)
        })
    } 

    const words = text.split(/\s|\n/).map((word, index) => {
        return {
            _id: `w-${_id.slice(2, 8)}-${index}-${_id.slice(8)}`,
            word: word
        }
    });

    console.log(`Analyzing paragraph:\n\n${text}`)

    analyzeParagraph(_id, text, words, body.isLatin)

    return NextResponse.json({
        "_id": _id,
        "isSingleWord": isSingleWord, // always false
        "isLatin": body.isLatin,
        "wordObjects": words
    })
    
}
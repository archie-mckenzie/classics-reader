import { NextResponse } from 'next/server';
import analyzeSingleWord from '../../../../js/server/analyzeSingleWord';
import analyzeParagraph from '../../../../js/server/analyzeParagraph';

const crypto = require('crypto')

function isValid(body) {
    if (!body) return false;
    if (typeof body.isLatin != 'boolean') return false;
    if (typeof body.text != 'string') return false;
    if (body.text.length > 250) return false;
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
    const _id = `${isSingleWord ? 'w' : 'p'}-${crypto.randomUUID()}`

    if (isSingleWord) {
        return NextResponse.json({
            "_id": _id,
            "isSingleWord": isSingleWord, // always true
            "analysis": await analyzeSingleWord(_id, text, body.isLatin)
        })
    } 

    const word_ids = text.split(' ').map(() => `w-${crypto.randomUUID()}`);

    analyzeParagraph(_id, word_ids, text, body.isLatin)

    return NextResponse.json({
        "_id": _id,
        "isSingleWord": isSingleWord, // always false
        "word_ids": word_ids
    })
    
}
import { NextResponse } from 'next/server';
import connectToMongoDB from '../../../../js/server/mongodb';

function isValid(body) {
    if (!body) return false;
    if (typeof body._id != 'string') return false;
    if (typeof body.isLatin != 'boolean') return false;
    return true;
}

export async function POST(req) {

    const body = await req.json();

    if (!isValid(body)) {
        return NextResponse.json({
            "error": "Submit a valid request please."
        })
    }

    const _id = body._id;

    try {
        const client = await connectToMongoDB;
        const paragraphs = client.db('reader').collection(`${body.isLatin ? 'latin' : 'greek'}_paragraphs`);
        const paragraphRecord = await paragraphs.findOne({ "_id": _id });
        if (paragraphRecord.english_translation) {
            return NextResponse.json({
                "englishTranslation": paragraphRecord.english_translation
            })
        } else {
            return NextResponse.json({
                "error": "Working on translation! Hold tight."
            })
        }
    } catch (error) {
        console.log(error) 
        return NextResponse.json({
            "error": "Internal server error.",
        })
    }

    
    
}
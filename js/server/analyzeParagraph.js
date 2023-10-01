import translate from "./gpt/translate";
import connectToMongoDB from "./mongodb";

export default async function analyzeParagraph(_id, text, words, isLatin) {
    try {
        
        const client = await connectToMongoDB;
        const paragraphs = client.db('reader').collection(`${isLatin ? 'latin' : 'greek'}_paragraphs`);
        const paragraphRecord = await paragraphs.findOne({ "_id": _id });

        if (paragraphRecord) return;

        async function createTranslation() {
            const translation = await translate(text, isLatin);
            paragraphs.updateOne({_id: _id}, { $set: { english_translation: translation } }, { upsert: true })
        }

        Promise.all([
            paragraphs.updateOne({_id: _id}, { $set: { text: text, word_ids: words.map((word) => word._id) }}, { upsert: true }),
            createTranslation()
        ])
        

    } catch (error) {
        console.log(error)
    }
}
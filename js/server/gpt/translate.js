import OpenAI from "openai";
const openai = new OpenAI();
openai.apiKey = process.env.OPENAI_API_KEY;
  
export default async function translate(text, isLatin) {
    const prompt = `DO NOT USE " QUOTATION MARKS ". Translate the following paragraph from ${isLatin ? 'Latin' : 'Ancient Greek'} into English:\n\n${text}`
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `Assistant translates from ${isLatin ? 'Latin' : 'Ancient Greek'} into English beautifully and accurately.`
                },
                {
                    role: "user", 
                    content: prompt
                }
            ],
            temperature: 0
        });
        console.log(completion.choices[0].message.content)
        return completion.choices[0].message.content
    } catch (error) {
        console.log(error);
        return null;
    }
}
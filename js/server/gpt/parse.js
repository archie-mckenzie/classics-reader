import OpenAI from "openai";
const openai = new OpenAI();
openai.apiKey = process.env.OPENAI_API_KEY;

export function removePunctuation(word) {
    return word.replace(/[^\p{L}\p{N}]/gu, '');
}

async function getWordsAroundIndex(words, index, numWords) {
    const start = Math.max(0, index - (numWords / 2));
    const end = Math.min(words.length, index + (numWords / 2));
    if (start === 0) {
        return words.slice(0, end).join(' ');
    }
    if (end === words.length) {
        return words.slice(start).join(' ');
    }
    return words.slice(start, end).join(' ');
    
}
  
export default async function parse(word, isLatin, text, wordIndex, englishTranslation) {

    const functions = [
        {
            "name": "analyze",
            "description": `Outputs parsing of ${isLatin ? 'Latin' : 'Ancient Greek'} word`,
            "parameters": {
                "type": "object",
                "properties": {
                    "analysis": {
                        "type": "string",
                        "description": "Case, gender, declension, conjugation, tense, mood, voice, person, etc if necessary. Comma-separated.",
                    },
                    "meaning": {
                        "type": "string",
                        "description": "English meaning of the word.",
                    },
                    "dictionaryForm": {
                        "type": "string",
                        "description": "Dictionary form of the word.",
                    }
                },
                "required": ["analysis", "meaning", "dictionaryForm"],
            },
        }
    ];

    let prompt = '';
    if (text) {
        const surrounding = await getWordsAroundIndex(text.split(' '), wordIndex, Math.floor(Math.random() * 8) + 7)
        if (englishTranslation) {
            prompt += `The following is a ${isLatin ? 'Latin' : 'Ancient Greek'} passage translated into English:\n\n${englishTranslation}\n\n`
            prompt += `From the above passage, in the following context:\n\n${surrounding}\n\n`
        } else {
            prompt += `In the following context:\n\n${surrounding}\n\n`
        }
    }
    prompt += `Analyze the ${isLatin ? 'Latin' : 'Ancient Greek'} word in detail: ${removePunctuation(word)}`
    
    console.log(prompt)
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user", 
                    content: prompt
                }
            ],
            temperature: 0,
            functions: functions,
            function_call: {"name": "analyze"}
        });
        const args = JSON.parse(completion.choices[0].message.function_call.arguments);

        return {
            "parsing": args.analysis,
            "meaning": args.meaning,
            "dictionaryForm": args.dictionaryForm,
        };
    } catch (error) {
        console.log(error);
        return null;
    }
}
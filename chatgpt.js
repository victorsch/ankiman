import OpenAI from "openai";
import dotenv from 'dotenv';
import pkg from './anki.cjs';
const { addCards } = pkg;
dotenv.config();  
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getChatGptResponse(prompt, name, language, level) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: "json_object" },
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant designed to output JSON. I'm a ${language} learner. I'd say my level is around ${level} and I've mostly been learning through comprehensible input. I'm going to paste articles here that I've read in ${language} but don't necessarily know all of the words. I want you to use your judgement and point out words I likely wouldn't know for someone of my level. I also want you to format those words at the end of your response in a way that would work well with anki flashcards and have context along with the definition. The output json should always have word (in Russian), definition (in English), and context (in ${language}), contained in a list called 'words'`,
        },
        { role: 'user', content: prompt },
      ],
    });

    const gptResponse = response.choices[0].message.content
    await addCards(JSON.parse(gptResponse), name); // Make sure gptResponse is parsed correctly if it's a JSON string
    return gptResponse;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

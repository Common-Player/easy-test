// pages/api/chat.js
import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  const { prompt } = req.body; // 前端传来的用户输入
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, 
  });
  const openai = new OpenAIApi(configuration);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    res.status(200).json({ response: completion.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

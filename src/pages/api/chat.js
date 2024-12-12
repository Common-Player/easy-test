export default async function handler(req, res) {
    const { prompt } = req.body;
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'No prompt provided or prompt is empty' });
    }
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }]
        })
      });
  
      if (!response.ok) {
        console.error('OpenAI API Error:', await response.text());
        return res.status(500).json({ error: '与服务端通信时发生错误，请稍后重试。' });
      }
  
      const completion = await response.json();
      const answer = completion.choices?.[0]?.message?.content?.trim() || '';
      if (!answer) {
        return res.status(200).json({ response: '抱歉，没有获得任何可用的回应。' });
      }
  
      res.status(200).json({ response: answer });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      res.status(500).json({ error: '与服务端通信时发生错误，请稍后重试。' });
    }
  }
  
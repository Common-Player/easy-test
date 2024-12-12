import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if(data.response) {
      setResponse(data.response);
    } else {
      setResponse('出错了，请重试');
    }
  }

  return (
    <div style={{ padding: '50px' }}>
      <h1>GPT请求示例</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请输入你的问题"
          style={{ width: '300px', marginRight: '10px' }}
        />
        <button type="submit">提交</button>
      </form>
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h2>回答：</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

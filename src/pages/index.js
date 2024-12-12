import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResponse('');

    if (!prompt.trim()) {
      setErrorMsg('请输入您的问题');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (res.ok && data.response) {
        setResponse(data.response);
      } else {
        setErrorMsg(data.error || '请求失败，请重试');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('请求时发生未知错误，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '50px', background: '#222', color: '#fff', minHeight: '100vh' }}>
      <h1>GPT 请求示例</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input 
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请输入你的问题..."
          style={{ width: '300px', marginRight: '10px', padding: '8px', border: '1px solid #555', background: '#333', color: '#fff' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#444', border: '1px solid #555', color: '#fff', cursor: 'pointer' }}>
          发送请求
        </button>
      </form>

      {loading && <div style={{ marginBottom: '20px' }}>请求中，请稍候...</div>}
      {errorMsg && <div style={{ marginBottom: '20px', color: 'red' }}>{errorMsg}</div>}
      {response && (
        <div style={{ width: '80%', maxWidth: '600px', background: '#333', border: '1px solid #444', padding: '20px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          <h2>回答：</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

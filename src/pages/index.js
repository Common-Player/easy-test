import { useState } from 'react';
import styles from '../styles/Home.module.css'; // 引入更新后的CSS模块

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResponse(null);

    if (!prompt.trim()) {
      setErrorMsg('请输入您的URL');
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
        // 尝试解析JSON
        try {
          const jsonData = JSON.parse(data.response);
          setResponse(jsonData);
        } catch (parseError) {
          // 如果解析失败，则直接显示原文本
          setResponse(data.response);
        }
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

  const renderSection = (title, content, isPreformatted = false) => (
    <div className={styles.section}>
      <h3>{title}</h3>
      {isPreformatted ? (
        <pre className={styles.preformatted}>{content}</pre>
      ) : (
        <div className={styles.contentContainer}>
          {Array.isArray(content) ? renderPlatformContent(content) : (
            <p className={styles.content}>
              {content}
            </p>
          )}
        </div>
      )}
    </div>
  );

  const renderPlatformContent = (platforms) => {
    // 定义需要分行展示的前缀
    const lineBreakPrefixes = ['baiduboxapp', 'baiduboxlite'];

    return (
      <p className={styles.platformContent}>
        {platforms.map((item, index) => {
          const shouldBreak = lineBreakPrefixes.some(prefix => item.startsWith(prefix));
          return (
            <span key={index}>
              {shouldBreak && index !== 0 && <br />}
              {item}
              {index < platforms.length - 1 && ', '}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>输入要解析的URL</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="urlInput" className={styles['sr-only']}>URL 输入</label>
        <input 
          id="urlInput"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请输入要解析的URL..."
          className={styles.input}
          aria-label="URL 输入"
        />
        <button type="submit" className={styles.button}>
          发送请求
        </button>
      </form>

      {loading && <div className={styles.message}>请求中，请稍候...</div>}
      {errorMsg && <div className={`${styles.message} ${styles.error}`}>{errorMsg}</div>}
      {response && typeof response === 'object' ? (
        <div className={styles.responseContainer}>
          <h2>解析结果</h2>
          {/* 分块展示 */}
          {response.decoded_format && renderSection('解码后的格式', response.decoded_format)}
          {response.query && renderSection('query', response.query)}
          {response.sid && renderSection('sid', response.sid)}
          {response.zhanxing_platform && response.zhanxing_platform.length > 0 && renderSection('瞻星平台', response.zhanxing_platform)}
          {response.qiaoqiaoban && response.qiaoqiaoban.length > 0 && renderSection('七巧板', response.qiaoqiaoban)}
          {response.midpage && renderSection('中间页', response.midpage)}
          {response.other && renderSection('其他信息', JSON.stringify(response.other, null, 2), true)}
        </div>
      ) : (
        response && (
          <div className={styles.responseContainer}>
            <h2>回答：</h2>
            <p>{response}</p>
          </div>
        )
      )}
    </div>
  );
}

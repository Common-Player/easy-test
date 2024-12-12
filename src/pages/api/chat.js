export default async function handler(req, res) {
  const { prompt } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'No prompt provided or prompt is empty' });
  }

  // 内置Prompt模板：要求GPT使用JSON格式输出
  const promptTemplate = `
请将以下URL中的参数进行解析和处理，并以JSON格式输出。

给定URL示例：
{输入URL}

需要完成的步骤如下：

1. 从URL中提取word参数并进行URL解码。例如URL里可能会出现word=%E8%BF%90%E8%90%A5...这样的编码格式，请将其解码成中文。
2. 从URL中提取sid参数的值。
3. 提取域名和端口信息，如http://grey.baidu.com:8812、http://sefe-beimei.bcc-bdbl.baidu.com:8590、https://m.baidu.com等，保持原始输入中对应的域名和端口不变。
4. 将提取出的信息按照JSON格式输出，示例如下(字段名称可参考，但需包含所有信息点)：

{
  "decoded_format": "{原始域名与端口}/s?word={解码后的word}&sid={sid}&node_addr={node_addr}",
  "query": "{解码后的word}",
  "sid": "{sid}",
  "zhanxing_platform": [
    "baiduboxapp://v1/browser/open?url={对完整URL进行URL编码并添加 &newbrowser=1&forbidautorotate=1 参数}",
    "baiduboxlite://v1/browser/open?url={同上，与baiduboxapp一致的URL编码方式}"
  ],
  "qiaoqiaoban": [
    "baiduboxapp://v1/browser/open?url={将word保持原始编码方式并使用{{word@rawurlencode:...}}格式及sid、node_addr参数}&newbrowser=1&forbidautorotate=1",
    "baiduboxlite://v1/browser/open?url={同上}"
  ],
  "midpage": "{原始域名与端口}/s?word={原始编码的word}&sid={sid}&sa=searchpromo_jlhb_fenxiang_wise&ext=force",
  "other": {
    "domain_port": "{原始域名与端口}",
    "node_addr": "{node_addr}",
    "raw_word": "{原始编码的word}"
  }
}

注意：
- 如果node_addr参数存在，也请一并提取并保持原值（如有）。若无则可以在JSON中省略node_addr相关字段。
- 瞻星平台和七巧板对应的URL需要对完整查询URL进行适当的URL编码。
- 中间页示例中，将在末尾增加&sa=searchpromo_jlhb_fenxiang_wise&ext=force。

请严格以JSON格式输出最终结果，勿包含多余的解释性文字。
将{输入URL}替换为用户给定的URL进行解析。
`;

  const finalPrompt = promptTemplate.replace('{输入URL}', prompt.trim());

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: finalPrompt }]
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

    // 直接返回answer（JSON字符串）
    res.status(200).json({ response: answer });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: '与服务端通信时发生错误，请稍后重试。' });
  }
}

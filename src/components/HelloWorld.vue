<template>
  <div class="hello">
    <el-input
      v-model="userInput"
      placeholder="输入您的请求"
      class="input-field"
    ></el-input>

    <el-select
      v-model="selectedApis"
      multiple
      placeholder="请选择API"
      class="select-field"
    >
      <el-option label="百度" value="baidu"></el-option>
      <el-option label="GPT" value="gpt"></el-option>
    </el-select>

    <el-button type="primary" @click="sendRequests" class="send-button"
      >发送请求</el-button
    >

    <div v-if="response" class="response">
      <h3>百度响应结果:</h3>
      <pre>{{ response.result }}</pre>
    </div>
    <div v-if="response2" class="response">
      <h3>GPT响应结果:</h3>
      <pre>{{ response2.choices[0].message.content }}</pre>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      userInput: "", // 用户输入的数据
      selectedApis: ["baidu", "gpt"], // 选择的API类型数组
      response: null, // 存储百度的响应数据
      response2: null, // 存储GPT的响应数据
    };
  },
  methods: {
    async sendRequests() {
      const requests = [];

      if (this.selectedApis.includes("baidu")) {
        requests.push(this.sendBaiduRequest());
      }
      if (this.selectedApis.includes("gpt")) {
        requests.push(this.sendGPTRequest());
      }

      try {
        await Promise.all(requests);
      } catch (error) {
        console.error("请求 API 出错:", error);
      }
    },

    async sendGPTRequest() {
      const OPENAI_API_KEY = process.env.VUE_APP_OPENAI_API_KEY;
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: this.userInput }],
            temperature: 0.7,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
          }
        );

        this.response2 = response.data;
      } catch (error) {
        console.error("请求 GPT API 出错:", error);
        this.response2 = error.message;
      }
    },
    async sendBaiduRequest() {
      const BAIDU_ACCESS_TOKEN = process.env.VUE_APP_BAIDU_ACCESS_TOKEN;
      try {
        const response = await axios.post(
          "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=" +
            BAIDU_ACCESS_TOKEN,
          {
            messages: [
              {
                role: "user",
                content: this.userInput,
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        this.response = response.data;
      } catch (error) {
        console.error("请求百度 API 出错:", error);
        this.response = error.message;
      }
    },
  },
};
</script>

<style scoped>
.hello {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.input-field,
.select-field,
.send-button {
  width: 300px; /* 调整宽度 */
}

.response {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  border: 1px solid #eee;
  padding: 10px;
  width: 60%;
  max-height: 300px; /* 设置最大高度 */
}
pre {
  width: 80%; /* 设置固定宽度 */
  max-height: 150px; /* 设置最大高度 */
  overflow-y: auto; /* 超出部分垂直滚动 */
  background-color: #f9f9f9; /* 背景色，可根据需要调整 */
  padding: 10px; /* 内边距 */
  border: 1px solid #ccc; /* 边框 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 阴影效果，可选 */
  white-space: pre-wrap; /* 自动换行 */
  word-wrap: break-word; /* 长单词或URL可以换行分割 */
}

h3 {
  color: #333;
}
</style>

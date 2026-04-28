<template>
  <n-card title="Base64 编解码工具" :bordered="false">
    <n-grid :cols="2" :x-gap="16" responsive="screen" item-responsive>
      <n-grid-item span="24 s:24 m:12">
        <n-space vertical :size="16">
          <n-input
            v-model:value="sourceText"
            type="textarea"
            :autosize="{ minRows: 12, maxRows: 18 }"
            placeholder="请输入需要编码或解码的内容"
          />
          <n-space>
            <n-button type="primary" @click="encodeText">Base64 编码</n-button>
            <n-button @click="decodeText">Base64 解码</n-button>
            <n-button tertiary @click="clearAll">清空</n-button>
          </n-space>
        </n-space>
      </n-grid-item>

      <n-grid-item span="24 s:24 m:12">
        <n-card size="small" title="转换结果" embedded>
          <template #header-extra>
            <n-space align="center" :size="8">
              <n-tag :type="statusType">{{ statusText }}</n-tag>
              <n-button text @click="copyResult">复制</n-button>
            </n-space>
          </template>
          <n-input
            v-model:value="resultText"
            type="textarea"
            readonly
            :autosize="{ minRows: 12, maxRows: 18 }"
            placeholder="结果会显示在这里"
          />
        </n-card>
      </n-grid-item>
    </n-grid>
  </n-card>
</template>

<script>
const { ref } = Vue;

export default {
  setup() {
    const sourceText = ref("hello world");
    const resultText = ref("");
    const statusText = ref("待处理");
    const statusType = ref("default");

    function utf8ToBase64(value) {
      // 先把 UTF-8 文本安全转换，再交给只支持 Latin-1 的 btoa 处理。
      return btoa(unescape(encodeURIComponent(value)));
    }

    function base64ToUtf8(value) {
      // 反向还原 UTF-8 转换，保证中文等多字节字符能正确解码。
      return decodeURIComponent(escape(atob(value)));
    }

    function encodeText() {
      try {
        resultText.value = utf8ToBase64(sourceText.value);
        statusText.value = "编码完成";
        statusType.value = "success";
      } catch {
        statusText.value = "编码失败";
        statusType.value = "error";
      }
    }

    function decodeText() {
      try {
        resultText.value = base64ToUtf8(sourceText.value);
        statusText.value = "解码完成";
        statusType.value = "success";
      } catch {
        statusText.value = "解码失败，请检查输入内容";
        statusType.value = "error";
      }
    }

    async function copyResult() {
      if (!resultText.value) {
        statusText.value = "当前没有可复制的结果";
        statusType.value = "warning";
        return;
      }
      await navigator.clipboard.writeText(resultText.value);
      statusText.value = "结果已复制";
      statusType.value = "success";
    }

    function clearAll() {
      sourceText.value = "";
      resultText.value = "";
      statusText.value = "已清空";
      statusType.value = "default";
    }

    return {
      clearAll,
      copyResult,
      decodeText,
      encodeText,
      resultText,
      statusText,
      statusType,
      sourceText
    };
  }
};
</script>

<template>
  <n-card title="JSON 格式化工具" :bordered="false">
    <n-space vertical :size="16">
      <n-input
        v-model:value="input"
        type="textarea"
        :autosize="{ minRows: 12, maxRows: 18 }"
        placeholder='请输入 JSON 内容，例如：{"name":"tool"}'
      />

      <n-space wrap>
        <n-button type="primary" @click="formatJson">格式化</n-button>
        <n-button @click="compressJson">压缩</n-button>
        <n-button @click="copyOutput">复制结果</n-button>
        <n-button tertiary @click="clearAll">清空</n-button>
      </n-space>

      <n-card size="small" :title="statusTitle" embedded>
        <template #header-extra>
          <n-tag :type="statusType">{{ statusText }}</n-tag>
        </template>
        <n-input
          v-model:value="output"
          type="textarea"
          readonly
          :autosize="{ minRows: 12, maxRows: 18 }"
          placeholder="格式化结果将显示在这里"
        />
      </n-card>
    </n-space>
  </n-card>
</template>

<script>
const { computed, ref } = Vue;

export default {
  setup() {
    const input = ref('{\n  "title": "tool-platform",\n  "author": "student"\n}');
    const output = ref("");
    const statusText = ref("待处理");
    const statusType = ref("default");

    const statusTitle = computed(() => {
      if (statusType.value === "error") {
        return "错误提示";
      }
      if (statusType.value === "success") {
        return "处理结果";
      }
      return "输出区域";
    });

    function parseInput() {
      // 统一在这里做 JSON 解析，格式化和压缩都复用同一套校验逻辑。
      try {
        return JSON.parse(input.value);
      } catch (error) {
        statusText.value = "JSON 格式错误";
        statusType.value = "error";
        output.value = error.message;
        return null;
      }
    }

    function formatJson() {
      // 使用两个空格缩进，让结果更适合阅读和调试。
      const parsed = parseInput();
      if (!parsed) return;
      output.value = JSON.stringify(parsed, null, 2);
      statusText.value = "格式化成功";
      statusType.value = "success";
    }

    function compressJson() {
      // 去掉缩进重新序列化，生成更紧凑的 JSON 内容。
      const parsed = parseInput();
      if (!parsed) return;
      output.value = JSON.stringify(parsed);
      statusText.value = "压缩成功";
      statusType.value = "success";
    }

    async function copyOutput() {
      if (!output.value) {
        statusText.value = "当前没有可复制的内容";
        statusType.value = "warning";
        return;
      }
      await navigator.clipboard.writeText(output.value);
      statusText.value = "结果已复制";
      statusType.value = "success";
    }

    function clearAll() {
      input.value = "";
      output.value = "";
      statusText.value = "已清空";
      statusType.value = "default";
    }

    return {
      clearAll,
      compressJson,
      copyOutput,
      formatJson,
      input,
      output,
      statusText,
      statusTitle,
      statusType
    };
  }
};
</script>

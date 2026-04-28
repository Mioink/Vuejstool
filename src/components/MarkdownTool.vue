<template>
  <n-card title="Markdown 实时预览" :bordered="false">
    <n-space vertical :size="18">
      <n-card embedded size="small">
        <n-space justify="space-between" align="center" wrap>
          <span>支持标题、列表、引用、代码块、粗体与行内代码</span>
          <n-tag :type="statusType">{{ statusText }}</n-tag>
        </n-space>
      </n-card>

      <n-grid :cols="2" :x-gap="16" responsive="screen" item-responsive>
        <n-grid-item span="24 s:24 m:12">
          <n-space vertical :size="16">
            <n-input
              v-model:value="markdownText"
              type="textarea"
              :autosize="{ minRows: 16, maxRows: 24 }"
              placeholder="请输入 Markdown 内容"
            />
            <n-space wrap>
              <n-button @click="resetSample">恢复示例</n-button>
              <n-button @click="insertSnippet('title')">插入标题</n-button>
              <n-button @click="insertSnippet('list')">插入列表示例</n-button>
              <n-button type="primary" @click="copyMarkdown">复制原文</n-button>
            </n-space>
          </n-space>
        </n-grid-item>

        <n-grid-item span="24 s:24 m:12">
          <n-card size="small" title="预览结果" embedded>
            <div class="markdown-preview" v-html="compiledMarkdown"></div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-space>
  </n-card>
</template>

<script>
const { computed, ref, watch } = Vue;

const SAMPLE_TEXT = `# 在线多功能工具平台

## 功能模块

- JSON 格式化工具
- Base64 编解码
- Markdown 实时预览
- 随机密码生成器
- 本地记事本

> 本项目基于 Vue.js 与 Naive UI 实现。

\`\`\`
console.log("Markdown Preview");
\`\`\`

支持 **粗体文本** 和 \`行内代码\`。`;

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function applyInlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  return html;
}

function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let inCodeBlock = false;
  let codeLines = [];
  let listItems = [];

  function flushList() {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.map((item) => `<li>${applyInlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  }

  function flushCodeBlock() {
    if (!codeLines.length) return;
    blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    codeLines = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      flushList();
      continue;
    }

    if (/^- /.test(line)) {
      listItems.push(line.replace(/^- /, ""));
      continue;
    }

    flushList();

    if (/^### /.test(line)) {
      blocks.push(`<h3>${applyInlineMarkdown(line.replace(/^### /, ""))}</h3>`);
      continue;
    }

    if (/^## /.test(line)) {
      blocks.push(`<h2>${applyInlineMarkdown(line.replace(/^## /, ""))}</h2>`);
      continue;
    }

    if (/^# /.test(line)) {
      blocks.push(`<h1>${applyInlineMarkdown(line.replace(/^# /, ""))}</h1>`);
      continue;
    }

    if (/^> /.test(line)) {
      blocks.push(`<blockquote>${applyInlineMarkdown(line.replace(/^> /, ""))}</blockquote>`);
      continue;
    }

    blocks.push(`<p>${applyInlineMarkdown(line)}</p>`);
  }

  flushList();
  if (inCodeBlock) {
    flushCodeBlock();
  }

  return blocks.join("");
}

export default {
  setup() {
    const markdownText = ref(SAMPLE_TEXT);
    const statusText = ref("实时预览中");
    const statusType = ref("info");

    const compiledMarkdown = computed(() => renderMarkdown(markdownText.value || "请输入 Markdown 内容"));

    watch(markdownText, () => {
      statusText.value = "实时预览中";
      statusType.value = "info";
    });

    function resetSample() {
      markdownText.value = SAMPLE_TEXT;
      statusText.value = "已恢复示例";
      statusType.value = "success";
    }

    function insertSnippet(type) {
      const snippets = {
        title: "\n# 新标题\n## 二级标题\n",
        list: "\n- 第一项\n- 第二项\n- 第三项\n"
      };
      markdownText.value += snippets[type] || "";
      statusText.value = "已插入示例";
      statusType.value = "success";
    }

    async function copyMarkdown() {
      try {
        await navigator.clipboard.writeText(markdownText.value);
        statusText.value = "Markdown 内容已复制";
        statusType.value = "success";
      } catch {
        statusText.value = "当前环境不允许复制";
        statusType.value = "warning";
      }
    }

    return {
      compiledMarkdown,
      copyMarkdown,
      insertSnippet,
      markdownText,
      resetSample,
      statusText,
      statusType
    };
  }
};
</script>

<style scoped>
.markdown-preview {
  min-height: 360px;
  line-height: 1.8;
  color: #1e293b;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3) {
  margin: 0 0 12px;
  color: #0f172a;
}

.markdown-preview :deep(p),
.markdown-preview :deep(li),
.markdown-preview :deep(blockquote) {
  color: #334155;
}

.markdown-preview :deep(ul) {
  margin: 0 0 14px;
  padding-left: 22px;
}

.markdown-preview :deep(code) {
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.08);
  font-family: Consolas, Monaco, monospace;
}

.markdown-preview :deep(pre) {
  margin: 0 0 16px;
  padding: 12px;
  overflow-x: auto;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.08);
}

.markdown-preview :deep(pre code) {
  padding: 0;
  background: transparent;
}

.markdown-preview :deep(blockquote) {
  margin: 0 0 16px;
  padding-left: 12px;
  border-left: 4px solid #0f766e;
}

:global(.dark) .markdown-preview {
  color: #e2e8f0;
}

:global(.dark) .markdown-preview :deep(h1),
:global(.dark) .markdown-preview :deep(h2),
:global(.dark) .markdown-preview :deep(h3) {
  color: #f8fafc;
  letter-spacing: 0;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
}

:global(.dark) .markdown-preview :deep(p),
:global(.dark) .markdown-preview :deep(li),
:global(.dark) .markdown-preview :deep(blockquote) {
  color: #dbe4f0;
}

:global(.dark) .markdown-preview :deep(ul) {
  color: #dbe4f0;
}

:global(.dark) .markdown-preview :deep(code) {
  background: rgba(30, 41, 59, 0.98);
  color: #f8fafc;
}

:global(.dark) .markdown-preview :deep(pre) {
  border: 1px solid rgba(71, 85, 105, 0.6);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.92));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

:global(.dark) .markdown-preview :deep(blockquote) {
  border-left-color: #2dd4bf;
  background: rgba(13, 20, 34, 0.55);
  padding: 8px 0 8px 12px;
  border-radius: 0 8px 8px 0;
}

:global(.dark) .markdown-preview :deep(strong) {
  color: #ffffff;
}
</style>

<template>
  <n-card title="本地记事本" :bordered="false">
    <n-space vertical :size="16">
      <n-card embedded size="small">
        <n-space justify="space-between" align="center" wrap>
          <span>内容会自动保存到浏览器本地存储</span>
          <n-tag type="success">{{ saveStatus }}</n-tag>
        </n-space>
      </n-card>

      <n-input
        v-model:value="noteText"
        type="textarea"
        :autosize="{ minRows: 16, maxRows: 24 }"
        placeholder="请输入笔记内容"
      />

      <n-space>
        <n-button type="primary" @click="saveNow">立即保存</n-button>
        <n-button @click="copyNote">复制内容</n-button>
        <n-button tertiary @click="clearNote">清空笔记</n-button>
      </n-space>
    </n-space>
  </n-card>
</template>

<script>
const { onMounted, ref, watch } = Vue;

export default {
  setup() {
    const STORAGE_KEY = "tool-platform-note";
    const noteText = ref("");
    const saveStatus = ref("未修改");
    let saveTimer = null;

    // 把笔记内容存到 localStorage，刷新页面后也能自动恢复。

    function persistNote() {
      localStorage.setItem(STORAGE_KEY, noteText.value);
      saveStatus.value = "已自动保存";
    }

    function saveNow() {
      persistNote();
    }

    async function copyNote() {
      if (!noteText.value) {
        saveStatus.value = "当前没有可复制的内容";
        return;
      }
      await navigator.clipboard.writeText(noteText.value);
      saveStatus.value = "笔记已复制";
    }

    function clearNote() {
      noteText.value = "";
      persistNote();
    }

    // 给自动保存加一点延迟，避免输入过快时频繁写入 localStorage。
    watch(noteText, () => {
      saveStatus.value = "正在输入...";
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        persistNote();
      }, 500);
    });

    onMounted(() => {
      noteText.value = localStorage.getItem(STORAGE_KEY) || "这是一个支持自动保存的本地记事本。";
    });

    return {
      clearNote,
      copyNote,
      noteText,
      saveNow,
      saveStatus
    };
  }
};
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="themeOverrides">
    <n-message-provider>
      <div :class="['app-shell', { dark: isDark }]">
        <header class="app-header">
          <div class="brand-block">
            <div>
              <h1>在线多功能工具平台</h1>
              <p>基于 Vue.js 的工具集合设计与实现</p>
            </div>
            <n-tag round size="small" type="success">毕业设计演示版</n-tag>
          </div>

          <n-space align="center" :size="16">
            <div class="header-stat">
              <span>最近使用</span>
              <strong>{{ recentTools[0]?.name || "暂无记录" }}</strong>
            </div>
            <button class="theme-switch" @click="isDark = !isDark">
              <span class="theme-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M21 12.79A9 9 0 0 1 11.21 3c0 .34-.03.67-.08 1A8.5 8.5 0 1 0 20 12.87c.33-.05.66-.08 1-.08z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <n-switch :value="isDark" />
            </button>
          </n-space>
        </header>

        <div class="workspace">
          <aside class="tool-sider">
            <div class="sider-inner">
              <div class="sider-section">
                <div class="section-title">工具导航</div>
                <div class="tool-list">
                  <button
                    v-for="tool in sortedTools"
                    :key="tool.key"
                    class="tool-item"
                    :class="{ active: activeToolKey === tool.key }"
                    @click="selectTool(tool.key)"
                  >
                    <div class="tool-main">
                      <div class="tool-name-row">
                        <span class="tool-name">{{ tool.name }}</span>
                        <button
                          class="favorite-button"
                          :class="{ selected: favorites.includes(tool.key) }"
                          @click.stop="toggleFavorite(tool.key)"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      </div>
                      <span class="tool-desc">{{ tool.description }}</span>
                    </div>
                  </button>
                </div>
              </div>

              <div class="sider-section">
                <div class="section-title">最近使用</div>
                <n-list bordered>
                  <n-list-item v-for="item in recentTools" :key="item.key">
                    <span>{{ item.name }}</span>
                  </n-list-item>
                  <n-list-item v-if="recentTools.length === 0">
                    <span>还没有使用记录</span>
                  </n-list-item>
                </n-list>
              </div>
            </div>
          </aside>

          <main class="content-panel">
            <div class="content-wrap">
              <n-card class="hero-panel" :bordered="false">
                <div class="hero-copy">
                  <div>
                    <h2>{{ activeTool.name }}</h2>
                    <p>{{ activeTool.description }}</p>
                  </div>
                  <n-space>
                    <n-tag type="info" round>{{ activeTool.category }}</n-tag>
                    <n-tag v-if="favorites.includes(activeTool.key)" type="warning" round>
                      已收藏
                    </n-tag>
                  </n-space>
                </div>
              </n-card>

              <component :is="activeTool.component" :is-dark="isDark" />
            </div>
          </main>
        </div>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script>
import JsonTool from "./components/JsonTool.vue";
import Base64Tool from "./components/Base64Tool.vue";
import MarkdownTool from "./components/MarkdownTool.vue";
import PasswordTool from "./components/PasswordTool.vue";
import NoteTool from "./components/NoteTool.vue";

const { computed, onMounted, ref, watch } = Vue;
const { darkTheme } = naive;

const STORAGE_KEYS = {
  theme: "tool-platform-theme",
  favorites: "tool-platform-favorites",
  recent: "tool-platform-recent",
  active: "tool-platform-active"
};

export default {
  components: {
    JsonTool,
    Base64Tool,
    MarkdownTool,
    PasswordTool,
    NoteTool
  },
  setup() {
    // 所有工具都集中登记在这里，左侧导航和右侧动态组件共用这份配置。
    const tools = [
      {
        key: "json",
        name: "JSON 格式化",
        description: "支持 JSON 校验、格式化与一键复制。",
        category: "开发工具",
        component: JsonTool
      },
      {
        key: "base64",
        name: "Base64 编解码",
        description: "快速完成文本编码与解码转换。",
        category: "编码处理",
        component: Base64Tool
      },
      {
        key: "markdown",
        name: "Markdown 预览",
        description: "左侧输入 Markdown，右侧实时预览。",
        category: "文档工具",
        component: MarkdownTool
      },
      {
        key: "password",
        name: "随机密码生成",
        description: "自定义长度与字符类型，生成高强度密码。",
        category: "安全工具",
        component: PasswordTool
      },
      {
        key: "note",
        name: "本地记事本",
        description: "自动保存到浏览器，支持本地记录灵感。",
        category: "效率工具",
        component: NoteTool
      }
    ];

    const isDark = ref(false);
    const favorites = ref([]);
    const recentKeys = ref([]);
    const activeToolKey = ref("json");

    const themeOverrides = {
      common: {
        fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        primaryColor: "#0f766e",
        primaryColorHover: "#115e59",
        primaryColorPressed: "#134e4a",
        borderRadius: "14px"
      }
    };

    const activeTool = computed(() => tools.find((tool) => tool.key === activeToolKey.value) || tools[0]);

    const sortedTools = computed(() => {
      return [...tools].sort((a, b) => {
        const aFav = favorites.value.includes(a.key) ? 1 : 0;
        const bFav = favorites.value.includes(b.key) ? 1 : 0;
        if (aFav !== bFav) {
          return bFav - aFav;
        }
        return 0;
      });
    });

    const recentTools = computed(() =>
      recentKeys.value
        .map((key) => tools.find((tool) => tool.key === key))
        .filter(Boolean)
    );

    function safeRead(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    }

    function safeWrite(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }

    function recordRecent(key) {
      // 把最近使用的工具放到最前面，并把记录数量限制在 5 条以内。
      const next = [key, ...recentKeys.value.filter((item) => item !== key)].slice(0, 5);
      recentKeys.value = next;
    }

    function selectTool(key) {
      activeToolKey.value = key;
      recordRecent(key);
    }

    function toggleFavorite(key) {
      if (favorites.value.includes(key)) {
        favorites.value = favorites.value.filter((item) => item !== key);
        return;
      }
      favorites.value = [...favorites.value, key];
    }

    onMounted(() => {
      // 页面刷新后恢复上一次的界面状态，保持连续使用体验。
      isDark.value = safeRead(STORAGE_KEYS.theme, false);
      favorites.value = safeRead(STORAGE_KEYS.favorites, []);
      recentKeys.value = safeRead(STORAGE_KEYS.recent, []);
      activeToolKey.value = safeRead(STORAGE_KEYS.active, "json");
      recordRecent(activeToolKey.value);
    });

    watch(isDark, (value) => safeWrite(STORAGE_KEYS.theme, value));
    watch(favorites, (value) => safeWrite(STORAGE_KEYS.favorites, value), { deep: true });
    watch(recentKeys, (value) => safeWrite(STORAGE_KEYS.recent, value), { deep: true });
    watch(activeToolKey, (value) => safeWrite(STORAGE_KEYS.active, value));

    return {
      activeTool,
      activeToolKey,
      darkTheme,
      favorites,
      isDark,
      recentTools,
      selectTool,
      sortedTools,
      themeOverrides,
      toggleFavorite
    };
  }
};
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.14), transparent 24%),
    linear-gradient(180deg, #f5f7fb 0%, #eef3f7 100%);
  transition: background 0.3s ease;
}

.app-shell.dark {
  background:
    radial-gradient(circle at top left, rgba(45, 212, 191, 0.16), transparent 28%),
    radial-gradient(circle at bottom right, rgba(251, 146, 60, 0.14), transparent 24%),
    linear-gradient(180deg, #101827 0%, #111827 100%);
}

.app-layout,
.main-layout {
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.dark .app-header {
  background: linear-gradient(180deg, rgba(6, 12, 22, 0.9), rgba(11, 19, 32, 0.78));
  border-bottom-color: rgba(148, 163, 184, 0.18);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.03);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-block h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.dark .brand-block h1 {
  color: #f8fafc;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.24);
}

.brand-block p {
  margin: 6px 0 0;
  opacity: 0.72;
}

.dark .brand-block p,
.dark .header-stat,
.dark .header-stat strong {
  color: rgba(226, 232, 240, 0.92);
}

.header-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 13px;
}

.header-stat strong {
  font-size: 14px;
}

.theme-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  color: inherit;
  cursor: pointer;
}

.dark .theme-switch {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(148, 163, 184, 0.28);
  color: #f8fafc;
}

.theme-icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
}

.theme-icon svg,
.favorite-button svg {
  width: 100%;
  height: 100%;
}

.tool-sider {
  position: sticky;
  top: 24px;
  align-self: start;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px);
}

.dark .tool-sider {
  border-color: rgba(148, 163, 184, 0.22);
  background:
    linear-gradient(180deg, rgba(8, 15, 28, 0.96), rgba(16, 24, 39, 0.9));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 18px 40px rgba(2, 6, 23, 0.34);
}

.workspace {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 24px;
  padding: 24px;
}

.sider-inner {
  padding: 20px 16px 24px;
}

.content-panel {
  min-width: 0;
}

.sider-section + .sider-section {
  margin-top: 22px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
  opacity: 0.7;
  letter-spacing: 0.04em;
}

.dark .section-title {
  color: rgba(148, 163, 184, 0.96);
  opacity: 1;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-item {
  width: 100%;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.dark .tool-item {
  border-color: rgba(71, 85, 105, 0.55);
  background: rgba(15, 23, 42, 0.98);
  color: #f8fafc;
}

.tool-item:hover,
.tool-item.active {
  transform: translateY(-1px);
  border-color: rgba(15, 118, 110, 0.65);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.dark .tool-item:hover,
.dark .tool-item.active {
  border-color: rgba(45, 212, 191, 0.78);
  box-shadow:
    0 14px 30px rgba(2, 6, 23, 0.42),
    inset 0 0 0 1px rgba(45, 212, 191, 0.18);
}

.tool-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tool-name {
  font-weight: 700;
}

.dark .tool-name {
  color: #f8fafc;
}

.tool-desc {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.78;
}

.dark .tool-desc {
  color: rgba(203, 213, 225, 0.88);
  opacity: 1;
}

.favorite-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.favorite-button.selected {
  color: #f59e0b;
}

.content-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-panel {
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(249, 115, 22, 0.14)),
    rgba(255, 255, 255, 0.88);
}

.dark .hero-panel {
  background:
    linear-gradient(135deg, rgba(45, 212, 191, 0.16), rgba(251, 146, 60, 0.12)),
    rgba(15, 23, 42, 0.88);
}

.hero-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.hero-copy h2 {
  margin: 0 0 10px;
  font-size: 24px;
}

.hero-copy p {
  margin: 0;
  opacity: 0.8;
}

@media (max-width: 900px) {
  .app-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .tool-sider {
    position: static;
  }

  .hero-copy {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

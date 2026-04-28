const { loadModule } = window["vue3-sfc-loader"];
const { createApp } = Vue;

const options = {
  moduleCache: {
    vue: Vue
  },
  async getFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`无法加载文件: ${url}`);
    }
    return {
      getContentData: () => response.text()
    };
  },
  addStyle(textContent) {
    const style = Object.assign(document.createElement("style"), { textContent });
    document.head.appendChild(style);
  }
};

const App = await loadModule("./src/App.vue", options);
createApp(App).use(naive).mount("#app");

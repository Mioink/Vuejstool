const { loadModule } = window["vue3-sfc-loader"];
const { createApp } = Vue;

const options = {
  // 复用浏览器全局对象，这样单文件组件在无构建环境下也能直接使用 Vue。
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
    // 在运行时把每个组件的 scoped 样式注入到页面 head 中。
    const style = Object.assign(document.createElement("style"), { textContent });
    document.head.appendChild(style);
  }
};

// 运行时加载根组件，便于项目直接以静态文件方式部署。
const App = await loadModule("./src/App.vue", options);
createApp(App).use(naive).mount("#app");

<template>
  <n-card title="随机密码生成器" :bordered="false">
    <n-space vertical :size="18">
      <n-grid :cols="2" :x-gap="16" responsive="screen" item-responsive>
        <n-grid-item span="24 s:24 m:12">
          <n-form label-placement="top">
            <n-form-item label="密码长度">
              <n-input-number v-model:value="length" :min="4" :max="32" style="width: 100%" />
            </n-form-item>
            <n-form-item label="字符类型">
              <n-space vertical>
                <label class="check-line">
                  <input v-model="useUppercase" type="checkbox" />
                  <span>大写字母</span>
                </label>
                <label class="check-line">
                  <input v-model="useLowercase" type="checkbox" />
                  <span>小写字母</span>
                </label>
                <label class="check-line">
                  <input v-model="useNumbers" type="checkbox" />
                  <span>数字</span>
                </label>
                <label class="check-line">
                  <input v-model="useSymbols" type="checkbox" />
                  <span>特殊符号</span>
                </label>
              </n-space>
            </n-form-item>
          </n-form>
        </n-grid-item>

        <n-grid-item span="24 s:24 m:12">
          <n-card embedded size="small" title="生成结果">
            <n-space vertical :size="16">
              <n-input :value="password" readonly placeholder="点击生成密码" />
              <n-space>
                <n-button type="primary" @click="generatePassword">生成密码</n-button>
                <n-button @click="copyPassword">复制密码</n-button>
              </n-space>
              <n-tag :type="statusType">{{ statusText }}</n-tag>
              <n-tag :type="strength.type">{{ strength.label }}</n-tag>
            </n-space>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-space>
  </n-card>
</template>

<script>
const { computed, ref } = Vue;

export default {
  setup() {
    const length = ref(12);
    const useUppercase = ref(true);
    const useLowercase = ref(true);
    const useNumbers = ref(true);
    const useSymbols = ref(true);
    const password = ref("");
    const statusText = ref("等待生成");
    const statusType = ref("default");

    const strength = computed(() => {
      // 用轻量规则计算强度，避免为了提示等级再引入额外库。
      const score =
        (useUppercase.value ? 1 : 0) +
        (useLowercase.value ? 1 : 0) +
        (useNumbers.value ? 1 : 0) +
        (useSymbols.value ? 1 : 0) +
        (length.value >= 12 ? 1 : 0);

      if (score >= 5) return { label: "强度：高", type: "success" };
      if (score >= 3) return { label: "强度：中", type: "warning" };
      return { label: "强度：低", type: "error" };
    });

    function generatePassword() {
      // 根据勾选项先拼出字符池，再从字符池中随机取值生成密码。
      let chars = "";
      if (useUppercase.value) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (useLowercase.value) chars += "abcdefghijklmnopqrstuvwxyz";
      if (useNumbers.value) chars += "0123456789";
      if (useSymbols.value) chars += "!@#$%^&*()_+-=[]{}<>?";

      if (!chars) {
        statusText.value = "请至少选择一种字符类型";
        statusType.value = "warning";
        return;
      }

      let result = "";
      for (let index = 0; index < length.value; index += 1) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
      }
      password.value = result;
      statusText.value = "密码已生成";
      statusType.value = "success";
    }

    async function copyPassword() {
      if (!password.value) {
        statusText.value = "请先生成密码";
        statusType.value = "warning";
        return;
      }
      await navigator.clipboard.writeText(password.value);
      statusText.value = "密码已复制";
      statusType.value = "success";
    }

    return {
      copyPassword,
      generatePassword,
      length,
      password,
      statusText,
      statusType,
      strength,
      useLowercase,
      useNumbers,
      useSymbols,
      useUppercase
    };
  }
};
</script>

<style scoped>
.check-line {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

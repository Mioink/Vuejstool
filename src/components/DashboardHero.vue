<template>
  <n-card class="dashboard-hero" :bordered="false">
    <div :class="['dashboard-shell', { dark: isDark }]">
      <div class="dashboard-main">
        <div class="dashboard-copy">
          <n-tag type="success" round size="small">首页概览</n-tag>
          <h2>{{ greeting }}</h2>
          <p>{{ greetingText }}</p>
          <div class="time-block">
            <strong>{{ currentTime }}</strong>
            <span>{{ currentDate }}</span>
          </div>
        </div>

        <div class="weather-panel">
          <div class="weather-header">
            <div>
              <span class="weather-label">当前天气</span>
              <h3>{{ activeCity.name }}</h3>
            </div>
            <n-button quaternary circle size="small" @click="loadWeather">↻</n-button>
          </div>

          <div class="weather-stats">
            <div class="stat-box">
              <span>天气</span>
              <strong>{{ weatherText }}</strong>
            </div>
            <div class="stat-box">
              <span>温度</span>
              <strong>{{ temperatureText }}</strong>
            </div>
            <div class="stat-box">
              <span>体感</span>
              <strong>{{ apparentText }}</strong>
            </div>
          </div>

          <div class="city-switcher">
            <button
              v-for="city in cities"
              :key="city.name"
              class="city-chip"
              :class="{ active: city.name === activeCity.name }"
              @click="switchCity(city)"
            >
              {{ city.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </n-card>
</template>

<script>
const { computed, onMounted, onBeforeUnmount, ref } = Vue;

const cities = [
  { name: "香港", latitude: 22.3193, longitude: 114.1694 },
  { name: "北京", latitude: 39.9042, longitude: 116.4074 },
  { name: "上海", latitude: 31.2304, longitude: 121.4737 },
  { name: "广州", latitude: 23.1291, longitude: 113.2644 }
];

const weatherMap = {
  0: "晴朗",
  1: "少云",
  2: "多云",
  3: "阴天",
  45: "有雾",
  48: "雾凇",
  51: "毛毛雨",
  53: "小雨",
  55: "中雨",
  61: "阵雨",
  63: "降雨",
  65: "大雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  80: "阵雨",
  81: "强阵雨",
  82: "暴雨",
  95: "雷暴"
};

export default {
  props: {
    isDark: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const activeCity = ref(cities[0]);
    const now = ref(new Date());
    const weather = ref({
      temperature: null,
      apparent: null,
      code: null
    });
    let timer = null;

    const greeting = computed(() => {
      const hour = now.value.getHours();
      if (hour < 6) return "夜深了，注意休息";
      if (hour < 12) return "早上好，开始今天的任务";
      if (hour < 18) return "下午好，继续保持节奏";
      return "晚上好，来处理一点收尾工作";
    });

    const greetingText = computed(() => "欢迎来到在线多功能工具平台，时间和天气都在这里一眼可见。");

    const currentTime = computed(() =>
      now.value.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      })
    );

    const currentDate = computed(() =>
      now.value.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
      })
    );

    const weatherText = computed(() => weatherMap[weather.value.code] || "加载中");
    const temperatureText = computed(() =>
      weather.value.temperature === null ? "--" : `${Math.round(weather.value.temperature)}°C`
    );
    const apparentText = computed(() =>
      weather.value.apparent === null ? "--" : `${Math.round(weather.value.apparent)}°C`
    );

    async function loadWeather() {
      try {
        const { latitude, longitude } = activeCity.value;
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
          `&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();
        weather.value = {
          temperature: data.current?.temperature_2m ?? null,
          apparent: data.current?.apparent_temperature ?? null,
          code: data.current?.weather_code ?? null
        };
      } catch {
        weather.value = {
          temperature: null,
          apparent: null,
          code: null
        };
      }
    }

    function switchCity(city) {
      activeCity.value = city;
      loadWeather();
    }

    onMounted(() => {
      loadWeather();
      timer = window.setInterval(() => {
        now.value = new Date();
      }, 1000);
    });

    onBeforeUnmount(() => {
      window.clearInterval(timer);
    });

    return {
      activeCity,
      apparentText,
      cities,
      currentDate,
      currentTime,
      greeting,
      greetingText,
      loadWeather,
      switchCity,
      temperatureText,
      weatherText
    };
  }
};
</script>

<style scoped>
.dashboard-hero {
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(16, 185, 129, 0.12)),
    rgba(255, 255, 255, 0.9);
}

.dark .dashboard-hero {
  background:
    linear-gradient(135deg, rgba(45, 212, 191, 0.14), rgba(59, 130, 246, 0.12)),
    rgba(15, 23, 42, 0.92);
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 18px;
}

.dashboard-copy h2 {
  margin: 12px 0 10px;
  font-size: 30px;
  font-weight: 800;
}

.dashboard-copy p {
  margin: 0;
  max-width: 560px;
  color: rgba(51, 65, 85, 0.9);
  line-height: 1.7;
}

.dark .dashboard-copy h2 {
  color: #f8fafc;
}

.time-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 22px;
}

.time-block strong {
  font-size: 42px;
  line-height: 1;
}

.time-block span {
  color: rgba(51, 65, 85, 0.78);
}

.weather-panel {
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
}

.weather-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.weather-label {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.85);
}

.weather-header h3 {
  margin: 6px 0 0;
  font-size: 24px;
}

.weather-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.stat-box {
  padding: 12px;
  border-radius: 14px;
  background: rgba(241, 245, 249, 0.9);
}

.stat-box span {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(71, 85, 105, 0.85);
}

.stat-box strong {
  font-size: 20px;
}

.city-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.city-chip {
  padding: 8px 14px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  color: inherit;
  cursor: pointer;
}

.city-chip.active {
  border-color: rgba(15, 118, 110, 0.7);
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
}

.dark .dashboard-copy p,
.dark .time-block span {
  color: rgba(226, 232, 240, 0.86);
}

.dark .time-block strong {
  color: #ffffff;
}

.dark .weather-panel {
  border-color: rgba(71, 85, 105, 0.56);
  background: rgba(15, 23, 42, 0.78);
}

.dark .weather-label,
.dark .stat-box span {
  color: rgba(191, 219, 254, 0.82);
}

.dark .stat-box {
  background: rgba(30, 41, 59, 0.9);
}

.dark .city-chip {
  border-color: rgba(71, 85, 105, 0.65);
  background: rgba(15, 23, 42, 0.84);
  color: #e2e8f0;
}

.dark .city-chip.active {
  border-color: rgba(45, 212, 191, 0.72);
  background: rgba(45, 212, 191, 0.14);
  color: #99f6e4;
}

@media (max-width: 900px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }

  .time-block strong {
    font-size: 34px;
  }
}
</style>

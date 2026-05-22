'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  hourly: { time: string; temp: number; icon: string }[];
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Xi'an Chang'an: 34.16, 108.94
    fetch('https://api.open-meteo.com/v1/forecast?latitude=34.16&longitude=108.94&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&timezone=Asia%2FShanghai&forecast_days=1')
      .then(r => r.json())
      .then(data => {
        const code = data.current.weather_code;
        const desc = weatherCodeToDesc(code);
        const icon = weatherCodeToIcon(code);

        const hourlyData = data.hourly.time.slice(0, 8).map((t: string, i: number) => ({
          time: t.slice(11, 16),
          temp: Math.round(data.hourly.temperature_2m[i]),
          icon: weatherCodeToIcon(data.hourly.weather_code[i]),
        }));

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          description: desc,
          icon,
          hourly: hourlyData,
        });
        setLoading(false);
      })
      .catch(() => { setError('获取天气失败'); setLoading(false); });
  }, []);

  if (loading) return <div className="h-32 bg-stone-50 rounded-2xl animate-pulse" />;
  if (error) return null;

  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">🌤️ 西安 · 长安</h2>
          <p className="text-xs text-stone-400 mt-0.5">今日天气</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-stone-800 dark:text-stone-100">{weather?.temp}°</span>
          <p className="text-sm text-stone-500 mt-0.5">{weather?.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
        <span>体感 {weather?.feelsLike}°</span>
        <span>💧 {weather?.humidity}%</span>
        <span>💨 {weather?.windSpeed} km/h</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {weather?.hourly.map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-1 min-w-[48px]">
            <span className="text-xs text-stone-400">{h.time}</span>
            <span className="text-lg">{h.icon}</span>
            <span className="text-sm font-medium text-stone-700">{h.temp}°</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function weatherCodeToDesc(code: number): string {
  const map: Record<number, string> = {
    0: '晴天', 1: '晴', 2: '多云', 3: '阴',
    45: '雾', 48: '霜雾',
    51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
    61: '小雨', 63: '中雨', 65: '大雨',
    71: '小雪', 73: '中雪', 75: '大雪',
    80: '阵雨', 81: '中阵雨', 82: '大阵雨',
    95: '雷暴', 96: '雷暴加冰雹',
  };
  return map[code] || '未知';
}

function weatherCodeToIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 75) return '🌨️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '☀️';
}

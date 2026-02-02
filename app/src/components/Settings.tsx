import React, { useState } from 'react';

interface SettingsProps {
  onNavigateToHelp?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigateToHelp }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      background: '#1a1a1a',
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    }}>
      <h1 style={{ color: '#00d4ff', marginBottom: '30px' }}>系统设置</h1>

      {/* 主题设置 */}
      <div style={{
        background: '#2a2a2a',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>🎨 界面主题</h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={(e) => setTheme(e.target.value as 'dark')}
              style={{ marginRight: '8px' }}
            />
            🌙 深色主题
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={(e) => setTheme(e.target.value as 'light')}
              style={{ marginRight: '8px' }}
            />
            ☀️ 浅色主题
          </label>
        </div>
      </div>

      {/* 语言设置 */}
      <div style={{
        background: '#2a2a2a',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>🌍 语言设置</h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="language"
              value="zh"
              checked={language === 'zh'}
              onChange={(e) => setLanguage(e.target.value as 'zh')}
              style={{ marginRight: '8px' }}
            />
            🇨🇳 中文
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="language"
              value="en"
              checked={language === 'en'}
              onChange={(e) => setLanguage(e.target.value as 'en')}
              style={{ marginRight: '8px' }}
            />
            🇺🇸 English
          </label>
        </div>
      </div>

      {/* 通知设置 */}
      <div style={{
        background: '#2a2a2a',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>🔔 通知设置</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            启用系统通知
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            自动刷新数据 (30秒间隔)
          </label>
        </div>
      </div>

      {/* 系统信息 */}
      <div style={{
        background: '#2a2a2a',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>ℹ️ 系统信息</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>版本:</strong> v2.0.0</p>
          <p><strong>最后更新:</strong> 2026年2月2日</p>
          <p><strong>技术栈:</strong> React 18.2.0 + TypeScript + Vite</p>
          <p><strong>无人机总数:</strong> 15架</p>
          <p><strong>覆盖景区:</strong> 3个 (巴松措、哈巴错、念朗温泉)</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        paddingTop: '20px'
      }}>
        <button style={{
          background: '#4caf50',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          💾 保存设置
        </button>
        <button style={{
          background: '#ff9800',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          🔄 重置为默认
        </button>
        <button style={{
          background: '#f44336',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          🗑️ 清除缓存
        </button>
        <button
          onClick={onNavigateToHelp}
          style={{
            background: '#00d4ff',
            color: '#1a1a1a',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ❓ 帮助中心
        </button>
      </div>
    </div>
  );
};

export default Settings;
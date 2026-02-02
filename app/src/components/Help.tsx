import React, { useState } from 'react';

const Help: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'contact'>('guide');

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      background: '#1a1a1a',
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    }}>
      <h1 style={{ color: '#00d4ff', marginBottom: '30px', textAlign: 'center' }}>帮助中心</h1>

      {/* 标签页导航 */}
      <div style={{
        display: 'flex',
        marginBottom: '30px',
        borderBottom: '2px solid #333'
      }}>
        <button
          onClick={() => setActiveTab('guide')}
          style={{
            background: activeTab === 'guide' ? '#00d4ff' : 'transparent',
            color: activeTab === 'guide' ? '#1a1a1a' : '#fff',
            border: 'none',
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '6px 6px 0 0'
          }}
        >
          📚 使用指南
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          style={{
            background: activeTab === 'faq' ? '#00d4ff' : 'transparent',
            color: activeTab === 'faq' ? '#1a1a1a' : '#fff',
            border: 'none',
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '6px 6px 0 0'
          }}
        >
          ❓ 常见问题
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          style={{
            background: activeTab === 'contact' ? '#00d4ff' : 'transparent',
            color: activeTab === 'contact' ? '#1a1a1a' : '#fff',
            border: 'none',
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '6px 6px 0 0'
          }}
        >
          📞 联系我们
        </button>
      </div>

      {/* 使用指南 */}
      {activeTab === 'guide' && (
        <div>
          <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>📚 平台使用指南</h2>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>🚁 指挥中心功能</h3>
            <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
              <h4>总览页面</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>实时显示系统投资、收入预测、回收期等关键指标</li>
                <li>展示无人机租赁和生成式内容服务的运营数据</li>
                <li>提供景区运营概况表格和航线收入统计</li>
              </ul>
            </div>
            <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
              <h4>景区详情页面</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>查看各景区的详细运营数据</li>
                <li>监控无人机状态和飞行路线</li>
                <li>管理航线规划和安全设置</li>
              </ul>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#2196f3', marginBottom: '15px' }}>📱 游客端功能</h3>
            <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
              <h4>航线预订</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>浏览各景区热门航线</li>
                <li>查看航线详情、价格和特色功能</li>
                <li>一键预约心仪航线</li>
              </ul>
            </div>
            <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
              <h4>特色服务</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li><strong>无人机租赁：</strong>APP远程控制或现场租赁体验</li>
                <li><strong>生成式内容：</strong>真人真景合成和虚拟形象创建</li>
                <li>上传照片，AI智能生成个性化景区内容</li>
              </ul>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#ff5722', marginBottom: '15px' }}>🎨 AIGC服务流程</h3>
            <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px' }}>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                <li><strong>选择服务：</strong>在游客端选择真人真景合成或虚拟形象服务</li>
                <li><strong>上传照片：</strong>上传个人照片（建议正面清晰照）</li>
                <li><strong>AI处理：</strong>系统自动分析照片特征和景区场景</li>
                <li><strong>生成结果：</strong>获得个性化景区写真或3D虚拟形象</li>
                <li><strong>下载分享：</strong>高清下载或分享到社交媒体</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 常见问题 */}
      {activeTab === 'faq' && (
        <div>
          <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>❓ 常见问题</h2>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#4caf50', marginBottom: '10px' }}>Q: 如何预约无人机航线？</h4>
            <p style={{ margin: 0, paddingLeft: '20px', borderLeft: '3px solid #4caf50', padding: '10px 0 10px 20px' }}>
              A: 在游客端选择"航线"标签页，浏览各景区航线，点击心仪航线查看详情，然后点击"立即预约"即可。
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#2196f3', marginBottom: '10px' }}>Q: 无人机租赁服务有什么区别？</h4>
            <p style={{ margin: 0, paddingLeft: '20px', borderLeft: '3px solid #2196f3', padding: '10px 0 10px 20px' }}>
              A: APP远程租赁可通过手机远程控制无人机飞行；现场租赁适合亲临景区，30秒快速起飞体验。
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#ff5722', marginBottom: '10px' }}>Q: AIGC服务需要多长时间？</h4>
            <p style={{ margin: 0, paddingLeft: '20px', borderLeft: '3px solid #ff5722', padding: '10px 0 10px 20px' }}>
              A: 真人真景合成通常需要2-5分钟，虚拟形象生成需要3-8分钟。处理完成后会自动通知您。
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#9c27b0', marginBottom: '10px' }}>Q: 如何查看我的预约记录？</h4>
            <p style={{ margin: 0, paddingLeft: '20px', borderLeft: '3px solid #9c27b0', padding: '10px 0 10px 20px' }}>
              A: 在游客端点击底部"预约"标签页，可查看所有预约记录和订单状态。
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#ff9800', marginBottom: '10px' }}>Q: 遇到问题如何获取帮助？</h4>
            <p style={{ margin: 0, paddingLeft: '20px', borderLeft: '3px solid #ff9800', padding: '10px 0 10px 20px' }}>
              A: 您可以查看本帮助中心，或通过"联系我们"页面获取技术支持。
            </p>
          </div>
        </div>
      )}

      {/* 联系我们 */}
      {activeTab === 'contact' && (
        <div>
          <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>📞 联系我们</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>🛠️ 技术支持</h3>
              <p style={{ margin: '5px 0' }}><strong>邮箱：</strong>support@gongbujiangda.com</p>
              <p style={{ margin: '5px 0' }}><strong>电话：</strong>400-888-6666</p>
              <p style={{ margin: '5px 0' }}><strong>工作时间：</strong>9:00-18:00 (周一至周五)</p>
            </div>

            <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#2196f3', marginBottom: '15px' }}>📋 商务合作</h3>
              <p style={{ margin: '5px 0' }}><strong>邮箱：</strong>business@gongbujiangda.com</p>
              <p style={{ margin: '5px 0' }}><strong>电话：</strong>010-88886666</p>
              <p style={{ margin: '5px 0' }}><strong>地址：</strong>北京市朝阳区工布江达大厦</p>
            </div>

            <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#ff5722', marginBottom: '15px' }}>📱 微信公众号</h3>
              <p style={{ margin: '5px 0' }}>扫描二维码关注我们：</p>
              <div style={{
                width: '120px',
                height: '120px',
                background: '#444',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '10px 0',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                二维码<br/>占位图
              </div>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>工布江达无人机文旅</p>
            </div>

            <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#9c27b0', marginBottom: '15px' }}>🌐 在线客服</h3>
              <p style={{ margin: '5px 0' }}>点击下方按钮进入在线客服：</p>
              <button style={{
                background: '#9c27b0',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '10px'
              }}>
                🗣️ 联系在线客服
              </button>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#ccc' }}>
                7×24小时在线，平均响应时间&lt;30秒
              </p>
            </div>
          </div>

          <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
            <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>📍 实体门店</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <h4 style={{ color: '#4caf50', marginBottom: '8px' }}>巴松措景区店</h4>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>📍 西藏林芝市巴松措景区游客中心</p>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>📞 0894-1234567</p>
              </div>
              <div>
                <h4 style={{ color: '#2196f3', marginBottom: '8px' }}>哈巴错景区店</h4>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>📍 西藏林芝市哈巴错景区管理处</p>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>📞 0894-7654321</p>
              </div>
              <div>
                <h4 style={{ color: '#ff5722', marginBottom: '8px' }}>念朗温泉店</h4>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>📍 西藏林芝市念朗温泉度假村</p>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>📞 0894-1122334</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
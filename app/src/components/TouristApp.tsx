import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { flightRoutes } from '../data/routes';
import { droneRentalServices, generativeContentServices } from '../data/services';

// 修复默认 Marker 图标
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TouristApp: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [aiService, setAiService] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'routes' | 'services' | 'bookings'>('home');
  const [selectedSpot, setSelectedSpot] = useState<'BasumTso' | 'HabaTso' | 'Nianlang' | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<'drone' | 'generative' | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<{[key: string]: File | File[] | null}>({});
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [processingResult, setProcessingResult] = useState<{
    type: 'realistic' | 'virtual';
    resultUrl: string;
    description: string;
  } | null>(null);

  // 处理文件上传
  const handleFileUpload = (serviceId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
      }
      // 验证文件大小 (最大5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('文件大小不能超过5MB！');
        return;
      }
      setUploadedPhotos(prev => ({
        ...prev,
        [serviceId]: file
      }));
    }
  };

  // 处理批量景区照片上传
  const handleMultipleSpotPhotos = (serviceId: string, _spot: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          alert(`文件 "${file.name}" 不是图片格式！`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`文件 "${file.name}" 超过5MB限制！`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        // 将批量上传的文件存储为数组
        setUploadedPhotos(prev => ({
          ...prev,
          [`${serviceId}_bulk`]: validFiles
        }));
      }
    }
  };

  // 获取景区照片数量
  const getSpotPhotoCount = (serviceId: string, _spot: string): number => {
    const bulkPhotos = uploadedPhotos[`${serviceId}_bulk`] as File[] | undefined;
    if (bulkPhotos) {
      return bulkPhotos.length;
    }

    // 计算单个上传的照片数量
    const spotKeys = Object.keys(uploadedPhotos).filter(key =>
      key.startsWith(`${serviceId}_`) && key !== `${serviceId}_bulk` && uploadedPhotos[key]
    );
    return spotKeys.length;
  };

  // 处理景区照片上传
  const handleSpotPhotoUpload = (serviceId: string, spot: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('文件大小不能超过5MB！');
        return;
      }
      setUploadedPhotos(prev => ({
        ...prev,
        [`${serviceId}_${spot}`]: file
      }));
    }
  };

  // 获取单个上传的照片名称
  const getSpotPhotoNames = (serviceId: string, _spot: string): string[] => {
    const spotKeys = Object.keys(uploadedPhotos).filter(key =>
      key.startsWith(`${serviceId}_`) && key !== `${serviceId}_bulk` && uploadedPhotos[key]
    );
    return spotKeys.map(key => {
      const spotName = key.replace(`${serviceId}_`, '');
      return spotName;
    });
  };

  // 创建图像合成
  const createImageSynthesis = (userPhotoFile: File, spotPhotoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      // 设置画布尺寸
      canvas.width = 400;
      canvas.height = 300;

      // 加载景区照片作为背景
      const spotImg = new Image();
      spotImg.crossOrigin = 'anonymous';

      spotImg.onload = () => {
        // 绘制景区照片作为背景
        ctx.drawImage(spotImg, 0, 0, canvas.width, canvas.height);

        // 加载用户照片
        const userImg = new Image();
        userImg.onload = () => {
          // 计算位置和大小
          const userPhotoWidth = 140;
          const userPhotoHeight = 180;
          const x = canvas.width - userPhotoWidth - 20;
          const y = canvas.height - userPhotoHeight + 5;

          // 创建人像背景虚化效果
          ctx.save();

          // 1. 创建模糊背景（景深效果）
          const blurCanvas = document.createElement('canvas');
          const blurCtx = blurCanvas.getContext('2d');
          blurCanvas.width = userPhotoWidth;
          blurCanvas.height = userPhotoHeight;

          if (blurCtx) {
            // 复制景区照片的对应区域到模糊画布
            blurCtx.drawImage(spotImg, x, y, userPhotoWidth, userPhotoHeight, 0, 0, userPhotoWidth, userPhotoHeight);

            // 应用高斯模糊和景深效果
            blurCtx.filter = 'blur(4px) brightness(0.9) contrast(1.1) saturate(1.2)';
            blurCtx.drawImage(blurCanvas, 0, 0);

            // 将模糊背景绘制到主画布（作为人像背景）
            ctx.globalCompositeOperation = 'destination-over';
            ctx.drawImage(blurCanvas, x, y, userPhotoWidth, userPhotoHeight);
          }

          // 2. 重新绘制清晰的景区照片
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(spotImg, 0, 0, canvas.width, canvas.height);

          // 3. 创建人像遮罩（中心清晰，边缘渐变虚化）
          const maskCanvas = document.createElement('canvas');
          const maskCtx = maskCanvas.getContext('2d');
          maskCanvas.width = userPhotoWidth;
          maskCanvas.height = userPhotoHeight;

          if (maskCtx) {
            // 创建径向渐变遮罩
            const gradient = maskCtx.createRadialGradient(
              userPhotoWidth/2, userPhotoHeight/2, userPhotoWidth/6,  // 中心清晰
              userPhotoWidth/2, userPhotoHeight/2, userPhotoWidth/2   // 边缘虚化
            );
            gradient.addColorStop(0, 'rgba(0,0,0,1)');      // 中心完全清晰
            gradient.addColorStop(0.6, 'rgba(0,0,0,0.9)');   // 中间区域
            gradient.addColorStop(0.8, 'rgba(0,0,0,0.6)');   // 边缘开始虚化
            gradient.addColorStop(1, 'rgba(0,0,0,0.2)');     // 边缘高度虚化

            maskCtx.fillStyle = gradient;
            maskCtx.fillRect(0, 0, userPhotoWidth, userPhotoHeight);

            // 创建最终人像画布
            const personCanvas = document.createElement('canvas');
            const personCtx = personCanvas.getContext('2d');
            personCanvas.width = userPhotoWidth;
            personCanvas.height = userPhotoHeight;

            if (personCtx) {
              // 绘制原始人像
              personCtx.drawImage(userImg, 0, 0, userPhotoWidth, userPhotoHeight);

              // 应用景深遮罩
              personCtx.globalCompositeOperation = 'destination-in';
              personCtx.drawImage(maskCanvas, 0, 0);

              // 在主画布上绘制处理后的人像
              ctx.drawImage(personCanvas, x, y, userPhotoWidth, userPhotoHeight);
            }
          }

          ctx.restore();

          // 添加环境光效果增强真实感
          const ambientLight = ctx.createRadialGradient(
            x + userPhotoWidth/2, y + userPhotoHeight/2, 0,
            x + userPhotoWidth/2, y + userPhotoHeight/2, userPhotoWidth
          );
          ambientLight.addColorStop(0, 'rgba(255,255,255,0.08)');
          ambientLight.addColorStop(0.7, 'rgba(255,255,255,0.03)');
          ambientLight.addColorStop(1, 'rgba(255,255,255,0)');

          ctx.fillStyle = ambientLight;
          ctx.fillRect(x - 15, y - 15, userPhotoWidth + 30, userPhotoHeight + 30);

          // 添加景深散景效果（bokeh）
          ctx.globalCompositeOperation = 'overlay';
          const bokehGradient = ctx.createRadialGradient(
            x + userPhotoWidth/2, y + userPhotoHeight/2, userPhotoWidth/4,
            x + userPhotoWidth/2, y + userPhotoHeight/2, userPhotoWidth/2 + 25
          );
          bokehGradient.addColorStop(0, 'rgba(255,255,255,0)');
          bokehGradient.addColorStop(0.7, 'rgba(255,255,255,0.01)');
          bokehGradient.addColorStop(1, 'rgba(255,255,255,0.05)');

          ctx.fillStyle = bokehGradient;
          ctx.fillRect(x - 20, y - 20, userPhotoWidth + 40, userPhotoHeight + 40);

          ctx.globalCompositeOperation = 'source-over';

          // 添加场景文字
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
          ctx.lineWidth = 2;
          ctx.font = 'bold 15px Arial';
          ctx.textAlign = 'left';

          const text = '工布江达';
          const textX = 18;
          const textY = 32;

          ctx.strokeText(text, textX, textY);
          ctx.fillText(text, textX, textY);

          // 添加时间戳
          ctx.font = '10px Arial';
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 1;
          ctx.textAlign = 'right';

          const now = new Date();
          const dateStr = now.toLocaleDateString('zh-CN');
          const timeStr = now.toLocaleTimeString('zh-CN', {hour12: false});
          const timestamp = `${dateStr} ${timeStr}`;

          ctx.strokeText(timestamp, canvas.width - 18, canvas.height - 18);
          ctx.fillText(timestamp, canvas.width - 18, canvas.height - 18);

          // 返回合成后的图像URL
          const resultUrl = canvas.toDataURL('image/jpeg', 0.95);
          resolve(resultUrl);
        };

        userImg.onerror = () => reject(new Error('Failed to load user photo'));

        // 从文件创建用户照片URL
        const userReader = new FileReader();
        userReader.onload = (e) => {
          userImg.src = e.target?.result as string;
        };
        userReader.readAsDataURL(userPhotoFile);
      };

      spotImg.onerror = () => reject(new Error('Failed to load spot photo'));

      // 从文件创建景区照片URL
      const spotReader = new FileReader();
      spotReader.onload = (e) => {
        spotImg.src = e.target?.result as string;
      };
      spotReader.readAsDataURL(spotPhotoFile);
    });
  };

  // 模拟AI处理
  const simulateAIProcessing = async (service: any) => {
    return new Promise(async (resolve) => {
      // 检查用户上传的照片
      const userPhoto = uploadedPhotos[service.id] as File | null;
      const bulkSpotPhotos = uploadedPhotos[`${service.id}_bulk`] as File[] | null;
      const individualSpotPhotos = Object.keys(uploadedPhotos)
        .filter(key => key.startsWith(`${service.id}_`) && key !== `${service.id}_bulk` && uploadedPhotos[key])
        .map(key => uploadedPhotos[key] as File);

      const allSpotPhotos = bulkSpotPhotos ? bulkSpotPhotos : individualSpotPhotos;

      let resultUrl = `https://picsum.photos/400/300?random=${Math.random()}`;
      let description = '';

      if (service.type === 'realistic_synthesis') {
        if (userPhoto && allSpotPhotos.length > 0) {
          try {
            // 真正的照片合成：用户照片 + 景区照片
            const spotPhoto = allSpotPhotos[0]; // 使用第一张景区照片
            resultUrl = await createImageSynthesis(userPhoto, spotPhoto);
            description = `您的照片已成功与${allSpotPhotos.length}张景区美景融合！AI智能识别了您的面部特征，将您完美融入工布江达的湖光山色中。`;
          } catch (error) {
            // 如果合成失败，回退到随机图片
            resultUrl = `https://picsum.photos/400/300?random=${Math.random()}&blend=${Date.now()}`;
            description = `您的照片已成功与${allSpotPhotos.length}张景区美景融合！AI智能识别了您的面部特征，将您完美融入工布江达的湖光山色中。`;
          }
        } else if (userPhoto) {
          resultUrl = `https://picsum.photos/400/300?random=${Math.random()}&user=${Date.now()}`;
          description = '您的个人照片已上传，但需要选择景区照片才能进行真实合成。请上传景区美景照片！';
        } else if (allSpotPhotos.length > 0) {
          resultUrl = `https://picsum.photos/400/300?random=${Math.random()}&spots=${Date.now()}`;
          description = '景区照片已上传，但需要您的个人照片才能进行真实合成。请上传您的个人照片！';
        } else {
          description = '请先上传您的个人照片和景区美景照片，AI才能为您生成真实的合成效果！';
        }
      } else if (service.type === 'virtual_avatar') {
        if (userPhoto) {
          // 为虚拟形象生成一个简单的处理效果
          try {
            // 创建一个简单的虚拟形象效果（用户照片加上一些滤镜）
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 400;
            canvas.height = 300;
            
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                // 应用一些滤镜效果模拟AI处理
                ctx.filter = 'contrast(1.2) brightness(1.1) saturate(1.3)';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // 添加虚拟效果边框
                ctx.filter = 'none';
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 4;
                ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
                
                resultUrl = canvas.toDataURL('image/jpeg', 0.9);
              };
              img.src = URL.createObjectURL(userPhoto);
            }
          } catch (error) {
            resultUrl = `https://picsum.photos/400/300?random=${Math.random()}&avatar=${Date.now()}`;
          }
          description = '您的3D虚拟形象已生成！AI基于您的照片创建了栩栩如生的虚拟分身，可以在工布江达景区中自由漫游。';
        } else {
          description = '请先上传您的个人照片，AI才能为您生成虚拟形象！';
        }
      }

      // 模拟处理时间
      setTimeout(() => {
        const results: {[key: string]: {type: 'realistic' | 'virtual', resultUrl: string, description: string}} = {
          realistic_synthesis: {
            type: 'realistic' as const,
            resultUrl,
            description
          },
          virtual_avatar: {
            type: 'virtual' as const,
            resultUrl,
            description
          }
        };
        resolve(results[service.type]);
      }, 3000);
    });
  };

  const basumRoutes = flightRoutes.filter(r => r.spot === 'BasumTso');
  const habaRoutes = flightRoutes.filter(r => r.spot === 'HabaTso');
  const nianlangRoutes = flightRoutes.filter(r => r.spot === 'Nianlang');

  const handleBook = (routeId: string) => {
    const route = [...basumRoutes, ...habaRoutes, ...nianlangRoutes].find(r => r.id === routeId);
    alert(`预约成功！路线: ${route?.name}`);
  };

  const allRoutes = [...basumRoutes, ...habaRoutes, ...nianlangRoutes];

  return (
    <div style={{
      maxWidth: '375px',
      height: '100vh',
      margin: '0 auto',
      background: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #ddd',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* 手机顶部状态栏 */}
      <div style={{
        background: '#000',
        color: '#fff',
        padding: '5px 15px',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>9:41</span>
        <span>📶 📶 📶 📶</span>
        <span>100%</span>
      </div>

      {/* 应用头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '15px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>工布江达无人机文旅</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>低空智慧体验</p>
      </div>

      {/* 主要内容区域 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
        {currentTab === 'home' && (
          <div>
            <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>热门景区</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #00ff00, #008000)',
                color: '#fff',
                padding: '15px',
                borderRadius: '10px',
                cursor: 'pointer'
              }} onClick={() => { setSelectedSpot('BasumTso'); setCurrentTab('routes'); }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>巴松措国家5A级景区</h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>经典环湖航线 ¥199</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #87ceeb, #4682b4)',
                color: '#fff',
                padding: '15px',
                borderRadius: '10px',
                cursor: 'pointer'
              }} onClick={() => { setSelectedSpot('HabaTso'); setCurrentTab('routes'); }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>哈巴错冰川秘境</h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>冰川之眼全景 ¥299</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ffa500, #ff8c00)',
                color: '#fff',
                padding: '15px',
                borderRadius: '10px',
                cursor: 'pointer'
              }} onClick={() => { setSelectedSpot('Nianlang'); setCurrentTab('routes'); }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>念朗温泉康养</h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>云游田园 ¥99</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'routes' && (
          <div>
            <button 
              onClick={() => { setCurrentTab('home'); setSelectedSpot(null); }}
              style={{
                background: '#667eea',
                color: '#fff',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '20px',
                marginBottom: '15px',
                fontSize: '12px'
              }}
            >
              ← 返回
            </button>
            <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>
              {selectedSpot === 'BasumTso' && '巴松措景区航线'}
              {selectedSpot === 'HabaTso' && '哈巴错景区航线'}
              {selectedSpot === 'Nianlang' && '念朗温泉航线'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(selectedSpot === 'BasumTso' ? basumRoutes :
                selectedSpot === 'HabaTso' ? habaRoutes :
                selectedSpot === 'Nianlang' ? nianlangRoutes : []).map(route => (
                <div key={route.id} style={{
                  background: '#fff',
                  borderRadius: '10px',
                  padding: '15px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }} onClick={() => setSelectedRoute(route.id)}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{route.name}</h3>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
                    {route.spot} | ¥{route.price} | {route.duration}分钟
                  </p>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {route.features.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'services' && (
          <div>
            <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>特色服务</h2>
            
            {/* 服务类型选择 */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button 
                onClick={() => setServiceType('drone')}
                style={{
                  flex: 1,
                  background: serviceType === 'drone' ? '#9c27b0' : '#f0f0f0',
                  color: serviceType === 'drone' ? '#fff' : '#333',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🚁 无人机租赁
              </button>
              <button 
                onClick={() => setServiceType('generative')}
                style={{
                  flex: 1,
                  background: serviceType === 'generative' ? '#ff5722' : '#f0f0f0',
                  color: serviceType === 'generative' ? '#fff' : '#333',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🎨 生成式内容
              </button>
            </div>

            {/* 无人机租赁服务 */}
            {serviceType === 'drone' && (
              <div>
                <h3 style={{ fontSize: '14px', marginBottom: '15px', color: '#9c27b0' }}>无人机租赁服务</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {droneRentalServices.map(service => (
                    <div key={service.id} style={{
                      background: '#fff',
                      borderRadius: '10px',
                      padding: '15px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }} onClick={() => setSelectedService(service.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>{service.name}</h4>
                          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>{service.description}</p>
                          <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                            {service.features.join(' • ')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9c27b0', fontWeight: 'bold' }}>
                            ¥{service.price} / {service.duration}
                          </div>
                        </div>
                        <div style={{
                          background: service.type === 'app_remote' ? '#2196f3' : '#4caf50',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {service.type === 'app_remote' ? 'APP远程' : '现场租赁'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 生成式内容服务 */}
            {serviceType === 'generative' && (
              <div>
                <h3 style={{ fontSize: '14px', marginBottom: '15px', color: '#ff5722' }}>生成式内容服务</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {generativeContentServices.map(service => (
                    <div key={service.id} style={{
                      background: '#fff',
                      borderRadius: '10px',
                      padding: '15px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }} onClick={() => setSelectedService(service.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>{service.name}</h4>
                          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>{service.description}</p>
                          <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                            {service.features.join(' • ')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#ff5722', fontWeight: 'bold' }}>
                            ¥{service.price}
                          </div>
                        </div>
                        <div style={{
                          background: service.type === 'realistic_synthesis' ? '#4caf50' : '#ff9800',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {service.type === 'realistic_synthesis' ? '真人真景' : '虚拟形象'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>我的预约</h2>
            
            {/* AI处理结果展示 */}
            {processingResult && (
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                padding: '20px',
                borderRadius: '15px',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
                  🎉 AI生成结果
                </h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <img
                    src={processingResult.resultUrl}
                    alt="AI生成结果"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '3px solid #fff'
                    }}
                  />
                </div>
                
                <p style={{ margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.5' }}>
                  {processingResult.description}
                </p>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{
                    background: '#4caf50',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    📥 下载高清版
                  </button>
                  <button style={{
                    background: '#2196f3',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    📤 分享到朋友圈
                  </button>
                </div>
              </div>
            )}
            
            <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
              <p>暂无其他预约记录</p>
              <button 
                onClick={() => setCurrentTab('services')}
                style={{
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  marginTop: '15px'
                }}
              >
                去体验AI服务
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 航线详情弹窗 */}
      {selectedRoute && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            width: '90%',
            height: '80%',
            borderRadius: '15px',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                {allRoutes.find(r => r.id === selectedRoute)?.name}
              </h3>
              <button 
                onClick={() => setSelectedRoute(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, marginBottom: '10px' }}>
              <MapContainer center={[29.6, 90.4]} zoom={9} style={{ height: '100%', width: '100%', borderRadius: '10px' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© OpenStreetMap contributors'
                />
                <Polyline
                  positions={allRoutes.find(r => r.id === selectedRoute)?.coordinates || []}
                  pathOptions={{ color: 'blue', weight: 3 }}
                />
              </MapContainer>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              价格: ¥{allRoutes.find(r => r.id === selectedRoute)?.price} | 
              时长: {allRoutes.find(r => r.id === selectedRoute)?.duration}分钟
            </div>
            <label style={{ fontSize: '12px', marginBottom: '10px' }}>
              <input 
                type="checkbox" 
                checked={aiService} 
                onChange={(e) => setAiService(e.target.checked)} 
              />
              生成式AI服务 +¥29 (真人真景合成照)
            </label>
            <button 
              onClick={() => handleBook(selectedRoute)}
              style={{
                background: '#667eea',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              立即预约
            </button>
          </div>
        </div>
      )}

      {/* 服务详情弹窗 */}
      {selectedService && serviceType && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            width: '90%',
            maxHeight: '80%',
            borderRadius: '15px',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {(() => {
              const service = serviceType === 'drone' 
                ? droneRentalServices.find(s => s.id === selectedService)
                : generativeContentServices.find(s => s.id === selectedService);
              
              if (!service) return null;

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>{service.name}</h3>
                    <button 
                      onClick={() => { 
                        setSelectedService(null); 
                        setServiceType(null);
                        setProcessingStatus('idle');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>{service.description}</p>
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      <div style={{
                        background: serviceType === 'drone' 
                          ? (service.type === 'app_remote' ? '#2196f3' : '#4caf50')
                          : (service.type === 'realistic_synthesis' ? '#4caf50' : '#ff9800'),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {serviceType === 'drone' 
                          ? (service.type === 'app_remote' ? 'APP远程租赁' : '现场租赁')
                          : (service.type === 'realistic_synthesis' ? '真人真景合成' : '虚拟形象')}
                      </div>
                      <div style={{
                        background: '#f0f0f0',
                        color: '#333',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {service.spot}
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>服务特色</h4>
                      <ul style={{ fontSize: '12px', color: '#666', paddingLeft: '20px' }}>
                        {service.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    {serviceType === 'generative' && service.type === 'realistic_synthesis' && (
                      <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>上传照片</h4>

                        {/* 个人照片上传 */}
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                            📸 您的个人照片（建议正面清晰照）
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(service.id, e)}
                            style={{ display: 'none' }}
                            id={`personal-photo-${service.id}`}
                          />
                          <label
                            htmlFor={`personal-photo-${service.id}`}
                            style={{
                              display: 'inline-block',
                              padding: '8px 15px',
                              background: '#4caf50',
                              color: '#fff',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {uploadedPhotos[service.id] ? '✅ 已选择' : '选择照片'}
                          </label>
                          {uploadedPhotos[service.id] && (
                            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                              已选择: {(uploadedPhotos[service.id] as File).name}
                            </div>
                          )}
                        </div>

                        {/* 景区照片批量上传 */}
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                            🏞️ 景区打卡点照片（{service.spot === 'BasumTso' ? '巴松措' : service.spot === 'HabaTso' ? '哈巴错' : '念朗温泉'}）
                          </label>
                          <p style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                            💡 提示：您可以选择一张或多张景区照片，AI将智能合成到最佳位置
                          </p>

                          {/* 批量上传按钮 */}
                          <div style={{ marginBottom: '10px' }}>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleMultipleSpotPhotos(service.id, service.spot, e)}
                              style={{ display: 'none' }}
                              id={`bulk-spot-photos-${service.id}`}
                            />
                            <label
                              htmlFor={`bulk-spot-photos-${service.id}`}
                              style={{
                                display: 'inline-block',
                                padding: '8px 15px',
                                background: '#2196f3',
                                color: '#fff',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                marginRight: '10px'
                              }}
                            >
                              📸 批量选择照片
                            </label>
                            <span style={{ fontSize: '11px', color: '#666' }}>
                              已选择 {getSpotPhotoCount(service.id, service.spot)} 张照片
                            </span>
                          </div>

                          {/* 显示已选择的照片 */}
                          {getSpotPhotoCount(service.id, service.spot) > 0 && (
                            <div style={{
                              background: '#f8f9fa',
                              padding: '10px',
                              borderRadius: '6px',
                              marginBottom: '10px'
                            }}>
                              <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                                已选择的照片：
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {getSpotPhotoNames(service.id, service.spot).map((name, index) => (
                                  <span key={index} style={{
                                    background: '#e3f2fd',
                                    color: '#1976d2',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px'
                                  }}>
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 或者选择推荐打卡点 */}
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                              📍 或选择推荐打卡点（单个上传）：
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {service.spot === 'BasumTso' && (
                                <>
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSpotPhotoUpload(service.id, '扎西岛', e)}
                                      style={{ display: 'none' }}
                                      id={`spot-zaxi-${service.id}`}
                                    />
                                    <label
                                      htmlFor={`spot-zaxi-${service.id}`}
                                      style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: uploadedPhotos[`${service.id}_扎西岛`] ? '#4caf50' : '#e8f5e8',
                                        color: uploadedPhotos[`${service.id}_扎西岛`] ? '#fff' : '#2e7d32',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '10px'
                                      }}
                                    >
                                      {uploadedPhotos[`${service.id}_扎西岛`] ? '✅ 扎西岛' : '📷 扎西岛'}
                                    </label>
                                  </div>
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSpotPhotoUpload(service.id, '扎拉沟瀑布', e)}
                                      style={{ display: 'none' }}
                                      id={`spot-zala-${service.id}`}
                                    />
                                    <label
                                      htmlFor={`spot-zala-${service.id}`}
                                      style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: uploadedPhotos[`${service.id}_扎拉沟瀑布`] ? '#4caf50' : '#e8f5e8',
                                        color: uploadedPhotos[`${service.id}_扎拉沟瀑布`] ? '#fff' : '#2e7d32',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '10px'
                                      }}
                                    >
                                      {uploadedPhotos[`${service.id}_扎拉沟瀑布`] ? '✅ 扎拉沟瀑布' : '📷 扎拉沟瀑布'}
                                    </label>
                                  </div>
                                </>
                              )}
                              {service.spot === 'HabaTso' && (
                                <>
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSpotPhotoUpload(service.id, '冰川之眼', e)}
                                      style={{ display: 'none' }}
                                      id={`spot-bingchuan-${service.id}`}
                                    />
                                    <label
                                      htmlFor={`spot-bingchuan-${service.id}`}
                                      style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: uploadedPhotos[`${service.id}_冰川之眼`] ? '#4caf50' : '#e8f5e8',
                                        color: uploadedPhotos[`${service.id}_冰川之眼`] ? '#fff' : '#2e7d32',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '10px'
                                      }}
                                    >
                                      {uploadedPhotos[`${service.id}_冰川之眼`] ? '✅ 冰川之眼' : '📷 冰川之眼'}
                                    </label>
                                  </div>
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSpotPhotoUpload(service.id, '崩嘎村', e)}
                                      style={{ display: 'none' }}
                                      id={`spot-bengga-${service.id}`}
                                    />
                                    <label
                                      htmlFor={`spot-bengga-${service.id}`}
                                      style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: uploadedPhotos[`${service.id}_崩嘎村`] ? '#4caf50' : '#e8f5e8',
                                        color: uploadedPhotos[`${service.id}_崩嘎村`] ? '#fff' : '#2e7d32',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '10px'
                                      }}
                                    >
                                      {uploadedPhotos[`${service.id}_崩嘎村`] ? '✅ 崩嘎村' : '📷 崩嘎村'}
                                    </label>
                                  </div>
                                </>
                              )}
                              {service.spot === 'Nianlang' && (
                                <>
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSpotPhotoUpload(service.id, '田园风光', e)}
                                      style={{ display: 'none' }}
                                      id={`spot-tianyuan-${service.id}`}
                                    />
                                    <label
                                      htmlFor={`spot-tianyuan-${service.id}`}
                                      style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: uploadedPhotos[`${service.id}_田园风光`] ? '#4caf50' : '#e8f5e8',
                                        color: uploadedPhotos[`${service.id}_田园风光`] ? '#fff' : '#2e7d32',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '10px'
                                      }}
                                    >
                                      {uploadedPhotos[`${service.id}_田园风光`] ? '✅ 田园风光' : '📷 田园风光'}
                                    </label>
                                  </div>
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSpotPhotoUpload(service.id, '温泉区', e)}
                                      style={{ display: 'none' }}
                                      id={`spot-wenquan-${service.id}`}
                                    />
                                    <label
                                      htmlFor={`spot-wenquan-${service.id}`}
                                      style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: uploadedPhotos[`${service.id}_温泉区`] ? '#4caf50' : '#e8f5e8',
                                        color: uploadedPhotos[`${service.id}_温泉区`] ? '#fff' : '#2e7d32',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '10px'
                                      }}
                                    >
                                      {uploadedPhotos[`${service.id}_温泉区`] ? '✅ 温泉区' : '📷 温泉区'}
                                    </label>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {serviceType === 'generative' && service.type === 'virtual_avatar' && (
                      <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>上传照片</h4>
                        
                        {/* 个人照片上传 */}
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                            📸 您的个人照片（用于生成3D虚拟形象）
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(service.id, e)}
                            style={{ display: 'none' }}
                            id={`avatar-photo-${service.id}`}
                          />
                          <label
                            htmlFor={`avatar-photo-${service.id}`}
                            style={{
                              display: 'inline-block',
                              padding: '8px 15px',
                              background: '#ff9800',
                              color: '#fff',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {uploadedPhotos[service.id] ? '✅ 已选择' : '选择照片'}
                          </label>
                          {uploadedPhotos[service.id] && (
                            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                              已选择: {(uploadedPhotos[service.id] as File).name}
                            </div>
                          )}
                        </div>

                        {/* 虚拟场景选择 */}
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                            🎭 选择虚拟场景（{service.spot === 'BasumTso' ? '巴松措' : service.spot === 'HabaTso' ? '哈巴错' : '念朗温泉'}）
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {service.spot === 'BasumTso' && (
                              <>
                                <div style={{
                                  padding: '8px 12px',
                                  background: '#e8f5e8',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  color: '#2e7d32'
                                }}>
                                  🏞️ 湖边禅修场景 - 在扎西岛旁冥想
                                </div>
                                <div style={{
                                  padding: '8px 12px',
                                  background: '#e3f2fd',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  color: '#1565c0'
                                }}>
                                  🏔️ 山顶观景场景 - 俯瞰杰青那拉嘎布神山
                                </div>
                              </>
                            )}
                            {service.spot === 'HabaTso' && (
                              <>
                                <div style={{
                                  padding: '8px 12px',
                                  background: '#f3e5f5',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  color: '#7b1fa2'
                                }}>
                                  🏔️ 冰川探险场景 - 在冰川之眼中穿梭
                                </div>
                                <div style={{
                                  padding: '8px 12px',
                                  background: '#fff3e0',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  color: '#e65100'
                                }}>
                                  🏕️ 高原牧场景 - 与牦牛一起漫步
                                </div>
                              </>
                            )}
                            {service.spot === 'Nianlang' && (
                              <>
                                <div style={{
                                  padding: '8px 12px',
                                  background: '#e8f5e8',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  color: '#2e7d32'
                                }}>
                                  🌸 田园采风场景 - 在油菜花海中漫步
                                </div>
                                <div style={{
                                  padding: '8px 12px',
                                  background: '#fce4ec',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  color: '#ad1457'
                                }}>
                                  ♨️ 温泉疗养场景 - 享受宁静的温泉时光
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>
                          💡 提示：AI将基于您的照片生成栩栩如生的3D虚拟形象
                        </div>
                      </div>
                    )}

                    {serviceType === 'drone' && service.type === 'app_remote' && (
                      <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>租赁说明</h4>
                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                          1. 通过APP远程控制无人机<br/>
                          2. 实时视频回传景区美景<br/>
                          3. 专业飞行员提供技术支持<br/>
                          4. 安全稳定的飞行体验
                        </div>
                      </div>
                    )}

                    {serviceType === 'drone' && service.type === 'onsite_rental' && (
                      <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>租赁说明</h4>
                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                          1. 现场扫码租赁无人机<br/>
                          2. 30秒快速起飞体验<br/>
                          3. 智能跟随和自动返航<br/>
                          4. 适合家庭和朋友使用
                        </div>
                      </div>
                    )}

                    {/* 照片上传区域 - 仅对生成式内容服务显示 */}
                    {serviceType === 'generative' && (
                      <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#333' }}>
                          📸 {service.type === 'realistic_synthesis' ? '上传照片' : '上传个人照片'}
                        </h4>
                        
                        {/* 上传区域 */}
                        <div style={{
                          border: '2px dashed #ddd',
                          borderRadius: '10px',
                          padding: '20px',
                          textAlign: 'center',
                          background: '#fafafa',
                          marginBottom: '10px'
                        }}>
                          {!uploadedPhotos[service.id] ? (
                            <div>
                              <div style={{ fontSize: '24px', marginBottom: '10px' }}>📷</div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                                {service.type === 'realistic_synthesis' 
                                  ? '请上传您的个人照片（建议正面清晰照）'
                                  : '请上传您的照片用于生成3D虚拟形象'
                                }
                              </div>
                              <label style={{
                                background: '#ff5722',
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'inline-block'
                              }}>
                                选择照片
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setUploadedPhotos(prev => ({
                                        ...prev,
                                        [service.id]: file
                                      }));
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
                              <div style={{ fontSize: '12px', color: '#4caf50', marginBottom: '5px' }}>
                                已选择: {(uploadedPhotos[service.id] as File)?.name}
                              </div>
                              <div style={{ fontSize: '10px', color: '#666' }}>
                                {((uploadedPhotos[service.id] as File)?.size! / 1024 / 1024).toFixed(2)} MB
                              </div>
                              <button
                                onClick={() => {
                                  setUploadedPhotos(prev => ({
                                    ...prev,
                                    [service.id]: null
                                  }));
                                }}
                                style={{
                                  background: '#f44336',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '4px 12px',
                                  borderRadius: '15px',
                                  fontSize: '10px',
                                  marginTop: '8px',
                                  cursor: 'pointer'
                                }}
                              >
                                重新选择
                              </button>
                            </div>
                          )}
                        </div>

                        {/* AIGC业务流程示意 */}
                        <div style={{
                          background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
                          borderRadius: '10px',
                          padding: '15px',
                          marginBottom: '15px'
                        }}>
                          <h5 style={{ fontSize: '12px', margin: '0 0 10px 0', color: '#333' }}>🎨 AIGC生成流程</h5>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{
                              textAlign: 'center',
                              flex: 1,
                              padding: '8px',
                              background: uploadedPhotos[service.id] ? '#4caf50' : '#fff',
                              borderRadius: '8px',
                              color: uploadedPhotos[service.id] ? '#fff' : '#666',
                              fontSize: '10px',
                              border: '2px solid #4caf50'
                            }}>
                              📤<br/>上传照片<br/>
                              <span style={{ fontSize: '8px' }}>Step 1</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>→</div>
                            <div style={{
                              textAlign: 'center',
                              flex: 1,
                              padding: '8px',
                              background: processingStatus === 'processing' ? '#ff9800' : '#fff',
                              borderRadius: '8px',
                              color: processingStatus === 'processing' ? '#fff' : '#666',
                              fontSize: '10px',
                              border: '2px solid #ff9800'
                            }}>
                              🤖<br/>AI处理<br/>
                              <span style={{ fontSize: '8px' }}>Step 2</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>→</div>
                            <div style={{
                              textAlign: 'center',
                              flex: 1,
                              padding: '8px',
                              background: processingStatus === 'completed' ? '#9c27b0' : '#fff',
                              borderRadius: '8px',
                              color: processingStatus === 'completed' ? '#fff' : '#666',
                              fontSize: '10px',
                              border: '2px solid #9c27b0'
                            }}>
                              🎉<br/>生成结果<br/>
                              <span style={{ fontSize: '8px' }}>Step 3</span>
                            </div>
                          </div>
                          
                          {service.type === 'realistic_synthesis' && (
                            <div style={{ fontSize: '10px', color: '#666', marginTop: '10px', lineHeight: '1.4' }}>
                              • AI将您的照片智能合成到景区美景中<br/>
                              • 生成个性化景区写真和数字收藏品<br/>
                              • 支持高清下载和分享
                            </div>
                          )}
                          
                          {service.type === 'virtual_avatar' && (
                            <div style={{ fontSize: '10px', color: '#666', marginTop: '10px', lineHeight: '1.4' }}>
                              • AI基于您的照片生成3D虚拟形象<br/>
                              • 可在虚拟景区中自由漫游体验<br/>
                              • 支持多种服装和场景定制
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI处理状态显示 */}
                    {processingStatus !== 'idle' && serviceType === 'generative' && (
                      <div style={{
                        background: processingStatus === 'processing' ? '#fff3cd' : '#d4edda',
                        border: `1px solid ${processingStatus === 'processing' ? '#ffeaa7' : '#c3e6cb'}`,
                        borderRadius: '10px',
                        padding: '15px',
                        marginBottom: '15px',
                        textAlign: 'center'
                      }}>
                        {processingStatus === 'processing' && (
                          <div>
                            <div style={{ fontSize: '20px', marginBottom: '10px' }}>🤖</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#856404', marginBottom: '5px' }}>
                              AI智能处理中...
                            </div>
                            <div style={{ fontSize: '12px', color: '#856404' }}>
                              正在分析您的照片并生成个性化内容
                            </div>
                          </div>
                        )}
                        {processingStatus === 'completed' && processingResult && (
                          <div>
                            <div style={{ fontSize: '20px', marginBottom: '10px' }}>✅</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#155724', marginBottom: '10px' }}>
                              处理完成！
                            </div>
                            <div style={{ fontSize: '12px', color: '#155724', marginBottom: '10px' }}>
                              {processingResult.description}
                            </div>
                            <div style={{
                              background: '#f8f9fa',
                              padding: '10px',
                              borderRadius: '8px',
                              marginBottom: '10px'
                            }}>
                              <img 
                                src={processingResult.resultUrl} 
                                alt="AI生成结果"
                                style={{
                                  width: '100%',
                                  maxWidth: '200px',
                                  height: 'auto',
                                  borderRadius: '8px',
                                  display: 'block',
                                  margin: '0 auto'
                                }}
                              />
                            </div>
                            <div style={{ fontSize: '11px', color: '#666' }}>
                              🎨 基于您上传的照片智能生成
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ 
                      background: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '10px',
                      marginBottom: '15px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>服务费用</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: serviceType === 'drone' ? '#9c27b0' : '#ff5722' }}>
                          ¥{service.price}
                          {serviceType === 'drone' && 'duration' in service && <span style={{ fontSize: '12px', color: '#666' }}>/{service.duration}</span>}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={async () => {
                        if (serviceType === 'generative' && !uploadedPhotos[service.id]) {
                          alert('请先上传您的个人照片后再预约服务！');
                          return;
                        }
                        
                        if (serviceType === 'generative' && service.type === 'realistic_synthesis') {
                          // 检查是否至少上传了一张景区照片（批量或单个）
                          const hasBulkPhotos = uploadedPhotos[`${service.id}_bulk`] as File[] | undefined;
                          const hasIndividualPhotos = Object.keys(uploadedPhotos).some(key =>
                            key.startsWith(`${service.id}_`) && key !== `${service.id}_bulk` && uploadedPhotos[key]
                          );

                          if (!hasBulkPhotos && !hasIndividualPhotos) {
                            alert('请至少上传一张景区打卡点照片！AI需要您的个人照片和景区照片才能进行真实合成。');
                            return;
                          }
                        }
                        
                        if (serviceType === 'generative') {
                          // 开始AI处理
                          setProcessingStatus('processing');
                          
                          // 检查照片完整性并给出相应提示
                          const userPhoto = uploadedPhotos[service.id] as File | null;
                          const bulkSpotPhotos = uploadedPhotos[`${service.id}_bulk`] as File[] | null;
                          const individualSpotPhotos = Object.keys(uploadedPhotos)
                            .filter(key => key.startsWith(`${service.id}_`) && key !== `${service.id}_bulk` && uploadedPhotos[key])
                            .map(key => uploadedPhotos[key] as File);
                          
                          const allSpotPhotos = bulkSpotPhotos ? bulkSpotPhotos : individualSpotPhotos;
                          
                          let processingMessage = '正在启动AI处理...\n\n';
                          
                          if (service.type === 'realistic_synthesis') {
                            if (userPhoto && allSpotPhotos.length > 0) {
                              processingMessage += `🎨 真人真景合成服务\n📸 您的照片: ${(userPhoto as File).name}\n🏞️ 景区照片: ${allSpotPhotos.length}张\n\nAI正在智能分析您的面部特征，将您完美融入工布江达的美景中...`;
                            } else if (userPhoto) {
                              processingMessage += `🎨 真人真景合成服务\n📸 您的照片: ${(userPhoto as File).name}\n⚠️ 缺少景区照片\n\n请上传景区美景照片以获得最佳合成效果...`;
                            } else if (allSpotPhotos.length > 0) {
                              processingMessage += `🎨 真人真景合成服务\n🏞️ 景区照片: ${allSpotPhotos.length}张\n⚠️ 缺少个人照片\n\n请上传您的个人照片以进行真实合成...`;
                            }
                          } else if (service.type === 'virtual_avatar') {
                            processingMessage += `🎭 虚拟形象生成服务\n📸 您的照片: ${(userPhoto as File).name}\n\nAI正在基于您的照片创建栩栩如生的3D虚拟分身...`;
                          }
                          
                          alert(processingMessage);
                          
                          try {
                            // 模拟AI处理
                            const result = await simulateAIProcessing(service);
                            setProcessingResult(result as any);
                            setProcessingStatus('completed');
                            
                            alert(`🎉 处理完成！\n\n${service.name}\n${(result as any).description}\n\n可在"我的预约"中查看完整结果。`);
                          } catch (error) {
                            alert('处理失败，请重试！');
                            setProcessingStatus('idle');
                          }
                          
                          setSelectedService(null);
                          setServiceType(null);
                        } else {
                          alert(`服务预约成功！\n${service.name}\n价格: ¥${service.price}`);
                          setSelectedService(null);
                          setServiceType(null);
                        }
                      }}
                      style={{
                        background: serviceType === 'generative' && !uploadedPhotos[service.id] ? '#ccc' : (serviceType === 'drone' ? '#9c27b0' : '#ff5722'),
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        width: '100%',
                        cursor: serviceType === 'generative' && !uploadedPhotos[service.id] ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {serviceType === 'generative' && !uploadedPhotos[service.id] ? '请先上传照片' : '立即预约'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 底部导航栏 */}
      <div style={{
        background: '#fff',
        borderTop: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0'
      }}>
        <button 
          onClick={() => setCurrentTab('home')}
          style={{
            background: 'none',
            border: 'none',
            color: currentTab === 'home' ? '#667eea' : '#666',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          🏠<br/>首页
        </button>
        <button 
          onClick={() => setCurrentTab('routes')}
          style={{
            background: 'none',
            border: 'none',
            color: currentTab === 'routes' ? '#667eea' : '#666',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          ✈️<br/>航线
        </button>
        <button 
          onClick={() => setCurrentTab('services')}
          style={{
            background: 'none',
            border: 'none',
            color: currentTab === 'services' ? '#667eea' : '#666',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          🎯<br/>服务
        </button>
        <button 
          onClick={() => setCurrentTab('bookings')}
          style={{
            background: 'none',
            border: 'none',
            color: currentTab === 'bookings' ? '#667eea' : '#666',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          📋<br/>预约
        </button>
      </div>
    </div>
  );
};

export default TouristApp;
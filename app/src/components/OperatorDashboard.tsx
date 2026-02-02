import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { flightRoutes } from '../data/routes';
import { serviceStats } from '../data/services';

// 修复默认 Marker 图标
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DroneState {
  id: string;
  position: [number, number];
  routeIndex: number;
  isFlying: boolean;
  status: string;
}

const OperatorDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'overview' | 'basum' | 'haba' | 'nianlang' | 'drones'>('overview');
  const [alerts, setAlerts] = useState<string[]>([]);
  const [availableDrones] = useState(12);
  const [revenue] = useState(0);
  const [drones, setDrones] = useState<DroneState[]>([
    {
      id: 'drone1',
      position: flightRoutes[0].coordinates[0], // 巴松措经典环湖起始
      routeIndex: 0,
      isFlying: true,
      status: '执行经典环湖航线',
    },
    {
      id: 'drone2',
      position: flightRoutes[3].coordinates[0], // 哈巴错冰川之眼起始
      routeIndex: 0,
      isFlying: true,
      status: '执行冰川之眼全景',
    },
  ]);

  // 禁飞区中心（念朗温泉）
  const noFlyZoneCenter: [number, number] = [29.6, 90.4];
  const noFlyZoneRadius = 500; // 米

  const checkNoFlyZone = (position: [number, number]): boolean => {
    const [lat1, lon1] = position;
    const [lat2, lon2] = noFlyZoneCenter;
    const R = 6371000; // 地球半径米
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance < noFlyZoneRadius;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(prevDrones =>
        prevDrones.map(drone => {
          if (!drone.isFlying) return drone;

          const route = flightRoutes.find(r => r.spot === 'BasumTso' && r.name === '经典环湖航线') || flightRoutes[3];
          const nextIndex = (drone.routeIndex + 1) % route.coordinates.length;
          const newPosition = route.coordinates[nextIndex];

          // 检查禁飞区
          const inNoFly = checkNoFlyZone(newPosition);
          if (inNoFly) {
            setAlerts(prev => [...prev, `警告！无人机 ${drone.id} 进入温泉隐私区域，已强制悬停！`]);
            return { ...drone, status: '警告！进入禁飞区，已强制悬停', isFlying: false };
          }

          return {
            ...drone,
            position: newPosition,
            routeIndex: nextIndex,
            isFlying: nextIndex !== route.coordinates.length - 1 || route.spot !== 'HabaTso',
            status: nextIndex === route.coordinates.length - 1 && route.spot === 'HabaTso' ? '正在回传8K视频' : drone.status,
          };
        })
      );
    }, 2000); // 每2秒移动一次

    return () => clearInterval(interval);
  }, []);

  const getRouteColor = (spot: string) => {
    if (spot === 'BasumTso') return 'blue';
    if (spot === 'HabaTso') return '#E0F6FF'; // 浅蓝色
    return 'green';
  };

  const activeTasks = drones.filter(d => d.isFlying).length;

  const basumRoutes = flightRoutes.filter(r => r.spot === 'BasumTso');
  const habaRoutes = flightRoutes.filter(r => r.spot === 'HabaTso');
  const nianlangRoutes = flightRoutes.filter(r => r.spot === 'Nianlang');

  const basumActive = drones.filter(d => d.isFlying && basumRoutes.some(r => d.status.includes(r.name))).length;
  const habaActive = drones.filter(d => d.isFlying && habaRoutes.some(r => d.status.includes(r.name))).length;
  const nianlangActive = drones.filter(d => d.isFlying && nianlangRoutes.some(r => d.status.includes(r.name))).length;

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      display: 'grid',
      gridTemplateColumns: '200px 1fr 300px',
      gridTemplateRows: '60px 1fr',
      gap: '10px',
      padding: '10px',
      boxSizing: 'border-box'
    }}>
      {/* 顶部标题栏 */}
      <div style={{
        gridColumn: '1 / -1',
        background: 'linear-gradient(90deg, #1a1a1a, #2a2a2a)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ margin: 0, color: '#00d4ff' }}>工布江达低空智慧文旅指挥中心</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff00' }}>{availableDrones}</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>可用无人机</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffff00' }}>{activeTasks}</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>执行任务</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>¥{revenue}</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>今日营收</div>
          </div>
        </div>
      </div>

      {/* 左侧导航栏 */}
      <div style={{
        background: '#1a1a1a',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button 
          onClick={() => setCurrentView('overview')} 
          style={{
            background: currentView === 'overview' ? '#00d4ff' : '#333',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          总览
        </button>
        <button 
          onClick={() => setCurrentView('basum')} 
          style={{
            background: currentView === 'basum' ? '#00ff00' : '#333',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          巴松措景区
        </button>
        <button 
          onClick={() => setCurrentView('haba')} 
          style={{
            background: currentView === 'haba' ? '#87ceeb' : '#333',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          哈巴错景区
        </button>
        <button 
          onClick={() => setCurrentView('nianlang')} 
          style={{
            background: currentView === 'nianlang' ? '#ffa500' : '#333',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          念朗温泉
        </button>
        <button 
          onClick={() => setCurrentView('drones')} 
          style={{
            background: currentView === 'drones' ? '#ff6b6b' : '#333',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          无人机管理
        </button>
      </div>

      {/* 中心内容区域 */}
      <div style={{
        background: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {currentView === 'overview' && (
          <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '15px' }}>
            {/* 统计数据区域 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              padding: '0 15px',
              marginBottom: '15px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #00ff00, #008000)',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                minHeight: '70px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>540万</div>
                <div style={{ fontSize: '11px' }}>总投资</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #87ceeb, #4682b4)',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                minHeight: '70px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>716万</div>
                <div style={{ fontSize: '11px' }}>年收入预测</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ffa500, #ff8c00)',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                minHeight: '70px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>1.16年</div>
                <div style={{ fontSize: '11px' }}>投资回收期</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b, #dc143c)',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                minHeight: '70px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>15架</div>
                <div style={{ fontSize: '11px' }}>无人机总数</div>
              </div>
            </div>

            {/* 新服务统计区域 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              padding: '0 15px',
              marginBottom: '15px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #9c27b0, #673ab7)',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{serviceStats.droneRentals.todayOrders}</div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>今日租赁订单</div>
                <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>
                  ¥{serviceStats.droneRentals.revenue}
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ff5722, #f44336)',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{serviceStats.generativeContent.todayOrders}</div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>今日生成订单</div>
                <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>
                  ¥{serviceStats.generativeContent.revenue}
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #2196f3, #03a9f4)',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{serviceStats.droneRentals.appRemoteCount}</div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>APP远程租赁</div>
                <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>
                  累计{serviceStats.droneRentals.totalOrders}单
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{serviceStats.generativeContent.realisticSynthesisCount}</div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>真人真景合成</div>
                <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>
                  累计{serviceStats.generativeContent.totalOrders}单
                </div>
              </div>
            </div>

            {/* 主要内容区域 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
              {/* 左侧图表和表格区域 */}
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: '15px' }}>
                {/* 景区运营数据表格 */}
                <div style={{
                  background: '#1a1a1a',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>景区运营概况</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #333' }}>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#00d4ff' }}>景区</th>
                        <th style={{ padding: '8px', textAlign: 'center', color: '#00d4ff' }}>年接待量</th>
                        <th style={{ padding: '8px', textAlign: 'center', color: '#00d4ff' }}>无人机</th>
                        <th style={{ padding: '8px', textAlign: 'center', color: '#00d4ff' }}>活跃</th>
                        <th style={{ padding: '8px', textAlign: 'center', color: '#00d4ff' }}>今日订单</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '8px', color: '#00ff00' }}>巴松措</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>100万</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>12架</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#00ff00' }}>{basumActive}架</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>{Math.floor(Math.random() * 50) + 20}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '8px', color: '#87ceeb' }}>哈巴错</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>5000</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>2架</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#87ceeb' }}>{habaActive}架</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>{Math.floor(Math.random() * 10) + 5}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', color: '#ffa500' }}>念朗温泉</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>2万</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>1架</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#ffa500' }}>{nianlangActive}架</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>{Math.floor(Math.random() * 15) + 8}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 航线收入图表 */}
                <div style={{
                  background: '#1a1a1a',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>航线收入统计</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '120px', color: '#00ff00' }}>经典环湖航线</div>
                      <div style={{ flex: 1, height: '20px', background: '#333', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #00ff00, #008000)' }}></div>
                      </div>
                      <div style={{ width: '60px', textAlign: 'right', color: '#fff' }}>¥199</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '120px', color: '#87ceeb' }}>冰川之眼</div>
                      <div style={{ flex: 1, height: '20px', background: '#333', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, #87ceeb, #4682b4)' }}></div>
                      </div>
                      <div style={{ width: '60px', textAlign: 'right', color: '#fff' }}>¥299</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '120px', color: '#ffa500' }}>云游田园</div>
                      <div style={{ flex: 1, height: '20px', background: '#333', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, #ffa500, #ff8c00)' }}></div>
                      </div>
                      <div style={{ width: '60px', textAlign: 'right', color: '#fff' }}>¥99</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '120px', color: '#ff6b6b' }}>冰洞探险</div>
                      <div style={{ flex: 1, height: '20px', background: '#333', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '90%', height: '100%', background: 'linear-gradient(90deg, #ff6b6b, #dc143c)' }}></div>
                      </div>
                      <div style={{ width: '60px', textAlign: 'right', color: '#fff' }}>¥899</div>
                    </div>
                  </div>
                </div>

                {/* 新服务运营统计 */}
                <div style={{
                  background: '#1a1a1a',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>新服务运营统计</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {/* 无人机租赁服务 */}
                    <div style={{ borderRight: '1px solid #333', paddingRight: '15px' }}>
                      <h4 style={{ color: '#9c27b0', margin: '0 0 10px 0', fontSize: '14px' }}>无人机租赁服务</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#ccc' }}>APP远程租赁:</span>
                          <span style={{ color: '#2196f3' }}>{serviceStats.droneRentals.appRemoteCount}单</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#ccc' }}>现场租赁:</span>
                          <span style={{ color: '#4caf50' }}>{serviceStats.droneRentals.onsiteRentalCount}单</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '5px', marginTop: '5px' }}>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>今日订单:</span>
                          <span style={{ color: '#9c27b0', fontWeight: 'bold' }}>{serviceStats.droneRentals.todayOrders}单</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>今日营收:</span>
                          <span style={{ color: '#9c27b0', fontWeight: 'bold' }}>¥{serviceStats.droneRentals.revenue}</span>
                        </div>
                      </div>
                    </div>

                    {/* 生成式内容服务 */}
                    <div style={{ paddingLeft: '15px' }}>
                      <h4 style={{ color: '#ff5722', margin: '0 0 10px 0', fontSize: '14px' }}>生成式内容服务</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#ccc' }}>真人真景:</span>
                          <span style={{ color: '#4caf50' }}>{serviceStats.generativeContent.realisticSynthesisCount}单</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#ccc' }}>虚拟形象:</span>
                          <span style={{ color: '#ff9800' }}>{serviceStats.generativeContent.virtualAvatarCount}单</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '5px', marginTop: '5px' }}>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>今日订单:</span>
                          <span style={{ color: '#ff5722', fontWeight: 'bold' }}>{serviceStats.generativeContent.todayOrders}单</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>今日营收:</span>
                          <span style={{ color: '#ff5722', fontWeight: 'bold' }}>¥{serviceStats.generativeContent.revenue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧地图区域 */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                position: 'relative'
              }}>
                <h3 style={{ margin: '15px', color: '#00d4ff' }}>实时监控地图</h3>
                <MapContainer center={[29.6, 90.4]} zoom={8} style={{ height: 'calc(100% - 60px)', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap contributors'
                  />
                  {flightRoutes.map(route => (
                    <Polyline
                      key={route.id}
                      positions={route.coordinates}
                      pathOptions={{
                        color: getRouteColor(route.spot),
                        weight: 3,
                        dashArray: '10, 10',
                      }}
                    />
                  ))}
                  <Circle
                    center={noFlyZoneCenter}
                    radius={noFlyZoneRadius}
                    pathOptions={{
                      color: 'red',
                      fillColor: 'red',
                      fillOpacity: 0.2,
                    }}
                  />
                  <Marker position={noFlyZoneCenter}>
                    <Popup>隐私禁飞区 (Privacy Zone)</Popup>
                  </Marker>
                  
                  {/* 景区详细信息标记 */}
                  <Marker position={[29.5, 90.5]}>
                    <Popup>
                      <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '14px' }}>巴松措国家5A级景区</div>
                      <div>接待人次: 100万人次/年</div>
                      <div>无人机: 12架</div>
                      <div>航线: 经典环湖 ¥199, 扎西岛精拍 ¥99, 扎拉沟瀑布 ¥129, 体育赛事 ¥299</div>
                      <div>今日活跃: {basumActive}架</div>
                    </Popup>
                  </Marker>
                  <Marker position={[29.7, 90.3]}>
                    <Popup>
                      <div style={{ color: '#87ceeb', fontWeight: 'bold', fontSize: '14px' }}>哈巴错冰川秘境</div>
                      <div>接待人次: 5000人次/年</div>
                      <div>无人机: 2架</div>
                      <div>航线: 冰川之眼 ¥299, 冰洞探险 ¥899, 皮划艇跟拍 ¥399</div>
                      <div>今日活跃: {habaActive}架</div>
                    </Popup>
                  </Marker>
                  <Marker position={[29.6, 90.4]}>
                    <Popup>
                      <div style={{ color: '#ffa500', fontWeight: 'bold', fontSize: '14px' }}>念朗温泉康养</div>
                      <div>接待人次: 2万人次/年</div>
                      <div>无人机: 1架</div>
                      <div>航线: 云游田园 ¥99, 康养日志 ¥188</div>
                      <div style={{ color: '#ff6b6b' }}>⚠️ 禁飞区保护</div>
                      <div>今日活跃: {nianlangActive}架</div>
                    </Popup>
                  </Marker>
                  
                  {drones.map(drone => (
                    <Marker
                      key={drone.id}
                      position={drone.position}
                    >
                      <Popup>{drone.status}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        )}
        {currentView === 'basum' && (
          <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '15px' }}>
            {/* 景区信息头部 */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>巴松措国家5A级景区</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff00' }}>100万</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>年接待人次</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#87ceeb' }}>12架</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>无人机数量</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffa500' }}>{basumActive}架</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>今日活跃</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' }}>¥{Math.floor(Math.random() * 10000) + 5000}</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>今日营收</div>
                </div>
              </div>
            </div>

            {/* 主要内容区域 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* 左侧航线详情 */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                overflowY: 'auto'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>航线详情</h3>
                {basumRoutes.map(route => (
                  <div key={route.id} style={{
                    background: '#2a4a2a',
                    borderRadius: '5px',
                    padding: '10px',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ color: '#00ff00', margin: '0 0 5px 0' }}>{route.name}</h4>
                    <p style={{ margin: '5px 0', color: '#fff' }}>价格: ¥{route.price} | 时长: {route.duration}分钟</p>
                    <p style={{ margin: '5px 0', color: '#ccc' }}>特点: {route.features.join(', ')}</p>
                    {route.restriction && (
                      <p style={{ margin: '5px 0', color: '#ff6b6b' }}>限制: {route.restriction}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* 右侧地图 */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                position: 'relative'
              }}>
                <h3 style={{ margin: '15px', color: '#00d4ff' }}>巴松措航线地图</h3>
                <MapContainer center={[29.5, 90.5]} zoom={12} style={{ height: 'calc(100% - 60px)', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap contributors'
                  />
                  {basumRoutes.map(route => (
                    <Polyline
                      key={route.id}
                      positions={route.coordinates}
                      pathOptions={{
                        color: '#00ff00',
                        weight: 4,
                        dashArray: '10, 10',
                      }}
                    />
                  ))}
                  {/* 部署点位标记 */}
                  <Marker position={[29.5, 90.5]}>
                    <Popup>
                      <div style={{ color: '#00ff00', fontWeight: 'bold' }}>A点 - 主运营中心</div>
                      <div>位置: 扎西岛附近</div>
                      <div>无人机: 8架</div>
                      <div>今日订单: {Math.floor(Math.random() * 30) + 15}</div>
                    </Popup>
                  </Marker>
                  <Marker position={[29.52, 90.48]}>
                    <Popup>
                      <div style={{ color: '#00ff00', fontWeight: 'bold' }}>B点 - 扎西岛辅助点</div>
                      <div>位置: 扎西岛</div>
                      <div>无人机: 3架</div>
                      <div>今日订单: {Math.floor(Math.random() * 10) + 5}</div>
                    </Popup>
                  </Marker>
                  <Marker position={[29.48, 90.52]}>
                    <Popup>
                      <div style={{ color: '#00ff00', fontWeight: 'bold' }}>C点 - 错高村自助点</div>
                      <div>位置: 错高村</div>
                      <div>无人机: 1架</div>
                      <div>今日订单: {Math.floor(Math.random() * 5) + 2}</div>
                    </Popup>
                  </Marker>
                  
                  {drones.filter(drone => drone.position[0] > 29.4 && drone.position[0] < 29.6 && drone.position[1] > 90.4 && drone.position[1] < 90.6).map(drone => (
                    <Marker
                      key={drone.id}
                      position={drone.position}
                    >
                      <Popup>{drone.status}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        )}
        {currentView === 'haba' && (
          <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '15px' }}>
            {/* 景区信息头部 */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ color: '#87ceeb', margin: '0 0 10px 0' }}>哈巴错冰川秘境</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#87ceeb' }}>5000</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>年接待人次</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#87ceeb' }}>2架</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>无人机数量</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#87ceeb' }}>{habaActive}架</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>今日活跃</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' }}>¥{Math.floor(Math.random() * 5000) + 2000}</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>今日营收</div>
                </div>
              </div>
            </div>

            {/* 主要内容区域 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* 左侧航线详情 */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                overflowY: 'auto'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>航线详情</h3>
                {habaRoutes.map(route => (
                  <div key={route.id} style={{
                    background: '#2a4a4a',
                    borderRadius: '5px',
                    padding: '10px',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ color: '#87ceeb', margin: '0 0 5px 0' }}>{route.name}</h4>
                    <p style={{ margin: '5px 0', color: '#fff' }}>价格: ¥{route.price} | 时长: {route.duration}分钟</p>
                    <p style={{ margin: '5px 0', color: '#ccc' }}>特点: {route.features.join(', ')}</p>
                    {route.restriction && (
                      <p style={{ margin: '5px 0', color: '#ff6b6b' }}>限制: {route.restriction}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* 右侧地图 */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                position: 'relative'
              }}>
                <h3 style={{ margin: '15px', color: '#00d4ff' }}>哈巴错航线地图</h3>
                <MapContainer center={[29.7, 90.3]} zoom={12} style={{ height: 'calc(100% - 60px)', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap contributors'
                  />
                  {habaRoutes.map(route => (
                    <Polyline
                      key={route.id}
                      positions={route.coordinates}
                      pathOptions={{
                        color: '#87ceeb',
                        weight: 4,
                        dashArray: '10, 10',
                      }}
                    />
                  ))}
                  {/* 部署点位标记 */}
                  <Marker position={[29.7, 90.3]}>
                    <Popup>
                      <div style={{ color: '#87ceeb', fontWeight: 'bold' }}>A点 - 崩嘎村运营基地</div>
                      <div>位置: 崩嘎村</div>
                      <div>无人机: 1架</div>
                      <div>今日订单: {Math.floor(Math.random() * 8) + 3}</div>
                    </Popup>
                  </Marker>
                  <Marker position={[29.72, 90.28]}>
                    <Popup>
                      <div style={{ color: '#87ceeb', fontWeight: 'bold' }}>B点 - 徒步起点辅助站</div>
                      <div>位置: 徒步起点</div>
                      <div>无人机: 1架</div>
                      <div>今日订单: {Math.floor(Math.random() * 5) + 2}</div>
                    </Popup>
                  </Marker>
                  
                  {drones.filter(drone => drone.position[0] > 29.65 && drone.position[0] < 29.75 && drone.position[1] > 90.25 && drone.position[1] < 90.35).map(drone => (
                    <Marker
                      key={drone.id}
                      position={drone.position}
                    >
                      <Popup>{drone.status}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        )}
        {currentView === 'nianlang' && (
          <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '15px' }}>
            {/* 景区信息头部 */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ color: '#ffa500', margin: '0 0 10px 0' }}>念朗温泉康养</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffa500' }}>2万</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>年接待人次</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffa500' }}>1架</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>无人机数量</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffa500' }}>{nianlangActive}架</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>今日活跃</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' }}>¥{Math.floor(Math.random() * 2000) + 500}</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>今日营收</div>
                </div>
              </div>
            </div>

            {/* 主要内容区域 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* 左侧航线详情 */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                overflowY: 'auto'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>航线详情</h3>
                {nianlangRoutes.map(route => (
                  <div key={route.id} style={{
                    background: '#4a3a2a',
                    borderRadius: '5px',
                    padding: '10px',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ color: '#ffa500', margin: '0 0 5px 0' }}>{route.name}</h4>
                    <p style={{ margin: '5px 0', color: '#fff' }}>价格: ¥{route.price} | 时长: {route.duration}分钟</p>
                    <p style={{ margin: '5px 0', color: '#ccc' }}>特点: {route.features.join(', ')}</p>
                    {route.restriction && (
                      <p style={{ margin: '5px 0', color: '#ff6b6b' }}>限制: {route.restriction}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* 右侧地图 */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                position: 'relative'
              }}>
                <h3 style={{ margin: '15px', color: '#00d4ff' }}>念朗温泉航线地图</h3>
                <MapContainer center={[29.6, 90.4]} zoom={12} style={{ height: 'calc(100% - 60px)', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap contributors'
                  />
                  {nianlangRoutes.map(route => (
                    <Polyline
                      key={route.id}
                      positions={route.coordinates}
                      pathOptions={{
                        color: '#ffa500',
                        weight: 4,
                        dashArray: '10, 10',
                      }}
                    />
                  ))}
                  {/* 禁飞区 */}
                  <Circle
                    center={noFlyZoneCenter}
                    radius={noFlyZoneRadius}
                    pathOptions={{
                      color: 'red',
                      fillColor: 'red',
                      fillOpacity: 0.2,
                    }}
                  />
                  <Marker position={noFlyZoneCenter}>
                    <Popup>
                      <div style={{ color: '#ff6b6b', fontWeight: 'bold' }}>⚠️ 隐私禁飞区</div>
                      <div>温泉康养区保护</div>
                    </Popup>
                  </Marker>
                  
                  {/* 部署点位标记 */}
                  <Marker position={[29.6, 90.4]}>
                    <Popup>
                      <div style={{ color: '#ffa500', fontWeight: 'bold' }}>A点 - 温泉接待中心</div>
                      <div>位置: 温泉区</div>
                      <div>无人机: 1架</div>
                      <div>今日订单: {Math.floor(Math.random() * 12) + 6}</div>
                    </Popup>
                  </Marker>
                  
                  {drones.filter(drone => drone.position[0] > 29.55 && drone.position[0] < 29.65 && drone.position[1] > 90.35 && drone.position[1] < 90.45).map(drone => (
                    <Marker
                      key={drone.id}
                      position={drone.position}
                    >
                      <Popup>{drone.status}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        )}
        {currentView === 'drones' && (
          <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '15px' }}>
            {/* 无人机管理头部统计 */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ color: '#ff6b6b', margin: '0 0 15px 0' }}>无人机管理系统</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff00' }}>15架</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>总无人机</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#87ceeb' }}>{drones.filter(d => d.isFlying).length}架</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>飞行中</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffa500' }}>{drones.filter(d => !d.isFlying).length}架</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>待命中</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00d4ff' }}>100%</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>合规率</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' }}>98.5%</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>健康度</div>
                </div>
              </div>
            </div>

            {/* 主要内容区域 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
              {/* 左侧无人机详情列表 */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                overflowY: 'auto'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>无人机状态监控</h3>
                {drones.map(drone => {
                  const altitude = Math.floor(Math.random() * 3000) + 2000; // 模拟海拔
                  const battery = Math.floor(Math.random() * 40) + 60; // 电池电量
                  const temperature = Math.floor(Math.random() * 10) - 5; // 环境温度
                  const windSpeed = Math.floor(Math.random() * 15) + 5; // 风速
                  const complianceStatus = Math.random() > 0.95 ? '警告' : '正常'; // 合规状态

                  return (
                    <div key={drone.id} style={{
                      background: drone.isFlying ? '#2a4a2a' : '#4a2a2a',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px',
                      border: `2px solid ${drone.isFlying ? '#00ff00' : '#ff0000'}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>
                          无人机 {drone.id}
                          <span style={{
                            marginLeft: '10px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            background: complianceStatus === '正常' ? '#00ff00' : '#ff6b6b',
                            color: '#000'
                          }}>
                            {complianceStatus}
                          </span>
                        </div>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: drone.isFlying ? '#00ff00' : '#666',
                          color: '#000'
                        }}>
                          {drone.isFlying ? '飞行中' : '待命'}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '2px' }}>位置</div>
                          <div style={{ fontSize: '11px', color: '#fff' }}>
                            {drone.position[0].toFixed(4)}, {drone.position[1].toFixed(4)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '2px' }}>海拔</div>
                          <div style={{ fontSize: '11px', color: '#87ceeb' }}>{altitude}m</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '2px' }}>电池</div>
                          <div style={{ fontSize: '11px', color: battery > 80 ? '#00ff00' : battery > 50 ? '#ffa500' : '#ff6b6b' }}>
                            {battery}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '2px' }}>温度</div>
                          <div style={{ fontSize: '11px', color: temperature > 0 ? '#ffa500' : '#87ceeb' }}>
                            {temperature}°C
                          </div>
                        </div>
                      </div>

                      {/* 高原特性监控 */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '12px', color: '#00d4ff', marginBottom: '5px' }}>高原飞行参数</div>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                          <div style={{ color: '#ccc' }}>
                            动力补偿: <span style={{ color: '#00ff00' }}>{Math.floor(Math.random() * 20) + 80}%</span>
                          </div>
                          <div style={{ color: '#ccc' }}>
                            气压适应: <span style={{ color: '#87ceeb' }}>正常</span>
                          </div>
                          <div style={{ color: '#ccc' }}>
                            风速: <span style={{ color: windSpeed > 12 ? '#ff6b6b' : '#00ff00' }}>{windSpeed}m/s</span>
                          </div>
                        </div>
                      </div>

                      {/* 合规性信息 */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#00d4ff', marginBottom: '5px' }}>合规状态</div>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                          <div style={{ color: '#ccc' }}>
                            飞行许可: <span style={{ color: '#00ff00' }}>有效</span>
                          </div>
                          <div style={{ color: '#ccc' }}>
                            保险: <span style={{ color: '#00ff00' }}>在保</span>
                          </div>
                          <div style={{ color: '#ccc' }}>
                            最后维护: <span style={{ color: '#ffa500' }}>{Math.floor(Math.random() * 30) + 1}天前</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 右侧系统监控面板 */}
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '15px' }}>
                {/* 高原环境监控 */}
                <div style={{
                  background: '#1a1a1a',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>高原环境监控</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>平均海拔</span>
                      <span style={{ color: '#87ceeb', fontSize: '14px', fontWeight: 'bold' }}>4200m</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>环境温度</span>
                      <span style={{ color: '#ffa500', fontSize: '14px', fontWeight: 'bold' }}>{Math.floor(Math.random() * 8) - 2}°C</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>大气压力</span>
                      <span style={{ color: '#00ff00', fontSize: '14px', fontWeight: 'bold' }}>0.62atm</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>氧气含量</span>
                      <span style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 'bold' }}>65%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>风速预警</span>
                      <span style={{
                        color: Math.random() > 0.8 ? '#ff6b6b' : '#00ff00',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {Math.random() > 0.8 ? '高风' : '正常'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 合规性监控 */}
                <div style={{
                  background: '#1a1a1a',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>合规性监控</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>飞行许可</span>
                      <span style={{ color: '#00ff00', fontSize: '14px', fontWeight: 'bold' }}>✓ 全部有效</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>禁飞区遵守</span>
                      <span style={{ color: '#00ff00', fontSize: '14px', fontWeight: 'bold' }}>✓ 100%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>保险覆盖</span>
                      <span style={{ color: '#00ff00', fontSize: '14px', fontWeight: 'bold' }}>✓ 完整</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>维护合规</span>
                      <span style={{ color: '#ffa500', fontSize: '14px', fontWeight: 'bold' }}>⚠ 2架待检</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '12px' }}>飞行日志</span>
                      <span style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 'bold' }}>✓ 完整记录</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 右侧信息面板 */}
      <div style={{
        background: '#1a1a1a',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        overflowY: 'auto'
      }}>
        {currentView === 'overview' && (
          <>
            <h3 style={{ marginTop: 0, color: '#ff6b6b' }}>系统警报</h3>
            {alerts.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic' }}>暂无警报</div>
            ) : (
              alerts.slice(-5).map((alert, index) => (
                <div key={index} style={{
                  background: '#4a2a2a',
                  borderRadius: '5px',
                  padding: '8px',
                  marginBottom: '8px',
                  borderLeft: '4px solid #ff6b6b',
                  fontSize: '12px'
                }}>
                  {alert}
                </div>
              ))
            )}
            <h3 style={{ color: '#00d4ff', marginTop: '20px' }}>项目概况</h3>
            <div style={{ fontSize: '14px' }}>
              <p>总投资: 540万元</p>
              <p>年收入预测: 716万元</p>
              <p>投资回收期: 1.16年</p>
              <p>无人机总数: 15架</p>
            </div>
          </>
        )}
        {(currentView === 'basum' || currentView === 'haba' || currentView === 'nianlang') && (
          <>
            <h3 style={{ marginTop: 0, color: '#00d4ff' }}>实时监控</h3>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff00' }}>
                {currentView === 'basum' ? basumActive : currentView === 'haba' ? habaActive : nianlangActive}
              </div>
              <div style={{ fontSize: '12px', color: '#ccc' }}>活跃无人机</div>
            </div>
            <h3 style={{ color: '#ffff00' }}>今日订单</h3>
            <div style={{ fontSize: '14px' }}>
              <p>预约数量: {Math.floor(Math.random() * 20) + 5}</p>
              <p>完成率: 95%</p>
            </div>
          </>
        )}
        {currentView === 'drones' && (
          <>
            <h3 style={{ marginTop: 0, color: '#ff6b6b' }}>无人机状态详情</h3>
            <div style={{ fontSize: '14px' }}>
              <p>总无人机: {drones.length}</p>
              <p>飞行中: {drones.filter(d => d.isFlying).length}</p>
              <p>待命: {drones.filter(d => !d.isFlying).length}</p>
              <p>系统运行率: 98%</p>
            </div>
            <h3 style={{ color: '#00d4ff', marginTop: '20px' }}>维护提醒</h3>
            <div style={{ fontSize: '12px', color: '#ccc' }}>
              所有无人机电池状态正常<br/>
              通信模块运行稳定<br/>
              高原适应性良好
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;
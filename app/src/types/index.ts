// 基础的 Drone 类型
export interface Drone {
  id: string;
  model: string;
  status: 'idle' | 'flying' | 'charging' | 'maintenance';
  battery: number; // 百分比
  location: [number, number]; // 经纬度
}

// FlightRoute 接口
export interface FlightRoute {
  id: string;
  name: string;
  spot: 'BasumTso' | 'HabaTso' | 'Nianlang';
  price: number;
  duration: number; // 分钟
  coordinates: [number, number][]; // 模拟航线坐标点集合
  features: string[]; // 如"智能环绕", "全景回传"
  restriction?: string; // 如"禁飞区围栏"
}

// 无人机租赁服务
export interface DroneRentalService {
  id: string;
  type: 'app_remote' | 'onsite_rental';
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  availability: boolean;
  spot: 'BasumTso' | 'HabaTso' | 'Nianlang';
}

// 生成式内容服务
export interface GenerativeContentService {
  id: string;
  type: 'realistic_synthesis' | 'virtual_avatar';
  name: string;
  description: string;
  price: number;
  features: string[];
  processingTime: number; // 处理时间（分钟）
  spot: 'BasumTso' | 'HabaTso' | 'Nianlang';
  checkpoint: string; // 打卡点名称
}

// 服务统计数据
export interface ServiceStats {
  droneRentals: {
    totalOrders: number;
    todayOrders: number;
    revenue: number;
    appRemoteCount: number;
    onsiteRentalCount: number;
  };
  generativeContent: {
    totalOrders: number;
    todayOrders: number;
    revenue: number;
    realisticSynthesisCount: number;
    virtualAvatarCount: number;
  };
}
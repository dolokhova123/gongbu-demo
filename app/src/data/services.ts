import { DroneRentalService, GenerativeContentService, ServiceStats } from '../types';

// 无人机租赁服务数据
export const droneRentalServices: DroneRentalService[] = [
  // APP远程租赁服务
  {
    id: 'app-rental-basum-1',
    type: 'app_remote',
    name: '巴松措环湖精华游',
    description: 'APP预订经典环湖航线，实时云端观看，素材永久保存',
    price: 199,
    duration: 15,
    features: ['预设经典航线', '实时云端上传', '4K高清素材', '永久保存'],
    availability: true,
    spot: 'BasumTso'
  },
  {
    id: 'app-rental-haba-1',
    type: 'app_remote',
    name: '哈巴错冰川全景',
    description: 'APP预订冰川之眼航线，欣赏千年冰川奇观',
    price: 299,
    duration: 20,
    features: ['冰川全景航拍', '实时云端上传', '专业运镜', '永久保存'],
    availability: true,
    spot: 'HabaTso'
  },
  {
    id: 'app-rental-nianlang-1',
    type: 'app_remote',
    name: '念朗温泉康养之旅',
    description: 'APP预订温泉区航线，俯瞰养生胜地',
    price: 99,
    duration: 10,
    features: ['温泉区全景', '实时云端上传', '高清素材', '永久保存'],
    availability: true,
    spot: 'Nianlang'
  },

  // 景区现场租赁服务
  {
    id: 'onsite-rental-basum-1',
    type: 'onsite_rental',
    name: '巴松措智能租赁',
    description: '扫码30秒起飞，一键跟随、智能环绕、自动合影',
    price: 50,
    duration: 10,
    features: ['一键跟随', '智能环绕', '自动合影', '手机实时预览'],
    availability: true,
    spot: 'BasumTso'
  },
  {
    id: 'onsite-rental-haba-1',
    type: 'onsite_rental',
    name: '哈巴错现场租赁',
    description: '冰川秘境智能租赁，专业航拍体验',
    price: 80,
    duration: 15,
    features: ['专业航拍', '智能跟随', '实时预览', '一键操作'],
    availability: true,
    spot: 'HabaTso'
  },
  {
    id: 'onsite-rental-nianlang-1',
    type: 'onsite_rental',
    name: '念朗温泉现场租赁',
    description: '温泉康养区智能租赁，轻松拍出大片',
    price: 40,
    duration: 8,
    features: ['傻瓜操作', '实时预览', '自动合影', '快速起飞'],
    availability: true,
    spot: 'Nianlang'
  }
];

// 生成式内容服务数据
export const generativeContentServices: GenerativeContentService[] = [
  // 真人真景合成版
  {
    id: 'realistic-basum-1',
    type: 'realistic_synthesis',
    name: '巴松措圣湖合影',
    description: '上传照片，AI合成到纯净圣湖场景，生成无路人甲的完美纪念照',
    price: 29,
    features: ['AI合成技术', '高精度3D模型', '最佳光影条件', '电影级运镜'],
    processingTime: 5,
    spot: 'BasumTso',
    checkpoint: '扎西岛观景台'
  },
  {
    id: 'realistic-basum-2',
    type: 'realistic_synthesis',
    name: '杰青那拉嘎布神山',
    description: '合成到神山脚下，体验朝圣者的虔诚视角',
    price: 39,
    features: ['神山视角', '朝圣路线', '文化内涵', '震撼视觉'],
    processingTime: 5,
    spot: 'BasumTso',
    checkpoint: '神山观景台'
  },
  {
    id: 'realistic-haba-1',
    type: 'realistic_synthesis',
    name: '冰川之眼全景',
    description: '合成到冰川核心区，体验万年冰川的壮丽',
    price: 49,
    features: ['冰川特效', '全景合成', '动态效果', '震撼体验'],
    processingTime: 8,
    spot: 'HabaTso',
    checkpoint: '冰川观景台'
  },
  {
    id: 'realistic-haba-2',
    type: 'realistic_synthesis',
    name: '冰洞探险合成',
    description: '合成到冰洞内部，体验冰雪世界的奇幻',
    price: 59,
    features: ['冰洞特效', '内部视角', '奇幻体验', '专业合成'],
    processingTime: 10,
    spot: 'HabaTso',
    checkpoint: '冰洞入口'
  },
  {
    id: 'realistic-nianlang-1',
    type: 'realistic_synthesis',
    name: '温泉康养合成',
    description: '合成到温泉区，体验养生胜地的宁静',
    price: 25,
    features: ['温泉特效', '宁静氛围', '养生体验', '完美合成'],
    processingTime: 3,
    spot: 'Nianlang',
    checkpoint: '温泉观景台'
  },

  // 虚拟形象趣味版
  {
    id: 'avatar-basum-1',
    type: 'virtual_avatar',
    name: '藏族服饰体验',
    description: '生成3D虚拟分身，穿上藏族特色服饰，在圣湖边起舞',
    price: 35,
    features: ['3D虚拟分身', '藏族服饰', '圣湖起舞', '趣味互动'],
    processingTime: 8,
    spot: 'BasumTso',
    checkpoint: '文化体验区'
  },
  {
    id: 'avatar-basum-2',
    type: 'virtual_avatar',
    name: '转山朝圣体验',
    description: '虚拟分身完成转山朝圣，体验藏传佛教文化',
    price: 45,
    features: ['朝圣体验', '文化互动', '虚拟行走', '深度沉浸'],
    processingTime: 12,
    spot: 'BasumTso',
    checkpoint: '转山路径'
  },
  {
    id: 'avatar-haba-1',
    type: 'virtual_avatar',
    name: '冰川探险家',
    description: '虚拟分身成为冰川探险家，挑战极限冰雪世界',
    price: 55,
    features: ['探险体验', '冰雪互动', '极限挑战', '冒险精神'],
    processingTime: 15,
    spot: 'HabaTso',
    checkpoint: '探险基地'
  },
  {
    id: 'avatar-haba-2',
    type: 'virtual_avatar',
    name: '皮划艇勇士',
    description: '虚拟分身驾驶皮划艇，征服冰川湖泊',
    price: 50,
    features: ['皮划艇体验', '湖泊征服', '水上运动', '勇气挑战'],
    processingTime: 10,
    spot: 'HabaTso',
    checkpoint: '皮划艇码头'
  },
  {
    id: 'avatar-nianlang-1',
    type: 'virtual_avatar',
    name: '温泉养生体验',
    description: '虚拟分身享受温泉养生，体验藏式康养文化',
    price: 30,
    features: ['养生体验', '温泉文化', '放松互动', '健康生活'],
    processingTime: 6,
    spot: 'Nianlang',
    checkpoint: '养生中心'
  }
];

// 服务统计数据
export const serviceStats: ServiceStats = {
  droneRentals: {
    totalOrders: 1250,
    todayOrders: 45,
    revenue: 28500,
    appRemoteCount: 780,
    onsiteRentalCount: 470
  },
  generativeContent: {
    totalOrders: 890,
    todayOrders: 32,
    revenue: 19800,
    realisticSynthesisCount: 520,
    virtualAvatarCount: 370
  }
};
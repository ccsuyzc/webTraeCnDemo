// 获取指定用户的统计数据
// 实际开发中应调用后端接口，这里先用模拟数据
export async function fetchStatsByUser(userId) {
  // TODO: 替换为真实接口请求
  // const res = await fetch(`/api/stats/${userId}`);
  // return await res.json();
  // 模拟数据结构
  return {
    articles: [
      { title: 'Vue3 入门', views: 120, likes: 30 },
      { title: '前端性能优化', views: 200, likes: 50 },
      { title: 'Node.js 实战', views: 150, likes: 40 }
    ],
    totalViews: 470,
    totalLikes: 120,
    categoryStats: [
      { name: '前端', value: 270 },
      { name: '后端', value: 120 },
      { name: '其他', value: 80 }
    ]
  };
}
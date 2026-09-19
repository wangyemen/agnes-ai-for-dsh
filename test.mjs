/**
 * Agnes AI Plugin Test Script
 * 
 * 使用方法：
 * 1. 设置环境变量: export AGNES_API_KEY=your_key
 * 2. 运行: node test.mjs
 */

const API_KEY = process.env.AGNES_API_KEY;
const BASE_URL = 'https://api.agnes-ai.cn/v1';

if (!API_KEY) {
  console.error('❌ 请先设置 AGNES_API_KEY 环境变量');
  process.exit(1);
}

// 测试文本生成
async function testChat() {
  console.log('\n🧪 测试文本生成...');
  
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'agnes-2.5-flash',
      messages: [
        { role: 'system', content: '你是一个友好的AI助手' },
        { role: 'user', content: '用一句话介绍你自己' }
      ],
      max_tokens: 100,
      stream: false
    })
  });

  const data = await response.json();
  console.log('✅ 文本生成成功:', data.choices[0]?.message?.content);
  return data;
}

// 测试图像生成
async function testImage() {
  console.log('\n🖼️ 测试图像生成...');
  
  const response = await fetch(`${BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'agnes-image-2.5-flash',
      prompt: '一只可爱的猫咪坐在键盘上',
      size: '1K',
      ratio: '1:1'
    })
  });

  const data = await response.json();
  console.log('✅ 图像生成成功:', data.data?.[0]?.url || 'URL可用');
  return data;
}

// 测试视频生成
async function testVideo() {
  console.log('\n🎬 测试视频生成...');
  
  const response = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'agnes-video-25-flash',
      prompt: '一只猫在沙漠中漫步，夕阳西下',
      seconds: '5',
      mode: 'text',
      size: '720P',
      aspect_ratio: '16:9'
    })
  });

  const data = await response.json();
  console.log('✅ 视频任务创建成功:', data.video_id);
  return data;
}

// 运行测试
async function main() {
  console.log('🚀 Agnes AI 插件测试\n');
  console.log('API:', BASE_URL);
  console.log('Key:', API_KEY.substring(0, 10) + '...');
  
  try {
    await testChat();
    await testImage();
    await testVideo();
    
    console.log('\n✨ 所有测试完成!');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
}

main();
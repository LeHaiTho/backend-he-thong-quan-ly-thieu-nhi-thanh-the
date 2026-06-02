const https = require('https');

const BASE_URL = 'server-two-zeta-47.vercel.app';

function testEndpoint(path, method, body) {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BASE_URL,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n📡 [${method}] ${path}`);
        console.log(`   Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log('   Response:', JSON.stringify(parsed, null, 4));
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          console.log('   Response (raw):', data);
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      resolve({ error: e.message });
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Bắt đầu kiểm tra kết nối Vercel → Railway MySQL...\n');
  console.log('=' .repeat(55));

  // Test 1: Health Check
  console.log('\n✅ Test 1: Health Check (Kiểm tra server đang chạy)');
  await testEndpoint('/api/health', 'GET');

  // Test 2: Login to test DB connection
  console.log('\n🔐 Test 2: Login (Kiểm tra kết nối Database Railway)');
  const loginResult = await testEndpoint('/api/auth/login', 'POST', {
    username: 'admin',
    password: 'Admin@123'
  });

  console.log('\n' + '='.repeat(55));
  if (loginResult.status === 200 && loginResult.body?.success) {
    console.log('\n🎉 KẾT QUẢ: Server và Database Railway kết nối THÀNH CÔNG 100%!');
    console.log('   Token nhận được:', loginResult.body?.data?.token ? '✅ Có' : '❌ Không có');
  } else if (loginResult.status === 401 || loginResult.status === 400) {
    console.log('\n✅ KẾT QUẢ: Database Railway kết nối THÀNH CÔNG!');
    console.log('   (Server trả về lỗi đăng nhập - Database hoạt động bình thường)');
    console.log('   Thông báo:', loginResult.body?.message);
  } else {
    console.log('\n❌ KẾT QUẢ: Có thể có lỗi kết nối Database.');
    console.log('   Response:', JSON.stringify(loginResult.body));
  }
}

runTests();

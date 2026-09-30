

async function run() {
  try {
    console.log("1. Logging in...");
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' })
    });
    
    let token = '';
    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.token;
      console.log("Logged in. Token length:", token.length);
    } else {
      // register
      console.log("Login failed, registering...");
      const regRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password' })
      });
      const data = await regRes.json();
      token = data.token;
      console.log("Registered. Token length:", token.length);
    }

    console.log("\n2. Creating Interview for SQL...");
    const startRes = await fetch('http://localhost:5000/api/interview/start', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: 'Data Analyst', type: 'Technical', difficulty: 'Medium', targetRole: 'Data Analyst' })
    });
    const startData = await startRes.json();
    const interviewId = startData.interview._id;
    console.log("Interview created:", interviewId);
    const qIndex = startData.interview.questions[0].questionIndex;
    console.log("Question Index 0 is actually:", qIndex);

    console.log("\n3. Testing BAD Answer...");
    const badAnsRes = await fetch(`http://localhost:5000/api/interview/${interviewId}/answer`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ questionIndex: qIndex, studentAnswer: "sql ka bada bhai hai postgresql is used for dancing and singing" })
    });
    const badData = await badAnsRes.json();
    console.log("HTTP Status:", badAnsRes.status);
    console.log("Response:", JSON.stringify(badData, null, 2));

    console.log("\n4. Testing GOOD Answer...");
    const goodAnsRes = await fetch(`http://localhost:5000/api/interview/${interviewId}/answer`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ questionIndex: qIndex, studentAnswer: "Jest can be used for unit testing and Supertest can send HTTP requests to test REST API endpoints. We can test successful responses as well as error cases." })
    });
    const goodData = await goodAnsRes.json();
    console.log("HTTP Status:", goodAnsRes.status);
    console.log("Response:", JSON.stringify(goodData, null, 2));

  } catch (err) {
    console.error("Test script failed:", err);
  }
}

run();

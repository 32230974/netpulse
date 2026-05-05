import { generateAIResponse } from '../src/lib/ai/openai';

async function testAI() {
  console.log('Testing AI Fallback Logic...');
  
  const tests = [
    { name: 'Subscription query', input: 'How do I change my plan?' },
    { name: 'Billing query', input: 'Where is my last invoice?' },
    { name: 'Speed query', input: 'Why is my internet so slow?' },
    { name: 'General query', input: 'Tell me about NetPulse' },
  ];

  for (const test of tests) {
    console.log(`\nTest: ${test.name}`);
    console.log(`Input: "${test.input}"`);
    const response = await generateAIResponse('System prompt', test.input);
    console.log(`Response: ${response.substring(0, 100)}...`);
  }
}

// Mocking process.env for the test if needed
process.env.OPENAI_API_KEY = 'sk-your-openai-api-key-here';

testAI().catch(console.error);

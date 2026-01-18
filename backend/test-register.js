// Quick test script to verify registration endpoint
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const testRegister = async () => {
  try {
    console.log('Testing registration endpoint...');
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'test123'
    };

    const response = await axios.post(`${API_URL}/register`, testData);
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Registration failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Full error:', error.message);
  }
};

testRegister();







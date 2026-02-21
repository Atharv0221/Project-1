async function testRegister() {
    try {
        console.log('Attempting to register test user via fetch...');
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test' + Date.now() + '@example.com',
                password: 'password123',
                board: 'CBSE'
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('✅ SUCCESS:', data);
        } else {
            console.error('❌ FAILED:', response.status, data);
        }
    } catch (error: any) {
        console.error('❌ ERROR:', error.message);
    }
}

testRegister();

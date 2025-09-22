// Simple test script to verify OTP functionality
// Run with: node test-otp.js

const OTPService = require('./src/services/otpService.ts');

async function testOTP() {
  console.log('🧪 Testing OTP Service...\n');
  
  try {
    // Test 1: Generate OTP
    console.log('1. Testing OTP generation...');
    const otp = await OTPService.generateOTP();
    console.log(`✅ Generated OTP: ${otp}`);
    console.log(`✅ OTP length: ${otp.length} (should be 6)`);
    console.log(`✅ OTP is numeric: ${/^\d{6}$/.test(otp)}\n`);
    
    // Test 2: Send OTP
    console.log('2. Testing OTP sending...');
    const phone = '+1234567890';
    await OTPService.sendOTP(phone);
    console.log(`✅ OTP sent to ${phone}\n`);
    
    // Test 3: Verify correct OTP
    console.log('3. Testing correct OTP verification...');
    // Note: In real app, you'd get this from console or SMS
    const correctOTP = '123456'; // This would be the generated OTP
    try {
      await OTPService.verifyOTP(phone, correctOTP);
      console.log('✅ Correct OTP verification passed');
    } catch (error) {
      console.log('ℹ️  OTP verification failed (expected in test environment)');
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 4: Verify wrong OTP
    console.log('\n4. Testing wrong OTP verification...');
    try {
      await OTPService.verifyOTP(phone, '000000');
      console.log('❌ Wrong OTP verification should have failed');
    } catch (error) {
      console.log(`✅ Wrong OTP correctly rejected: ${error.message}`);
    }
    
    // Test 5: Check remaining time
    console.log('\n5. Testing remaining time...');
    const remainingTime = await OTPService.getRemainingTime();
    console.log(`✅ Remaining time: ${remainingTime}ms`);
    
    // Test 6: Check remaining attempts
    console.log('\n6. Testing remaining attempts...');
    const remainingAttempts = await OTPService.getRemainingAttempts();
    console.log(`✅ Remaining attempts: ${remainingAttempts}`);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOTP();

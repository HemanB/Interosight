// Quick Test Script - Paste this into browser console
// Run this when your app is running at localhost:5173

console.log('🚀 Starting quick functionality test...');

const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function testElement(selector, description) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`✅ ${description} - Found`);
      testResults.passed++;
      return true;
    } else {
      console.log(`❌ ${description} - Not found`);
      testResults.failed++;
      testResults.errors.push(`${description}: Element not found`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error`);
    testResults.failed++;
    testResults.errors.push(`${description}: ${error.message}`);
    return false;
  }
}

function testText(text, description) {
  try {
    const bodyText = document.body.innerText;
    if (bodyText.includes(text)) {
      console.log(`✅ ${description} - Found`);
      testResults.passed++;
      return true;
    } else {
      console.log(`❌ ${description} - Not found`);
      testResults.failed++;
      testResults.errors.push(`${description}: Text not found`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error`);
    testResults.failed++;
    testResults.errors.push(`${description}: ${error.message}`);
    return false;
  }
}

function testButton(selector, description) {
  try {
    const button = document.querySelector(selector);
    if (button && !button.disabled) {
      console.log(`✅ ${description} - Clickable`);
      testResults.passed++;
      return true;
    } else {
      console.log(`❌ ${description} - Not clickable`);
      testResults.failed++;
      testResults.errors.push(`${description}: Button not clickable`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error`);
    testResults.failed++;
    testResults.errors.push(`${description}: ${error.message}`);
    return false;
  }
}

// Test HomeScreen
console.log('\n📋 Testing HomeScreen...');
testText('Welcome to Interosight', 'HomeScreen Header');
testText('Start Your Journey', 'Start Journey Button');
testText('Freeform Journaling', 'Freeform Journaling Button');
testText('Track Your Day', 'Track Your Day Button');
testText('Introduction', 'Introduction Module');
testText('0%', 'Progress Indicator');

// Test buttons
testButton('button', 'Any Button');
testButton('button:has-text("Start Your Journey")', 'Start Journey Button');
testButton('button:has-text("Freeform Journaling")', 'Freeform Journaling Button');
testButton('button:has-text("Track Your Day")', 'Track Your Day Button');

// Test AuthScreen (if visible)
console.log('\n📋 Testing AuthScreen...');
testText('Sign Up', 'Sign Up Button');
testText('Sign In', 'Sign In Button');

// Test navigation functionality
console.log('\n📋 Testing Navigation...');
const buttons = document.querySelectorAll('button');
buttons.forEach((button, index) => {
  try {
    const originalText = button.textContent;
    button.click();
    console.log(`✅ Button ${index + 1} (${originalText}) - Clickable`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ Button ${index + 1} - Click error`);
    testResults.failed++;
    testResults.errors.push(`Button ${index + 1}: ${error.message}`);
  }
});

// Print results
console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.errors.length > 0) {
  console.log('\n🚨 Errors:');
  testResults.errors.forEach(error => {
    console.log(`  - ${error}`);
  });
}

if (testResults.failed === 0) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log('\n⚠️  Some tests failed. Check the errors above.');
}

console.log('\n💡 To test specific screens, navigate to them and run this script again.'); 
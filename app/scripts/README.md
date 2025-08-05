# Automated Test Scripts

These scripts provide quick automated testing for the Interosight app functionality.

## Quick Test (Recommended)

### Method 1: Browser Console
1. Start your app: `npm run dev`
2. Open browser console (F12)
3. Copy and paste the contents of `console-test.js`
4. Press Enter to run the test

### Method 2: NPM Script
```bash
npm run test:quick
```

## Full Test (Puppeteer-based)

### Prerequisites
```bash
npm install puppeteer
```

### Run Full Test
```bash
npm run test
```

## Test Scripts Overview

### `console-test.js`
- **Purpose**: Quick browser console test
- **Usage**: Copy-paste into browser console
- **Tests**: Element rendering, button functionality, navigation
- **Speed**: ⚡ Very fast (runs in browser)

### `test-functionality.js`
- **Purpose**: Node.js-based DOM testing
- **Usage**: `node scripts/test-functionality.js`
- **Tests**: Same as console test but runs outside browser
- **Speed**: ⚡ Fast

### `test-rendering.js`
- **Purpose**: Full Puppeteer-based testing
- **Usage**: `node scripts/test-rendering.js`
- **Tests**: Full browser automation, navigation testing
- **Speed**: 🐌 Slower but more comprehensive

## What Each Test Checks

### HomeScreen Tests
- ✅ Header text "Welcome to Interosight"
- ✅ Action buttons: "Start Your Journey", "Freeform Journaling", "Track Your Day"
- ✅ Module cards: "Introduction", "Nutrition"
- ✅ Progress indicators
- ✅ Button clickability

### AuthScreen Tests
- ✅ Sign Up/Sign In buttons
- ✅ Form elements
- ✅ Navigation functionality

### ModuleScreen Tests
- ✅ Module title and description
- ✅ Journal textarea
- ✅ Save/Previous/Continue buttons
- ✅ Progress tracking

### FreeformJournalScreen Tests
- ✅ Header text
- ✅ Journal textarea
- ✅ Save button functionality

### LogScreen Tests
- ✅ Meal/Behavior log tabs
- ✅ Form elements
- ✅ Save functionality

### SettingsScreen Tests
- ✅ Settings header
- ✅ Profile/Privacy/Data tabs
- ✅ Form elements

## Test Results

Tests will output:
- ✅ **Passed**: Element found and functional
- ❌ **Failed**: Element missing or non-functional
- 📊 **Summary**: Success rate and error details

## Troubleshooting

### Common Issues
1. **App not running**: Make sure `npm run dev` is running on localhost:5173
2. **Elements not found**: Check if the app is on the correct screen
3. **Button clicks not working**: Ensure JavaScript is enabled

### Debug Mode
Add this to any test script to see more details:
```javascript
console.log('Current page text:', document.body.innerText);
console.log('All buttons:', document.querySelectorAll('button'));
```

## Quick Commands

```bash
# Start app
npm run dev

# Run quick test (in browser console)
# Copy-paste console-test.js content

# Run full test (requires Puppeteer)
npm run test
```

## Custom Tests

To add custom tests, modify the test functions in any script:

```javascript
// Add custom test
function testCustomElement() {
  const element = document.querySelector('.my-custom-element');
  if (element) {
    console.log('✅ Custom element found');
  } else {
    console.log('❌ Custom element not found');
  }
}

// Run custom test
testCustomElement();
``` 
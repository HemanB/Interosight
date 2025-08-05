#!/usr/bin/env node

// Simple DOM-based test script for quick functionality checks
// Run this in the browser console or as a Node.js script

class QuickTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  testElementExists(selector, description) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`✅ ${description} - Found`);
        this.results.passed++;
        return true;
      } else {
        console.log(`❌ ${description} - Not found`);
        this.results.failed++;
        this.results.errors.push(`${description}: Element not found`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${description} - Error`);
      this.results.failed++;
      this.results.errors.push(`${description}: ${error.message}`);
      return false;
    }
  }

  testTextExists(text, description) {
    try {
      const bodyText = document.body.innerText;
      if (bodyText.includes(text)) {
        console.log(`✅ ${description} - Found`);
        this.results.passed++;
        return true;
      } else {
        console.log(`❌ ${description} - Not found`);
        this.results.failed++;
        this.results.errors.push(`${description}: Text not found`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${description} - Error`);
      this.results.failed++;
      this.results.errors.push(`${description}: ${error.message}`);
      return false;
    }
  }

  testButtonClickable(selector, description) {
    try {
      const button = document.querySelector(selector);
      if (button && !button.disabled) {
        console.log(`✅ ${description} - Clickable`);
        this.results.passed++;
        return true;
      } else {
        console.log(`❌ ${description} - Not clickable`);
        this.results.failed++;
        this.results.errors.push(`${description}: Button not clickable`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${description} - Error`);
      this.results.failed++;
      this.results.errors.push(`${description}: ${error.message}`);
      return false;
    }
  }

  testHomeScreen() {
    console.log('\n📋 Testing HomeScreen Elements...');
    
    this.testTextExists('Welcome to Interosight', 'HomeScreen Header');
    this.testTextExists('Start Your Journey', 'Start Journey Button');
    this.testTextExists('Freeform Journaling', 'Freeform Journaling Button');
    this.testTextExists('Track Your Day', 'Track Your Day Button');
    this.testTextExists('Introduction', 'Introduction Module');
    this.testTextExists('0%', 'Progress Indicator');
    
    this.testButtonClickable('button:has-text("Start Your Journey")', 'Start Journey Button');
    this.testButtonClickable('button:has-text("Freeform Journaling")', 'Freeform Journaling Button');
    this.testButtonClickable('button:has-text("Track Your Day")', 'Track Your Day Button');
  }

  testAuthScreen() {
    console.log('\n📋 Testing AuthScreen Elements...');
    
    this.testTextExists('Sign Up', 'Sign Up Button');
    this.testTextExists('Sign In', 'Sign In Button');
    this.testTextExists('Welcome to Interosight', 'Auth Header');
    
    this.testButtonClickable('button:has-text("Sign Up")', 'Sign Up Button');
    this.testButtonClickable('button:has-text("Sign In")', 'Sign In Button');
  }

  testModuleScreen() {
    console.log('\n📋 Testing ModuleScreen Elements...');
    
    this.testTextExists('Introduction', 'Module Title');
    this.testTextExists('Welcome', 'Submodule Title');
    this.testElementExists('textarea', 'Journal Textarea');
    this.testElementExists('button:has-text("Save Response")', 'Save Button');
    
    this.testButtonClickable('button:has-text("Save Response")', 'Save Button');
    this.testButtonClickable('button:has-text("Previous")', 'Previous Button');
    this.testButtonClickable('button:has-text("Continue")', 'Continue Button');
  }

  testFreeformJournalScreen() {
    console.log('\n📋 Testing FreeformJournalScreen Elements...');
    
    this.testTextExists('Freeform Journaling', 'Freeform Journal Header');
    this.testElementExists('textarea', 'Freeform Textarea');
    this.testElementExists('button:has-text("Save Entry")', 'Save Entry Button');
    
    this.testButtonClickable('button:has-text("Save Entry")', 'Save Entry Button');
  }

  testLogScreen() {
    console.log('\n📋 Testing LogScreen Elements...');
    
    this.testTextExists('Log Your Day', 'Log Screen Header');
    this.testTextExists('Meal Log', 'Meal Log Tab');
    this.testTextExists('Behavior Log', 'Behavior Log Tab');
    this.testElementExists('button:has-text("Save Log")', 'Save Log Button');
    
    this.testButtonClickable('button:has-text("Save Log")', 'Save Log Button');
  }

  testSettingsScreen() {
    console.log('\n📋 Testing SettingsScreen Elements...');
    
    this.testTextExists('Settings', 'Settings Header');
    this.testTextExists('Profile', 'Profile Tab');
    this.testTextExists('Privacy', 'Privacy Tab');
    this.testTextExists('Data', 'Data Tab');
  }

  testNavigation() {
    console.log('\n📋 Testing Navigation...');
    
    // Test that clicking buttons doesn't cause errors
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button, index) => {
      try {
        const originalText = button.textContent;
        button.click();
        console.log(`✅ Button ${index + 1} (${originalText}) - Clickable`);
        this.results.passed++;
      } catch (error) {
        console.log(`❌ Button ${index + 1} - Click error`);
        this.results.failed++;
        this.results.errors.push(`Button ${index + 1}: ${error.message}`);
      }
    });
  }

  runAllTests() {
    console.log('🎯 Running quick functionality tests...\n');
    
    this.testHomeScreen();
    this.testAuthScreen();
    this.testModuleScreen();
    this.testFreeformJournalScreen();
    this.testLogScreen();
    this.testSettingsScreen();
    this.testNavigation();
    
    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 Errors:');
      this.results.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Check the errors above.');
    }
  }
}

// Browser console version
if (typeof window !== 'undefined') {
  // Running in browser
  window.QuickTester = QuickTester;
  console.log('🚀 QuickTester loaded! Run: new QuickTester().runAllTests()');
} else {
  // Running in Node.js
  const tester = new QuickTester();
  tester.runAllTests();
}

module.exports = QuickTester; 
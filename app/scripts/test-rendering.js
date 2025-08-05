#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AutomatedTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async init() {
    console.log('🚀 Starting automated rendering tests...');
    this.browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testElementExists(selector, description) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      console.log(`✅ ${description} - Found`);
      this.results.passed++;
      return true;
    } catch (error) {
      console.log(`❌ ${description} - Not found`);
      this.results.failed++;
      this.results.errors.push(`${description}: ${error.message}`);
      return false;
    }
  }

  async testTextExists(text, description) {
    try {
      await this.page.waitForFunction(
        (searchText) => document.body.innerText.includes(searchText),
        { timeout: 5000 },
        text
      );
      console.log(`✅ ${description} - Found`);
      this.results.passed++;
      return true;
    } catch (error) {
      console.log(`❌ ${description} - Not found`);
      this.results.failed++;
      this.results.errors.push(`${description}: ${error.message}`);
      return false;
    }
  }

  async testButtonClick(selector, description) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.click(selector);
      console.log(`✅ ${description} - Clickable`);
      this.results.passed++;
      return true;
    } catch (error) {
      console.log(`❌ ${description} - Not clickable`);
      this.results.failed++;
      this.results.errors.push(`${description}: ${error.message}`);
      return false;
    }
  }

  async testNavigation(buttonSelector, expectedUrl, description) {
    try {
      await this.page.waitForSelector(buttonSelector, { timeout: 5000 });
      await this.page.click(buttonSelector);
      
      // Wait for navigation or URL change
      await this.page.waitForTimeout(1000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes(expectedUrl) || currentUrl !== 'http://localhost:5173/') {
        console.log(`✅ ${description} - Navigation successful`);
        this.results.passed++;
        return true;
      } else {
        console.log(`❌ ${description} - Navigation failed`);
        this.results.failed++;
        this.results.errors.push(`${description}: Navigation failed`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${description} - Navigation error`);
      this.results.failed++;
      this.results.errors.push(`${description}: ${error.message}`);
      return false;
    }
  }

  async testHomeScreen() {
    console.log('\n📋 Testing HomeScreen...');
    
    // Navigate to home
    await this.page.goto('http://localhost:5173/');
    await this.page.waitForTimeout(2000);

    // Test main elements
    await this.testTextExists('Welcome to Interosight', 'HomeScreen Header');
    await this.testTextExists('Start Your Journey', 'Start Journey Button');
    await this.testTextExists('Freeform Journaling', 'Freeform Journaling Button');
    await this.testTextExists('Track Your Day', 'Track Your Day Button');
    await this.testTextExists('Introduction', 'Introduction Module');
    await this.testTextExists('0%', 'Progress Indicator');

    // Test button functionality
    await this.testButtonClick('button:has-text("Start Your Journey")', 'Start Journey Button Click');
    await this.testButtonClick('button:has-text("Freeform Journaling")', 'Freeform Journaling Button Click');
    await this.testButtonClick('button:has-text("Track Your Day")', 'Track Your Day Button Click');
  }

  async testAuthScreen() {
    console.log('\n📋 Testing AuthScreen...');
    
    // Navigate to auth (logout first)
    await this.page.goto('http://localhost:5173/');
    await this.page.waitForTimeout(1000);
    
    // Try to find auth elements
    await this.testTextExists('Sign Up', 'Sign Up Button');
    await this.testTextExists('Sign In', 'Sign In Button');
    await this.testTextExists('Welcome to Interosight', 'Auth Header');
  }

  async testModuleScreen() {
    console.log('\n📋 Testing ModuleScreen...');
    
    // Navigate to module screen
    await this.page.goto('http://localhost:5173/');
    await this.page.waitForTimeout(1000);
    
    // Click on Start Your Journey to get to module
    await this.page.click('button:has-text("Start Your Journey")');
    await this.page.waitForTimeout(2000);

    // Test module elements
    await this.testTextExists('Introduction', 'Module Title');
    await this.testTextExists('Welcome', 'Submodule Title');
    await this.testElementExists('textarea', 'Journal Textarea');
    await this.testElementExists('button:has-text("Save Response")', 'Save Button');
  }

  async testFreeformJournalScreen() {
    console.log('\n📋 Testing FreeformJournalScreen...');
    
    // Navigate to freeform journal
    await this.page.goto('http://localhost:5173/');
    await this.page.waitForTimeout(1000);
    
    await this.page.click('button:has-text("Freeform Journaling")');
    await this.page.waitForTimeout(2000);

    // Test freeform journal elements
    await this.testTextExists('Freeform Journaling', 'Freeform Journal Header');
    await this.testElementExists('textarea', 'Freeform Textarea');
    await this.testElementExists('button:has-text("Save Entry")', 'Save Entry Button');
  }

  async testLogScreen() {
    console.log('\n📋 Testing LogScreen...');
    
    // Navigate to log screen
    await this.page.goto('http://localhost:5173/');
    await this.page.waitForTimeout(1000);
    
    await this.page.click('button:has-text("Track Your Day")');
    await this.page.waitForTimeout(2000);

    // Test log screen elements
    await this.testTextExists('Log Your Day', 'Log Screen Header');
    await this.testTextExists('Meal Log', 'Meal Log Tab');
    await this.testTextExists('Behavior Log', 'Behavior Log Tab');
    await this.testElementExists('button:has-text("Save Log")', 'Save Log Button');
  }

  async testSettingsScreen() {
    console.log('\n📋 Testing SettingsScreen...');
    
    // Navigate to settings (assuming there's a settings link)
    await this.page.goto('http://localhost:5173/');
    await this.page.waitForTimeout(1000);
    
    // Look for settings navigation
    const settingsLink = await this.page.$('a[href*="settings"], button:has-text("Settings")');
    if (settingsLink) {
      await settingsLink.click();
      await this.page.waitForTimeout(2000);

      // Test settings elements
      await this.testTextExists('Settings', 'Settings Header');
      await this.testTextExists('Profile', 'Profile Tab');
      await this.testTextExists('Privacy', 'Privacy Tab');
      await this.testTextExists('Data', 'Data Tab');
    } else {
      console.log('⚠️  Settings navigation not found - skipping SettingsScreen test');
    }
  }

  async runAllTests() {
    try {
      await this.init();
      
      console.log('🎯 Running automated rendering tests...\n');
      
      await this.testHomeScreen();
      await this.testAuthScreen();
      await this.testModuleScreen();
      await this.testFreeformJournalScreen();
      await this.testLogScreen();
      await this.testSettingsScreen();
      
      this.printResults();
      
    } catch (error) {
      console.error('💥 Test runner error:', error);
    } finally {
      await this.cleanup();
    }
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
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Check the errors above.');
      process.exit(1);
    }
  }
}

// Run the tests
const tester = new AutomatedTester();
tester.runAllTests(); 
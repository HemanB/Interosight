#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

const USER_EMAIL = 'gptfranklin@gmail.com';
const OUTPUT_FILE = 'user-data-inspection.json';

console.log('🔍 Starting quick user data inspection...\n');

try {
  // Step 1: Get current project
  console.log('📋 Getting current Firebase project...');
  const projectResult = execSync('firebase use --json', { encoding: 'utf8' });
  const projectData = JSON.parse(projectResult);
  const projectId = projectData.current;
  
  console.log(`✅ Current project: ${projectId}\n`);
  
  // Step 2: Export all Firestore data
  console.log('📤 Exporting Firestore data...');
  const exportResult = execSync(`firebase firestore:export --format=json --project=${projectId}`, { encoding: 'utf8' });
  const firestoreData = JSON.parse(exportResult);
  
  console.log(`✅ Exported ${Object.keys(firestoreData).length} documents\n`);
  
  // Step 3: Export Auth data
  console.log('👤 Exporting Auth data...');
  const authResult = execSync(`firebase auth:export --format=json --project=${projectId}`, { encoding: 'utf8' });
  const authData = JSON.parse(authResult);
  
  // Find user by email
  const user = Object.values(authData.users || {}).find(u => u.email === USER_EMAIL);
  
  if (!user) {
    console.log(`❌ User with email ${USER_EMAIL} not found in Auth`);
    process.exit(1);
  }
  
  const userId = user.localId;
  console.log(`✅ Found user: ${user.email} (ID: ${userId})\n`);
  
  // Step 4: Filter user's data
  console.log('🔍 Filtering user data...');
  
  const userData = {
    userId,
    email: USER_EMAIL,
    authUser: {
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      creationTime: user.metadata?.creationTime,
      lastSignInTime: user.metadata?.lastSignInTime
    },
    profile: null,
    collections: {
      journal_entries: {},
      module_progress: {},
      meal_logs: {},
      behavior_logs: {},
      insights: {},
      events: {}
    }
  };
  
  // Get user profile
  const userProfilePath = `users/${userId}`;
  if (firestoreData[userProfilePath]) {
    userData.profile = firestoreData[userProfilePath];
    console.log('✅ Found user profile');
  } else {
    console.log('⚠️  No user profile found');
  }
  
  // Get collection data
  const collections = [
    'journal_entries',
    'module_progress',
    'meal_logs',
    'behavior_logs',
    'insights',
    'events'
  ];
  
  collections.forEach(collection => {
    const userPath = `users/${userId}/${collection}`;
    const collectionData = {};
    
    Object.keys(firestoreData).forEach(docPath => {
      if (docPath.startsWith(userPath)) {
        const docId = docPath.split('/').pop();
        collectionData[docId] = firestoreData[docPath];
      }
    });
    
    userData.collections[collection] = collectionData;
    const count = Object.keys(collectionData).length;
    console.log(`${collection}: ${count} documents`);
  });
  
  // Step 5: Save results
  console.log('\n💾 Saving results...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(userData, null, 2));
  
  console.log(`✅ Data saved to: ${OUTPUT_FILE}`);
  
  // Step 6: Print summary
  console.log('\n📊 Data Summary:');
  console.log(`User ID: ${userId}`);
  console.log(`Email: ${USER_EMAIL}`);
  console.log(`Display Name: ${user.displayName || 'Not set'}`);
  console.log(`Profile: ${userData.profile ? 'Found' : 'Not found'}`);
  console.log(`Email Verified: ${user.emailVerified}`);
  console.log(`Created: ${user.metadata?.creationTime}`);
  console.log(`Last Sign In: ${user.metadata?.lastSignInTime}`);
  
  console.log('\n📚 Collections:');
  Object.entries(userData.collections).forEach(([collection, data]) => {
    const count = Object.keys(data).length;
    console.log(`  ${collection}: ${count} documents`);
  });
  
  console.log('\n🎉 Inspection complete!');
  console.log(`📁 Full data available in: ${OUTPUT_FILE}`);
  
} catch (error) {
  console.error('💥 Inspection failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Make sure you are logged into Firebase CLI: firebase login');
  console.error('2. Make sure you have the correct project selected: firebase use');
  console.error('3. Make sure you have the necessary permissions');
  process.exit(1);
} 
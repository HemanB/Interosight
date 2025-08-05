#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const USER_EMAIL = 'gptfranklin@gmail.com';
const OUTPUT_FILE = 'user-data-inspection.json';

console.log('🔍 Starting user data inspection...\n');

try {
  // Initialize Firebase Admin
  console.log('📋 Initializing Firebase Admin...');
  
  // Check if service account key exists
  const serviceAccountPath = './firebase/serviceAccountKey.json';
  if (!fs.existsSync(serviceAccountPath)) {
    console.log('❌ Service account key not found. Please:');
    console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
    console.log('2. Click "Generate new private key"');
    console.log('3. Save the JSON file as firebase/serviceAccountKey.json');
    process.exit(1);
  }
  
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  const auth = getAuth();
  const db = getFirestore();
  
  console.log('✅ Firebase Admin initialized\n');
  
  // Get user by email
  console.log(`👤 Looking up user: ${USER_EMAIL}`);
  const userRecord = await auth.getUserByEmail(USER_EMAIL);
  const userId = userRecord.uid;
  
  console.log(`✅ Found user: ${userRecord.email} (ID: ${userId})`);
  console.log(`Display Name: ${userRecord.displayName || 'Not set'}`);
  console.log(`Email Verified: ${userRecord.emailVerified}`);
  console.log(`Created: ${userRecord.metadata.creationTime}`);
  console.log(`Last Sign In: ${userRecord.metadata.lastSignInTime}\n`);
  
  // Get user profile
  console.log('📄 Getting user profile...');
  const profileDoc = await db.collection('users').doc(userId).get();
  let profile = null;
  
  if (profileDoc.exists) {
    profile = profileDoc.data();
    console.log('✅ User profile found');
  } else {
    console.log('⚠️  No user profile found');
  }
  
  // Get all collections
  console.log('\n📚 Getting collection data...');
  const collections = [
    'journal_entries',
    'module_progress',
    'meal_logs',
    'behavior_logs',
    'insights',
    'events'
  ];
  
  const userData = {
    userId,
    email: USER_EMAIL,
    authUser: {
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime
    },
    profile,
    collections: {}
  };
  
  for (const collection of collections) {
    console.log(`📄 Getting ${collection}...`);
    const snapshot = await db.collection('users').doc(userId).collection(collection).get();
    const docs = {};
    
    snapshot.forEach(doc => {
      docs[doc.id] = doc.data();
    });
    
    userData.collections[collection] = docs;
    console.log(`  ${collection}: ${Object.keys(docs).length} documents`);
  }
  
  // Save results
  console.log('\n💾 Saving results...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(userData, null, 2));
  
  console.log(`✅ Data saved to: ${OUTPUT_FILE}`);
  
  // Print summary
  console.log('\n📊 Data Summary:');
  console.log(`User ID: ${userId}`);
  console.log(`Email: ${USER_EMAIL}`);
  console.log(`Display Name: ${userRecord.displayName || 'Not set'}`);
  console.log(`Profile: ${profile ? 'Found' : 'Not found'}`);
  console.log(`Email Verified: ${userRecord.emailVerified}`);
  console.log(`Created: ${userRecord.metadata.creationTime}`);
  console.log(`Last Sign In: ${userRecord.metadata.lastSignInTime}`);
  
  console.log('\n📚 Collections:');
  Object.entries(userData.collections).forEach(([collection, data]) => {
    const count = Object.keys(data).length;
    console.log(`  ${collection}: ${count} documents`);
    
    // Show sample data for non-empty collections
    if (count > 0) {
      const sampleDoc = Object.values(data)[0];
      console.log(`    Sample fields: ${Object.keys(sampleDoc).join(', ')}`);
    }
  });
  
  console.log('\n🎉 Inspection complete!');
  console.log(`📁 Full data available in: ${OUTPUT_FILE}`);
  
} catch (error) {
  console.error('💥 Inspection failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Make sure you have firebase-admin installed: npm install firebase-admin');
  console.error('2. Ensure you have serviceAccountKey.json in the firebase/ directory');
  console.error('3. Check that the service account has the necessary permissions');
  process.exit(1);
} 
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const USER_EMAIL = 'gptfranklin@gmail.com';
const OUTPUT_FILE = 'user-data-inspection.json';

/**
 * Get user ID from email using Firebase CLI
 */
async function getUserIdFromEmail(email) {
  try {
    console.log(`🔍 Looking up user ID for email: ${email}`);
    
    // Use Firebase CLI to get user by email
    const command = `firebase auth:export --format=json --project=$(firebase use --json | jq -r '.current')`;
    const result = execSync(command, { encoding: 'utf8' });
    const authData = JSON.parse(result);
    
    // Find user by email
    const user = Object.values(authData.users || {}).find(u => u.email === email);
    
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    
    console.log(`✅ Found user ID: ${user.localId}`);
    return user.localId;
  } catch (error) {
    console.error('❌ Error getting user ID:', error.message);
    throw error;
  }
}

/**
 * Get all collections for a user
 */
async function getUserCollections(userId) {
  try {
    console.log(`📚 Getting collections for user: ${userId}`);
    
    // List all collections under the user
    const command = `firebase firestore:indexes --format=json --project=$(firebase use --json | jq -r '.current')`;
    const result = execSync(command, { encoding: 'utf8' });
    
    // For now, we'll use a predefined list of collections we know exist
    const collections = [
      'journal_entries',
      'module_progress', 
      'meal_logs',
      'behavior_logs',
      'insights',
      'events'
    ];
    
    console.log(`✅ Found collections: ${collections.join(', ')}`);
    return collections;
  } catch (error) {
    console.error('❌ Error getting collections:', error.message);
    return [];
  }
}

/**
 * Get all documents from a collection
 */
async function getCollectionData(userId, collectionName) {
  try {
    console.log(`📄 Getting data from collection: ${collectionName}`);
    
    // Use Firebase CLI to export data
    const command = `firebase firestore:export --format=json --project=$(firebase use --json | jq -r '.current')`;
    const result = execSync(command, { encoding: 'utf8' });
    const exportData = JSON.parse(result);
    
    // Filter for user's data
    const userData = {};
    const userPath = `users/${userId}/${collectionName}`;
    
    Object.keys(exportData).forEach(docPath => {
      if (docPath.startsWith(userPath)) {
        const docId = docPath.split('/').pop();
        userData[docId] = exportData[docPath];
      }
    });
    
    console.log(`✅ Found ${Object.keys(userData).length} documents in ${collectionName}`);
    return userData;
  } catch (error) {
    console.error(`❌ Error getting ${collectionName} data:`, error.message);
    return {};
  }
}

/**
 * Get user profile data
 */
async function getUserProfile(userId) {
  try {
    console.log(`👤 Getting user profile for: ${userId}`);
    
    const command = `firebase firestore:export --format=json --project=$(firebase use --json | jq -r '.current')`;
    const result = execSync(command, { encoding: 'utf8' });
    const exportData = JSON.parse(result);
    
    const userProfilePath = `users/${userId}`;
    const profileData = exportData[userProfilePath];
    
    if (profileData) {
      console.log(`✅ Found user profile`);
      return profileData;
    } else {
      console.log(`⚠️  No user profile found`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting user profile:', error.message);
    return null;
  }
}

/**
 * Main inspection function
 */
async function inspectUserData() {
  try {
    console.log('🔍 Starting user data inspection...\n');
    
    // Get user ID from email
    const userId = await getUserIdFromEmail(USER_EMAIL);
    
    // Get user profile
    const userProfile = await getUserProfile(userId);
    
    // Get collections
    const collections = await getUserCollections(userId);
    
    // Get data from each collection
    const userData = {
      userId,
      email: USER_EMAIL,
      profile: userProfile,
      collections: {}
    };
    
    for (const collection of collections) {
      const collectionData = await getCollectionData(userId, collection);
      userData.collections[collection] = collectionData;
    }
    
    // Save to file
    const outputPath = path.join(__dirname, OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(userData, null, 2));
    
    console.log(`\n✅ Inspection complete!`);
    console.log(`📁 Data saved to: ${outputPath}`);
    
    // Print summary
    console.log('\n📊 Data Summary:');
    console.log(`User ID: ${userId}`);
    console.log(`Email: ${USER_EMAIL}`);
    console.log(`Profile: ${userProfile ? 'Found' : 'Not found'}`);
    
    Object.entries(userData.collections).forEach(([collection, data]) => {
      const count = Object.keys(data).length;
      console.log(`${collection}: ${count} documents`);
    });
    
  } catch (error) {
    console.error('💥 Inspection failed:', error.message);
    process.exit(1);
  }
}

// Alternative approach using direct Firestore queries
async function inspectUserDataDirect() {
  try {
    console.log('🔍 Starting direct user data inspection...\n');
    
    // This approach uses a Node.js script that can be run with Firebase Admin SDK
    const script = `
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./firebase/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function inspectUserData() {
  const userEmail = '${USER_EMAIL}';
  
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    const userId = userRecord.uid;
    
    console.log('User ID:', userId);
    console.log('Email:', userRecord.email);
    console.log('Display Name:', userRecord.displayName);
    
    const userData = {
      userId,
      email: userEmail,
      authUser: {
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      },
      collections: {}
    };
    
    // Get user profile
    const profileDoc = await db.collection('users').doc(userId).get();
    if (profileDoc.exists) {
      userData.profile = profileDoc.data();
    }
    
    // Get all collections
    const collections = [
      'journal_entries',
      'module_progress',
      'meal_logs', 
      'behavior_logs',
      'insights',
      'events'
    ];
    
    for (const collection of collections) {
      const snapshot = await db.collection('users').doc(userId).collection(collection).get();
      const docs = {};
      
      snapshot.forEach(doc => {
        docs[doc.id] = doc.data();
      });
      
      userData.collections[collection] = docs;
      console.log(\`\${collection}: \${Object.keys(docs).length} documents\`);
    }
    
    // Save to file
    fs.writeFileSync('${OUTPUT_FILE}', JSON.stringify(userData, null, 2));
    console.log('\\n✅ Data saved to ${OUTPUT_FILE}');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

inspectUserData();
`;
    
    // Save the script
    const scriptPath = path.join(__dirname, 'temp-inspect-script.js');
    fs.writeFileSync(scriptPath, script);
    
    console.log('📝 Created direct inspection script');
    console.log('💡 To run this script:');
    console.log(`   1. Make sure you have firebase-admin installed: npm install firebase-admin`);
    console.log(`   2. Ensure you have serviceAccountKey.json in the firebase/ directory`);
    console.log(`   3. Run: node ${scriptPath}`);
    
  } catch (error) {
    console.error('❌ Error creating direct inspection script:', error.message);
  }
}

// Run the inspection
if (require.main === module) {
  inspectUserData();
  inspectUserDataDirect();
} 
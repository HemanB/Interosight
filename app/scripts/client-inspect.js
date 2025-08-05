// Client-side Firebase inspection script
// Run this in the browser console when logged into the app

console.log('🔍 Starting client-side user data inspection...\n');

// Import Firebase from the app
const { auth, db } = await import('./firebase/config.js');

// Get current user
const currentUser = auth.currentUser;
if (!currentUser) {
  console.log('❌ No user logged in');
  return;
}

console.log(`✅ User: ${currentUser.email} (ID: ${currentUser.uid})`);
console.log(`Display Name: ${currentUser.displayName || 'Not set'}`);
console.log(`Email Verified: ${currentUser.emailVerified}`);
console.log(`Created: ${new Date(currentUser.metadata.creationTime)}`);
console.log(`Last Sign In: ${new Date(currentUser.metadata.lastSignInTime)}\n`);

// Get user profile
console.log('📄 Getting user profile...');
const profileDoc = await db.collection('users').doc(currentUser.uid).get();
let profile = null;

if (profileDoc.exists) {
  profile = profileDoc.data();
  console.log('✅ User profile found');
  console.log('Profile data:', profile);
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
  userId: currentUser.uid,
  email: currentUser.email,
  authUser: {
    email: currentUser.email,
    displayName: currentUser.displayName,
    emailVerified: currentUser.emailVerified,
    creationTime: currentUser.metadata.creationTime,
    lastSignInTime: currentUser.metadata.lastSignInTime
  },
  profile,
  collections: {}
};

for (const collection of collections) {
  console.log(`📄 Getting ${collection}...`);
  const snapshot = await db.collection('users').doc(currentUser.uid).collection(collection).get();
  const docs = {};
  
  snapshot.forEach(doc => {
    docs[doc.id] = doc.data();
  });
  
  userData.collections[collection] = docs;
  console.log(`  ${collection}: ${Object.keys(docs).length} documents`);
  
  // Show sample data for non-empty collections
  if (Object.keys(docs).length > 0) {
    const sampleDoc = Object.values(docs)[0];
    console.log(`    Sample fields: ${Object.keys(sampleDoc).join(', ')}`);
    console.log(`    Sample data:`, sampleDoc);
  }
}

// Print summary
console.log('\n📊 Data Summary:');
console.log(`User ID: ${currentUser.uid}`);
console.log(`Email: ${currentUser.email}`);
console.log(`Display Name: ${currentUser.displayName || 'Not set'}`);
console.log(`Profile: ${profile ? 'Found' : 'Not found'}`);
console.log(`Email Verified: ${currentUser.emailVerified}`);
console.log(`Created: ${new Date(currentUser.metadata.creationTime)}`);
console.log(`Last Sign In: ${new Date(currentUser.metadata.lastSignInTime)}`);

console.log('\n📚 Collections:');
Object.entries(userData.collections).forEach(([collection, data]) => {
  const count = Object.keys(data).length;
  console.log(`  ${collection}: ${count} documents`);
});

console.log('\n🎉 Inspection complete!');
console.log('📁 Full data available in the userData object');

// Make data available globally
window.userData = userData;
console.log('💡 Access the full data with: window.userData'); 
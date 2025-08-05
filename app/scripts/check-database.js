const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'interosight'
});

const db = admin.firestore();

async function checkDatabaseState() {
  console.log('📊 CHECKING DATABASE STATE 📊');
  
  const collections = [
    'journal_entries',
    'module_progress', 
    'discarded_prompts',
    'users',
    'journalEntries',
    'moduleProgress',
    'mealLogs',
    'behaviorLogs',
    'insights',
    'safetyPlans'
  ];
  
  let totalDocuments = 0;
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      const count = snapshot.docs.length;
      totalDocuments += count;
      
      if (count > 0) {
        console.log(`📁 ${collectionName}: ${count} documents`);
      } else {
        console.log(`📁 ${collectionName}: 0 documents (empty)`);
      }
    } catch (error) {
      console.log(`📁 ${collectionName}: Collection doesn't exist or error`);
    }
  }
  
  console.log(`\n📊 TOTAL DOCUMENTS IN DATABASE: ${totalDocuments}`);
  
  if (totalDocuments === 0) {
    console.log('✅ Database is completely empty!');
  } else {
    console.log('⚠️  Database still contains data');
  }
  
  process.exit(0);
}

checkDatabaseState().catch(console.error); 
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Standalone function to wipe all database data
export const wipeAllDatabaseData = async (): Promise<void> => {
  try {
    console.log('🚨 STARTING COMPLETE DATABASE WIPE 🚨');
    console.log('This will delete ALL data from ALL collections...');
    
    const collections = [
      'journal_entries',
      'module_progress', 
      'discarded_prompts',
      'users',
      'journalEntries', // legacy
      'moduleProgress', // legacy
      'mealLogs', // legacy
      'behaviorLogs', // legacy
      'insights' // legacy
    ];
    
    let totalDeleted = 0;
    
    for (const collectionName of collections) {
      try {
        console.log(`\n🗑️  Cleaning up collection: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.docs.length > 0) {
          console.log(`Found ${snapshot.docs.length} documents in ${collectionName}`);
          
          const deletions = snapshot.docs.map(doc => {
            console.log(`Deleting document: ${doc.id} from ${collectionName}`);
            return deleteDoc(doc.ref);
          });
          
          await Promise.all(deletions);
          totalDeleted += snapshot.docs.length;
          console.log(`✅ Deleted ${snapshot.docs.length} documents from ${collectionName}`);
        } else {
          console.log(`📭 Collection ${collectionName} is already empty`);
        }
      } catch (error) {
        console.log(`⚠️  Error with collection ${collectionName}:`, error);
        // Continue with other collections even if one fails
      }
    }
    
    console.log(`\n🎉 COMPLETE DATABASE WIPE FINISHED!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log(`✅ All collections are now empty`);
    
  } catch (error) {
    console.error('❌ Error during complete database wipe:', error);
    throw error;
  }
};

// Function to check current database state
export const checkDatabaseState = async (): Promise<void> => {
  try {
    console.log('📊 CHECKING CURRENT DATABASE STATE 📊');
    
    const collections = [
      'journal_entries',
      'module_progress', 
      'discarded_prompts',
      'users',
      'journalEntries',
      'moduleProgress',
      'mealLogs',
      'behaviorLogs',
      'insights'
    ];
    
    let totalDocuments = 0;
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        const count = snapshot.docs.length;
        totalDocuments += count;
        
        if (count > 0) {
          console.log(`📁 ${collectionName}: ${count} documents`);
        } else {
          console.log(`📁 ${collectionName}: 0 documents (empty)`);
        }
      } catch (error) {
        console.log(`📁 ${collectionName}: Error accessing collection`);
      }
    }
    
    console.log(`\n📊 TOTAL DOCUMENTS IN DATABASE: ${totalDocuments}`);
    
    if (totalDocuments === 0) {
      console.log('✅ Database is completely empty!');
    } else {
      console.log('⚠️  Database still contains data');
    }
    
  } catch (error) {
    console.error('❌ Error checking database state:', error);
  }
}; 
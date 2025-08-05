#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, auth, firestore
import pandas as pd

class FirebaseDataExtractor:
    def __init__(self, service_account_path=None):
        """Initialize Firebase connection"""
        self.service_account_path = service_account_path or './firebase/serviceAccountKey.json'
        self.db = None
        self.auth = None
        self.setup_firebase()
    
    def setup_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            if not os.path.exists(self.service_account_path):
                print(f"❌ Service account key not found at: {self.service_account_path}")
                print("Please:")
                print("1. Go to Firebase Console > Project Settings > Service Accounts")
                print("2. Click 'Generate new private key'")
                print("3. Save the JSON file as firebase/serviceAccountKey.json")
                sys.exit(1)
            
            cred = credentials.Certificate(self.service_account_path)
            firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            self.auth = auth
            
            print("✅ Firebase Admin initialized successfully")
            
        except Exception as e:
            print(f"❌ Failed to initialize Firebase: {e}")
            sys.exit(1)
    
    def get_user_by_email(self, email):
        """Get user record by email"""
        try:
            user_record = self.auth.get_user_by_email(email)
            print(f"✅ Found user: {user_record.email} (ID: {user_record.uid})")
            print(f"Display Name: {user_record.display_name or 'Not set'}")
            print(f"Email Verified: {user_record.email_verified}")
            print(f"Created: {user_record.user_metadata.creation_timestamp}")
            print(f"Last Sign In: {user_record.user_metadata.last_sign_in_timestamp}")
            return user_record
        except Exception as e:
            print(f"❌ User not found: {e}")
            return None
    
    def get_user_profile(self, user_id):
        """Get user profile from Firestore"""
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                profile = doc.to_dict()
                print("✅ User profile found")
                return profile
            else:
                print("⚠️  No user profile found")
                return None
        except Exception as e:
            print(f"❌ Error getting user profile: {e}")
            return None
    
    def get_collection_data(self, user_id, collection_name):
        """Get all documents from a collection"""
        try:
            docs = self.db.collection('users').document(user_id).collection(collection_name).stream()
            data = []
            
            for doc in docs:
                doc_data = doc.to_dict()
                doc_data['id'] = doc.id
                data.append(doc_data)
            
            print(f"  {collection_name}: {len(data)} documents")
            return data
        except Exception as e:
            print(f"❌ Error getting {collection_name}: {e}")
            return []
    
    def extract_user_data(self, email):
        """Extract all data for a specific user"""
        print(f"🔍 Starting data extraction for: {email}")
        
        # Get user record
        user_record = self.get_user_by_email(email)
        if not user_record:
            return None
        
        user_id = user_record.uid
        
        # Get user profile
        profile = self.get_user_profile(user_id)
        
        # Get all collections
        collections = [
            'journal_entries',
            'module_progress',
            'meal_logs',
            'behavior_logs',
            'insights',
            'events'
        ]
        
        print("\n📚 Getting collection data...")
        user_data = {
            'metadata': {
                'userId': user_id,
                'email': email,
                'extractedAt': datetime.now().isoformat(),
                'totalDocuments': 0
            },
            'auth': {
                'userId': user_id,
                'email': user_record.email,
                'displayName': user_record.display_name,
                'emailVerified': user_record.email_verified,
                'creationTime': user_record.user_metadata.creation_timestamp,
                'lastSignInTime': user_record.user_metadata.last_sign_in_timestamp
            },
            'profile': profile,
            'collections': {}
        }
        
        # Extract each collection
        for collection in collections:
            data = self.get_collection_data(user_id, collection)
            user_data['collections'][collection] = data
            user_data['metadata']['totalDocuments'] += len(data)
        
        return user_data
    
    def save_data(self, user_data, output_dir='./raw'):
        """Save extracted data to files"""
        if not user_data:
            return
        
        # Ensure output directory exists
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Save JSON file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        user_id = user_data['metadata']['userId']
        json_file = f"{output_dir}/user_{user_id}_{timestamp}.json"
        
        with open(json_file, 'w') as f:
            json.dump(user_data, f, indent=2, default=str)
        
        print(f"\n✅ Data saved to: {json_file}")
        
        # Save individual CSV files for each collection
        for collection_name, data in user_data['collections'].items():
            if data:
                df = pd.DataFrame(data)
                csv_file = f"{output_dir}/{collection_name}_{user_id}_{timestamp}.csv"
                df.to_csv(csv_file, index=False)
                print(f"  {csv_file}: {len(data)} rows")
        
        return json_file
    
    def print_summary(self, user_data):
        """Print extraction summary"""
        if not user_data:
            return
        
        print("\n📊 Extraction Summary:")
        print(f"User ID: {user_data['metadata']['userId']}")
        print(f"Email: {user_data['metadata']['email']}")
        print(f"Profile: {'Found' if user_data['profile'] else 'Not found'}")
        print(f"Total Documents: {user_data['metadata']['totalDocuments']}")
        
        print("\n📚 Collections:")
        for collection, data in user_data['collections'].items():
            print(f"  {collection}: {len(data)} documents")
            if data:
                # Show sample fields
                sample_doc = data[0]
                fields = list(sample_doc.keys())
                print(f"    Sample fields: {', '.join(fields[:5])}...")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python extract_data.py <email>")
        print("Example: python extract_data.py gptfranklin@gmail.com")
        sys.exit(1)
    
    email = sys.argv[1]
    
    # Initialize extractor
    extractor = FirebaseDataExtractor()
    
    # Extract data
    user_data = extractor.extract_user_data(email)
    
    if user_data:
        # Save data
        json_file = extractor.save_data(user_data)
        
        # Print summary
        extractor.print_summary(user_data)
        
        print(f"\n🎉 Extraction complete!")
        print(f"📁 Raw data: {json_file}")
        print("💡 Next step: Run process_data.py to clean and prepare for analysis")
    else:
        print("❌ Extraction failed")

if __name__ == "__main__":
    main() 
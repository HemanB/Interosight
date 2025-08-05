#!/usr/bin/env python3

import json
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
import glob
import os

class DataProcessor:
    def __init__(self, raw_dir='./raw', processed_dir='./processed'):
        """Initialize data processor"""
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir
        self.ensure_directories()
    
    def ensure_directories(self):
        """Ensure output directories exist"""
        Path(self.processed_dir).mkdir(parents=True, exist_ok=True)
    
    def find_latest_raw_file(self):
        """Find the most recent raw data file"""
        pattern = f"{self.raw_dir}/user_*.json"
        files = glob.glob(pattern)
        
        if not files:
            print("❌ No raw data files found. Run extract_data.py first.")
            return None
        
        # Get the most recent file
        latest_file = max(files, key=os.path.getctime)
        print(f"📄 Processing: {os.path.basename(latest_file)}")
        return latest_file
    
    def load_raw_data(self, file_path):
        """Load raw data from JSON file"""
        with open(file_path, 'r') as f:
            return json.load(f)
    
    def convert_timestamps(self, data):
        """Convert Firestore timestamps to datetime objects"""
        if isinstance(data, dict):
            for key, value in data.items():
                if key in ['createdAt', 'updatedAt', 'completedAt', 'lastAccessed', 'unlockedAt']:
                    if value:
                        try:
                            # Handle Firestore timestamp objects
                            if hasattr(value, 'timestamp'):
                                data[key] = value.timestamp()
                            elif isinstance(value, str):
                                data[key] = value
                            else:
                                data[key] = str(value)
                        except:
                            data[key] = str(value)
                elif isinstance(value, (dict, list)):
                    self.convert_timestamps(value)
        elif isinstance(data, list):
            for item in data:
                self.convert_timestamps(item)
        
        return data
    
    def process_journal_entries(self, entries):
        """Process journal entries data"""
        if not entries:
            return pd.DataFrame()
        
        df = pd.DataFrame(entries)
        
        # Convert timestamps
        if 'createdAt' in df.columns:
            df['createdAt'] = pd.to_datetime(df['createdAt'])
        if 'updatedAt' in df.columns:
            df['updatedAt'] = pd.to_datetime(df['updatedAt'])
        
        # Add derived columns
        if 'wordCount' in df.columns:
            df['wordCount'] = pd.to_numeric(df['wordCount'], errors='coerce').fillna(0)
        
        if 'type' in df.columns:
            df['type'] = df['type'].fillna('unknown')
        
        return df
    
    def process_module_progress(self, progress_data):
        """Process module progress data"""
        if not progress_data:
            return pd.DataFrame()
        
        df = pd.DataFrame(progress_data)
        
        # Convert timestamps
        timestamp_cols = ['lastAccessed', 'unlockedAt', 'completedAt']
        for col in timestamp_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col])
        
        # Process submodule progress
        if 'submoduleProgress' in df.columns:
            # Flatten submodule progress
            submodule_data = []
            for _, row in df.iterrows():
                module_id = row.get('moduleId', 'unknown')
                submodules = row.get('submoduleProgress', {})
                
                for submodule_id, submodule_info in submodules.items():
                    submodule_data.append({
                        'moduleId': module_id,
                        'submoduleId': submodule_id,
                        'status': submodule_info.get('status', 'unknown'),
                        'wordCount': submodule_info.get('wordCount', 0),
                        'completedAt': submodule_info.get('completedAt'),
                        'journalEntryId': submodule_info.get('journalEntryId')
                    })
            
            if submodule_data:
                submodule_df = pd.DataFrame(submodule_data)
                if 'completedAt' in submodule_df.columns:
                    submodule_df['completedAt'] = pd.to_datetime(submodule_df['completedAt'])
                return submodule_df
        
        return df
    
    def process_meal_logs(self, logs):
        """Process meal logs data"""
        if not logs:
            return pd.DataFrame()
        
        df = pd.DataFrame(logs)
        
        # Convert timestamps
        if 'createdAt' in df.columns:
            df['createdAt'] = pd.to_datetime(df['createdAt'])
        
        # Convert numeric columns
        numeric_cols = ['satietyPre', 'satietyPost', 'affectPre', 'affectPost', 'wordCount']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Process emotion arrays
        emotion_cols = ['emotionPre', 'emotionPost']
        for col in emotion_cols:
            if col in df.columns:
                df[f'{col}_count'] = df[col].apply(lambda x: len(x) if isinstance(x, list) else 0)
        
        return df
    
    def process_behavior_logs(self, logs):
        """Process behavior logs data"""
        if not logs:
            return pd.DataFrame()
        
        df = pd.DataFrame(logs)
        
        # Convert timestamps
        if 'createdAt' in df.columns:
            df['createdAt'] = pd.to_datetime(df['createdAt'])
        
        # Convert numeric columns
        numeric_cols = ['affectPre', 'affectPost', 'wordCount']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Process emotion arrays
        emotion_cols = ['emotionPre', 'emotionPost']
        for col in emotion_cols:
            if col in df.columns:
                df[f'{col}_count'] = df[col].apply(lambda x: len(x) if isinstance(x, list) else 0)
        
        return df
    
    def process_insights(self, insights):
        """Process insights data"""
        if not insights:
            return pd.DataFrame()
        
        df = pd.DataFrame(insights)
        
        # Convert timestamps
        if 'createdAt' in df.columns:
            df['createdAt'] = pd.to_datetime(df['createdAt'])
        
        return df
    
    def process_events(self, events):
        """Process events data"""
        if not events:
            return pd.DataFrame()
        
        df = pd.DataFrame(events)
        
        # Convert timestamps
        timestamp_cols = ['startTime', 'endTime', 'createdAt', 'updatedAt']
        for col in timestamp_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col])
        
        # Calculate duration if start and end times exist
        if 'startTime' in df.columns and 'endTime' in df.columns:
            df['duration_minutes'] = (df['endTime'] - df['startTime']).dt.total_seconds() / 60
        
        return df
    
    def process_data(self):
        """Main processing function"""
        print("🔄 Starting data processing...\n")
        
        # Find latest raw file
        raw_file = self.find_latest_raw_file()
        if not raw_file:
            return
        
        # Load raw data
        raw_data = self.load_raw_data(raw_file)
        
        # Process data
        processed_data = {
            'metadata': {
                **raw_data['metadata'],
                'processedAt': datetime.now().isoformat(),
                'sourceFile': os.path.basename(raw_file)
            },
            'user': {
                'id': raw_data['metadata']['userId'],
                'email': raw_data['metadata']['email'],
                'profile': raw_data.get('profile')
            },
            'collections': {}
        }
        
        # Process each collection
        collections = {
            'journal_entries': self.process_journal_entries,
            'module_progress': self.process_module_progress,
            'meal_logs': self.process_meal_logs,
            'behavior_logs': self.process_behavior_logs,
            'insights': self.process_insights,
            'events': self.process_events
        }
        
        for collection_name, processor_func in collections.items():
            print(f"📊 Processing {collection_name}...")
            
            raw_collection = raw_data['collections'].get(collection_name, [])
            processed_df = processor_func(raw_collection)
            
            if not processed_df.empty:
                processed_data['collections'][collection_name] = processed_df.to_dict('records')
                print(f"  {collection_name}: {len(processed_df)} documents processed")
                print(f"    Columns: {list(processed_df.columns)}")
            else:
                processed_data['collections'][collection_name] = []
                print(f"  {collection_name}: 0 documents")
        
        # Save processed data
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        user_id = raw_data['metadata']['userId']
        processed_file = f"{self.processed_dir}/processed_{user_id}_{timestamp}.json"
        
        with open(processed_file, 'w') as f:
            json.dump(processed_data, f, indent=2, default=str)
        
        print(f"\n✅ Processed data saved to: {processed_file}")
        
        # Save individual CSV files
        print("\n📈 Generating CSV files...")
        for collection_name, data in processed_data['collections'].items():
            if data:
                df = pd.DataFrame(data)
                csv_file = f"{self.processed_dir}/{collection_name}_{user_id}_{timestamp}.csv"
                df.to_csv(csv_file, index=False)
                print(f"  {csv_file}: {len(df)} rows")
        
        # Print summary
        print("\n📊 Processing Summary:")
        print(f"User: {raw_data['metadata']['email']}")
        print(f"Total Documents: {raw_data['metadata']['totalDocuments']}")
        
        for collection_name, data in processed_data['collections'].items():
            print(f"  {collection_name}: {len(data)} documents")
        
        print(f"\n🎉 Processing complete!")
        print(f"📁 Processed data: {processed_file}")
        print("💡 Next step: Run analyze_data.py to generate insights")

def main():
    """Main function"""
    processor = DataProcessor()
    processor.process_data()

if __name__ == "__main__":
    main() 
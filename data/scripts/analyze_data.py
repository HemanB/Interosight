#!/usr/bin/env python3

import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
from pathlib import Path
import glob
import os

# Set up plotting style
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

class DataAnalyzer:
    def __init__(self, processed_dir='./processed', analysis_dir='./analysis'):
        """Initialize data analyzer"""
        self.processed_dir = processed_dir
        self.analysis_dir = analysis_dir
        self.ensure_directories()
        self.data = None
        self.user_id = None
    
    def ensure_directories(self):
        """Ensure output directories exist"""
        Path(self.analysis_dir).mkdir(parents=True, exist_ok=True)
    
    def find_latest_processed_file(self):
        """Find the most recent processed data file"""
        pattern = f"{self.processed_dir}/processed_*.json"
        files = glob.glob(pattern)
        
        if not files:
            print("❌ No processed data files found. Run process_data.py first.")
            return None
        
        # Get the most recent file
        latest_file = max(files, key=os.path.getctime)
        print(f"📄 Analyzing: {os.path.basename(latest_file)}")
        return latest_file
    
    def load_processed_data(self, file_path):
        """Load processed data from JSON file"""
        with open(file_path, 'r') as f:
            return json.load(f)
    
    def convert_to_dataframes(self, processed_data):
        """Convert processed data to pandas DataFrames"""
        self.user_id = processed_data['user']['id']
        
        dataframes = {}
        for collection_name, data in processed_data['collections'].items():
            if data:
                df = pd.DataFrame(data)
                # Convert timestamp columns
                timestamp_cols = [col for col in df.columns if 'At' in col or 'Time' in col]
                for col in timestamp_cols:
                    if col in df.columns:
                        df[col] = pd.to_datetime(df[col])
                
                dataframes[collection_name] = df
        
        return dataframes
    
    def analyze_journal_entries(self, df):
        """Analyze journal entries"""
        if df.empty:
            return {}
        
        analysis = {
            'total_entries': len(df),
            'total_words': df['wordCount'].sum() if 'wordCount' in df.columns else 0,
            'avg_words_per_entry': df['wordCount'].mean() if 'wordCount' in df.columns else 0,
            'entry_types': df['type'].value_counts().to_dict() if 'type' in df.columns else {},
            'date_range': {
                'start': df['createdAt'].min().isoformat() if 'createdAt' in df.columns else None,
                'end': df['createdAt'].max().isoformat() if 'createdAt' in df.columns else None
            }
        }
        
        # Time series analysis
        if 'createdAt' in df.columns:
            df['date'] = df['createdAt'].dt.date
            daily_entries = df.groupby('date').size()
            analysis['entries_per_day'] = daily_entries.mean()
            analysis['most_active_day'] = daily_entries.idxmax().isoformat()
        
        return analysis
    
    def analyze_module_progress(self, df):
        """Analyze module progress"""
        if df.empty:
            return {}
        
        analysis = {
            'total_modules': len(df),
            'completed_modules': len(df[df['status'] == 'completed']) if 'status' in df.columns else 0,
            'in_progress_modules': len(df[df['status'] == 'in_progress']) if 'status' in df.columns else 0,
            'not_started_modules': len(df[df['status'] == 'not_started']) if 'status' in df.columns else 0
        }
        
        if 'overallProgress' in df.columns:
            analysis['avg_progress'] = df['overallProgress'].mean()
            analysis['total_progress'] = df['overallProgress'].sum()
        
        return analysis
    
    def analyze_meal_logs(self, df):
        """Analyze meal logs"""
        if df.empty:
            return {}
        
        analysis = {
            'total_logs': len(df),
            'meal_types': df['mealType'].value_counts().to_dict() if 'mealType' in df.columns else {},
            'avg_satiety_pre': df['satietyPre'].mean() if 'satietyPre' in df.columns else 0,
            'avg_satiety_post': df['satietyPost'].mean() if 'satietyPost' in df.columns else 0,
            'avg_affect_pre': df['affectPre'].mean() if 'affectPre' in df.columns else 0,
            'avg_affect_post': df['affectPost'].mean() if 'affectPost' in df.columns else 0
        }
        
        return analysis
    
    def create_visualizations(self, dataframes):
        """Create visualizations for the data"""
        print("📊 Creating visualizations...")
        
        # Journal entries over time
        if 'journal_entries' in dataframes and not dataframes['journal_entries'].empty:
            df = dataframes['journal_entries']
            if 'createdAt' in df.columns:
                plt.figure(figsize=(12, 6))
                df['date'] = df['createdAt'].dt.date
                daily_entries = df.groupby('date').size()
                plt.plot(daily_entries.index, daily_entries.values, marker='o')
                plt.title('Journal Entries Over Time')
                plt.xlabel('Date')
                plt.ylabel('Number of Entries')
                plt.xticks(rotation=45)
                plt.tight_layout()
                plt.savefig(f"{self.analysis_dir}/journal_entries_timeline.png", dpi=300, bbox_inches='tight')
                plt.close()
        
        # Word count distribution
        if 'journal_entries' in dataframes and not dataframes['journal_entries'].empty:
            df = dataframes['journal_entries']
            if 'wordCount' in df.columns:
                plt.figure(figsize=(10, 6))
                plt.hist(df['wordCount'], bins=20, alpha=0.7, edgecolor='black')
                plt.title('Distribution of Journal Entry Word Counts')
                plt.xlabel('Word Count')
                plt.ylabel('Frequency')
                plt.tight_layout()
                plt.savefig(f"{self.analysis_dir}/word_count_distribution.png", dpi=300, bbox_inches='tight')
                plt.close()
        
        # Module progress
        if 'module_progress' in dataframes and not dataframes['module_progress'].empty:
            df = dataframes['module_progress']
            if 'overallProgress' in df.columns:
                plt.figure(figsize=(10, 6))
                plt.bar(range(len(df)), df['overallProgress'])
                plt.title('Module Progress')
                plt.xlabel('Module')
                plt.ylabel('Progress (%)')
                plt.ylim(0, 100)
                plt.tight_layout()
                plt.savefig(f"{self.analysis_dir}/module_progress.png", dpi=300, bbox_inches='tight')
                plt.close()
        
        # Meal tracking metrics
        if 'meal_logs' in dataframes and not dataframes['meal_logs'].empty:
            df = dataframes['meal_logs']
            
            # Satiety comparison
            if 'satietyPre' in df.columns and 'satietyPost' in df.columns:
                plt.figure(figsize=(10, 6))
                plt.scatter(df['satietyPre'], df['satietyPost'], alpha=0.6)
                plt.plot([0, 10], [0, 10], 'r--', alpha=0.5)  # Reference line
                plt.title('Pre vs Post Meal Satiety')
                plt.xlabel('Pre-Meal Satiety')
                plt.ylabel('Post-Meal Satiety')
                plt.xlim(0, 10)
                plt.ylim(0, 10)
                plt.tight_layout()
                plt.savefig(f"{self.analysis_dir}/satiety_comparison.png", dpi=300, bbox_inches='tight')
                plt.close()
            
            # Meal type distribution
            if 'mealType' in df.columns:
                plt.figure(figsize=(10, 6))
                meal_counts = df['mealType'].value_counts()
                plt.pie(meal_counts.values, labels=meal_counts.index, autopct='%1.1f%%')
                plt.title('Meal Type Distribution')
                plt.tight_layout()
                plt.savefig(f"{self.analysis_dir}/meal_type_distribution.png", dpi=300, bbox_inches='tight')
                plt.close()
    
    def generate_insights(self, analysis_results):
        """Generate insights from analysis results"""
        insights = {
            'engagement': {},
            'patterns': {},
            'recommendations': {}
        }
        
        # Journal insights
        if 'journal_entries' in analysis_results:
            journal = analysis_results['journal_entries']
            insights['engagement']['journaling'] = {
                'frequency': 'High' if journal['total_entries'] > 10 else 'Medium' if journal['total_entries'] > 5 else 'Low',
                'consistency': 'Good' if journal.get('entries_per_day', 0) > 0.5 else 'Needs improvement',
                'detail_level': 'Detailed' if journal['avg_words_per_entry'] > 100 else 'Brief'
            }
        
        # Module insights
        if 'module_progress' in analysis_results:
            modules = analysis_results['module_progress']
            completion_rate = (modules['completed_modules'] / modules['total_modules']) * 100 if modules['total_modules'] > 0 else 0
            insights['engagement']['modules'] = {
                'completion_rate': completion_rate,
                'progress': 'Good' if completion_rate > 50 else 'Needs attention'
            }
        
        # Meal tracking insights
        if 'meal_logs' in analysis_results:
            meals = analysis_results['meal_logs']
            insights['engagement']['tracking'] = {
                'frequency': 'High' if meals['total_logs'] > 20 else 'Medium' if meals['total_logs'] > 10 else 'Low',
                'detail': 'Comprehensive' if meals['total_logs'] > 5 else 'Basic'
            }
        
        # Recommendations
        insights['recommendations'] = {
            'journaling': 'Consider journaling more frequently' if analysis_results.get('journal_entries', {}).get('total_entries', 0) < 5 else 'Great journaling consistency!',
            'modules': 'Focus on completing modules' if analysis_results.get('module_progress', {}).get('completed_modules', 0) < 2 else 'Excellent module progress!',
            'tracking': 'Try logging more meals for better insights' if analysis_results.get('meal_logs', {}).get('total_logs', 0) < 10 else 'Great meal tracking habits!'
        }
        
        return insights
    
    def analyze_data(self):
        """Main analysis function"""
        print("📊 Starting data analysis...\n")
        
        # Find latest processed file
        processed_file = self.find_latest_processed_file()
        if not processed_file:
            return
        
        # Load processed data
        processed_data = self.load_processed_data(processed_file)
        
        # Convert to DataFrames
        dataframes = self.convert_to_dataframes(processed_data)
        
        # Analyze each collection
        analysis_results = {}
        
        if 'journal_entries' in dataframes:
            print("📝 Analyzing journal entries...")
            analysis_results['journal_entries'] = self.analyze_journal_entries(dataframes['journal_entries'])
        
        if 'module_progress' in dataframes:
            print("📚 Analyzing module progress...")
            analysis_results['module_progress'] = self.analyze_module_progress(dataframes['module_progress'])
        
        if 'meal_logs' in dataframes:
            print("🍽️ Analyzing meal logs...")
            analysis_results['meal_logs'] = self.analyze_meal_logs(dataframes['meal_logs'])
        
        # Create visualizations
        self.create_visualizations(dataframes)
        
        # Generate insights
        print("💡 Generating insights...")
        insights = self.generate_insights(analysis_results)
        
        # Combine all results
        analysis_output = {
            'metadata': {
                'analyzedAt': datetime.now().isoformat(),
                'sourceFile': os.path.basename(processed_file),
                'userId': processed_data['user']['id'],
                'email': processed_data['user']['email']
            },
            'summary': analysis_results,
            'insights': insights
        }
        
        # Save analysis
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        analysis_file = f"{self.analysis_dir}/analysis_{self.user_id}_{timestamp}.json"
        
        with open(analysis_file, 'w') as f:
            json.dump(analysis_output, f, indent=2, default=str)
        
        print(f"\n✅ Analysis saved to: {analysis_file}")
        
        # Print summary
        print("\n📊 Analysis Summary:")
        print(f"User: {processed_data['user']['email']}")
        
        for collection, analysis in analysis_results.items():
            if analysis:
                print(f"\n{collection.replace('_', ' ').title()}:")
                for key, value in analysis.items():
                    if isinstance(value, dict):
                        print(f"  {key}: {len(value)} items")
                    else:
                        print(f"  {key}: {value}")
        
        print("\n💡 Key Insights:")
        for category, data in insights['engagement'].items():
            print(f"  {category}: {data}")
        
        print("\n🎯 Recommendations:")
        for area, recommendation in insights['recommendations'].items():
            print(f"  {area}: {recommendation}")
        
        print(f"\n🎉 Analysis complete!")
        print(f"📁 Analysis data: {analysis_file}")
        print(f"📊 Visualizations saved to: {self.analysis_dir}/")

def main():
    """Main function"""
    analyzer = DataAnalyzer()
    analyzer.analyze_data()

if __name__ == "__main__":
    main() 
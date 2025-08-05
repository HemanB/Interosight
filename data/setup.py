#!/usr/bin/env python3

"""
Setup script for Interosight Data Analysis Environment
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        sys.exit(1)

def create_directories():
    """Create necessary directories"""
    directories = ["raw", "processed", "analysis"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")

def check_firebase_setup():
    """Check if Firebase service account is set up"""
    service_account_path = Path("../app/firebase/serviceAccountKey.json")
    if not service_account_path.exists():
        print("⚠️  Firebase service account not found")
        print("To set up Firebase access:")
        print("1. Go to Firebase Console > Project Settings > Service Accounts")
        print("2. Click 'Generate new private key'")
        print("3. Save the JSON file as: ../app/firebase/serviceAccountKey.json")
        print("\nYou can still run the setup, but data extraction will fail without this file.")
    else:
        print("✅ Firebase service account found")

def main():
    """Main setup function"""
    print("🚀 Setting up Interosight Data Analysis Environment\n")
    
    # Check Python version
    check_python_version()
    
    # Create directories
    create_directories()
    
    # Check Firebase setup
    check_firebase_setup()
    
    # Install requirements
    install_requirements()
    
    print("\n🎉 Setup complete!")
    print("\n📋 Next steps:")
    print("1. Extract your data: python scripts/extract_data.py gptfranklin@gmail.com")
    print("2. Process the data: python scripts/process_data.py")
    print("3. Generate insights: python scripts/analyze_data.py")
    print("4. Interactive analysis: jupyter notebook analysis_notebook.ipynb")
    print("\n📚 For more information, see README.md")

if __name__ == "__main__":
    main() 
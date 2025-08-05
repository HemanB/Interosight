# Data Analysis Environment

This folder contains scripts and data for analyzing Interosight user data locally.

## 📁 Folder Structure

```
data/
├── raw/           # Raw data exports from Firebase
├── processed/     # Cleaned and transformed data
├── analysis/      # Generated insights and visualizations
├── scripts/       # Python data processing scripts
├── requirements.txt # Python dependencies
├── analysis_notebook.ipynb # Interactive Jupyter notebook
└── README.md      # This file
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Navigate to data directory
cd /home/hemanburre/projects/Interosight/data

# Run setup script (installs dependencies and creates directories)
python setup.py

# Or manually install dependencies
pip install -r requirements.txt
```

### 2. Extract Data from Firebase
```bash
# Extract all data for a specific user
python scripts/extract_data.py gptfranklin@gmail.com

# The script will automatically save JSON and CSV files
```

### 3. Process and Analyze
```bash
# Process raw data into analysis-ready format
python scripts/process_data.py

# Generate insights and visualizations
python scripts/analyze_data.py
```

### 4. Interactive Analysis (Optional)
```bash
# Start Jupyter notebook for interactive analysis
jupyter notebook analysis_notebook.ipynb
```

## 📊 Data Sources

### User Data Collections
- **journal_entries**: Freeform and module journal entries
- **module_progress**: Module completion tracking
- **meal_logs**: Meal tracking and nutrition data
- **behavior_logs**: Behavior and habit tracking
- **insights**: Generated insights and patterns
- **events**: User interaction events

### Data Formats
- **Raw**: JSON exports from Firebase CLI
- **Processed**: Cleaned CSV/JSON for analysis
- **Analysis**: Charts, reports, and insights

## 🔧 Tools Used

- **Firebase Admin SDK**: Data extraction
- **Python**: Data processing and analysis
- **Pandas**: Data manipulation and analysis
- **Matplotlib/Seaborn**: Static visualizations
- **Plotly**: Interactive visualizations
- **Jupyter**: Interactive analysis

## 📈 Analysis Capabilities

### User Behavior Analysis
- Journal entry patterns
- Module completion rates
- Meal tracking consistency
- Behavior change over time

### Data Quality Checks
- Missing data detection
- Data consistency validation
- Schema compliance checks

### Visualization Types
- Time series charts
- Progress tracking
- Pattern recognition
- User journey mapping

## 🔒 Privacy & Security

- All data is anonymized for analysis
- Raw data contains PII and should be handled securely
- Processed data removes sensitive information
- Analysis scripts work with anonymized data only

## 📝 Usage Examples

```bash
# Extract data for specific user
python scripts/extract_data.py user@example.com

# Process the data
python scripts/process_data.py

# Generate insights and visualizations
python scripts/analyze_data.py

# Interactive analysis
jupyter notebook analysis_notebook.ipynb
```

## 🛠️ Development

### Adding New Analysis
1. Create script in `scripts/`
2. Add data processing logic
3. Generate visualizations
4. Document findings

### Data Pipeline
```
Firebase CLI → Raw Data → Processing → Analysis → Visualizations
```

## 📋 TODO

- [ ] Set up automated data extraction
- [ ] Create dashboard templates
- [ ] Add machine learning analysis
- [ ] Implement real-time monitoring
- [ ] Create user behavior models 
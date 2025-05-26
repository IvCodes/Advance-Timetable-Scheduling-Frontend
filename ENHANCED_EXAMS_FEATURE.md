# Enhanced Exams Feature

## Overview
The Enhanced Exams feature has been added to the admin timetable section, providing advanced timetable generation with student ID mappings and beautiful HTML visualization.

## Navigation
- **URL**: `http://localhost:5173/admin/timetable/exams`
- **Sidebar**: Admin → Timetable → Enhanced Exams

## Features

### 🎓 Student ID Mappings
- Unique student IDs (IT21259852, IT21259853, etc.)
- Student-to-activity mappings
- Group-to-student relationships
- Activity-to-student assignments

### 🎨 Enhanced HTML Generation
- Beautiful, responsive HTML timetables
- Interactive student information display
- Modern design with statistics dashboard
- Mobile-friendly visualization

### 🚀 Advanced Algorithms
- Multiple run modes (Quick, Standard, Full)
- Batch algorithm execution
- Real-time progress tracking
- Comprehensive result analysis

### 📊 File Management
- Automatic HTML generation
- Download and view capabilities
- File organization and cleanup
- Version tracking with timestamps

## Available Algorithms
- **NSGA-II**: Non-dominated Sorting Genetic Algorithm II
- **SPEA2**: Strength Pareto Evolutionary Algorithm 2
- **MOEA/D**: Multi-objective Evolutionary Algorithm Based on Decomposition
- **DQN**: Deep Q-Network
- **SARSA**: State-Action-Reward-State-Action
- **Implicit Q-learning**: Advanced reinforcement learning

## Run Modes
- **Quick Mode**: Fast execution for testing (20 pop, 10 gen)
- **Standard Mode**: Balanced performance (50 pop, 25 gen)
- **Full Mode**: Maximum quality (100 pop, 50 gen)

## API Integration
The feature integrates with the backend enhanced timetable API:
- Dataset statistics
- Algorithm execution
- File management
- HTML generation

## Configuration
API endpoints are configured in `src/config/api.js`:
```javascript
ENHANCED_TIMETABLE: {
  DATASET_STATS: "/api/enhanced-timetable/dataset-stats",
  RUN_ALGORITHM: "/api/enhanced-timetable/run-algorithm",
  LIST_FILES: "/api/enhanced-timetable/list-generated-files",
  // ... other endpoints
}
```

## Usage
1. Navigate to Admin → Timetable → Enhanced Exams
2. View dataset statistics and available algorithms
3. Run single algorithms or batch operations
4. Download and view generated HTML timetables
5. Access enhanced features and student ID mappings

## Integration with Existing Features
- Added "Enhanced Features" tab to SLIIT Timetables view
- Cross-navigation between different timetable sections
- Consistent UI/UX with existing admin interface

## Technical Implementation
- **Component**: `src/features/admin/Timetable/EnhancedExams.jsx`
- **Routing**: Added to `src/pages/Home.jsx`
- **Navigation**: Updated `src/features/admin/Timetable/Timetable.jsx`
- **API Config**: `src/config/api.js`

## Benefits
- Enhanced visualization of exam timetables
- Student ID tracking and mapping
- Multiple algorithm comparison
- Beautiful HTML output for presentations
- Comprehensive file management system 
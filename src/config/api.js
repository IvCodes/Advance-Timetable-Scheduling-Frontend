// Enhanced Timetable API Configuration
// Following the existing frontend pattern with Vite environment variables

const API_CONFIG = {
  // Backend API base URL - uses Vite environment variable
  // This is 'http://localhost:8000/api/v1' due to VITE_API_URL
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  
  // Enhanced Timetable API endpoints
  // Paths are relative to the axios base URL (http://localhost:8000/api/v1)
  // to target http://localhost:8000/api/enhanced-timetable/...
  ENHANCED_TIMETABLE: {
    BASE: "../enhanced-timetable", // conceptual base
    DATASET_STATS: "../enhanced-timetable/dataset-stats",
    ALGORITHMS: "../enhanced-timetable/algorithms",
    RUN_ALGORITHM: "../enhanced-timetable/run-algorithm",
    RUN_ALL_ALGORITHMS: "../enhanced-timetable/run-all-algorithms",
    LIST_FILES: "../enhanced-timetable/list-generated-files",
    VIEW_HTML: "/api/enhanced-timetable/view-html", // View HTML in browser (absolute path for direct browser access)
    DOWNLOAD_HTML: "/api/enhanced-timetable/download-html", // Download HTML file (absolute path for direct browser access)
    DELETE_HTML: "../enhanced-timetable/delete-html", // Delete HTML file
    GENERATE_TEST_HTML: "../enhanced-timetable/generate-test-html",
    HEALTH: "../enhanced-timetable/health",
    CLEANUP: "../enhanced-timetable/cleanup-files",
  },
  
  // Exam Algorithm Metrics API endpoints
  EXAM_METRICS: {
    BASE: "../exam-metrics",
    INFO: "../exam-metrics/",
    RUNS: "../exam-metrics/runs",
    DELETE_RUN: "../exam-metrics/runs", // DELETE method with /{run_id}
    STATISTICS: "../exam-metrics/statistics",
    COMPARE: "../exam-metrics/compare",
    RUN_WITH_EVALUATION: "../exam-metrics/run-with-evaluation",
    RUN_ALL_WITH_EVALUATION: "../exam-metrics/run-all-with-evaluation",
    HEALTH: "../exam-metrics/health",
  },

  // Regular timetable API endpoints (existing, relative to axios base http://localhost:8000/api/v1)
  TIMETABLE: {
    BASE: "/timetable", // e.g., /api/v1/timetable
    // Add other existing endpoints here as needed
  }
};

export default API_CONFIG; 
import React, { useState, useEffect, useRef } from "react";
import { Button, Spin, notification, Progress, Badge } from "antd";
import { LoadingOutlined, CheckCircleFilled, CloseCircleFilled, InfoCircleFilled } from "@ant-design/icons";
import { generateTimetable, setNotificationRead } from "./timetable.api";
import { useDispatch, useSelector } from "react-redux";
import { setGenerating } from "./timetable.slice";

export default function Generate() {
  const { generating } = useSelector((state) => state.timetable);
  const dispatch = useDispatch();
  
  const [prevGenerating, setPrevGenerating] = useState(false);
  const [NotificationShown, setNotificationShown] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]);
  const [algoComplete, setAlgoComplete] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(null);
  const [algorithmStatus, setAlgorithmStatus] = useState({
    GA: { status: 'pending', details: {} },
    CO: { status: 'pending', details: {} },
    RL: { status: 'pending', details: {} },
  });
  
  // Reference to the log container for auto-scrolling
  const logContainerRef = useRef(null);
  
  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [progressLogs]);
  
  // Debug logging for state changes
  useEffect(() => {
    console.log("State change: generating =", generating, "algoComplete =", algoComplete);
  }, [generating, algoComplete]);

  // Process log message to extract useful information
  const processLogMessage = (message) => {
    // Check for algorithm start
    if (message.includes("Starting Genetic Algorithm execution")) {
      setCurrentAlgorithm("GA");
      setAlgorithmStatus(prev => ({
        ...prev,
        GA: { ...prev.GA, status: 'running' }
      }));
    } else if (message.includes("Starting Constraint Optimization Algorithm execution")) {
      setCurrentAlgorithm("CO");
      setAlgorithmStatus(prev => ({
        ...prev,
        CO: { ...prev.CO, status: 'running' }
      }));
    } else if (message.includes("Starting Reinforcement Learning Algorithm execution")) {
      setCurrentAlgorithm("RL");
      setAlgorithmStatus(prev => ({
        ...prev,
        RL: { ...prev.RL, status: 'running' }
      }));
    }
    
    // Check for algorithm completion
    if (message.includes("Genetic Algorithm completed - Success: true")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        GA: { ...prev.GA, status: 'success' }
      }));
    } else if (message.includes("Genetic Algorithm completed - Success: false")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        GA: { ...prev.GA, status: 'failed' }
      }));
    } else if (message.includes("Constraint Algorithm completed - Success: true")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        CO: { ...prev.CO, status: 'success' }
      }));
    } else if (message.includes("Constraint Algorithm completed - Success: false")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        CO: { ...prev.CO, status: 'failed' }
      }));
    } else if (message.includes("Reinforcement Learning completed - Success: true")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        RL: { ...prev.RL, status: 'success' }
      }));
    } else if (message.includes("Reinforcement Learning completed - Success: false")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        RL: { ...prev.RL, status: 'failed' }
      }));
    }
    
    // Extract population and iteration info for GA
    if (currentAlgorithm === "GA") {
      const populationMatch = message.match(/Population size: (\d+)/);
      const iterationMatch = message.match(/Iterations: (\d+)/);
      const fitnessMatch = message.match(/Best fitness: ([\d.]+)/);
      
      if (populationMatch) {
        setAlgorithmStatus(prev => ({
          ...prev,
          GA: { 
            ...prev.GA, 
            details: { 
              ...prev.GA.details, 
              population: populationMatch[1] 
            } 
          }
        }));
      }
      
      if (iterationMatch) {
        setAlgorithmStatus(prev => ({
          ...prev,
          GA: { 
            ...prev.GA, 
            details: { 
              ...prev.GA.details, 
              iterations: iterationMatch[1] 
            } 
          }
        }));
      }
      
      if (fitnessMatch) {
        setAlgorithmStatus(prev => ({
          ...prev,
          GA: { 
            ...prev.GA, 
            details: { 
              ...prev.GA.details, 
              fitness: fitnessMatch[1] 
            } 
          }
        }));
      }
    }
    
    // Extract constraint info for CO
    if (currentAlgorithm === "CO") {
      const constraintsMatch = message.match(/Constraints: (\d+)/);
      const violatedMatch = message.match(/Violated: (\d+)/);
      
      if (constraintsMatch) {
        setAlgorithmStatus(prev => ({
          ...prev,
          CO: { 
            ...prev.CO, 
            details: { 
              ...prev.CO.details, 
              constraints: constraintsMatch[1] 
            } 
          }
        }));
      }
      
      if (violatedMatch) {
        setAlgorithmStatus(prev => ({
          ...prev,
          CO: { 
            ...prev.CO, 
            details: { 
              ...prev.CO.details, 
              violated: violatedMatch[1] 
            } 
          }
        }));
      }
    }
    
    // Extract training info for RL
    if (currentAlgorithm === "RL") {
      const episodesMatch = message.match(/Episodes: (\d+)/);
      const rewardMatch = message.match(/Reward: ([\d.]+)/);
      
      if (episodesMatch) {
        setAlgorithmStatus(prev => ({
          ...prev,
          RL: { 
            ...prev.RL, 
            details: { 
              ...prev.RL.details, 
              episodes: episodesMatch[1] 
            } 
          }
        }));
      }
      
      if (rewardMatch) {
        setAlgorithmStatus(prev => ({
          ...prev,
          RL: { 
            ...prev.RL, 
            details: { 
              ...prev.RL.details, 
              reward: rewardMatch[1] 
            } 
          }
        }));
      }
    }
  };

  useEffect(() => {
    let eventSource;
    
    if (generating && !algoComplete) {
      console.log(" Connecting to SSE stream...");
      
      // Force notification state to false when generation starts
      setNotificationShown(false);
      
      // Reset algorithm status
      setAlgorithmStatus({
        GA: { status: 'pending', details: {} },
        CO: { status: 'pending', details: {} },
        RL: { status: 'pending', details: {} },
      });
      
      eventSource = new EventSource("http://localhost:8000/api/v1/timetable/progress-stream");
      
      eventSource.onopen = () => {
        console.log(" SSE connection opened");
      };
      
      eventSource.onerror = (error) => {
        console.error(" SSE connection error:", error);
        
        // Close and retry connection if there's an error
        if (eventSource) {
          eventSource.close();
          console.log(" Retrying SSE connection in 2 seconds...");
          setTimeout(() => {
            if (generating && !algoComplete) {
              eventSource = new EventSource("http://localhost:8000/api/v1/timetable/progress-stream");
            }
          }, 2000);
        }
      };
      
      eventSource.onmessage = (event) => {
        console.log(" SSE message received:", event.data);
        try {
          const log = JSON.parse(event.data);
          
          // Process the log message to extract useful information
          if (log.message) {
            processLogMessage(log.message);
          }
          
          // Filter out unnecessary logs
          if (
            !log.message.includes("HTTP/1.1") && 
            !log.message.includes("127.0.0.1") &&
            !log.message.includes("INFO:") &&
            !log.message.includes("--------------------------------------------------")
          ) {
            setProgressLogs(prev => [...prev, log]);
          }
          
          // Only show completion notification when we get the final success message
          // Updated to match the new format from the backend
          if (log.message && 
              log.message.includes("Schedule generated successfully with")) {
            console.log(" Timetable generation completed successfully!");
            setAlgoComplete(true);
            
            // Important: Use the Redux action to set generating to false
            dispatch(setGenerating(false));
            
            // Extract which algorithms succeeded
            const numSuccess = log.message.match(/with (\d+) of 3 algorithms/);
            const numSuccessful = numSuccess ? numSuccess[1] : "at least one";
            
            // Different notification based on how many algorithms succeeded
            notification.success({
              message: 'Timetable Generation Complete',
              description: `${numSuccessful} of 3 algorithms successfully generated timetables. Switch to the View tab to see the results.`,
              duration: 8,
            });
            
            setNotificationShown(true);
            eventSource.close();
          }
        } catch (error) {
          console.error("Error processing SSE message:", error);
        }
      };
    }
    
    return () => {
      if (eventSource) {
        console.log(" Closing SSE connection");
        eventSource.close();
      }
    };
  }, [generating, algoComplete, dispatch]);
  
  const genTimetable = () => {
    console.log(" Starting timetable generation");
    setNotificationShown(false);
    setAlgoComplete(false);
    setProgressLogs([]);
    setCurrentAlgorithm(null);
    dispatch(generateTimetable());
  };

  const targetText = "Generating Timetable...";
  const randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const [displayedText, setDisplayedText] = useState(
    Array(targetText.length).fill(" ")
  );
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

  useEffect(() => {
    // Only show notification when algo is actually complete (from SSE stream)
    // Not just when generating state changes
    if (prevGenerating && !generating) {
      console.log(" Generation state changed from true to false");
      
      // Reset animation state
      setCurrentLetterIndex(0);
      setDisplayedText(Array(targetText.length).fill(" "));
    }
    
    // Update previous generating state
    setPrevGenerating(generating);
  }, [generating, prevGenerating, targetText]);

  // Keep the existing animation effect
  useEffect(() => {
    if (!generating) return; // Don't run animation if not generating
    
    // If we've reached the end, start over
    if (currentLetterIndex >= targetText.length) {
      setCurrentLetterIndex(0);
      return;
    }
    
    // Random character animation timer
    const timer = setInterval(() => {
      const newText = [...displayedText];
      
      if (currentLetterIndex < targetText.length) {
        // Generate random character
        newText[currentLetterIndex] = randomChars.charAt(
          Math.floor(Math.random() * randomChars.length)
        );
        setDisplayedText(newText);
      }
    }, 50);
    
    // Timer to advance to next letter
    const finalizeTimer = setTimeout(() => {
      const newText = [...displayedText];
      if (currentLetterIndex < targetText.length) {
        newText[currentLetterIndex] = targetText[currentLetterIndex];
        setDisplayedText(newText);
        setCurrentLetterIndex(currentLetterIndex + 1);
      }
    }, 500);
    
    return () => {
      clearInterval(timer);
      clearTimeout(finalizeTimer);
    };
  }, [currentLetterIndex, generating, randomChars, targetText]);

  // Get status icon for an algorithm
  const getStatusIcon = (status) => {
    switch(status) {
      case 'success':
        return <CheckCircleFilled style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleFilled style={{ color: '#f5222d' }} />;
      case 'running':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleFilled style={{ color: '#8c8c8c' }} />;
    }
  };

  // Get color for log message
  const getLogColor = (message) => {
    if (message.includes("ERROR") || message.includes("failed")) {
      return "#f5222d"; // Red for errors
    } else if (message.includes("WARNING")) {
      return "#faad14"; // Yellow for warnings
    } else if (message.includes("success") || message.includes("complete")) {
      return "#52c41a"; // Green for success
    } else if (message.includes("Starting")) {
      return "#1890ff"; // Blue for starting
    } else {
      return "#d9d9d9"; // Default gray
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl max-w-4xl mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gold-dark">
        Timetable Generator
      </h2>
      
      {!generating && (
        <Button className="text-center" onClick={genTimetable}>
          Generate
        </Button>
      )}
      
      {generating && (
        <>
          <div
            className="animate-pulse font-mono text-lg mb-6"
            style={{ minHeight: "1.5rem" }}
          >
            {displayedText.join("")}
          </div>
          
          {/* Algorithm Status Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(algorithmStatus).map(([algo, data]) => (
              <div 
                key={algo} 
                className="border rounded-lg p-3 text-left"
                style={{ 
                  borderColor: 
                    data.status === 'success' ? '#52c41a' : 
                    data.status === 'failed' ? '#f5222d' : 
                    data.status === 'running' ? '#1890ff' : '#d9d9d9'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{algo} Algorithm</span>
                  {getStatusIcon(data.status)}
                </div>
                
                <div className="text-xs">
                  {Object.entries(data.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Terminal-like Log Display */}
          <div 
            ref={logContainerRef}
            className="mt-4 max-h-60 overflow-y-auto bg-gray-900 p-3 text-left rounded-lg font-mono text-xs"
            style={{ 
              height: '300px', 
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
              color: '#f0f0f0'
            }}
          >
            <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
              <span className="text-gray-400">Timetable Generation Logs</span>
              <span className="text-gray-400 text-xs">
                {currentAlgorithm ? `Running: ${currentAlgorithm}` : 'Initializing...'}
              </span>
            </div>
            
            {progressLogs.length === 0 ? (
              <div className="text-gray-500 italic">Waiting for progress updates...</div>
            ) : (
              progressLogs.map((log, index) => (
                <div 
                  key={index} 
                  style={{ 
                    color: getLogColor(log.message),
                    marginBottom: '4px',
                    fontFamily: 'monospace'
                  }}
                >
                  <span style={{ color: '#888' }}>
                    {new Date().toLocaleTimeString()} &gt;
                  </span>{' '}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
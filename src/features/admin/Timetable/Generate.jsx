import React, { useState, useEffect, useRef } from "react";
import { Button, Spin, notification, Progress } from "antd";
import { LoadingOutlined, CheckCircleFilled, CloseCircleFilled, InfoCircleFilled } from "@ant-design/icons";
import { generateTimetable, setNotificationRead, checkGenerationStatus } from "./timetable.api";
import { useDispatch, useSelector } from "react-redux";
import { setGenerating, setGenerationCompleted } from "./timetable.slice";

export default function Generate() {
  const { generating, generationStatus } = useSelector((state) => state.timetable);
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
  
  // Check status on component mount
  useEffect(() => {
    console.log("Component mounted, checking generation status");
    dispatch(checkGenerationStatus());
  }, [dispatch]);

  // Process log message to extract useful information
  const processLogMessage = (message) => {
    console.log("Processing log message:", message);
    
    // Check for algorithm start
    if (message.includes("Starting genetic algorithm") || message.includes("Starting Genetic Algorithm")) {
      setCurrentAlgorithm("GA");
      setAlgorithmStatus(prev => ({
        ...prev,
        GA: { ...prev.GA, status: 'running' }
      }));
    } else if (message.includes("Starting constraint optimization") || message.includes("Starting Constraint Optimization")) {
      setCurrentAlgorithm("CO");
      setAlgorithmStatus(prev => ({
        ...prev,
        CO: { ...prev.CO, status: 'running' }
      }));
    } else if (message.includes("Starting reinforcement learning") || message.includes("Starting Reinforcement Learning")) {
      setCurrentAlgorithm("RL");
      setAlgorithmStatus(prev => ({
        ...prev,
        RL: { ...prev.RL, status: 'running' }
      }));
    }
    
    // Check for algorithm completion - more flexible pattern matching
    if (message.includes("GA algorithm completed successfully") || message.includes("GA algorithm completed")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        GA: { ...prev.GA, status: 'success' }
      }));
    } else if (message.includes("GA algorithm failed") || message.includes("GA algorithm completed with no result")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        GA: { ...prev.GA, status: 'failed' }
      }));
    } else if (message.includes("CO algorithm completed successfully") || message.includes("CO algorithm completed")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        CO: { ...prev.CO, status: 'success' }
      }));
    } else if (message.includes("CO algorithm failed") || message.includes("CO algorithm completed with no result")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        CO: { ...prev.CO, status: 'failed' }
      }));
    } else if (message.includes("RL algorithm completed successfully") || message.includes("RL algorithm completed")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        RL: { ...prev.RL, status: 'success' }
      }));
    } else if (message.includes("RL algorithm failed") || message.includes("RL algorithm completed with no result")) {
      setAlgorithmStatus(prev => ({
        ...prev,
        RL: { ...prev.RL, status: 'failed' }
      }));
    }
    
    // Additional check for final completion message
    if (message.includes("Schedule generated successfully with") && message.includes("of 3 algorithms")) {
      // Extract success count from the message
      const successMatch = message.match(/(\d+) of 3 algorithms/);
      if (successMatch) {
        const successCount = parseInt(successMatch[1]);
        
        // Mark algorithms as completed based on the final message
        setAlgorithmStatus(prev => {
          const newStatus = { ...prev };
          let successfulAlgos = 0;
          
          // Count how many are already marked as successful
          Object.keys(newStatus).forEach(algo => {
            if (newStatus[algo].status === 'success') {
              successfulAlgos++;
            }
          });
          
          // If we have fewer successful than reported, mark remaining as successful
          if (successfulAlgos < successCount) {
            Object.keys(newStatus).forEach(algo => {
              if (newStatus[algo].status === 'running' && successfulAlgos < successCount) {
                newStatus[algo].status = 'success';
                successfulAlgos++;
              }
            });
          }
          
          // Mark any remaining running algorithms as failed
          Object.keys(newStatus).forEach(algo => {
            if (newStatus[algo].status === 'running') {
              newStatus[algo].status = 'failed';
            }
          });
          
          return newStatus;
        });
      }
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

  // Poll for generation status
  useEffect(() => {
    let pollingInterval = null;
    
    if (generating && !algoComplete) {
      console.log("Starting polling for generation status...");
      
      // Force notification state to false when generation starts
      setNotificationShown(false);
      
      // Reset algorithm status
      setAlgorithmStatus({
        GA: { status: 'pending', details: {} },
        CO: { status: 'pending', details: {} },
        RL: { status: 'pending', details: {} },
      });
      
      // Check status immediately
      dispatch(checkGenerationStatus());
      
      // Then poll for updates every 2 seconds
      pollingInterval = setInterval(() => {
        dispatch(checkGenerationStatus());
      }, 2000);
    }
    
    return () => {
      if (pollingInterval) {
        console.log("Stopping generation status polling");
        clearInterval(pollingInterval);
      }
    };
  }, [generating, algoComplete, dispatch]);

  // Process generation status updates
  useEffect(() => {
    if (generationStatus) {
      console.log("Generation status update:", generationStatus);
      console.log("Current algorithm statuses:", algorithmStatus);
      
      // Process logs if they exist (only when generating)
      if (generating && generationStatus.logs && generationStatus.logs.length > 0) {
        // Filter out logs we've already seen
        const currentLogMessages = progressLogs.map(log => log.message);
        const newLogs = generationStatus.logs.filter(
          log => !currentLogMessages.includes(log.message)
        );
        
        if (newLogs.length > 0) {
          // Process each new log message
          newLogs.forEach(log => {
            if (log.message) {
              processLogMessage(log.message);
            }
          });
          
          // Add new logs to our state
          setProgressLogs(prev => [...prev, ...newLogs]);
        }
      } else if (generating && generationStatus.last_log) {
        // Handle single log message (fallback, only when generating)
        const currentLogMessages = progressLogs.map(log => log.message);
        if (!currentLogMessages.includes(generationStatus.last_log)) {
          const logEntry = {
            message: generationStatus.last_log,
            timestamp: new Date().toISOString()
          };
          processLogMessage(generationStatus.last_log);
          setProgressLogs(prev => [...prev, logEntry]);
        }
      }
      
      // Handle completed generation regardless of generating state
      if (generationStatus.completed && generationStatus.success_count > 0) {
        console.log("Processing completed generation with", generationStatus.success_count, "successful algorithms");
        
        // Process all logs to update algorithm statuses
        if (generationStatus.logs && generationStatus.logs.length > 0) {
          generationStatus.logs.forEach(log => {
            if (log.message) {
              processLogMessage(log.message);
            }
          });
        }
      }
      
      // Check if generation is completed
      if (generationStatus.completed) {
        console.log("Timetable generation completed!");
        setAlgoComplete(true);
        
        // Mark all algorithms as completed based on success count
        const successCount = generationStatus.success_count || 0;
        const algorithmsCompleted = generationStatus.algorithms_completed || 0;
        
        // Update algorithm statuses based on completion
        setAlgorithmStatus(prev => {
          const newStatus = { ...prev };
          
          // If we have 3 algorithms completed, mark them appropriately
          if (algorithmsCompleted >= 3) {
            // Mark all as success if we have successful results
            if (successCount >= 1) {
              Object.keys(newStatus).forEach(algo => {
                if (newStatus[algo].status === 'running' || newStatus[algo].status === 'pending') {
                  newStatus[algo].status = 'success';
                }
              });
            }
          }
          
          return newStatus;
        });
        
        // Important: Use the Redux action to set generating to false
        dispatch(setGenerating(false));
        dispatch(setGenerationCompleted(true));
        
        // Only show notification if not already shown
        if (!NotificationShown) {
          // Extract which algorithms succeeded
          const numSuccess = generationStatus.success_count;
          
          // Different notification based on how many algorithms succeeded
          notification.success({
            message: 'Timetable Generation Complete',
            description: `${numSuccess} of 3 algorithms successfully generated timetables. Switch to the View tab to see the results.`,
            duration: 8,
          });
          
          setNotificationShown(true);
        }
      }
      
      // Additional safety check: if generation is complete but some algorithms are still running
      if (generationStatus.completed && !algoComplete) {
        console.log("Generation marked as complete, forcing algorithm status update");
        const successCount = generationStatus.success_count || 0;
        
        setAlgorithmStatus(prev => {
          const newStatus = { ...prev };
          let markedAsSuccess = 0;
          
          // Mark algorithms as successful up to the success count
          Object.keys(newStatus).forEach(algo => {
            if (newStatus[algo].status === 'running' && markedAsSuccess < successCount) {
              newStatus[algo].status = 'success';
              markedAsSuccess++;
            } else if (newStatus[algo].status === 'running') {
              newStatus[algo].status = 'failed';
            }
          });
          
          return newStatus;
        });
      }
    }
  }, [generationStatus, generating, dispatch, progressLogs, NotificationShown, algoComplete, algorithmStatus]);
  
  const genTimetable = () => {
    console.log("Starting timetable generation");
    setProgressLogs([]);
    setAlgoComplete(false);
    setCurrentAlgorithm(null);
    setNotificationShown(false);
    
    // Reset algorithm status
    setAlgorithmStatus({
      GA: { status: 'pending', details: {} },
      CO: { status: 'pending', details: {} },
      RL: { status: 'pending', details: {} },
    });
    
    dispatch(setGenerating(true));
    dispatch(generateTimetable());
  };
  
  // Manual refresh function to check current status
  const refreshStatus = () => {
    console.log("Manually refreshing generation status");
    dispatch(checkGenerationStatus());
  };
  
  // Track state changes to reset the progress when starting a new generation
  useEffect(() => {
    if (generating !== prevGenerating) {
      setPrevGenerating(generating);
      if (generating) {
        // Reset everything when generation starts
        setProgressLogs([]);
        setAlgoComplete(false);
        setCurrentAlgorithm(null);
      }
    }
  }, [generating, prevGenerating]);
  
  return (
    <div>
      <div className="p-4 bg-gray-100 rounded-lg shadow-md mt-4">
        <h2 className="text-xl font-bold mb-2">Timetable Generation</h2>
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700">
            Click the button below to start generating timetables using multiple algorithms.
          </p>
          
          {/* Generate button */}
          <div className="flex gap-2">
            <Button
              type="primary"
              onClick={genTimetable}
              disabled={generating && !algoComplete}
              style={{ 
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                color: 'white'
              }}
              className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {generating && !algoComplete ? (
                <span className="flex items-center">
                  <LoadingOutlined className="mr-2" />
                  Generating...
                </span>
              ) : (
                "Generate Timetable"
              )}
            </Button>
            
            {generating && (
              <Button
                onClick={refreshStatus}
                style={{ 
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  color: 'white'
                }}
              >
                Refresh Status
              </Button>
            )}
          </div>
        </div>
        
        {/* Algorithm statuses */}
        <div className="mb-4 flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-4">
            {/* Genetic Algorithm Status */}
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <span className="font-semibold mr-2">Genetic Algorithm</span>
                {algorithmStatus.GA.status === 'success' && (
                  <CheckCircleFilled style={{ color: '#52c41a' }} />
                )}
                {algorithmStatus.GA.status === 'failed' && (
                  <CloseCircleFilled style={{ color: '#f5222d' }} />
                )}
                {algorithmStatus.GA.status === 'running' && (
                  <Spin size="small" />
                )}
                {algorithmStatus.GA.status === 'pending' && (
                  <InfoCircleFilled style={{ color: '#1890ff' }} />
                )}
              </div>
              {(algorithmStatus.GA.status === 'running' || algorithmStatus.GA.status === 'success') && (
                <div className="text-sm text-gray-600">
                  {algorithmStatus.GA.details.population && (
                    <div>Population: {algorithmStatus.GA.details.population}</div>
                  )}
                  {algorithmStatus.GA.details.iterations && (
                    <div>Iterations: {algorithmStatus.GA.details.iterations}</div>
                  )}
                  {algorithmStatus.GA.details.fitness && (
                    <div>Fitness: {algorithmStatus.GA.details.fitness}</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Colony Optimization Status */}
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <span className="font-semibold mr-2">Colony Optimization</span>
                {algorithmStatus.CO.status === 'success' && (
                  <CheckCircleFilled style={{ color: '#52c41a' }} />
                )}
                {algorithmStatus.CO.status === 'failed' && (
                  <CloseCircleFilled style={{ color: '#f5222d' }} />
                )}
                {algorithmStatus.CO.status === 'running' && (
                  <Spin size="small" />
                )}
                {algorithmStatus.CO.status === 'pending' && (
                  <InfoCircleFilled style={{ color: '#1890ff' }} />
                )}
              </div>
              {(algorithmStatus.CO.status === 'running' || algorithmStatus.CO.status === 'success') && (
                <div className="text-sm text-gray-600">
                  {algorithmStatus.CO.details.constraints && (
                    <div>Constraints: {algorithmStatus.CO.details.constraints}</div>
                  )}
                  {algorithmStatus.CO.details.violated && (
                    <div>Violated: {algorithmStatus.CO.details.violated}</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Reinforcement Learning Status */}
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <span className="font-semibold mr-2">Reinforcement Learning</span>
                {algorithmStatus.RL.status === 'success' && (
                  <CheckCircleFilled style={{ color: '#52c41a' }} />
                )}
                {algorithmStatus.RL.status === 'failed' && (
                  <CloseCircleFilled style={{ color: '#f5222d' }} />
                )}
                {algorithmStatus.RL.status === 'running' && (
                  <Spin size="small" />
                )}
                {algorithmStatus.RL.status === 'pending' && (
                  <InfoCircleFilled style={{ color: '#1890ff' }} />
                )}
              </div>
              {(algorithmStatus.RL.status === 'running' || algorithmStatus.RL.status === 'success') && (
                <div className="text-sm text-gray-600">
                  {algorithmStatus.RL.details.episodes && (
                    <div>Episodes: {algorithmStatus.RL.details.episodes}</div>
                  )}
                  {algorithmStatus.RL.details.reward && (
                    <div>Reward: {algorithmStatus.RL.details.reward}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Log display */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Progress Logs</h3>
          <div 
            ref={logContainerRef}
            className="bg-gray-800 text-white p-3 rounded-lg h-48 overflow-auto font-mono text-sm"
          >
            {progressLogs.length === 0 ? (
              <p className="text-gray-400">No logs yet. Start generating to see progress.</p>
            ) : (
              progressLogs.map((log, index) => (
                <div key={`log-${log.message ? log.message.substring(0, 20) : ''}-${index}`} className="mb-1">
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
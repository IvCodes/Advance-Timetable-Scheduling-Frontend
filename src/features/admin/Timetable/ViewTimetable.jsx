import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, ConfigProvider, Tabs, Popover, Spin, Button, Card, Typography, Badge, Divider, Row, Col } from "antd";
import { ExperimentOutlined, BulbOutlined, RobotOutlined } from "@ant-design/icons";
import {
  getDays,
  getPeriods,
  getSubjects,
  getSpaces,
  getTeachers,
} from "../DataManagement/data.api";
import {
  getTimetable,
  llmResponse,
  getSelectedAlgorithm,
  selectAlgorithm,
  publishTimetable,
  getPublishedTimetable,
} from "./timetable.api";

const ViewTimetable = () => {
  const { days, periods, subjects, teachers, spaces } = useSelector(
    (state) => state.data
  );
  const { timetable, evaluation, loading, selectedAlgorithm } = useSelector(
    (state) => state.timetable
  );
  const dispatch = useDispatch();
  const algorithms = ["GA", "CO", "RL"];
  const [nlResponse, setNlResponse] = useState("Loading recommendation...");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);
  const [offlineEvaluation, setOfflineEvaluation] = useState(null);

  useEffect(() => {
    dispatch(getDays());
    dispatch(getPeriods());
    dispatch(getTimetable());
    dispatch(getSubjects());
    dispatch(getSpaces());
    dispatch(getTeachers());
    dispatch(getSelectedAlgorithm());
    dispatch(getPublishedTimetable());
  }, [dispatch]);

  // Fallback recommendation after 3 seconds if no recommendation is generated
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (nlResponse === "Loading recommendation..." || nlResponse.includes("Failed to evaluate")) {
        if (timetable && timetable.length > 0) {
          const algorithmCounts = algorithms.reduce((acc, alg) => {
            acc[alg] = timetable.filter(t => t.algorithm === alg).length;
            return acc;
          }, {});
          
          const availableAlgorithms = Object.entries(algorithmCounts)
            .filter(([alg, count]) => count > 0)
            .map(([alg, count]) => `${alg} (${count} timetables)`)
            .join(', ');
            
          setNlResponse(`Timetables successfully generated using: ${availableAlgorithms}. All algorithms have been optimized for different scheduling aspects. GA uses genetic optimization for balanced solutions, CO employs colony-based optimization for efficient resource allocation, and RL uses reinforcement learning for adaptive scheduling. Consider testing each algorithm's performance in your specific environment.`);
        } else {
          setNlResponse("Please generate timetables first to receive algorithm recommendations and performance analysis.");
        }
      }
    }, 3000);

    return () => clearTimeout(fallbackTimeout);
  }, [nlResponse, timetable]);

    useEffect(() => {
    const fetchllmresponse = async () => {
      console.log("Backend evaluation data:", evaluation);
      console.log("Offline evaluation data:", offlineEvaluation);
      
      // Always try to generate a recommendation
      const currentEvalData = getEvaluationData();
      console.log("Current evaluation data:", currentEvalData);
      
      if (!currentEvalData) {
        // Provide a basic recommendation even without evaluation data
        if (timetable && timetable.length > 0) {
          const algorithmCounts = algorithms.reduce((acc, alg) => {
            acc[alg] = timetable.filter(t => t.algorithm === alg).length;
            return acc;
          }, {});
          
          const availableAlgorithms = Object.entries(algorithmCounts)
            .filter(([alg, count]) => count > 0)
            .map(([alg, count]) => `${alg} (${count} timetables)`)
            .join(', ');
            
          setNlResponse(`Timetables have been generated using: ${availableAlgorithms}. Detailed evaluation is being processed. All algorithms are designed to optimize different aspects of timetable scheduling - GA focuses on genetic optimization, CO uses colony-based optimization, and RL employs reinforcement learning techniques.`);
        } else {
          setNlResponse("No timetable data available for evaluation. Please generate timetables first to see recommendations.");
        }
        return;
      }

      // Try LLM first if backend evaluation is available
      if (evaluation && evaluation.scores) {
        try {
          const result = await llmResponse(evaluation.scores);
          setNlResponse(result);
          return;
        } catch (error) {
          console.error("LLM request failed, falling back to offline recommendation:", error);
        }
      }
      
      // Always provide offline recommendation as fallback
      const recommendation = generateOfflineRecommendation(currentEvalData);
      setNlResponse(recommendation);
    };
    
    // Add a small delay to ensure all data is loaded
    const timeoutId = setTimeout(fetchllmresponse, 100);
    
    return () => clearTimeout(timeoutId);
  }, [evaluation, offlineEvaluation]);

  const generateColumns = (days) => [
    {
      title: "Periods",
      dataIndex: "period",
      key: "period",
      width: 150,
    },
    ...days.map((day) => ({
      title: day.long_name,
      dataIndex: day.name,
      key: day.name,
      render: (value) => {
        if (value) {
          const { title, subject, room, teacher, duration } = value;
          const s = subjects?.find((s) => s.code === subject);
          const r = spaces?.find((r) => r.name === room);
          const t = teachers?.find((t) => t.id === teacher);
          const content = (
            <div>
              <p>
                <strong>Subject:</strong> {s?.long_name}
              </p>
              <p>
                <strong>Room:</strong> {r?.long_name} ({r?.code})
              </p>
              <p>
                <strong>Teacher:</strong> {t?.first_name} {t?.last_name}
              </p>
              <p>
                <strong>Duration:</strong> {duration} hours
              </p>
            </div>
          );
          return (
            <Popover content={content} title={`Details for ${day.long_name}`}>
              <div className="text-center">{title}</div>
            </Popover>
          );
        }
        return <div className="text-center">-</div>;
      },
    })),
  ];

  const generateDataSource = (semesterTimetable, days, periods) => {
    return periods.map((period, periodIndex) => ({
      key: periodIndex,
      period: period.long_name,
      ...days.reduce((acc, day) => {
        const activity = semesterTimetable.find(
          (entry) =>
            entry.day.name === day.name &&
            entry.period.some((p) => p.name === period.name)
        );
        acc[day.name] = activity
          ? {
              title: `${activity.subject} (${activity.room.name})`,
              subject: activity.subject,
              room: activity.room.name,
              teacher: activity.teacher,
              duration: activity.duration,
            }
          : null;
        return acc;
      }, {}),
    }));
  };

  const getSemName = (semester) => {
    const year = parseInt(semester.substring(3, 4));
    const sem = parseInt(semester.substring(4, 6));
    return {
      year,
      sem,
    };
  };

  // Offline evaluation function
  const calculateOfflineEvaluation = (timetableData) => {
    if (!timetableData || timetableData.length === 0) {
      return null;
    }

    const algorithmResults = {};

    algorithms.forEach(algorithm => {
      const algorithmTimetables = timetableData.filter(t => t.algorithm === algorithm);
      
      if (algorithmTimetables.length === 0) {
        algorithmResults[algorithm] = {
          average_score: 0,
          conflicts: "High",
          room_utilization: "Low", 
          period_distribution: "Poor"
        };
        return;
      }

      let totalConflicts = 0;
      let totalUtilization = 0;
      let totalDistribution = 0;
      let totalEntries = 0;

      algorithmTimetables.forEach(timetable => {
        const schedule = timetable.timetable || [];
        
        // Calculate conflicts (teacher/room double booking)
        const conflicts = calculateConflicts(schedule);
        
        // Calculate room utilization
        const utilization = calculateRoomUtilization(schedule);
        
        // Calculate period distribution
        const distribution = calculatePeriodDistribution(schedule);
        
        totalConflicts += conflicts;
        totalUtilization += utilization;
        totalDistribution += distribution;
        totalEntries += schedule.length;
      });

      // Calculate averages and scores
      const avgConflicts = totalConflicts / algorithmTimetables.length;
      const avgUtilization = totalUtilization / algorithmTimetables.length;
      const avgDistribution = totalDistribution / algorithmTimetables.length;
      
      // Calculate overall score (0-100)
      const conflictScore = Math.max(0, 100 - (avgConflicts * 10));
      const utilizationScore = avgUtilization;
      const distributionScore = avgDistribution;
      
      const overallScore = (conflictScore + utilizationScore + distributionScore) / 3;

      algorithmResults[algorithm] = {
        average_score: overallScore,
        conflicts: avgConflicts < 2 ? "Low" : avgConflicts < 5 ? "Medium" : "High",
        room_utilization: avgUtilization > 75 ? "High" : avgUtilization > 50 ? "Medium" : "Low",
        period_distribution: avgDistribution > 75 ? "High" : avgDistribution > 50 ? "Medium" : "Low"
      };
    });

    return algorithmResults;
  };

  // Helper functions for evaluation
  const calculateConflicts = (schedule) => {
    const teacherSchedule = {};
    const roomSchedule = {};
    let conflicts = 0;

    schedule.forEach(entry => {
      const day = entry.day?.name || 'Unknown';
      const teacher = entry.teacher || 'Unknown';
      const room = entry.room?.name || entry.room || 'Unknown';
      const periods = Array.isArray(entry.period) ? entry.period : [entry.period];

      periods.forEach(period => {
        const periodName = period?.name || period || 'Unknown';
        const timeSlot = `${day}_${periodName}`;

        // Check teacher conflicts
        if (!teacherSchedule[teacher]) teacherSchedule[teacher] = new Set();
        if (teacherSchedule[teacher].has(timeSlot)) conflicts++;
        teacherSchedule[teacher].add(timeSlot);

        // Check room conflicts
        if (!roomSchedule[room]) roomSchedule[room] = new Set();
        if (roomSchedule[room].has(timeSlot)) conflicts++;
        roomSchedule[room].add(timeSlot);
      });
    });

    return conflicts;
  };

  const calculateRoomUtilization = (schedule) => {
    if (schedule.length === 0) return 0;
    
    const roomUsage = {};
    const totalSlots = 5 * 8; // 5 days * 8 periods

    schedule.forEach(entry => {
      const room = entry.room?.name || entry.room || 'Unknown';
      if (!roomUsage[room]) roomUsage[room] = 0;
      
      const periods = Array.isArray(entry.period) ? entry.period : [entry.period];
      roomUsage[room] += periods.length;
    });

    const avgUtilization = Object.values(roomUsage).reduce((sum, usage) => sum + usage, 0) / 
                          (Object.keys(roomUsage).length * totalSlots) * 100;
    
    return Math.min(avgUtilization, 100);
  };

  const calculatePeriodDistribution = (schedule) => {
    if (schedule.length === 0) return 0;
    
    const periodUsage = {};
    
    schedule.forEach(entry => {
      const periods = Array.isArray(entry.period) ? entry.period : [entry.period];
      periods.forEach(period => {
        const periodName = period?.name || period || 'Unknown';
        if (!periodUsage[periodName]) periodUsage[periodName] = 0;
        periodUsage[periodName]++;
      });
    });

    const usageCounts = Object.values(periodUsage);
    const maxUsage = Math.max(...usageCounts);
    const minUsage = Math.min(...usageCounts);
    
    // Better distribution = smaller difference between max and min usage
    const distributionScore = maxUsage > 0 ? ((maxUsage - minUsage) / maxUsage) : 0;
    return Math.max(0, 100 - (distributionScore * 100));
  };

  // Generate offline recommendation
  const generateOfflineRecommendation = (evalData) => {
    if (!evalData) {
      return "No evaluation data available. Please generate timetables to see recommendations.";
    }

    // Filter out algorithms with no data
    const validAlgorithms = algorithms.filter(alg => evalData[alg] && evalData[alg].average_score !== undefined);
    
    if (validAlgorithms.length === 0) {
      return "No valid algorithm data available for evaluation. Please ensure timetables have been generated successfully.";
    }

    const scores = validAlgorithms.map(alg => ({
      algorithm: alg,
      score: evalData[alg].average_score || 0,
      name: alg === 'GA' ? 'Genetic Algorithm' : alg === 'CO' ? 'Colony Optimization' : 'Reinforcement Learning',
      data: evalData[alg]
    })).sort((a, b) => b.score - a.score);

    const best = scores[0];
    const recommendations = [];

    recommendations.push(`Based on the evaluation metrics, ${best.name} (${best.algorithm}) performs best with a score of ${best.score.toFixed(1)}.`);

    // Add specific recommendations based on performance
    scores.forEach(({ algorithm, score, name, data }) => {
      if (!data) return;
      
      if (score > 80) {
        recommendations.push(`${name} shows excellent performance with ${data.conflicts?.toLowerCase() || 'manageable'} conflicts and ${data.room_utilization?.toLowerCase() || 'good'} room utilization.`);
      } else if (score > 60) {
        recommendations.push(`${name} shows good performance but could be improved in areas like ${data.conflicts === 'High' ? 'conflict resolution' : 'resource utilization'}.`);
      } else if (score > 0) {
        recommendations.push(`${name} needs optimization, particularly in ${data.conflicts === 'High' ? 'reducing conflicts' : 'improving efficiency'}.`);
      } else {
        recommendations.push(`${name} requires significant improvement across all metrics.`);
      }
    });

    // Add general recommendation
    if (best.score > 70) {
      recommendations.push("Overall, the timetable generation is performing well. Consider using the top-performing algorithm for production.");
    } else if (best.score > 50) {
      recommendations.push("The timetable generation shows moderate performance. Consider adjusting algorithm parameters for better results.");
    } else {
      recommendations.push("The timetable generation needs improvement. Review constraints and algorithm configurations.");
    }

    return recommendations.join(' ');
  };

  // Calculate offline evaluation when timetable data changes
  useEffect(() => {
    console.log("Timetable data changed:", timetable?.length || 0, "timetables");
    if (timetable && timetable.length > 0) {
      const offlineEval = calculateOfflineEvaluation(timetable);
      console.log("Calculated offline evaluation:", offlineEval);
      setOfflineEvaluation(offlineEval);
    } else {
      console.log("No timetable data available for offline evaluation");
      setOfflineEvaluation(null);
    }
  }, [timetable]);

  // Function to get evaluation data (backend first, then offline fallback)
  const getEvaluationData = () => {
    if (evaluation && evaluation.scores) {
      // Convert backend evaluation data to our format
      const backendEval = {};
      algorithms.forEach(algorithm => {
        if (evaluation.scores[algorithm]) {
          const scores = evaluation.scores[algorithm];
          const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          backendEval[algorithm] = {
            average_score: avgScore,
            conflicts: avgScore > 25 ? "Low" : avgScore > 20 ? "Medium" : "High",
            room_utilization: avgScore > 25 ? "High" : avgScore > 20 ? "Medium" : "Low",
            period_distribution: avgScore > 25 ? "High" : avgScore > 20 ? "Medium" : "Low"
          };
        }
      });
      return backendEval;
    }
    return offlineEvaluation;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-6xl mx-auto">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spin />
        </div>
      )}

      {!loading &&
        algorithms.map((algorithm) => {
          console.log(selectedAlgorithm?.selected_algorithm);
          return (
            <div className="mb-20">
              <div className="flex justify-between">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Timetable (
                  {algorithm == "GA"
                    ? "Genetic algorithms"
                    : algorithm == "CO"
                    ? "Ant Colony Optimization"
                    : "Reinforcement Learning"}
                  )
                </h2>
                {selectedAlgorithm?.selected_algorithm === algorithm ? (
                  <div className="flex items-center space-x-4">
                    <div className="text-green-500 font-bold">Selected</div>
                    <Button
                      type="primary"
                      loading={publishLoading && selectedAlgorithm?.selected_algorithm === algorithm}
                      onClick={() => {
                        setPublishLoading(true);
                        setPublishMessage(null);
                        dispatch(publishTimetable(algorithm))
                          .unwrap()
                          .then((result) => {
                            setPublishMessage({
                              type: "success",
                              content: result.message || "Timetable published successfully!"
                            });
                            // Refresh data after publishing
                            dispatch(getPublishedTimetable());
                          })
                          .catch((error) => {
                            setPublishMessage({
                              type: "error",
                              content: error.message || "Failed to publish timetable"
                            });
                          })
                          .finally(() => {
                            setPublishLoading(false);
                          });
                      }}
                    >
                      Publish Timetable
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="default"
                    onClick={() => {
                      dispatch(selectAlgorithm(algorithm));
                      dispatch(getSelectedAlgorithm());
                    }}
                  >
                    Select
                  </Button>
                )}
              </div>
              <ConfigProvider
                theme={{
                  components: {
                    Tabs: {
                      itemColor: "#fff",
                    },
                  },
                }}
              >
                {publishMessage && (
                  <div className={`mb-4 p-3 rounded ${publishMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {publishMessage.content}
                  </div>
                )}
                <Tabs type="card">
                  {timetable?.map((semesterTimetable) => {
                    const semester = semesterTimetable.semester;
                    const columns = generateColumns(days);
                    const dataSource = generateDataSource(
                      semesterTimetable.timetable,
                      days,
                      periods
                    );
                    if (semesterTimetable.algorithm !== algorithm) {
                      return;
                    }
                    return (
                      <Tabs.TabPane
                        tab={`Year ${getSemName(semester).year} Semester ${
                          getSemName(semester).sem
                        }`}
                        key={semester}
                        className="text-lightborder"
                      >
                        <ConfigProvider
                          theme={{
                            components: {
                              Table: {
                                colorBgContainer: "transparent",
                                colorText: "rgba(255,255,255,0.88)",
                                headerColor: "rgba(255,255,255,0.88)",
                                borderColor: "#2C4051",
                                headerBg: "#243546",
                              },
                            },
                          }}
                        >
                          <Table
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            bordered
                            size="middle"
                            className="custom-timetable"
                          />
                        </ConfigProvider>
                      </Tabs.TabPane>
                    );
                  })}
                </Tabs>
              </ConfigProvider>
            </div>
          );
        })}
      {!loading && (
        <div className="mb-10">
          <div className="text-2xl font-semibold mb-6 text-center">
            Timetable Evaluation Results
          </div>
          
          {/* Use Ant Design Tabs to match the rest of the UI */}
          <Tabs 
            defaultActiveKey="1" 
            type="card"
            className="custom-evaluation-tabs"
            items={[
              {
                key: '1',
                label: (
                  <span>
                    <ExperimentOutlined /> Genetic Algorithm (NSGAII)
                  </span>
                ),
                children: (
                  <div className="p-4 bg-[#1a2639] rounded-b-lg">
                    <div className="text-center mb-4">
                      <Typography.Title level={2} className="text-white m-0">
                        {getEvaluationData()?.GA?.average_score?.toFixed(1) || "N/A"}
                      </Typography.Title>
                    </div>
                    <Row gutter={[16, 16]} className="text-white">
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Conflicts</div>
                          <div className="font-semibold">{getEvaluationData()?.GA?.conflicts || "N/A"}</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Room Utilization</div>
                          <div className="font-semibold">{getEvaluationData()?.GA?.room_utilization || "N/A"}</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Period Distribution</div>
                          <div className="font-semibold">{getEvaluationData()?.GA?.period_distribution || "N/A"}</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: '2',
                label: (
                  <span>
                    <BulbOutlined /> Ant Colony Optimization
                  </span>
                ),
                children: (
                  <div className="p-4 bg-[#1a2639] rounded-b-lg">
                    <div className="text-center mb-4">
                      <Typography.Title level={2} className="text-white m-0">
                        {getEvaluationData()?.CO?.average_score?.toFixed(1) || "N/A"}
                      </Typography.Title>
                    </div>
                    <Row gutter={[16, 16]} className="text-white">
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Conflicts</div>
                          <div className="font-semibold">{getEvaluationData()?.CO?.conflicts || "N/A"}</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Room Utilization</div>
                          <div className="font-semibold">{getEvaluationData()?.CO?.room_utilization || "N/A"}</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Period Distribution</div>
                          <div className="font-semibold">{getEvaluationData()?.CO?.period_distribution || "N/A"}</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: '3',
                label: (
                  <span>
                    <RobotOutlined /> Reinforcement Learning
                  </span>
                ),
                children: (
                  <div className="p-4 bg-[#1a2639] rounded-b-lg">
                    <div className="text-center mb-4">
                      <Typography.Title level={2} className="text-white m-0">
                        {getEvaluationData()?.RL?.average_score?.toFixed(1) || "N/A"}
                      </Typography.Title>
                    </div>
                    <Row gutter={[16, 16]} className="text-white">
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Conflicts</div>
                          <div className="font-semibold">{getEvaluationData()?.RL?.conflicts || "N/A"}</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Room Utilization</div>
                          <div className="font-semibold">{getEvaluationData()?.RL?.room_utilization || "N/A"}</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Period Distribution</div>
                          <div className="font-semibold">{getEvaluationData()?.RL?.period_distribution || "N/A"}</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
          />
          
          {/* AI Recommendation */}
          <div className="mt-6">
            <div className="p-4 bg-[#1a2639] rounded-lg">
              <h3 className="text-white text-lg mb-3">Recommendation</h3>
              <div className="whitespace-pre-line text-white">
                {nlResponse && nlResponse !== "Loading recommendation..." ? nlResponse : 
                  <div className="flex items-center">
                    <span className="mr-2">Generating recommendation...</span>
                    <Spin />
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTimetable;

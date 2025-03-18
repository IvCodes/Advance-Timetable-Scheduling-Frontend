import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Spin, Button, Card, Space, Row, Col, Tabs, Typography, Descriptions, Badge, Tag, Divider, Statistic, message, Tooltip } from "antd";
import { 
  FileTextOutlined, 
  BarChartOutlined, 
  CheckCircleOutlined, 
  ExperimentOutlined,
  ExportOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { getSliitTimetables, getTimetableHtmlUrl, getTimetableStats } from "./timetable.api";

const { Title, Text } = Typography;

const ViewSliitTimetable = () => {
  const dispatch = useDispatch();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch all SLIIT timetables
  useEffect(() => {
    const fetchTimetables = async () => {
      setLoading(true);
      try {
        const result = await dispatch(getSliitTimetables()).unwrap();
        setTimetables(result);
        
        // Select the first timetable by default if available
        if (result && result.length > 0) {
          setSelectedTimetable(result[0]);
          fetchTimetableStats(result[0]._id);
        }
      } catch (error) {
        console.error("Error fetching SLIIT timetables:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, [dispatch]);

  // Fetch statistics for a specific timetable
  const fetchTimetableStats = async (timetableId) => {
    if (!timetableId) return;
    
    setStatsLoading(true);
    try {
      const result = await dispatch(getTimetableStats(timetableId)).unwrap();
      setStats(result);
    } catch (error) {
      console.error(`Error fetching statistics for timetable with ID ${timetableId}:`, error);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  // Handler for selecting a timetable
  const handleTimetableSelect = (timetable) => {
    setSelectedTimetable(timetable);
    fetchTimetableStats(timetable._id);
  };

  // Format the algorithm name for display
  const formatAlgorithmName = (algorithm) => {
    switch (algorithm?.toLowerCase()) {
      case "nsga2":
        return "NSGA-II (Non-dominated Sorting Genetic Algorithm II)";
      case "spea2":
        return "SPEA2 (Strength Pareto Evolutionary Algorithm 2)";
      case "moead":
        return "MOEA/D (Multi-objective Evolutionary Algorithm Based on Decomposition)";
      default:
        return algorithm || "Unknown Algorithm";
    }
  };

  // Open timetable HTML in a new tab
  const viewTimetableHtml = (timetableId) => {
    if (!timetableId) return;
    
    const htmlUrl = getTimetableHtmlUrl(timetableId);
    window.open(htmlUrl, '_blank');
  };

  // View detailed statistics in TimetableView component
  const viewDetailedStats = (timetableId) => {
    if (!timetableId) return;
    
    // Instead of redirecting to a non-existent route, use the existing stats panel
    // Set the Tabs to show the metrics tab
    message.info("Statistics are already shown in the Metrics tab below");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-6xl mx-auto">
      <Title level={2}>SLIIT Timetables</Title>
      <Divider />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : timetables.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">No timetables available. Generate a timetable first.</Text>
          </div>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {/* Timetable List */}
          <Col xs={24} lg={8}>
            <Card title="Generated Timetables" bordered={false}>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {timetables.map((timetable) => (
                  <Card 
                    key={timetable._id} 
                    style={{ 
                      marginBottom: '10px',
                      borderLeft: selectedTimetable?._id === timetable._id ? '3px solid #1890ff' : 'none',
                      cursor: 'pointer'
                    }}
                    hoverable
                    onClick={() => handleTimetableSelect(timetable)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>{timetable.name}</Text>
                        <div>
                          <Tag color="blue">{timetable.algorithm}</Tag>
                          <Tag color="green">Pop: {timetable.parameters?.population || 'N/A'}</Tag>
                          <Tag color="purple">Gen: {timetable.parameters?.generations || 'N/A'}</Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {new Date(timetable.createdAt).toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </Col>

          {/* Timetable Details */}
          <Col xs={24} lg={16}>
            {selectedTimetable ? (
              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{selectedTimetable.name}</span>
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<ExportOutlined />}
                        onClick={() => viewTimetableHtml(selectedTimetable._id)}
                      >
                        View HTML Timetable
                      </Button>
                    </Space>
                  </div>
                }
                bordered={false}
              >
                <Tabs defaultActiveKey="overview">
                  <Tabs.TabPane tab={<span><FileTextOutlined /> Overview</span>} key="overview">
                    <Descriptions title="Timetable Information" bordered column={2}>
                      <Descriptions.Item label="Name">{selectedTimetable.name}</Descriptions.Item>
                      <Descriptions.Item label="Algorithm">
                        {formatAlgorithmName(selectedTimetable.algorithm)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Dataset">{selectedTimetable.dataset}</Descriptions.Item>
                      <Descriptions.Item label="Created At">
                        {new Date(selectedTimetable.createdAt).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Population Size">
                        {selectedTimetable.parameters?.population || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Number of Generations">
                        {selectedTimetable.parameters?.generations || 'N/A'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Tabs.TabPane>
                  
                  <Tabs.TabPane tab={<span><CheckCircleOutlined /> Metrics</span>} key="metrics">
                    {statsLoading ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin />
                        <div style={{ marginTop: '10px' }}>Loading metrics...</div>
                      </div>
                    ) : stats ? (
                      <div>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Card>
                              <Statistic
                                title={
                                  <span>
                                    Room Utilization 
                                    <Tooltip title="Percentage of room slots that are efficiently utilized">
                                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                    </Tooltip>
                                  </span>
                                }
                                value={stats.metrics?.room_utilization?.toFixed(2) || "N/A"}
                                suffix="%"
                                precision={2}
                              />
                            </Card>
                          </Col>
                          <Col span={12}>
                            <Card>
                              <Statistic
                                title={
                                  <span>
                                    Teacher Satisfaction
                                    <Tooltip title="Percentage of teacher preferences that were accommodated">
                                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                    </Tooltip>
                                  </span>
                                }
                                value={stats.metrics?.teacher_satisfaction?.toFixed(2) || "N/A"}
                                suffix="%"
                                precision={2}
                              />
                            </Card>
                          </Col>
                          <Col span={12}>
                            <Card>
                              <Statistic
                                title={
                                  <span>
                                    Student Satisfaction
                                    <Tooltip title="Percentage of student preferences that were accommodated">
                                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                    </Tooltip>
                                  </span>
                                }
                                value={stats.metrics?.student_satisfaction?.toFixed(2) || "N/A"}
                                suffix="%"
                                precision={2}
                              />
                            </Card>
                          </Col>
                          <Col span={12}>
                            <Card>
                              <Statistic
                                title={
                                  <span>
                                    Time Efficiency
                                    <Tooltip title="Efficiency score for time slot distribution">
                                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                    </Tooltip>
                                  </span>
                                }
                                value={stats.metrics?.time_efficiency?.toFixed(2) || "N/A"}
                                suffix="%"
                                precision={2}
                              />
                            </Card>
                          </Col>
                        </Row>
                        
                        <Divider orientation="left">Constraint Violations</Divider>
                        
                        <Descriptions bordered column={2}>
                          <Descriptions.Item label="Hard Constraint Violations">
                            <Badge status={selectedTimetable.metrics?.hardConstraintViolations > 0 ? "error" : "success"} />
                            {selectedTimetable.metrics?.hardConstraintViolations || 0}
                          </Descriptions.Item>
                          <Descriptions.Item label="Soft Constraint Score">
                            {selectedTimetable.metrics?.softConstraintScore?.toFixed(2) || 0}
                          </Descriptions.Item>
                          <Descriptions.Item label="Unassigned Activities">
                            <Badge status={selectedTimetable.metrics?.unassignedActivities > 0 ? "warning" : "success"} />
                            {selectedTimetable.metrics?.unassignedActivities || 0}
                          </Descriptions.Item>
                          <Descriptions.Item label="Execution Time">
                            {stats.stats?.execution_time ? `${stats.stats.execution_time.toFixed(2)} seconds` : "N/A"}
                          </Descriptions.Item>
                        </Descriptions>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary">No metrics available for this timetable.</Text>
                      </div>
                    )}
                  </Tabs.TabPane>
                  
                  <Tabs.TabPane tab={<span><ExperimentOutlined /> Algorithm</span>} key="algorithm">
                    <Descriptions title="Algorithm Information" bordered>
                      <Descriptions.Item label="Algorithm" span={3}>
                        {formatAlgorithmName(selectedTimetable.algorithm)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Description" span={3}>
                        {selectedTimetable.algorithm?.toLowerCase() === "nsga2" ? (
                          <Text>
                            NSGA-II is a multi-objective optimization algorithm that uses a non-dominated sorting approach. 
                            It excels at finding a diverse set of Pareto-optimal solutions, making it effective for complex 
                            timetabling problems with competing objectives.
                          </Text>
                        ) : selectedTimetable.algorithm?.toLowerCase() === "spea2" ? (
                          <Text>
                            SPEA2 (Strength Pareto Evolutionary Algorithm 2) is a multi-objective optimization algorithm 
                            that incorporates a fine-grained fitness assignment strategy, a density estimation technique, 
                            and an enhanced archive truncation method to maintain diversity.
                          </Text>
                        ) : selectedTimetable.algorithm?.toLowerCase() === "moead" ? (
                          <Text>
                            MOEA/D (Multi-objective Evolutionary Algorithm Based on Decomposition) decomposes a multi-objective 
                            optimization problem into multiple single-objective subproblems and optimizes them simultaneously, 
                            which is particularly effective for problems with many objectives.
                          </Text>
                        ) : (
                          <Text>No detailed information available for this algorithm.</Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Parameters" span={3}>
                        <div>
                          <Text strong>Population Size:</Text> {selectedTimetable.parameters?.population || 'N/A'} 
                          <br />
                          <Text strong>Number of Generations:</Text> {selectedTimetable.parameters?.generations || 'N/A'}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary">Select a timetable to view details</Text>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ViewSliitTimetable;

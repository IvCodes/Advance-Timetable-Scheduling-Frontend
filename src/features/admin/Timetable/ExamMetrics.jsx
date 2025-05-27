import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Typography,
  Table,
  Tag,
  Statistic,
  message,
  Tooltip,
  Modal,
  Form,
  Select,
  Spin,
  Alert,
  Progress,
  Badge,
  Descriptions,
  Empty,
  Divider,
} from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SwapOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import makeApi from "../../../config/axiosConfig";
import API_CONFIG from "../../../config/api";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ExamMetrics = () => {
  const [loading, setLoading] = useState(false);
  const [algorithmRuns, setAlgorithmRuns] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedRuns, setSelectedRuns] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [isRunModalVisible, setIsRunModalVisible] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [form] = Form.useForm();

  const api = makeApi();

  useEffect(() => {
    fetchAlgorithmRuns();
    fetchStatistics();
  }, []);

  const fetchAlgorithmRuns = async () => {
    if (isPaused) {
      console.log("⏸️ Skipping algorithm runs fetch - paused");
      return;
    }
    
    console.log("🔄 Fetching algorithm runs...", new Date().toLocaleTimeString());
    setLoading(true);
    try {
      const response = await api.get(API_CONFIG.EXAM_METRICS.RUNS);
      if (response.data.success) {
        setAlgorithmRuns(response.data.runs);
        console.log("✅ Algorithm runs fetched:", response.data.runs.length, "runs");
      }
    } catch (error) {
      console.error("❌ Error fetching algorithm runs:", error);
      message.error("Failed to fetch algorithm runs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (isPaused) {
      console.log("⏸️ Skipping statistics fetch - paused");
      return;
    }
    
    console.log("📊 Fetching statistics...", new Date().toLocaleTimeString());
    try {
      const response = await api.get(API_CONFIG.EXAM_METRICS.STATISTICS);
      if (response.data.success) {
        setStatistics(response.data.statistics);
        console.log("✅ Statistics fetched");
      }
    } catch (error) {
      console.error("❌ Error fetching statistics:", error);
      message.error("Failed to fetch statistics");
    }
  };

  const runAlgorithmWithEvaluation = async (values) => {
    setRunLoading(true);
    try {
      const response = await api.post(API_CONFIG.EXAM_METRICS.RUN_WITH_EVALUATION, {
        algorithm: values.algorithm,
        mode: values.mode,
      });

      if (response.data.success) {
        message.success(`Algorithm completed with evaluation! Run ID: ${response.data.run_id}`);
        fetchAlgorithmRuns();
        fetchStatistics();
        setIsRunModalVisible(false);
        form.resetFields();
      } else {
        message.error(`Algorithm failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error running algorithm:", error);
      message.error("Error running algorithm with evaluation");
    } finally {
      setRunLoading(false);
    }
  };

  const runAllAlgorithmsWithEvaluation = async (mode) => {
    setRunLoading(true);
    try {
      const response = await api.post(API_CONFIG.EXAM_METRICS.RUN_ALL_WITH_EVALUATION, {
        mode: mode,
      });

      if (response.data.success) {
        const { summary, results } = response.data;
        message.success(
          `Batch evaluation completed! ${summary.successful}/${summary.total_algorithms} algorithms succeeded. Results are being stored for comparison.`
        );
        
        // Show detailed results if available
        if (results && results.comparison) {
          setTimeout(() => {
            message.info(
              `Best performing algorithm: ${results.comparison.best_algorithm}. Check the Comparison Results tab for detailed analysis.`
            );
          }, 2000);
        }
        
        fetchAlgorithmRuns();
        fetchStatistics();
      } else {
        message.error("Batch evaluation failed");
      }
    } catch (error) {
      console.error("Error running batch evaluation:", error);
      message.error("Error running batch evaluation");
    } finally {
      setRunLoading(false);
    }
  };

  const compareSelectedRuns = async () => {
    if (selectedRuns.length < 2) {
      message.warning("Please select at least 2 runs to compare");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(API_CONFIG.EXAM_METRICS.COMPARE, selectedRuns);
      if (response.data.success) {
        setComparison(response.data.comparison);
        message.success("Comparison generated successfully");
      }
    } catch (error) {
      console.error("Error comparing runs:", error);
      message.error("Failed to compare runs");
    } finally {
      setLoading(false);
    }
  };

  const deleteAlgorithmRun = async (runId) => {
    try {
      const response = await api.delete(`${API_CONFIG.EXAM_METRICS.DELETE_RUN}/${runId}`);
      if (response.data.success) {
        message.success(`Algorithm run deleted successfully`);
        fetchAlgorithmRuns();
        fetchStatistics();
        // Remove from selected runs if it was selected
        setSelectedRuns(selectedRuns.filter(id => id !== runId));
      }
    } catch (error) {
      console.error("Error deleting algorithm run:", error);
      if (error.response?.status === 404) {
        message.error("Algorithm run not found");
      } else {
        message.error("Failed to delete algorithm run");
      }
    }
  };

  const confirmDelete = (runId, algorithmName) => {
    Modal.confirm({
      title: 'Delete Algorithm Run',
      content: `Are you sure you want to delete this ${algorithmName} run? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteAlgorithmRun(runId),
    });
  };

  const getAlgorithmColor = (algorithm) => {
    const colors = {
      nsga2: "blue",
      moead: "green",
      cp: "orange",
      dqn: "purple",
      sarsa: "red",
      hybrid: "gold",
    };
    return colors[algorithm] || "default";
  };

  const getModeColor = (mode) => {
    const colors = {
      quick: "green",
      standard: "blue",
      full: "purple",
    };
    return colors[mode] || "default";
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const runsTableColumns = [
    {
      title: "Run ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => (
        <Text code>{text ? text.slice(-8) : 'N/A'}</Text>
      ),
    },
    {
      title: "Algorithm",
      dataIndex: "algorithm_name",
      key: "algorithm_name",
      render: (text) => (
        <Tag color={getAlgorithmColor(text || 'unknown')}>
          {text ? text.toUpperCase() : 'UNKNOWN'}
        </Tag>
      ),
    },
    {
      title: "Parameters",
      dataIndex: "algorithm_parameters",
      key: "algorithm_parameters",
      render: (params) => {
        if (!params) return <Text type="secondary">N/A</Text>;
        const paramText = Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join(", ");
        return (
          <Tooltip title={paramText}>
            <Text style={{ fontSize: "11px" }}>{paramText}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Execution Time",
      dataIndex: "execution_time_seconds",
      key: "execution_time_seconds",
      render: (time) => (
        <Tooltip title={`${time || 0} seconds`}>
          <Text>{time ? formatDuration(time) : 'N/A'}</Text>
        </Tooltip>
      ),
    },
    {
      title: (
        <Tooltip title="Student satisfaction metric - penalizes exams scheduled too close together. Excellent: <50k, Good: 50k-100k, Average: 100k-150k, Poor: >150k">
          Proximity Penalty
        </Tooltip>
      ),
      dataIndex: ["metrics", "proximity_penalty"],
      key: "proximity_penalty",
      render: (score) => {
        let color = "#52c41a"; // Green (excellent)
        let performance = "Excellent";
        
        if (score > 150000) {
          color = "#ff4d4f"; // Red (poor)
          performance = "Poor";
        } else if (score > 100000) {
          color = "#fa8c16"; // Orange (average)
          performance = "Average";
        } else if (score > 50000) {
          color = "#1890ff"; // Blue (good)
          performance = "Good";
        }
        
        return (
          <Tooltip title={`${performance} performance (${score?.toLocaleString() || 0})`}>
            <Statistic
              value={score || 0}
              precision={0}
              valueStyle={{ fontSize: "12px", color }}
            />
          </Tooltip>
        );
      },
      sorter: (a, b) => {
        const scoreA = a?.metrics?.proximity_penalty || 0;
        const scoreB = b?.metrics?.proximity_penalty || 0;
        return scoreA - scoreB;
      },
    },
    {
      title: (
        <Tooltip title="Hard constraint violations - students with conflicting exams. Must be 0 for valid solutions.">
          Conflicts
        </Tooltip>
      ),
      dataIndex: ["metrics", "conflict_violations"],
      key: "conflict_violations",
      render: (conflicts) => {
        const isValid = (conflicts || 0) === 0;
        return (
          <Tooltip title={isValid ? "Valid solution - no conflicts" : `${conflicts} students have conflicting exams`}>
            <Badge
              count={conflicts || 0}
              style={{ backgroundColor: isValid ? "#52c41a" : "#f5222d" }}
            />
            {isValid && <CheckCircleOutlined style={{ color: "#52c41a", marginLeft: 8 }} />}
          </Tooltip>
        );
      },
    },
    {
      title: "Efficiency",
      dataIndex: ["metrics", "efficiency_score"],
      key: "efficiency_score",
      render: (score) => (
        <Statistic
          value={(score || 0) * 100}
          precision={1}
          suffix="%"
          valueStyle={{ fontSize: "12px" }}
        />
      ),
    },
    {
      title: "Students Affected",
      dataIndex: ["metrics", "total_students_affected"],
      key: "total_students_affected",
      render: (count) => (
        <Text>{count || 0}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Delete this algorithm run">
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(record._id, record.algorithm_name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedRuns,
    onChange: (selectedRowKeys) => {
      setSelectedRuns(selectedRowKeys);
    },
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2}>
                  <BarChartOutlined /> Exam Algorithm Evaluation Metrics
                </Title>
                <Paragraph>
                  Comprehensive performance analysis and comparison of exam timetabling algorithms
                </Paragraph>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => setIsRunModalVisible(true)}
                  >
                    Run Algorithm
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      fetchAlgorithmRuns();
                      fetchStatistics();
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    icon={isPaused ? <PlayCircleOutlined /> : <ExclamationCircleOutlined />}
                    type={isPaused ? "primary" : "default"}
                    onClick={() => {
                      setIsPaused(!isPaused);
                      message.info(isPaused ? "Resumed API calls" : "Paused API calls");
                    }}
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Dataset Information */}
        <Col span={24}>
          <Card title="Dataset Information: STA-F-83 (Carter Benchmark)" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Dataset">STA-F-83 (University of Toronto)</Descriptions.Item>
                  <Descriptions.Item label="Exams">139</Descriptions.Item>
                  <Descriptions.Item label="Students">611</Descriptions.Item>
                  <Descriptions.Item label="Timeslots">13</Descriptions.Item>
                  <Descriptions.Item label="Conflict Density">~0.14 (14% of exam pairs conflict)</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Title level={5}>Performance Guidelines</Title>
                <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
                  <div><strong>Proximity Penalty:</strong></div>
                  <div>• Excellent: &lt; 50,000</div>
                  <div>• Good: 50,000 - 100,000</div>
                  <div>• Average: 100,000 - 150,000</div>
                  <div>• Poor: &gt; 150,000</div>
                  <br />
                  <div><strong>Hard Constraints:</strong></div>
                  <div>• Must be 0 (no student conflicts)</div>
                  <br />
                  <div><strong>Efficiency Score:</strong></div>
                  <div>• Higher is better (optimal timeslot usage)</div>
                </div>
              </Col>
            </Row>
            <Divider />
            <Alert
              message="About Carter Benchmark Datasets"
              description={
                <div>
                  <div style={{ marginBottom: 8 }}>
                    The STA-F-83 dataset is part of the standard Carter benchmark suite for exam timetabling research. 
                    It represents real-world constraints from the University of Toronto. The proximity penalty measures 
                    student satisfaction by penalizing exams scheduled too close together.
                  </div>
                  <div style={{ fontSize: "11px", fontStyle: "italic" }}>
                    <strong>Reference:</strong> R. Qu, E. K. Burke, B. McCollum, L.T.G. Merlot, and S.Y. Lee. 
                    "A Survey of Search Methodologies and Automated System Development for Examination Timetabling." 
                    Journal of Scheduling, 12(1): 55-89, 2009.
                  </div>
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        {/* Statistics Overview */}
        {statistics && (
          <Col span={24}>
            <Card title="Algorithm Performance Overview" size="small">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Runs"
                    value={statistics.total_runs || 0}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Best Proximity Penalty"
                    value={
                      statistics.algorithm_stats && statistics.algorithm_stats.length > 0
                        ? Math.min(...statistics.algorithm_stats.map(s => s.best_proximity_penalty || Infinity))
                        : 0
                    }
                    precision={0}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Avg Execution Time"
                    value={
                      statistics.algorithm_stats && statistics.algorithm_stats.length > 0
                        ? statistics.algorithm_stats.reduce((sum, s) => sum + (s.avg_execution_time || 0), 0) / statistics.algorithm_stats.length
                        : 0
                    }
                    precision={1}
                    suffix="s"
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Algorithms Tested"
                    value={statistics.algorithm_stats ? statistics.algorithm_stats.length : 0}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
              </Row>
              
              {/* Algorithm-specific stats */}
              {statistics.algorithm_stats && statistics.algorithm_stats.length > 0 && (
                <Divider />
              )}
              {statistics.algorithm_stats && statistics.algorithm_stats.map((algoStat) => (
                <Row key={algoStat._id} gutter={16} style={{ marginBottom: 8 }}>
                  <Col span={4}>
                    <Tag color={getAlgorithmColor(algoStat._id)}>
                      {algoStat._id.toUpperCase()}
                    </Tag>
                  </Col>
                  <Col span={5}>
                    <Text type="secondary">Runs: {algoStat.total_runs}</Text>
                  </Col>
                  <Col span={5}>
                    <Text type="secondary">Avg Penalty: {algoStat.avg_proximity_penalty?.toFixed(0) || 'N/A'}</Text>
                  </Col>
                  <Col span={5}>
                    <Text type="secondary">Best Penalty: {algoStat.best_proximity_penalty?.toFixed(0) || 'N/A'}</Text>
                  </Col>
                  <Col span={5}>
                    <Text type="secondary">Avg Time: {algoStat.avg_execution_time?.toFixed(1) || 'N/A'}s</Text>
                  </Col>
                </Row>
              ))}
            </Card>
          </Col>
        )}

        {/* Main Content Tabs */}
        <Col span={24}>
          <Card>
            <Tabs defaultActiveKey="runs">
              <TabPane tab="Algorithm Runs" key="runs">
                <Space direction="vertical" style={{ width: "100%" }}>
                  {/* Metrics Explanation */}
                  <Alert
                    message="Metric Explanations"
                    description={
                      <div style={{ fontSize: "12px" }}>
                        <strong>Proximity Penalty:</strong> Measures student satisfaction - lower is better. Penalizes exams scheduled too close together. 
                        <strong> Conflicts:</strong> Hard constraint violations - must be 0 for valid solutions. 
                        <strong> Efficiency:</strong> Percentage of optimal timeslot utilization - higher is better.
                      </div>
                    }
                    type="info"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                  />
                  
                  <Row justify="space-between">
                    <Col>
                      <Space>
                        <Button
                          type="primary"
                          icon={<SwapOutlined />}
                          onClick={compareSelectedRuns}
                          disabled={selectedRuns.length < 2}
                        >
                          Compare Selected ({selectedRuns.length})
                        </Button>
                        <Button
                          onClick={() => runAllAlgorithmsWithEvaluation("standard")}
                          loading={runLoading}
                        >
                          Run All Algorithms
                        </Button>
                      </Space>
                    </Col>
                  </Row>

                  <Table
                    columns={runsTableColumns}
                    dataSource={algorithmRuns}
                    rowKey={(record) => record._id || Math.random()}
                    rowSelection={rowSelection}
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                    }}
                    scroll={{ x: 1200 }}
                    locale={{
                      emptyText: (
                        <Empty
                          description="No algorithm runs found. Run some algorithms to see evaluation results here."
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ),
                    }}
                  />
                </Space>
              </TabPane>

              <TabPane tab="Comparison Results" key="comparison">
                {comparison ? (
                  <div>
                    <Title level={4}>Algorithm Comparison Results</Title>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Card title="Overall Ranking" size="small">
                          {comparison.overall_ranking && comparison.overall_ranking.map((item, index) => (
                            <div key={item.run_id} style={{ marginBottom: 8 }}>
                              <Badge
                                count={index + 1}
                                style={{ backgroundColor: index === 0 ? "#faad14" : "#1890ff" }}
                              />
                              <span style={{ marginLeft: 8 }}>
                                <Tag color={getAlgorithmColor(item.algorithm_name)}>
                                  {item.algorithm_name.toUpperCase()}
                                </Tag>
                                Overall Score: {item.overall_score ? item.overall_score.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                          ))}
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card title="Proximity Penalty Ranking" size="small">
                          {comparison.proximity_ranking && comparison.proximity_ranking.map((item, index) => (
                            <div key={item.run_id} style={{ marginBottom: 8 }}>
                              <Badge
                                count={index + 1}
                                style={{ backgroundColor: index === 0 ? "#52c41a" : "#1890ff" }}
                              />
                              <span style={{ marginLeft: 8 }}>
                                <Tag color={getAlgorithmColor(item.algorithm_name)}>
                                  {item.algorithm_name.toUpperCase()}
                                </Tag>
                                Penalty: {item.score ? item.score.toFixed(0) : 'N/A'}
                              </span>
                            </div>
                          ))}
                        </Card>
                      </Col>
                      <Col span={24}>
                        <Card title="Performance Summary" size="small">
                          <Descriptions bordered size="small">
                            <Descriptions.Item label="Best Algorithm">
                              <Tag color={getAlgorithmColor(comparison.best_algorithm)}>
                                {comparison.best_algorithm ? comparison.best_algorithm.toUpperCase() : 'N/A'}
                              </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Worst Algorithm">
                              <Tag color={getAlgorithmColor(comparison.worst_algorithm)}>
                                {comparison.worst_algorithm ? comparison.worst_algorithm.toUpperCase() : 'N/A'}
                              </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Performance Gap">
                              {comparison.performance_gap ? comparison.performance_gap.toFixed(2) : 'N/A'}
                            </Descriptions.Item>
                          </Descriptions>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <Empty description="No comparison results. Select runs from the table and click Compare." />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Run Algorithm Modal */}
      <Modal
        title="Run Algorithm with Evaluation"
        visible={isRunModalVisible}
        onCancel={() => setIsRunModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={runAlgorithmWithEvaluation} layout="vertical">
          <Form.Item
            name="algorithm"
            label="Algorithm"
            rules={[{ required: true, message: "Please select an algorithm" }]}
          >
            <Select placeholder="Select algorithm">
              <Option value="nsga2">NSGA-II</Option>
              <Option value="moead">MOEA/D</Option>
              <Option value="cp">Constraint Programming</Option>
              <Option value="dqn">Deep Q-Network</Option>
              <Option value="sarsa">SARSA</Option>
              <Option value="hybrid">Hybrid SARSA</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="mode"
            label="Execution Mode"
            rules={[{ required: true, message: "Please select a mode" }]}
          >
            <Select placeholder="Select mode">
              <Option value="quick">Quick (Fast testing)</Option>
              <Option value="standard">Standard (Balanced)</Option>
              <Option value="full">Full (Maximum quality)</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={runLoading}>
                Run Algorithm
              </Button>
              <Button onClick={() => setIsRunModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamMetrics; 
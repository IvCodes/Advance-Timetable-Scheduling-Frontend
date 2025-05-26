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
  const [form] = Form.useForm();

  const api = makeApi();

  useEffect(() => {
    fetchAlgorithmRuns();
    fetchStatistics();
  }, []);

  const fetchAlgorithmRuns = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_CONFIG.EXAM_METRICS.RUNS);
      if (response.data.success) {
        setAlgorithmRuns(response.data.runs);
      }
    } catch (error) {
      console.error("Error fetching algorithm runs:", error);
      message.error("Failed to fetch algorithm runs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get(API_CONFIG.EXAM_METRICS.STATISTICS);
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
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
        const { summary } = response.data;
        message.success(
          `Batch evaluation completed! ${summary.successful}/${summary.total_algorithms} algorithms succeeded`
        );
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
      dataIndex: "run_id",
      key: "run_id",
      render: (text) => <Text code>{text.slice(0, 8)}...</Text>,
    },
    {
      title: "Algorithm",
      dataIndex: "algorithm_name",
      key: "algorithm_name",
      render: (text) => <Tag color={getAlgorithmColor(text)}>{text.toUpperCase()}</Tag>,
    },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
      render: (text) => <Tag color={getModeColor(text)}>{text}</Tag>,
    },
    {
      title: "Execution Time",
      dataIndex: "execution_time",
      key: "execution_time",
      render: (time) => (
        <Tooltip title={`${time} seconds`}>
          <Text>{formatDuration(time)}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Total Score",
      dataIndex: ["evaluation", "total_score"],
      key: "total_score",
      render: (score) => (
        <Statistic
          value={score}
          precision={2}
          valueStyle={{ fontSize: "14px" }}
        />
      ),
      sorter: (a, b) => a.evaluation.total_score - b.evaluation.total_score,
    },
    {
      title: "Conflicts",
      dataIndex: ["evaluation", "conflicts"],
      key: "conflicts",
      render: (conflicts) => (
        <Badge
          count={conflicts}
          style={{ backgroundColor: conflicts > 0 ? "#f5222d" : "#52c41a" }}
        />
      ),
    },
    {
      title: "Timestamp",
      dataIndex: "run_timestamp",
      key: "run_timestamp",
      render: (timestamp) => (
        <Tooltip title={formatTimestamp(timestamp)}>
          <Text>{new Date(timestamp).toLocaleDateString()}</Text>
        </Tooltip>
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
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Statistics Overview */}
        {statistics && (
          <Col span={24}>
            <Card title="Performance Overview" size="small">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Runs"
                    value={statistics.total_runs}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Best Score"
                    value={statistics.best_score}
                    precision={2}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Avg Execution Time"
                    value={statistics.avg_execution_time}
                    precision={1}
                    suffix="s"
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Success Rate"
                    value={statistics.success_rate}
                    precision={1}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* Main Content Tabs */}
        <Col span={24}>
          <Card>
            <Tabs defaultActiveKey="runs">
              <TabPane tab="Algorithm Runs" key="runs">
                <Space direction="vertical" style={{ width: "100%" }}>
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
                    rowKey="run_id"
                    rowSelection={rowSelection}
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                    }}
                    scroll={{ x: 1200 }}
                  />
                </Space>
              </TabPane>

              <TabPane tab="Comparison Results" key="comparison">
                {comparison ? (
                  <div>
                    <Title level={4}>Algorithm Comparison Results</Title>
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Card title="Ranking" size="small">
                          {comparison.ranking.map((item, index) => (
                            <div key={item.run_id} style={{ marginBottom: 8 }}>
                              <Badge
                                count={index + 1}
                                style={{ backgroundColor: index === 0 ? "#faad14" : "#1890ff" }}
                              />
                              <span style={{ marginLeft: 8 }}>
                                <Tag color={getAlgorithmColor(item.algorithm_name)}>
                                  {item.algorithm_name.toUpperCase()}
                                </Tag>
                                Score: {item.total_score.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </Card>
                      </Col>
                      <Col span={24}>
                        <Card title="Detailed Metrics" size="small">
                          <Table
                            dataSource={comparison.detailed_comparison}
                            columns={[
                              { title: "Metric", dataIndex: "metric", key: "metric" },
                              ...comparison.runs.map((run) => ({
                                title: (
                                  <Tag color={getAlgorithmColor(run.algorithm_name)}>
                                    {run.algorithm_name.toUpperCase()}
                                  </Tag>
                                ),
                                dataIndex: run.run_id,
                                key: run.run_id,
                                render: (value) => typeof value === "number" ? value.toFixed(2) : value,
                              })),
                            ]}
                            pagination={false}
                            size="small"
                          />
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
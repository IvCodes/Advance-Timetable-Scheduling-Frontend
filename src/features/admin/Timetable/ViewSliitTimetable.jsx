import React, { useEffect, useState, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  Spin,
  Button,
  Card,
  Space,
  Row,
  Col,
  Tabs,
  Typography,
  Descriptions,
  Tag,
  Divider,
  Statistic,
  message,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  DownloadOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  getSliitTimetables,
  getTimetableHtmlUrl,
  getTimetableStats,
  generateSliitTimetable,
} from "./timetable.api";

const { Title, Text } = Typography;

const ViewSliitTimetable = () => {
  const dispatch = useDispatch();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch all SLIIT timetables
  useEffect(() => {
    const fetchTimetables = async () => {
      setLoading(true);
      try {
        const result = await dispatch(getSliitTimetables()).unwrap();
        console.log("Fetched timetables:", result);
        setTimetables(result);

        // Select the first timetable by default if available
        if (result && result.length > 0) {
          setSelectedTimetable(result[0]);
          fetchTimetableStats(result[0]._id);
        }
      } catch (error) {
        console.error("Error fetching SLIIT timetables:", error);
        message.error("Failed to fetch timetables");
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
      console.log("Fetched stats:", result);
      setStats(result);
    } catch (error) {
      console.error(
        `Error fetching statistics for timetable with ID ${timetableId}:`,
        error,
      );
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
    // Use optional chaining for better readability
    const algorithmLower = algorithm?.toLowerCase();
    switch (algorithmLower) {
      case "nsga2":
        return "NSGA-II (Non-dominated Sorting Genetic Algorithm II)";
      case "spea2":
        return "SPEA2 (Strength Pareto Evolutionary Algorithm 2)";
      case "moead":
        return "MOEA/D (Multi-objective Evolutionary Algorithm Based on Decomposition)";
      case "dqn":
        return "DQN (Deep Q-Network)";
      case "sarsa":
        return "SARSA (State-Action-Reward-State-Action)";
      case "implicit_q":
        return "Implicit Q-learning";
      default:
        return algorithm || "Unknown Algorithm";
    }
  };

  // Open timetable HTML in a new tab
  const viewTimetableHtml = (timetableId) => {
    if (!timetableId) {
      message.error("No timetable ID provided");
      return;
    }

    try {
      const htmlUrl = getTimetableHtmlUrl(timetableId);
      console.log("Opening HTML URL:", htmlUrl);

      // Show loading message
      const loadingMessage = message.loading("Opening timetable view...", 0);

      // Create a hidden iframe to check if the URL is valid
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.onload = () => {
        // Success - open in new tab
        window.open(htmlUrl, "_blank");
        loadingMessage();
      };
      iframe.onerror = () => {
        // Error loading
        loadingMessage();
        message.error(
          "Error loading timetable HTML. The server may have encountered an error.",
        );
      };

      // Set a timeout in case the load event doesn't fire
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
          loadingMessage();
          window.open(htmlUrl, "_blank");
        }
      }, 2000);

      // Add to document to start loading
      document.body.appendChild(iframe);
      iframe.src = htmlUrl;
    } catch (error) {
      console.error("Error opening timetable HTML:", error);
      message.error("Failed to open timetable HTML view");
    }
  };

  // Get algorithm description
  const getAlgorithmDescription = (algorithm) => {
    if (!algorithm) return "No detailed information available.";

    switch (algorithm.toLowerCase()) {
      case "nsga2":
        return "NSGA-II is a multi-objective optimization algorithm that uses a non-dominated sorting approach. It excels at finding a diverse set of Pareto-optimal solutions, making it effective for complex timetabling problems with competing objectives.";
      case "spea2":
        return "SPEA2 (Strength Pareto Evolutionary Algorithm 2) is a multi-objective optimization algorithm that incorporates a fine-grained fitness assignment strategy, a density estimation technique, and an enhanced archive truncation method to maintain diversity.";
      case "moead":
        return "MOEA/D (Multi-objective Evolutionary Algorithm Based on Decomposition) decomposes a multi-objective optimization problem into multiple single-objective subproblems and optimizes them simultaneously, which is particularly effective for problems with many objectives.";
      case "dqn":
        return "DQN (Deep Q-Network) is a reinforcement learning algorithm that uses a neural network to approximate the Q-function, which estimates the expected return for each state-action pair.";
      case "sarsa":
        return "SARSA (State-Action-Reward-State-Action) is a reinforcement learning algorithm that updates the Q-function based on the current state, action, reward, and next state.";
      case "implicit_q":
        return "Implicit Q-learning is a reinforcement learning algorithm that updates the Q-function based on the current state and action, without explicitly computing the Q-function.";
      default:
        return "No detailed information available for this algorithm.";
    }
  };

  // Show the generate modal
  const showGenerateModal = () => {
    setIsGenerateModalVisible(true);
  };

  // Handle the form submission for timetable generation
  const handleGenerateSubmit = async (values) => {
    let generationNotice = null;

    try {
      setGenerationLoading(true);

      // Prepare the parameters for the API call
      const parameters = {
        name: values.name,
        algorithm: values.algorithm,
        dataset: "sliit",
        parameters: {
          population: values.population,
          generations: values.generations,
          learning_rate: values.learning_rate,
          episodes: values.episodes,
          epsilon: values.epsilon,
        },
      };

      // Call the API to generate the timetable
      console.log("Generating timetable with parameters:", parameters);

      // Show a loading notification
      generationNotice = message.loading(
        `Generating timetable using ${formatAlgorithmName(values.algorithm)}. This may take a few minutes...`,
        0,
      );

      const result = await dispatch(
        generateSliitTimetable(parameters),
      ).unwrap();

      // Refresh the timetable list
      const updatedTimetables = await dispatch(getSliitTimetables()).unwrap();
      setTimetables(updatedTimetables);

      // Select the newly generated timetable
      if (result?._id) {
        setSelectedTimetable(result);
        fetchTimetableStats(result._id);
      }

      // Close the modal and reset the form
      setIsGenerateModalVisible(false);
      form.resetFields();

      // Show success message
      message.success(
        `Timetable "${values.name}" has been generated successfully using ${formatAlgorithmName(values.algorithm)}`,
      );
    } catch (error) {
      console.error("Error generating timetable:", error);

      // Format a detailed error message
      let errorMessage = "Failed to generate timetable. Please try again.";

      // Check for server response errors (status codes)
      if (error.response?.data?.detail) {
        errorMessage = `Server error: ${error.response.data.detail}`;
      } else if (error.response?.status === 500) {
        errorMessage =
          "Server error: Internal server error occurred during timetable generation.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      message.error(errorMessage, 5); // Display for 5 seconds
    } finally {
      // Always clear the loading notification
      generationNotice?.();
      setGenerationLoading(false);
    }
  };

  // Handle modal cancel
  const handleGenerateCancel = () => {
    setIsGenerateModalVisible(false);
    form.resetFields();
  };

  // Get algorithm options for the select dropdown
  const getAlgorithmOptions = () => {
    const algorithms = [
      {
        value: "nsga2",
        label: "NSGA-II (Non-dominated Sorting Genetic Algorithm II)",
      },
      {
        value: "spea2",
        label: "SPEA2 (Strength Pareto Evolutionary Algorithm 2)",
      },
      {
        value: "moead",
        label:
          "MOEA/D (Multi-objective Evolutionary Algorithm Based on Decomposition)",
      },
      {
        value: "dqn",
        label: "DQN (Deep Q-Network)",
      },
      {
        value: "sarsa",
        label: "SARSA (State-Action-Reward-State-Action)",
      },
      {
        value: "implicit_q",
        label: "Implicit Q-learning",
      },
    ];

    return algorithms.map((algorithm) => (
      <Select.Option key={algorithm.value} value={algorithm.value}>
        {algorithm.label}
      </Select.Option>
    ));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>SLIIT Timetables</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showGenerateModal}
        >
          Generate New Timetable
        </Button>
      </div>
      <Divider />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : timetables.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text type="secondary">
              No timetables available. Generate a timetable first.
            </Text>
          </div>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {/* Timetable List */}
          <Col xs={24} lg={8}>
            <Card title="Generated Timetables" bordered={false}>
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {timetables.map((timetable) => (
                  <Card
                    key={timetable._id}
                    style={{
                      marginBottom: "10px",
                      borderLeft:
                        selectedTimetable?._id === timetable._id
                          ? "3px solid #1890ff"
                          : "none",
                      cursor: "pointer",
                    }}
                    hoverable
                    onClick={() => handleTimetableSelect(timetable)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text strong>{timetable.name}</Text>
                        <div>
                          <Tag color="blue">{timetable.algorithm}</Tag>
                          <Tag color="green">
                            Pop: {timetable.parameters?.population || "N/A"}
                          </Tag>
                          <Tag color="purple">
                            Gen: {timetable.parameters?.generations || "N/A"}
                          </Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
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
                  <Tabs.TabPane
                    tab={
                      <span>
                        <FileTextOutlined /> Overview
                      </span>
                    }
                    key="overview"
                  >
                    <Descriptions
                      title="Timetable Information"
                      bordered
                      column={2}
                    >
                      <Descriptions.Item label="Name">
                        {selectedTimetable.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Algorithm">
                        {formatAlgorithmName(selectedTimetable.algorithm)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Dataset">
                        {selectedTimetable.dataset}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created At">
                        {new Date(selectedTimetable.createdAt).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Population Size">
                        {selectedTimetable.parameters?.population || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Number of Generations">
                        {selectedTimetable.parameters?.generations || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Tabs.TabPane>

                  <Tabs.TabPane
                    tab={
                      <span>
                        <CheckCircleOutlined /> Metrics
                      </span>
                    }
                    key="metrics"
                  >
                    {statsLoading ? (
                      <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <Spin />
                        <div style={{ marginTop: "10px" }}>
                          Loading metrics...
                        </div>
                      </div>
                    ) : stats ? (
                      <div>
                        <Row gutter={[16, 16]}>
                          {/* Commenting out these metrics since they don't have data yet
                          <Col span={12}>
                            <Card>
                              <Statistic
                                title={
                                  <span>
                                    Room Utilization
                                    <Tooltip title="Percentage of room slots that are efficiently utilized">
                                      <InfoCircleOutlined
                                        style={{ marginLeft: 8 }}
                                      />
                                    </Tooltip>
                                  </span>
                                }
                                value={
                                  stats.metrics?.room_utilization?.toFixed(2) ||
                                  "N/A"
                                }
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
                                      <InfoCircleOutlined
                                        style={{ marginLeft: 8 }}
                                      />
                                    </Tooltip>
                                  </span>
                                }
                                value={
                                  stats.metrics?.teacher_satisfaction?.toFixed(
                                    2,
                                  ) || "N/A"
                                }
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
                                      <InfoCircleOutlined
                                        style={{ marginLeft: 8 }}
                                      />
                                    </Tooltip>
                                  </span>
                                }
                                value={
                                  stats.metrics?.student_satisfaction?.toFixed(
                                    2,
                                  ) || "N/A"
                                }
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
                                      <InfoCircleOutlined
                                        style={{ marginLeft: 8 }}
                                      />
                                    </Tooltip>
                                  </span>
                                }
                                value={
                                  stats.metrics?.time_efficiency?.toFixed(2) ||
                                  "N/A"
                                }
                                suffix="%"
                                precision={2}
                              />
                            </Card>
                          </Col>
                          */}
                        </Row>

                        <Divider orientation="left">Constraint Details</Divider>
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Card>
                              <Statistic
                                title="Hard Constraint Violations"
                                value={stats.basic?.hardConstraintViolations || 0}
                                valueStyle={{
                                  color:
                                    (stats.basic?.hardConstraintViolations || 0) === 0
                                      ? "#3f8600"
                                      : "#cf1322",
                                }}
                              />
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card>
                              <Statistic
                                title="Soft Constraint Score"
                                value={stats.basic?.softConstraintScore?.toFixed(4) || 0}
                                precision={4}
                                valueStyle={{
                                  color: 
                                    (stats.basic?.softConstraintScore || 0) > 0.5 
                                      ? "#3f8600" 
                                      : (stats.basic?.softConstraintScore || 0) > 0 
                                      ? "#faad14" 
                                      : "#cf1322",
                                }}
                              />
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card>
                              <Statistic
                                title="Unassigned Activities"
                                value={stats.basic?.unassignedActivities || 0}
                                valueStyle={{
                                  color:
                                    (stats.basic?.unassignedActivities || 0) === 0
                                      ? "#3f8600"
                                      : "#cf1322",
                                }}
                              />
                            </Card>
                          </Col>
                        </Row>

                        <Divider orientation="left">Algorithm</Divider>
                        <Descriptions bordered>
                          <Descriptions.Item label="Algorithm Name">
                            {formatAlgorithmName(stats.algorithm?.name)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Population Size">
                            {stats.algorithm?.parameters?.population || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Generations">
                            {stats.algorithm?.parameters?.generations || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Execution Time">
                            {stats.algorithm?.runTime 
                              ? `${stats.algorithm.runTime.toFixed(2)} seconds` 
                              : "N/A"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Created At">
                            {stats.timetable?.createdAt
                              ? new Date(stats.timetable.createdAt).toLocaleDateString()
                              : "N/A"}
                          </Descriptions.Item>
                        </Descriptions>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <Text type="secondary">No metrics available</Text>
                      </div>
                    )}
                  </Tabs.TabPane>

                  <Tabs.TabPane
                    tab={
                      <span>
                        <ExperimentOutlined /> Algorithm
                      </span>
                    }
                    key="algorithm"
                  >
                    <Descriptions title="Algorithm Information" bordered>
                      <Descriptions.Item label="Algorithm" span={3}>
                        {formatAlgorithmName(selectedTimetable.algorithm)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Description" span={3}>
                        <Text>
                          {getAlgorithmDescription(selectedTimetable.algorithm)}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Parameters" span={3}>
                        <div>
                          <Text strong>Population Size:</Text>{" "}
                          {selectedTimetable.parameters?.population || "N/A"}
                          <br />
                          <Text strong>Number of Generations:</Text>{" "}
                          {selectedTimetable.parameters?.generations || "N/A"}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Text type="secondary">
                    Select a timetable to view details
                  </Text>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      )}

      {/* Generate Timetable Modal */}
      <Modal
        title="Generate New SLIIT Timetable"
        open={isGenerateModalVisible}
        onCancel={handleGenerateCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerateSubmit}
          initialValues={{
            algorithm: "nsga2",
            population: 100,
            generations: 50,
          }}
        >
          <Form.Item
            name="name"
            label="Timetable Name"
            rules={[
              {
                required: true,
                message: "Please enter a name for the timetable",
              },
            ]}
          >
            <Input placeholder="e.g., SLIIT Summer 2025 Timetable" />
          </Form.Item>

          <Form.Item
            name="algorithm"
            label="Algorithm"
            rules={[{ required: true, message: "Please select an algorithm" }]}
          >
            <Select>{getAlgorithmOptions()}</Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.algorithm !== currentValues.algorithm}>
            {({ getFieldValue }) => {
              const algorithm = getFieldValue('algorithm');
              const isRLAlgorithm = ['dqn', 'sarsa', 'implicit_q'].includes(algorithm);
              
              if (isRLAlgorithm) {
                return (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="learning_rate"
                        label="Learning Rate"
                        initialValue={0.001}
                        rules={[
                          { required: true, message: "Please enter learning rate" },
                        ]}
                      >
                        <InputNumber min={0.0001} max={1} step={0.001} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="episodes"
                        label="Episodes"
                        initialValue={100}
                        rules={[
                          {
                            required: true,
                            message: "Please enter number of episodes",
                          },
                        ]}
                      >
                        <InputNumber min={10} max={500} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="epsilon"
                        label="Epsilon (Exploration Rate)"
                        initialValue={0.1}
                        rules={[
                          {
                            required: true,
                            message: "Please enter epsilon value",
                          },
                        ]}
                      >
                        <InputNumber min={0.01} max={1} step={0.01} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                );
              }
              
              // Default params for evolutionary algorithms
              return (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="population"
                      label="Population Size"
                      rules={[
                        { required: true, message: "Please enter population size" },
                      ]}
                    >
                      <InputNumber min={10} max={500} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="generations"
                      label="Number of Generations"
                      rules={[
                        {
                          required: true,
                          message: "Please enter number of generations",
                        },
                      ]}
                    >
                      <InputNumber min={10} max={200} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
              );
            }}
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button style={{ marginRight: 8 }} onClick={handleGenerateCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={generationLoading}
              >
                Generate
              </Button>
            </div>
          </Form.Item>

          <div style={{ marginTop: "16px" }}>
            <Divider orientation="left">Algorithm Information</Divider>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const algorithm = getFieldValue("algorithm");
                  return <Text>{getAlgorithmDescription(algorithm)}</Text>;
                }}
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewSliitTimetable;

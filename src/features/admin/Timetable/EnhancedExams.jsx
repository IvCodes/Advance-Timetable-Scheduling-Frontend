import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
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
  Select,
  Spin,
  Table,
  Alert,
  Progress,
  Badge,
} from "antd";
import {
  ExperimentOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import makeApi from "../../../config/axiosConfig";
import API_CONFIG from "../../../config/api";
import ExamMetrics from "./ExamMetrics";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const EnhancedExams = () => {
  const [loading, setLoading] = useState(false);
  const [datasetStats, setDatasetStats] = useState(null);
  const [algorithms, setAlgorithms] = useState({});
  const [runModes, setRunModes] = useState({});
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [isRunModalVisible, setIsRunModalVisible] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [batchRunLoading, setBatchRunLoading] = useState(false);
  const [form] = Form.useForm();

  // Create API instance using existing pattern
  const api = makeApi();

  // Fetch initial data
  useEffect(() => {
    fetchDatasetStats();
    fetchAlgorithms();
    fetchGeneratedFiles();
  }, []);

  const fetchDatasetStats = async () => {
    try {
      const response = await api.get(API_CONFIG.ENHANCED_TIMETABLE.DATASET_STATS);
      setDatasetStats(response.data);
    } catch (error) {
      console.warn("Dataset stats API not available:", error);
      // Set fallback data
      setDatasetStats({
        total_students: 0,
        total_activities: 0,
        total_groups: 0,
        total_slots: 0,
        student_id_sample: []
      });
    }
  };

  const fetchAlgorithms = async () => {
    try {
      const response = await api.get(API_CONFIG.ENHANCED_TIMETABLE.ALGORITHMS);
      setAlgorithms(response.data.algorithms);
      setRunModes(response.data.run_modes);
    } catch (error) {
      console.warn("Algorithms API not available:", error);
      // Set fallback data
      setAlgorithms({
        nsga2: "Non-dominated Sorting Genetic Algorithm II",
        spea2: "Strength Pareto Evolutionary Algorithm 2",
        moead: "Multi-objective Evolutionary Algorithm Based on Decomposition",
        dqn: "Deep Q-Network",
        sarsa: "State-Action-Reward-State-Action",
        implicit_q: "Implicit Q-learning"
      });
      setRunModes({
        quick: { description: "Fast execution for testing" },
        standard: { description: "Balanced performance" },
        full: { description: "Maximum quality" }
      });
    }
  };

  const fetchGeneratedFiles = async () => {
    try {
      const response = await api.get(API_CONFIG.ENHANCED_TIMETABLE.LIST_FILES);
      setGeneratedFiles(response.data.html_files || []);
    } catch (error) {
      console.warn("Generated files API not available:", error);
      setGeneratedFiles([]);
    }
  };

  const runSingleAlgorithm = async (values) => {
    setRunLoading(true);
    try {
      // Use evaluation API for comprehensive metrics and database storage
      const response = await api.post(API_CONFIG.EXAM_METRICS.RUN_WITH_EVALUATION, {
        algorithm: values.algorithm,
        mode: values.mode,
      });

      if (response.data.success) {
        message.success(
          `Algorithm completed with evaluation! Run ID: ${response.data.run_id || 'N/A'}`
        );
        
        // Also generate HTML using the basic API for visualization
        try {
          await api.post(API_CONFIG.ENHANCED_TIMETABLE.RUN_ALGORITHM, {
            algorithm: values.algorithm,
            mode: values.mode,
            generate_html: true,
          });
          fetchGeneratedFiles(); // Refresh file list
        } catch (htmlError) {
          console.warn("HTML generation failed:", htmlError);
          message.warning("Algorithm completed but HTML generation failed");
        }
        
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

  const runAllAlgorithms = async (mode) => {
    setBatchRunLoading(true);
    try {
      // Use evaluation API for comprehensive metrics and comparison
      const response = await api.post(API_CONFIG.EXAM_METRICS.RUN_ALL_WITH_EVALUATION, {
        mode: mode,
      });

      if (response.data.success) {
        const { summary } = response.data;
        message.success(
          `Batch evaluation completed! ${summary.successful}/${summary.total_algorithms} algorithms succeeded. Check Evaluation Metrics tab for comparison.`
        );
        
        // Also generate HTML files for visualization
        try {
          await api.post(API_CONFIG.ENHANCED_TIMETABLE.RUN_ALL_ALGORITHMS, {
            mode: mode,
            generate_html: true,
          });
          fetchGeneratedFiles(); // Refresh file list
        } catch (htmlError) {
          console.warn("HTML generation failed:", htmlError);
          message.warning("Evaluation completed but HTML generation failed");
        }
      } else {
        message.error("Batch evaluation failed");
      }
    } catch (error) {
      console.error("Error running batch evaluation:", error);
      message.error("Error running batch evaluation");
    } finally {
      setBatchRunLoading(false);
    }
  };

  const generateTestHTML = async () => {
    setLoading(true);
    try {
      const response = await api.post(API_CONFIG.ENHANCED_TIMETABLE.GENERATE_TEST_HTML);

      if (response.data.success) {
        message.success("Test HTML generated successfully!");
        fetchGeneratedFiles(); // Refresh file list
      } else {
        message.error("Failed to generate test HTML");
      }
    } catch (error) {
      console.error("Error generating test HTML:", error);
      message.error("Error generating test HTML");
    } finally {
      setLoading(false);
    }
  };

  const getApiHost = () => {
    // VITE_API_URL is like http://localhost:8000/api/v1
    // We need http://localhost:8000
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.host}`;
  };

  const downloadHTML = (filename) => {
    const apiHost = getApiHost();
    // API_CONFIG.ENHANCED_TIMETABLE.DOWNLOAD_HTML is /api/enhanced-timetable/download-html
    const downloadUrl = `${apiHost}${API_CONFIG.ENHANCED_TIMETABLE.DOWNLOAD_HTML}/${filename}`;
    window.open(downloadUrl, "_blank");
  };

  const viewHTML = (filename) => {
    const apiHost = getApiHost();
    // API_CONFIG.ENHANCED_TIMETABLE.VIEW_HTML is /api/enhanced-timetable/view-html
    const viewUrl = `${apiHost}${API_CONFIG.ENHANCED_TIMETABLE.VIEW_HTML}/${filename}`;
    window.open(viewUrl, "_blank");
  };

  const deleteHTML = async (filename) => {
    Modal.confirm({
      title: 'Delete HTML File',
      content: `Are you sure you want to delete "${filename}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await api.delete(`${API_CONFIG.ENHANCED_TIMETABLE.DELETE_HTML}/${filename}`);
          
          if (response.data) {
            message.success(response.data.message || 'File deleted successfully');
            // Refresh the file list
            await fetchGeneratedFiles();
          }
        } catch (error) {
          console.error('Error deleting file:', error);
          const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete file';
          message.error(errorMessage);
        }
      }
    });
  };

  const showRunModal = () => {
    setIsRunModalVisible(true);
  };

  const handleRunCancel = () => {
    setIsRunModalVisible(false);
    form.resetFields();
  };

  const getAlgorithmColor = (algorithm) => {
    const colors = {
      nsga2: "blue",
      spea2: "green",
      moead: "purple",
      dqn: "orange",
      sarsa: "red",
      implicit_q: "cyan",
    };
    return colors[algorithm] || "default";
  };

  const getModeColor = (mode) => {
    const colors = {
      quick: "green",
      standard: "blue",
      full: "red",
    };
    return colors[mode] || "default";
  };

  const extractAlgorithmFromFilename = (filename) => {
    // Match patterns like: timetable_nsga2_quick_20250526_195247.html
    const match = filename.match(/timetable_(\w+)_(\w+)_\d+_\d+\.html/);
    return match ? match[1] : "unknown";
  };

  const extractModeFromFilename = (filename) => {
    // Match patterns like: timetable_nsga2_quick_20250526_195247.html
    const match = filename.match(/timetable_(\w+)_(\w+)_\d+_\d+\.html/);
    return match ? match[2] : "unknown";
  };

  const fileColumns = [
    {
      title: "File Name",
      dataIndex: "filename",
      key: "filename",
      render: (filename) => (
        <Text strong style={{ fontSize: "12px" }}>
          {filename}
        </Text>
      ),
    },
    {
      title: "Algorithm",
      dataIndex: "filename",
      key: "algorithm",
      render: (filename) => {
        const algorithm = extractAlgorithmFromFilename(filename);
        return <Tag color={getAlgorithmColor(algorithm)}>{algorithm.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Mode",
      dataIndex: "filename",
      key: "mode",
      render: (filename) => {
        const mode = extractModeFromFilename(filename);
        return <Tag color={getModeColor(mode)}>{mode}</Tag>;
      },
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size) => `${(size / 1024).toFixed(1)} KB`,
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      render: (created) => new Date(created).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewHTML(record.filename)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => downloadHTML(record.filename)}
          >
            Download
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => deleteHTML(record.filename)}
            loading={loading}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-7xl mx-auto" style={{ color: '#1f2937' }}>
      <div className="flex justify-between items-center mb-4">
        <Title level={2} style={{ margin: 0, fontWeight: "bold", color: "white" }}>
           Exam Timetables 
        </Title>
        <Space>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={showRunModal}>
            Run Algorithm
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchGeneratedFiles}>
            Refresh
          </Button>
        </Space>
      </div>

      <Alert
        message="Enhanced Timetable System"
        description=" system generates HTML timetables with student ID mappings, showing detailed student information for each activity slot."
        type="info"
        showIcon
        style={{ marginBottom: 24, color: '#1f2937' }}
      />

      <Divider />

      <Tabs defaultActiveKey="overview">
        {/* Overview Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <FileTextOutlined /> Overview
            </span>
          }
          key="overview"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Dataset Statistics" bordered={false}>
                {datasetStats ? (
                  <>
                    <Row gutter={[16, 16]}>
                      {datasetStats.total_students > 0 && (
                        <Col span={12}>
                          <Statistic
                            title="Total Students"
                            value={datasetStats.total_students}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                          />
                        </Col>
                      )}
                      {datasetStats.total_activities > 0 && (
                        <Col span={12}>
                          <Statistic
                            title="Total Activities"
                            value={datasetStats.total_activities}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                          />
                        </Col>
                      )}
                      {datasetStats.total_groups > 0 && (
                        <Col span={12}>
                          <Statistic
                            title="Total Groups"
                            value={datasetStats.total_groups}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: "#722ed1" }}
                          />
                        </Col>
                      )}
                      {datasetStats.total_slots > 0 && (
                        <Col span={12}>
                          <Statistic
                            title="Time Slots"
                            value={datasetStats.total_slots}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: "#fa8c16" }}
                          />
                        </Col>
                      )}
                    </Row>
                    
                    {/* Show message when no statistics are available */}
                    {datasetStats.total_students === 0 && datasetStats.total_activities === 0 && 
                     datasetStats.total_groups === 0 && datasetStats.total_slots === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Text type="secondary">
                          Dataset statistics will be available when the enhanced data loader is properly configured.
                        </Text>
                      </div>
                    )}

                    {/* Only show student IDs section if there are actual student IDs */}
                    {datasetStats.student_id_sample && datasetStats.student_id_sample.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Divider orientation="left">Sample Student IDs</Divider>
                        <Space wrap>
                          {datasetStats.student_id_sample.map((studentId) => (
                            <Tag key={studentId} color="blue">
                              {studentId}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </>
                ) : (
                  <Spin />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Available Algorithms" bordered={false}>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {Object.entries(algorithms).map(([key, description]) => (
                    <div key={key} style={{ marginBottom: 12 }}>
                      <Tag color={getAlgorithmColor(key)}>{key.toUpperCase()}</Tag>
                      <Text style={{ fontSize: "12px" }}>{description}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="Quick Actions" bordered={false}>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={showRunModal}
                  >
                    Run Single Algorithm
                  </Button>
                  <Button
                    icon={<ExperimentOutlined />}
                    loading={batchRunLoading}
                    onClick={() => runAllAlgorithms("quick")}
                  >
                    Run All (Quick Mode)
                  </Button>
                  <Button
                    icon={<ExperimentOutlined />}
                    loading={batchRunLoading}
                    onClick={() => runAllAlgorithms("standard")}
                  >
                    Run All (Standard Mode)
                  </Button>
                  <Button
                    icon={<FileTextOutlined />}
                    loading={loading}
                    onClick={generateTestHTML}
                  >
                    Generate Test HTML
                  </Button>
                  <Button
                    icon={<BarChartOutlined />}
                    type="dashed"
                    onClick={() => {
                      // Switch to metrics tab
                      const tabsElement = document.querySelector('.ant-tabs-tab[data-node-key="metrics"]');
                      if (tabsElement) {
                        tabsElement.click();
                        message.info("Switched to Evaluation Metrics tab for algorithm comparison");
                      }
                    }}
                  >
                    View Comparisons
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* Generated Files Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <DownloadOutlined /> Generated Files ({generatedFiles.length})
            </span>
          }
          key="files"
        >
          <Card font color="white " title="Enhanced HTML Timetables" bordered={false}>
            <Table
              columns={fileColumns}
              dataSource={generatedFiles}
              rowKey="filename"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Tabs.TabPane>

        {/* Evaluation Metrics Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <BarChartOutlined /> Evaluation Metrics
            </span>
          }
          key="metrics"
        >
          <ExamMetrics />
        </Tabs.TabPane>

        {/* Run Modes Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <ExperimentOutlined /> Run Modes
            </span>
          }
          key="modes"
        >
          <Row gutter={[24, 24]}>
            {Object.entries(runModes).map(([mode, config]) => (
              <Col xs={24} lg={8} key={mode}>
                <Card
                  title={
                    <span>
                      <Tag color={getModeColor(mode)}>{mode.toUpperCase()}</Tag>
                      Mode
                    </span>
                  }
                  bordered={false}
                >
                  <Paragraph>{config.description}</Paragraph>
                  <Divider />
                  {Object.entries(algorithms).map(([algorithm]) => {
                    const params = config[algorithm];
                    return (
                      <div key={algorithm} style={{ marginBottom: 8 }}>
                        <Tag color={getAlgorithmColor(algorithm)} size="small">
                          {algorithm.toUpperCase()}
                        </Tag>
                        <Text style={{ fontSize: "11px" }}>
                          {Object.entries(params)
                            .map(([key, value]) => `${key}=${value}`)
                            .join(", ")}
                        </Text>
                      </div>
                    );
                  })}
                </Card>
              </Col>
            ))}
          </Row>
        </Tabs.TabPane>
      </Tabs>

      {/* Run Algorithm Modal */}
      <Modal
        title="Run Enhanced Timetable Algorithm"
        open={isRunModalVisible}
        onCancel={handleRunCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={runSingleAlgorithm}>
          <Form.Item
            name="algorithm"
            label="Algorithm"
            rules={[{ required: true, message: "Please select an algorithm" }]}
          >
            <Select placeholder="Select an algorithm">
              {Object.entries(algorithms).map(([key, description]) => (
                <Option key={key} value={key}>
                  <Tag color={getAlgorithmColor(key)} size="small">
                    {key.toUpperCase()}
                  </Tag>
                  {description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="mode"
            label="Run Mode"
            rules={[{ required: true, message: "Please select a run mode" }]}
          >
            <Select placeholder="Select a run mode">
              {Object.entries(runModes).map(([mode, config]) => (
                <Option key={mode} value={mode}>
                  <Tag color={getModeColor(mode)} size="small">
                    {mode.toUpperCase()}
                  </Tag>
                  {config.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Alert
            message="Enhanced HTML Generation"
            description="This will automatically generate a beautiful HTML timetable with student ID mappings and detailed information for each activity slot."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button style={{ marginRight: 8 }} onClick={handleRunCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={runLoading}>
                Run Algorithm
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnhancedExams;
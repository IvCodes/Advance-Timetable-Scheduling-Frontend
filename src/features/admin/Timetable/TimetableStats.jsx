import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { 
  Card, 
  Row, 
  Col, 
  Spin, 
  Descriptions, 
  Typography, 
  Table, 
  Divider, 
  Tabs,
  Statistic
} from "antd";
import { 
  LineChartOutlined, 
  BarChartOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { getTimetableStats } from "./timetable.api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TimetableStats = ({ timetableId }) => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (timetableId) {
        setLoading(true);
        try {
          const result = await dispatch(getTimetableStats(timetableId)).unwrap();
          setStats(result);
          setError(null);
        } catch (err) {
          setError(err.message || "Failed to fetch timetable statistics");
          console.error("Error fetching timetable stats:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [dispatch, timetableId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "20px" }}>Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="error-card">
        <div style={{ textAlign: "center", color: "#ff4d4f" }}>
          <InfoCircleOutlined style={{ fontSize: 24 }} />
          <div style={{ marginTop: "10px" }}>{error}</div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div style={{ textAlign: "center" }}>
          <Text type="secondary">No statistics available</Text>
        </div>
      </Card>
    );
  }

  // Format algorithm name for display
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

  return (
    <div className="timetable-stats-container">
      <Card title={<Title level={4}>Timetable Optimization Statistics</Title>} bordered={false}>
        <Tabs defaultActiveKey="overview">
          <TabPane 
            tab={<span><InfoCircleOutlined /> Overview</span>} 
            key="overview"
          >
            <Descriptions title="Algorithm Information" bordered column={2}>
              <Descriptions.Item label="Algorithm">
                {formatAlgorithmName(stats.algorithm)}
              </Descriptions.Item>
              <Descriptions.Item label="Population Size">
                {stats.parameters?.population || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Number of Generations">
                {stats.parameters?.generations || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Execution Time">
                {stats.stats?.execution_time ? `${stats.stats.execution_time.toFixed(2)} seconds` : "N/A"}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">Performance Metrics</Divider>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic 
                    title="Room Utilization" 
                    value={stats.metrics?.room_utilization?.toFixed(2) || "N/A"} 
                    suffix="%" 
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic 
                    title="Teacher Satisfaction" 
                    value={stats.metrics?.teacher_satisfaction?.toFixed(2) || "N/A"} 
                    suffix="%" 
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic 
                    title="Student Satisfaction" 
                    value={stats.metrics?.student_satisfaction?.toFixed(2) || "N/A"} 
                    suffix="%" 
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic 
                    title="Time Slot Efficiency" 
                    value={stats.metrics?.time_efficiency?.toFixed(2) || "N/A"} 
                    suffix="%" 
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={<span><LineChartOutlined /> Detailed Metrics</span>} 
            key="detailed"
          >
            <Card title="Optimization Details">
              {stats.stats?.convergence_history ? (
                <div>
                  <Title level={5}>Convergence History</Title>
                  <Text>
                    The algorithm ran for {stats.stats.convergence_history.length} generations and 
                    achieved a final fitness score of {stats.stats.convergence_history[stats.stats.convergence_history.length - 1]?.toFixed(4) || "N/A"}.
                  </Text>
                  
                  {/* You could add a chart here to visualize the convergence history */}
                  
                  <Divider />
                  
                  <Table 
                    dataSource={stats.stats.convergence_history.map((value, index) => ({
                      key: index,
                      generation: index + 1,
                      fitness: value.toFixed(4)
                    }))}
                    columns={[
                      {
                        title: 'Generation',
                        dataIndex: 'generation',
                        key: 'generation',
                      },
                      {
                        title: 'Fitness Score',
                        dataIndex: 'fitness',
                        key: 'fitness',
                      }
                    ]}
                    pagination={{ pageSize: 10 }}
                    scroll={{ y: 300 }}
                  />
                </div>
              ) : (
                <Text>No detailed convergence data available.</Text>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TimetableStats;

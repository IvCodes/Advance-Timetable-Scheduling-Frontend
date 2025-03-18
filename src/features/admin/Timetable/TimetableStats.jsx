import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Tabs, 
  Table, 
  Descriptions,
  Typography,
  Divider,
  Spin,
  Tag,
  Alert
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { getTimetableStats } from "./timetable.api";

const { TabPane } = Tabs;
const { Text } = Typography;

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
    const algorithmLower = algorithm?.toLowerCase();
    switch (algorithmLower) {
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

  // Format date to show only year, month, and date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Default metrics values if they're not available
  const roomUtilization = stats.metrics?.room_utilization?.toFixed(2) || "N/A";
  const teacherSatisfaction = stats.metrics?.teacher_satisfaction?.toFixed(2) || "N/A";
  const studentSatisfaction = stats.metrics?.student_satisfaction?.toFixed(2) || "N/A";
  const timeEfficiency = stats.metrics?.time_efficiency?.toFixed(2) || "N/A";

  // Constraint metrics directly from timetable data
  const hardViolations = stats.basic?.hardConstraintViolations || 0;
  const softScore = stats.basic?.softConstraintScore?.toFixed(4) || 0;
  const unassignedActivities = stats.basic?.unassignedActivities || 0;

  // Calculate execution time display
  const executionTime = stats.algorithm?.runTime 
    ? `${stats.algorithm.runTime.toFixed(2)} seconds` 
    : "N/A";

  // Create detailed constraints data for the table
  const constraintData = [
    {
      key: '1',
      type: 'Hard Constraint Violations',
      value: hardViolations,
      status: hardViolations === 0 ? 'success' : 'error'
    },
    {
      key: '2',
      type: 'Soft Constraint Score',
      value: softScore,
      status: parseFloat(softScore) >= 0.5 ? 'success' : parseFloat(softScore) > 0 ? 'warning' : 'error'
    },
    {
      key: '3',
      type: 'Unassigned Activities',
      value: unassignedActivities,
      status: unassignedActivities === 0 ? 'success' : 'error'
    }
  ];

  const constraintColumns = [
    {
      title: 'Constraint Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let icon = <CheckCircleOutlined />;
        
        if (status === 'warning') {
          color = 'orange';
          icon = <WarningOutlined />;
        } else if (status === 'error') {
          color = 'red';
          icon = <CloseCircleOutlined />;
        }
        
        return <Tag color={color} icon={icon}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <div className="timetable-stats">
      <Tabs defaultActiveKey="overview" style={{ marginBottom: 24 }}>
        <TabPane 
          tab={<span><InfoCircleOutlined /> Overview</span>} 
          key="overview"
        >
          <Descriptions title="Algorithm Information" bordered column={2}>
            <Descriptions.Item label="Algorithm">
              {formatAlgorithmName(stats.algorithm?.name)}
            </Descriptions.Item>
            <Descriptions.Item label="Population Size">
              {stats.algorithm?.parameters?.population || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Number of Generations">
              {stats.algorithm?.parameters?.generations || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Execution Time">
              {executionTime}
            </Descriptions.Item>
            <Descriptions.Item label="Dataset">
              {stats.timetable?.dataset || "SLIIT"}
            </Descriptions.Item>
            <Descriptions.Item label="Created Date">
              {formatDate(stats.timetable?.createdAt)}
            </Descriptions.Item>
          </Descriptions>
          
          <Divider orientation="left">Performance Metrics</Divider>
          
          <Row gutter={[16, 16]}>
            {/* Commenting out these metrics since they don't have data yet
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic 
                  title="Room Utilization" 
                  value={roomUtilization} 
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
                  value={teacherSatisfaction} 
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
                  value={studentSatisfaction} 
                  suffix="%" 
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic 
                  title="Time Efficiency" 
                  value={timeEfficiency} 
                  suffix="%" 
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            */}
            <Col span={24}>
              <Alert 
                message="Additional Metrics Coming Soon"
                description="Room utilization, satisfaction ratings, and time efficiency metrics are in development and will be available in future versions."
                type="info"
                showIcon
              />
            </Col>
          </Row>
          
          <Divider orientation="left">Constraint Analysis</Divider>
          
          <Table 
            dataSource={constraintData} 
            columns={constraintColumns} 
            pagination={false}
            bordered
          />
          
          {hardViolations > 0 && (
            <Alert
              message="Hard Constraints Violated"
              description="This timetable contains hard constraint violations which should be resolved for a valid schedule."
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </TabPane>
        
        <TabPane 
          tab={<span><BarChartOutlined /> Detailed Metrics</span>} 
          key="metrics"
        >
          <Card title="Detailed Constraint Violations" bordered={false}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Room Conflicts">
                {stats.detailed?.hard_constraints?.room_conflicts || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Time Conflicts">
                {stats.detailed?.hard_constraints?.time_conflicts || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Distribution Conflicts">
                {stats.detailed?.hard_constraints?.distribution_conflicts || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Student Conflicts">
                {stats.detailed?.hard_constraints?.student_conflicts || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Capacity Violations">
                {stats.detailed?.hard_constraints?.capacity_violations || 0}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TimetableStats;

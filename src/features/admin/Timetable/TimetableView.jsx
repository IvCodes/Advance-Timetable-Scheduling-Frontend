import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  Card, 
  Button, 
  Tabs, 
  Spin, 
  Result,
  Typography,
  Space
} from "antd";
import { 
  ArrowLeftOutlined, 
  TableOutlined, 
  BarChartOutlined,
  FileTextOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import TimetableStats from "./TimetableStats";
import { getSliitTimetable, getTimetableHtmlUrl } from "./timetable.api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TimetableView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch timetable data on component mount
  useEffect(() => {
    const fetchTimetable = async () => {
      if (id) {
        setLoading(true);
        try {
          const result = await dispatch(getSliitTimetable(id)).unwrap();
          setTimetable(result);
          setError(null);
        } catch (err) {
          setError(err.message || "Failed to fetch timetable");
          console.error("Error fetching timetable:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTimetable();
  }, [dispatch, id]);
  
  // Handle navigation back to timetable list
  const handleBackClick = () => {
    navigate(-1);
  };
  
  // Handle reload of iframe content
  const handleReloadIframe = () => {
    const iframe = document.getElementById("timetable-html-iframe");
    if (iframe) {
      iframe.src = iframe.src;
    }
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "20px" }}>Loading timetable...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Result
        status="error"
        title="Failed to load timetable"
        subTitle={error}
        extra={[
          <Button type="primary" key="back" onClick={handleBackClick}>
            Go Back
          </Button>
        ]}
      />
    );
  }
  
  if (!timetable) {
    return (
      <Result
        status="warning"
        title="No timetable found"
        subTitle="The requested timetable could not be found."
        extra={[
          <Button type="primary" key="back" onClick={handleBackClick}>
            Go Back
          </Button>
        ]}
      />
    );
  }
  
  return (
    <div className="timetable-view-container" style={{ padding: "20px" }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBackClick}>
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {timetable.name || "Timetable View"}
          </Title>
        </Space>
        
        <Tabs defaultActiveKey="timetable" size="large">
          <TabPane 
            tab={<span><TableOutlined /> Timetable</span>} 
            key="timetable"
          >
            <Card 
              title={
                <Space>
                  <FileTextOutlined />
                  <Text>HTML Timetable Visualization</Text>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleReloadIframe}
                    size="small"
                  >
                    Reload
                  </Button>
                </Space>
              }
            >
              <div style={{ position: "relative", height: "800px", width: "100%" }}>
                <iframe
                  id="timetable-html-iframe"
                  src={getTimetableHtmlUrl(id)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none"
                  }}
                  title="Timetable HTML"
                />
              </div>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={<span><BarChartOutlined /> Statistics</span>} 
            key="statistics"
          >
            <TimetableStats timetableId={id} />
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default TimetableView;

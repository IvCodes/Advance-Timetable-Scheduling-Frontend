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
  const [nlResponse, setNlResponse] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);

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

  useEffect(() => {
    const fetchllmresponse = async () => {
      console.log(evaluation);
      var result = null;
      if (evaluation) {
        result = await llmResponse(evaluation);
        setNlResponse(result);
      }
    };
    fetchllmresponse();
  }, [evaluation]);

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
                        {evaluation?.GA?.average_score?.toFixed(2) || "N/A"}
                      </Typography.Title>
                    </div>
                    <Row gutter={[16, 16]} className="text-white">
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Conflicts</div>
                          <div className="font-semibold">Low</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Room Utilization</div>
                          <div className="font-semibold">Medium</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Period Distribution</div>
                          <div className="font-semibold">High</div>
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
                        {evaluation?.CO?.average_score?.toFixed(2) || "N/A"}
                      </Typography.Title>
                    </div>
                    <Row gutter={[16, 16]} className="text-white">
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Conflicts</div>
                          <div className="font-semibold">Medium</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Room Utilization</div>
                          <div className="font-semibold">High</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Period Distribution</div>
                          <div className="font-semibold">Medium</div>
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
                        {evaluation?.RL?.average_score?.toFixed(2) || "N/A"}
                      </Typography.Title>
                    </div>
                    <Row gutter={[16, 16]} className="text-white">
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Conflicts</div>
                          <div className="font-semibold">High</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Room Utilization</div>
                          <div className="font-semibold">High</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center">
                          <div className="text-gray-300 mb-1">Period Distribution</div>
                          <div className="font-semibold">High</div>
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
                {nlResponse || 
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

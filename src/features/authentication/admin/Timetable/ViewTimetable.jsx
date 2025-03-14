import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  ConfigProvider,
  Tabs,
  Spin,
  Button,
  message,
  Popover,
} from "antd";
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
  editTimetable,
} from "./timetable.api";
import EditTimetableModal from "./EditTimetable";

const ViewTimetable = () => {
  const { days, periods, subjects, teachers, spaces } = useSelector(
    (state) => state.data
  );
  const {
    timetable,
    evaluation,
    loading,
    selectedAlgorithm: selectedAlgorithmFromState,
  } = useSelector((state) => state.timetable);
  const dispatch = useDispatch();
  const algorithms = ["GA", "CO", "RL", "BC", "PSO"];
  const [nlResponse, setNlResponse] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  useEffect(() => {
    dispatch(getDays());
    dispatch(getPeriods());
    dispatch(getTimetable());
    dispatch(getSubjects());
    dispatch(getSpaces());
    dispatch(getTeachers());
    dispatch(getSelectedAlgorithm());
  }, [dispatch]);

  useEffect(() => {
    const fetchllmresponse = async () => {
      if (evaluation) {
        const result = await llmResponse(evaluation);
        setNlResponse(result);
      }
    };
    fetchllmresponse();
  }, [evaluation]);

  const generateColumns = (days, timetableId, algorithm) => [
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
        if (value && value.length > 0) {
          return (
            <Popover
              content={
                <div>
                  {value.map((activity, index) => {
                    const subject = subjects?.find(
                      (s) => s.code === activity.subject
                    );
                    const room = spaces?.find(
                      (r) => r.name === activity.room.name
                    );
                    const teacher = teachers?.find(
                      (t) => t.id === activity.teacher
                    );

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          handleCellClick(
                            {
                              ...activity,
                              subject: subject?.code,
                              subject_name: subject?.long_name,
                              room: {
                                _id: room?._id,
                                name: room?.name,
                                code: room?.code,
                                long_name: room?.long_name,
                              },
                              teacher: {
                                id: teacher?.id,
                                first_name: teacher?.first_name,
                                last_name: teacher?.last_name,
                              },
                            },
                            day.name,
                            algorithm,
                            timetableId
                          );
                        }}
                        style={{ cursor: "pointer", marginBottom: "10px" }}
                      >
                        <p>
                          <strong>{activity.title}</strong>
                        </p>
                        <p>Subject: {subject?.long_name}</p>
                        <p>
                          Room: {room?.long_name} ({room?.code})
                        </p>
                        <p>
                          Teacher: {teacher?.first_name} {teacher?.last_name}
                        </p>
                        <p>Duration: {activity.duration} hours</p>
                      </div>
                    );
                  })}
                </div>
              }
              title={`Details for ${day.long_name}`}
            >
              <div className="text-center" style={{ cursor: "pointer" }}>
                {value.map((activity, index) => (
                  <div key={index}>{activity.title}</div>
                ))}
              </div>
            </Popover>
          );
        }
        return <div className="text-center">-</div>;
      },
    })),
  ];

  const generateDataSource = (semesterTimetable, days, periods) => {
    return periods.map((period) => ({
      key: period.name,
      period: period.long_name,
      ...days.reduce((acc, day) => {
        const activities = semesterTimetable.filter(
          (entry) =>
            entry.day.name === day.name &&
            entry.period.some((p) => p.name === period.name)
        );
        acc[day.name] = activities.length
          ? activities.map((activity) => ({
              ...activity,
              title: `${activity.subject} (${activity.room.name})`,
              period: activity.period.map((p) => p.name),
              duration: activity.duration,
            }))
          : null;
        return acc;
      }, {}),
    }));
  };

  const getSemName = (semester) => {
    const year = parseInt(semester.substring(3, 4));
    const sem = parseInt(semester.substring(4, 6));
    return { year, sem };
  };

  const handleCellClick = (activity, dayName, algorithm, timetableId) => {
    if (!activity) return;

    const selectedSubject = subjects?.find((s) => s.code === activity.subject);
    const selectedRoom = spaces?.find((r) => r.name === activity.room.name);
    const selectedTeacher = teachers?.find((t) => t.id === activity.teacher.id);

    const formattedActivity = {
      ...activity,
      day: dayName,
      sessionId: activity.session_id,
      subject: activity.subject,
      subject_name: selectedSubject?.long_name,
      room: activity.room.name,
      teacher: selectedTeacher?.id,
      period: activity.period,
      duration: activity.duration,
      subgroup: activity.subgroup,
      activity_id: activity.activity_id,
    };

    setSelectedActivity(formattedActivity);
    setSelectedAlgorithm(algorithm);
    setSelectedTimetableId(timetableId);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (updatedActivity) => {
    try {
      // The updatedActivity is already in the correct format from the EditTimetableModal
      console.log("updatedActivity", updatedActivity);

      // No need to create a new object, just use the updatedActivity directly
      const response = await dispatch(
        editTimetable({
          timetableId: selectedTimetableId,
          timetableData: updatedActivity,
          sessionId: updatedActivity.session_id,
        })
      ).unwrap();

      if (response.detail) {
        const conflictDescription = response.detail.match(
          /description': "(.*?)"/
        )[1];
        message.error("Conflicts detected: " + conflictDescription);
      } else {
        message.success("Timetable updated successfully");
        setEditModalVisible(false);
        dispatch(getTimetable());
      }
    } catch (error) {
      if (error.detail) {
        const conflictDescription = error.detail.match(
          /description': "(.*?)"/
        )[1];
        message.error("Failed to update timetable: " + conflictDescription);
      } else {
        message.error("Failed to update timetable: " + error.message);
      }
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-6xl mx-auto">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spin />
        </div>
      )}

      {!loading &&
        algorithms.map((algorithm) => (
          <div key={algorithm} className="mb-20">
            <div className="flex justify-between">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Timetable (
                {algorithm === "GA"
                  ? "Genetic algorithms"
                  : algorithm === "CO"
                  ? "Ant Colony Optimization"
                  : algorithm === "RL"
                  ? "Reinforcement Learning"
                  : algorithm === "BC"
                  ? "Bee Colony Optimization"
                  : algorithm === "PSO"
                  ? "Particle Swarm Optimization"
                  : ""}
                )
              </h2>
              {selectedAlgorithmFromState?.selected_algorithm === algorithm ? (
                <div className="text-green-500">Selected</div>
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
              theme={{ components: { Tabs: { itemColor: "#fff" } } }}
            >
              <Tabs type="card">
                {timetable?.map((semesterTimetable) => {
                  if (semesterTimetable.algorithm !== algorithm) return null;
                  const semester = semesterTimetable.semester;
                  const columns = generateColumns(
                    days,
                    semesterTimetable._id,
                    algorithm
                  );
                  const dataSource = generateDataSource(
                    semesterTimetable.timetable,
                    days,
                    periods
                  );
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
        ))}

      {!loading && (
        <div className="mb-10">
          <div className="text-2xl font-semibold mb-6 text-center">
            Evaluation score
          </div>
          <div>
            <div className="center">
              Genetic Algorithm (NSGAII):{" "}
              {evaluation?.GA?.average_score.toFixed(2)}
            </div>
            <div className="center">
              Ant Colony Optimization:{" "}
              {evaluation?.CO?.average_score.toFixed(2)}
            </div>
            <div className="center">
              Bee Colony Optimization:{" "}
              {evaluation?.BC?.average_score.toFixed(2)}
            </div>
            <div className="center">
              Particle Swarm Optimization:{" "}
              {evaluation?.PSO?.average_score.toFixed(2)}
            </div>
            <div className="center">
              Reinforcement Learning: {evaluation?.RL?.average_score.toFixed(2)}
            </div>
            <div className="center">
              <strong>Recommendation:{"    "}</strong> {nlResponse}
            </div>
          </div>
        </div>
      )}

      <EditTimetableModal
        visible={editModalVisible}
        onCancel={handleEditCancel}
        onSubmit={handleEditSubmit}
        initialData={selectedActivity}
        timetableId={selectedTimetableId}
        algorithm={selectedAlgorithm}
      />
    </div>
  );
};

export default ViewTimetable;

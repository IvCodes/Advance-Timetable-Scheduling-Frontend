import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Spin, 
  Select, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Tooltip,
  Progress,
  Tag,
  Space,
  Calendar,
  Badge,
  Tabs
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces, getDays, getPeriods } from '../DataManagement/data.api';
import { getPublishedTimetable } from '../Timetable/timetable.api';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, ClockCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { Pie, Column } from '@ant-design/charts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { utils as XLSXUtils, writeFile as writeXLSXFile } from 'xlsx';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const SpaceOccupancyReport = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [days, setDays] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch spaces, days, periods and published timetable
        const [spacesResponse, daysResponse, periodsResponse, timetableResponse] = await Promise.all([
          dispatch(getSpaces()).unwrap(),
          dispatch(getDays()).unwrap(),
          dispatch(getPeriods()).unwrap(),
          dispatch(getPublishedTimetable()).unwrap()
        ]);

        setSpaces(spacesResponse || []);
        setDays(daysResponse || []);
        setPeriods(periodsResponse || []);

        // Process timetable data to get space occupancy
        const spaceOccupancy = processSpaceOccupancy(
          spacesResponse, 
          daysResponse, 
          periodsResponse, 
          timetableResponse
        );
        
        setOccupancyData(spaceOccupancy);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Process timetable data to get space occupancy
  const processSpaceOccupancy = (spaces, days, periods, timetable) => {
    if (!timetable || !timetable.timetable || !timetable.timetable.slots) {
      return [];
    }

    // Create a map to track space usage
    const spaceOccupancyMap = new Map();
    
    spaces.forEach(space => {
      spaceOccupancyMap.set(space.name, {
        id: space.id || space.name,
        name: space.name,
        type: space.type || 'Lecture Hall',
        capacity: space.capacity || 30,
        totalSlots: 0,
        occupiedSlots: 0,
        occupancyRate: 0,
        dayOccupancy: {},
        periodOccupancy: {},
        details: []
      });
    });

    // Calculate total possible slots per space
    const totalPossibleSlots = days.length * periods.length;

    // Count occupancies from timetable slots
    timetable.timetable.slots.forEach(slot => {
      const roomName = slot.room;
      
      if (roomName && spaceOccupancyMap.has(roomName)) {
        const spaceData = spaceOccupancyMap.get(roomName);
        spaceData.occupiedSlots += 1;
        
        // Track day occupancy
        if (!spaceData.dayOccupancy[slot.day]) {
          spaceData.dayOccupancy[slot.day] = 1;
        } else {
          spaceData.dayOccupancy[slot.day] += 1;
        }
        
        // Track period occupancy
        if (!spaceData.periodOccupancy[slot.period]) {
          spaceData.periodOccupancy[slot.period] = 1;
        } else {
          spaceData.periodOccupancy[slot.period] += 1;
        }
        
        // Add detailed slot info
        spaceData.details.push({
          day: slot.day,
          period: slot.period,
          subject: slot.subject,
          teacher: slot.teacher,
          studentGroup: slot.student_group || '-'
        });
      }
    });

    // Calculate occupancy rates and finalize data
    const spaceOccupancy = Array.from(spaceOccupancyMap.values()).map(space => {
      space.totalSlots = totalPossibleSlots;
      space.occupancyRate = (space.occupiedSlots / space.totalSlots) * 100;
      
      return space;
    });

    return spaceOccupancy;
  };

  // Filter occupancy data based on selected day and type
  const filteredOccupancy = occupancyData.filter(item => {
    const dayMatch = selectedDay === 'all' || 
      (item.dayOccupancy[selectedDay] !== undefined);
    
    const typeMatch = selectedType === 'all' || item.type === selectedType;
    
    return dayMatch && typeMatch;
  });

  // Get space types for filtering
  const spaceTypes = [...new Set(occupancyData.map(item => item.type))].filter(Boolean);

  // Get chart data for pie chart
  const getPieChartData = () => {
    return [
      { type: 'Occupied', value: filteredOccupancy.reduce((sum, item) => sum + item.occupiedSlots, 0) },
      { type: 'Available', value: filteredOccupancy.reduce((sum, item) => sum + (item.totalSlots - item.occupiedSlots), 0) }
    ];
  };

  // Get chart data for column chart
  const getColumnChartData = () => {
    return filteredOccupancy.map(item => ({
      space: item.name,
      occupancyRate: Math.round(item.occupancyRate),
      type: item.type
    }));
  };

  // Generate PDF report
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Space Occupancy Report', 14, 22);
    
    // Add filter info
    doc.setFontSize(12);
    doc.text(`Day: ${selectedDay === 'all' ? 'All Days' : selectedDay}`, 14, 32);
    doc.text(`Space Type: ${selectedType === 'all' ? 'All Types' : selectedType}`, 14, 38);
    
    // Add date
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 44);
    
    // Prepare table data
    const tableColumn = ['Space', 'Type', 'Capacity', 'Occupied Slots', 'Total Slots', 'Occupancy Rate'];
    const tableRows = filteredOccupancy.map(item => [
      item.name,
      item.type,
      item.capacity,
      item.occupiedSlots,
      item.totalSlots,
      `${Math.round(item.occupancyRate)}%`
    ]);
    
    // Add table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      styles: { 
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 }
      }
    });
    
    doc.save('space-occupancy-report.pdf');
  };

  // Export Excel report
  const exportExcel = () => {
    const worksheet = XLSXUtils.json_to_sheet(
      filteredOccupancy.map(item => ({
        'Space': item.name,
        'Type': item.type,
        'Capacity': item.capacity,
        'Occupied Slots': item.occupiedSlots,
        'Total Slots': item.totalSlots,
        'Occupancy Rate': `${Math.round(item.occupancyRate)}%`
      }))
    );
    
    const workbook = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(workbook, worksheet, 'Space Occupancy');
    
    writeXLSXFile(workbook, 'space-occupancy-report.xlsx');
  };

  const columns = [
    {
      title: 'Space',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: spaceTypes.map(type => ({ text: type, value: type })),
      onFilter: (value, record) => record.type === value
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a, b) => a.capacity - b.capacity
    },
    {
      title: 'Occupied Slots',
      dataIndex: 'occupiedSlots',
      key: 'occupiedSlots',
      sorter: (a, b) => a.occupiedSlots - b.occupiedSlots
    },
    {
      title: 'Total Slots',
      dataIndex: 'totalSlots',
      key: 'totalSlots'
    },
    {
      title: 'Occupancy Rate',
      key: 'occupancyRate',
      render: (_, record) => (
        <Tooltip title={`${Math.round(record.occupancyRate)}% occupancy`}>
          <Progress 
            percent={Math.round(record.occupancyRate)} 
            size="small" 
            status={
              record.occupancyRate > 80 ? 'exception' : 
              record.occupancyRate < 30 ? 'active' : 'normal'
            }
          />
        </Tooltip>
      ),
      sorter: (a, b) => a.occupancyRate - b.occupancyRate
    }
  ];

  // Expandable row to show detailed schedule
  const expandedRowRender = (record) => {
    return (
      <Tabs defaultActiveKey="details" style={{ background: '#fff', borderRadius: '8px', padding: '8px' }}>
        <TabPane 
          tab={<span style={{ color: '#000' }}>Schedule Details</span>} 
          key="details"
        >
          <Table
            columns={[
              { title: 'Day', dataIndex: 'day', key: 'day' },
              { title: 'Period', dataIndex: 'period', key: 'period' },
              { title: 'Subject', dataIndex: 'subject', key: 'subject' },
              { title: 'Teacher', dataIndex: 'teacher', key: 'teacher' },
              { title: 'Class', dataIndex: 'studentGroup', key: 'studentGroup' }
            ]}
            dataSource={record.details}
            pagination={false}
            rowKey={(record, index) => `${record.day}-${record.period}-${index}`}
            style={{ background: '#fff' }}
          />
        </TabPane>
        <TabPane 
          tab={<span style={{ color: '#000' }}>Day Analysis</span>} 
          key="days"
        >
          <div style={{ height: 300, padding: '16px' }}>
            <Column
              data={Object.entries(record.dayOccupancy).map(([day, count]) => ({
                day,
                count
              }))}
              xField="day"
              yField="count"
              color="#1890ff"
              label={{
                position: 'middle',
                style: { fill: '#000' }
              }}
              xAxis={{
                label: {
                  style: { fill: '#000' }
                }
              }}
              yAxis={{
                label: {
                  style: { fill: '#000' }
                }
              }}
            />
          </div>
        </TabPane>
      </Tabs>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Row gutter={[16, 24]} className="mb-4">
          <Col span={24}>
            <div className="flex items-center justify-between">
              <Title level={3} style={{ margin: 0 }}>
                Space Occupancy Report
              </Title>
              <Space>
                <Select 
                  value={selectedDay} 
                  onChange={setSelectedDay} 
                  style={{ width: 150 }}
                >
                  <Option value="all">All Days</Option>
                  {days.map(day => (
                    <Option key={day.name} value={day.name}>{day.name}</Option>
                  ))}
                </Select>
                <Select 
                  value={selectedType} 
                  onChange={setSelectedType} 
                  style={{ width: 150 }}
                >
                  <Option value="all">All Types</Option>
                  {spaceTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
                <Select 
                  value={viewMode} 
                  onChange={setViewMode} 
                  style={{ width: 120 }}
                >
                  <Option value="table">Table View</Option>
                  <Option value="charts">Chart View</Option>
                </Select>
                <Button 
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={exportExcel}
                >
                  Export Excel
                </Button>
                <Button 
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={exportPDF}
                >
                  Export PDF
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Spaces"
                value={filteredOccupancy.length}
                valueStyle={{ color: '#40a9ff' }}
                prefix={<HomeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Average Occupancy"
                value={
                  filteredOccupancy.length > 0 
                    ? Math.round(filteredOccupancy.reduce((sum, item) => sum + item.occupancyRate, 0) / filteredOccupancy.length) 
                    : 0
                }
                suffix="%"
                valueStyle={{ color: '#40a9ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Capacity"
                value={filteredOccupancy.reduce((sum, item) => sum + item.capacity, 0)}
                valueStyle={{ color: '#40a9ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {viewMode === 'table' ? (
          <Table 
            columns={columns} 
            dataSource={filteredOccupancy}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            expandable={{
              expandedRowRender,
              rowExpandable: record => record.details.length > 0,
            }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card 
                title="Overall Space Utilization"
              >
                <div style={{ height: 300 }}>
                  {filteredOccupancy.length > 0 ? (
                    <Pie
                      data={getPieChartData()}
                      angleField="value"
                      colorField="type"
                      radius={0.8}
                      innerRadius={0.6}
                      label={{
                        type: 'outer',
                        content: '{name} {percentage}',
                        style: { fill: '#000' }
                      }}
                      legend={{
                        layout: 'horizontal',
                        position: 'bottom',
                        itemName: {
                          style: { fill: '#000' }
                        }
                      }}
                      tooltip={{
                        formatter: (datum) => {
                          return { name: datum.type, value: `${datum.value} slots` };
                        }
                      }}
                      color={['#1890ff', '#f0f0f0']}
                      statistic={{
                        title: {
                          style: { color: '#000' },
                          formatter: () => 'Utilization'
                        },
                        content: {
                          style: { color: '#40a9ff' },
                          formatter: (_, data) => {
                            const totalValue = data.reduce((sum, item) => sum + item.value, 0);
                            const occupiedValue = data.find(item => item.type === 'Occupied')?.value || 0;
                            return `${Math.round((occupiedValue / totalValue) * 100)}%`;
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Text>No data available</Text>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                title="Space Occupancy Rates"
              >
                <div style={{ height: 300 }}>
                  {filteredOccupancy.length > 0 ? (
                    <Column
                      data={getColumnChartData()}
                      xField="space"
                      yField="occupancyRate"
                      colorField="type"
                      isGroup={true}
                      seriesField="type"
                      label={{
                        position: 'top',
                        style: { fill: '#000' },
                        formatter: (datum) => `${datum.occupancyRate}%`
                      }}
                      xAxis={{
                        label: {
                          style: { fill: '#000' },
                          autoRotate: true,
                          autoHide: true,
                          autoEllipsis: true
                        }
                      }}
                      yAxis={{
                        label: {
                          style: { fill: '#000' }
                        },
                        title: {
                          text: 'Occupancy Rate (%)',
                          style: { fill: '#000' }
                        }
                      }}
                      maxColumnWidth={40}
                      columnStyle={{
                        radius: [4, 4, 0, 0]
                      }}
                      legend={{
                        itemName: {
                          style: { fill: '#000' }
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Text>No data available</Text>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default SpaceOccupancyReport;

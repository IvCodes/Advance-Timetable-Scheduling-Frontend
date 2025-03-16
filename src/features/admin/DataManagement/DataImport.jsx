// src/features/admin/DataManagement/DataImport.jsx
import React, { useState } from 'react';
import { Upload, Button, message, Tabs, Card, Alert, Typography, Space, Table, Select } from 'antd';
import { UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import GoldButton from '../../../components/buttons/GoldButton';
import { downloadTemplate, uploadData } from './data.api'; // Add these functions to your API file

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const DataImport = () => {
  const [fileList, setFileList] = useState([]);
  const [fileFormat, setFileFormat] = useState('xlsx'); // Default to Excel format
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [entityType, setEntityType] = useState('activities');

  const entityOptions = [
    { label: 'Activities', value: 'activities' },
    { label: 'Modules', value: 'modules' },
    { label: 'Years & Subgroups', value: 'years' },
    { label: 'Spaces', value: 'spaces' }
  ];

  const handleDownloadTemplate = async () => {
  try {
    await downloadTemplate(entityType, fileFormat);
    message.success(`Template for ${entityType} downloaded successfully!`);
  } catch (error) {
    message.error(`Failed to download template: ${error.message}`);
  }
};

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('file', file);
    });

    setUploading(true);

    try {
      const result = await uploadData(entityType, formData);
      setUploadResults(result);
      message.success(`${result.inserted_count} records processed successfully!`);
      setFileList([]);
    } catch (error) {
      message.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      // Check file type
      const isExcelOrCSV = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                          file.type === 'application/vnd.ms-excel' ||
                          file.type === 'text/csv';
      if (!isExcelOrCSV) {
        message.error('You can only upload Excel or CSV files!');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]); // Replace any existing file
      return false; // Prevent auto upload
    },
    fileList,
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <Title level={2} className="text-center text-gold-dark mb-6">
        Bulk Data Import
      </Title>
      
      <Alert
        message="Data Import Guidelines"
        description={
          <ul>
            <li>Download the appropriate template for the data you want to import</li>
            <li>Fill in the template with your data following the format guidelines</li>
            <li>Upload the completed file to import your data</li>
            <li>Review any errors that occur during import</li>
          </ul>
        }
        type="info"
        showIcon
        className="mb-6"
      />
      
      <Card className="mb-6">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Step 1: Select Data Type</Text>
          <Select
            options={entityOptions}
            value={entityType}
            onChange={setEntityType}
            style={{ width: '100%' }}
            placeholder="Select the type of data to import"
          />
          
          <Text strong>Step 2: Select File Format</Text>
          <Select
            options={[
              { label: 'Excel (.xlsx)', value: 'xlsx' },
              { label: 'CSV (.csv)', value: 'csv' }
            ]}
            value={fileFormat}
            onChange={setFileFormat}
            style={{ width: '100%' }}
            placeholder="Select the type of data to import"
          />
          
          <Text strong>Step 3: Download Template</Text>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleDownloadTemplate}
            style={{ width: '100%' }}
          >
            Download Template
          </Button>
          
          <Text strong>Step 4: Upload Completed File</Text>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
              Select File
            </Button>
          </Upload>
          
          <GoldButton 
            onClick={handleUpload} 
            loading={uploading}
            disabled={fileList.length === 0}
            style={{ width: '100%', marginTop: '16px' }}
          >
            Upload and Process Data
          </GoldButton>
        </Space>
      </Card>
      
      {uploadResults && (
        <Card title="Upload Results" className="mt-4">
          {uploadResults.success ? (
            <Alert
              message="Success"
              description={`Successfully imported ${uploadResults.inserted_count} records.`}
              type="success"
              showIcon
            />
          ) : (
            <>
              <Alert
                message="Import Completed with Errors"
                description={`${uploadResults.valid_count} records were valid, ${uploadResults.invalid_count} records had errors.`}
                type="warning"
                showIcon
                className="mb-4"
              />
              <Table
                dataSource={uploadResults.errors.map((error, index) => ({ key: index, ...error }))}
                columns={[
                  { title: 'Row', dataIndex: 'row', key: 'row' },
                  { title: 'Field', dataIndex: 'field', key: 'field' },
                  { title: 'Error', dataIndex: 'message', key: 'message' },
                ]}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default DataImport;
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, User, Store, Mail, MapPin, Calendar, Shield, Eye, MoreVertical, Search, Filter, Bell, TrendingUp, Star, Package, FilterX, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Avatar, Badge, Button, Card, Col, Descriptions, Divider, Empty, Input, List, message, notification, Pagination, Row, Select, Space, Spin, Statistic, Tag, Tooltip, Typography } from 'antd';
import { debounce, formatDate } from '../../utils/helpers';

const { Option } = Select;
const { Title, Text } = Typography;

const ApprovalRequestsPage = () => {
  const { pendingApprovals, getPendingApprovals } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    sortField: "fullName",
    sortOrder: "asc",
  });

  //   const [selectedCard, setSelectedCard] = useState(null);
  //   const [showDetails, setShowDetails] = useState(false);
  //   const [processingActions, setProcessingActions] = useState(new Set());

  // Initial fetch of sellers
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      setLoading(true);
      try {
        await getPendingApprovals(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder
        );
      } catch (error) {
        console.error("Failed to fetch pending approvals:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch pending approvals. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApprovals();
  }, [pagination]);

  // Statistics calculation
  const stats = {
    // pendingApplications: pendingApprovals?.length || 0,
    // approvedApplications:
    //   customers?.filter((customerObj: any) => customerObj.isActive)?.length ||
    //   0,
    //   totalApplications:
    //   customers?.filter((customerObj: any) => !customerObj.isActive)?.length ||
    //   0,

    pendingApplications: 5,
    approvedApplications: 10,
    totalApplications: 15,

  };

  // Debounced Search Function
  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      await getPendingApprovals(
        1,
        10,
        value,
        filters.sortField,
        filters.sortOrder
      );
      setLoading(false);
    }, 1000),
    []
  );


  // Clear filters button
  const clearFilters = async () => {
    if (
      searchText !== "" ||
      filters.sortField !== "fullName" ||
      filters.sortOrder !== "asc"
    ) {
      setSearchText("");
      setFilters({
        sortField: "fullName",
        sortOrder: "asc"
      });
      setLoading(true);
      await getPendingApprovals(1, 10, "", "fullName", "asc");
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: any) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: any) => {
    switch (role) {
      case 'Seller':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Customer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Add these helper functions for pagination
  const setCurrentPage = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };
  const setPageSize = (size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, current: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">

          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <Title level={2} className="mb-2">
              Seller Approvals
            </Title>
          </div>
          <Text type="secondary" className="text-lg">
            Manage pending seller applications
          </Text>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <Statistic
              title="Pending Applications"
              value={stats.pendingApplications}
              prefix={<Clock className="text-blue-600" size={20} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <Statistic
              title="Approved Applications"
              value={stats.approvedApplications}
              prefix={<CheckCircle className="text-green-600" size={20} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
            <Statistic
              title="Total Applications"
              value={stats.totalApplications}
              prefix={<User className="text-orange-600" size={20} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-sm border-0">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <Input
                size="large"
                placeholder="Search sellers by name or store..."
                value={searchText}
                onChange={(e) => {
                  setLoading(true);
                  const value = e.target.value;
                  setSearchText(value);
                  if (value.trim() === "") {
                    setTimeout(async () => {
                      await getPendingApprovals(
                        1,
                        10,
                        "",
                        filters.sortField,
                        filters.sortOrder
                      );
                      setLoading(false);
                    }, 1000);
                  } else {
                    debouncedSearch(value);
                  }
                }}
                prefix={<Search size={18} className="text-gray-400" />}
                allowClear
                className="shadow-lg"
              />
            </div>

            {/* Filters */}
            {/* <div className="flex flex-wrap gap-3">
              <Select
                placeholder="Approval"
                value={filters.filterByApproval || undefined}
                onChange={async (value) => {
                  const newApprovalFilter = value || "all";
                  setFilters((prev) => ({
                    ...prev,
                    filterByApproval: newApprovalFilter,
                  }));
                  setLoading(true);
                  await getSellers(
                    1,
                    10,
                    searchText,
                    filters.sortField,
                    filters.sortOrder,
                    filters.filterByStatus,
                    newApprovalFilter,
                    filters.filterByCity
                  );
                  setLoading(false);
                }}
                style={{ width: 140 }}
                size="large"
                allowClear
                className="shadow-lg"
              >
                <Option value="all">All Approvals</Option>
                <Option value="true">Approved</Option>
                <Option value="false">Pending</Option>
              </Select>

              <Tooltip title="Clear all filters">
                <Button
                  size="large"
                  icon={<FilterX size={18} />}
                  onClick={clearFilters}
                  className="shadow-lg"
                >
                  Clear
                </Button>
              </Tooltip>

            </div> */}
          </div>
        </Card>

        {/* Approval Cards */}
        <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
          ) : pendingApprovals && pendingApprovals.length > 0 ? (
            <>
              <div className="space-y-4">
                {pendingApprovals.map((approval: any) => (
                  <div key={approval.userId}>
                       <Card
                       hoverable
                       className="mb-4 shadow-md border-l-4"
                       style={{
                         borderLeftColor: approval.isApproved ? '#52c41a' : '#fa8c16'
                       }}
                       actions={
                         !approval.isApproved ? [
                           <Button
                             key="approve"
                             type="primary"
                             icon={<CheckCircle size={16} />}
                             loading={actionLoading === approval.userId}
                            //  onClick={() => handleApprove(approval.userId)}
                             onClick={() => message.success(`${approval.name} Approved Successfully`)}
                             className="bg-green-500 hover:bg-green-600 border-green-500"
                           >
                             Approve
                           </Button>,
                           <Button
                             key="reject"
                             danger
                             icon={<XCircle size={16} />}
                             loading={actionLoading === approval.userId}
                            //  onClick={() => handleReject(approval.userId)}
                            onClick={() => message.success(`${approval.name} Reejcted Successfully`)}
                           >
                             Reject
                           </Button>
                         ] : [
                           <Tag key="approved" color="success" icon={<CheckCircle size={14} />}>
                             Approved
                           </Tag>
                         ]
                       }
                     >
                       <List.Item.Meta
                         avatar={
                           <Avatar
                             size={64}
                             style={{
                               backgroundColor: approval.isApproved ? '#52c41a' : '#fa8c16',
                               fontSize: '20px',
                               fontWeight: 'bold'
                             }}
                           >
                        {approval.name.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                           </Avatar>
                         }
                         title={
                           <Space direction="vertical" size={0}>
                             <Text strong style={{ fontSize: '18px' }}>
                               {approval.name}
                             </Text>
                             <Space>
                               <Mail size={14} className="text-gray-400" />
                               <Text type="secondary">{approval.email}</Text>
                             </Space>
                             <Space wrap>
                      {approval.roles.map((role: any, i: any) => (
                                 <Tag
                                   key={i}
                                   color={role === 'Seller' ? 'blue' : role === 'Customer' ? 'purple' : 'default'}
                                 >
                          {role}
                                 </Tag>
                               ))}
                               <Tag color={approval.isApproved ? 'success' : 'warning'}>
                                 {approval.isApproved ? 'Approved' : 'Pending Review'}
                               </Tag>
                             </Space>
                           </Space>
                         }
                       />
               
                       <Divider />
               
                       <Row gutter={[16, 16]}>
                         {/* Store Information */}
                  {approval.storeName && (
                           <Col xs={24} sm={12}>
                             <Card size="small" title={<Space><Store size={16} />Store Information</Space>}>
                               <Descriptions size="small" column={1}>
                                 <Descriptions.Item label="Store Name">{approval.storeName}</Descriptions.Item>
                                 <Descriptions.Item label="Location">
                                   <Space>
                                     <MapPin size={14} />
                                     {approval.city}
                                   </Space>
                                 </Descriptions.Item>
                      {approval.sellerId && (
                                   <Descriptions.Item label="Seller ID">
                                     <Text code>{approval.sellerId.slice(0, 8)}...</Text>
                                   </Descriptions.Item>
                                 )}
                               </Descriptions>
                             </Card>
                           </Col>
                         )}
               
                         {/* Profile Status */}
                         <Col xs={24} sm={12}>
                           <Card size="small" title={<Space><User size={16} />Profile Status</Space>}>
                             <Space direction="vertical" style={{ width: '100%' }}>
                               <div className="flex justify-between items-center">
                                 <Text>Seller Profile</Text>
                                 <Badge
                                   status={approval.sellerProfileStatus ? 'success' : 'error'}
                                   text={approval.sellerProfileStatus ? 'Active' : 'Inactive'}
                                 />
                      </div>
                      {approval.customerId && (
                                 <div className="flex justify-between items-center">
                                   <Text>Customer Profile</Text>
                                   <Badge
                                     status={approval.customerProfileStatus ? 'success' : 'error'}
                                     text={approval.customerProfileStatus ? 'Active' : 'Inactive'}
                                   />
                        </div>
                      )}
                             </Space>
                           </Card>
                         </Col>
               
                         {/* Timeline Information */}
                         <Col xs={24}>
                           <Card size="small" title={<Space><Calendar size={16} />Timeline</Space>}>
                             <Row gutter={16}>
                               <Col xs={12}>
                                 <Statistic
                                   title="Registered"
                                   value={formatDate(approval.registeredAt)}
                                   valueStyle={{ fontSize: '14px' }}
                                 />
                               </Col>
                               <Col xs={12}>
                                 <Statistic
                                   title="Last Login"
                                   value={formatDateTime(approval.lastLogin)}
                                   valueStyle={{ fontSize: '14px' }}
                                 />
                               </Col>
                             </Row>
                           </Card>
                         </Col>
                       </Row>
                     </Card>
                  </div>
                ))}
                  </div>

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pendingApprovals.length}
                  // onChange={handlePaginationChange}
                  onChange={(page, pageSize) => {
                    setPagination({ current: page, pageSize: pageSize || 5 });
                  }}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`
                  }
                  pageSizeOptions={['5', '10', '20', '50']}
                />
              </div>
            </>
          ) : (
            <Empty
              description="No pending approvals found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
          }
          </Card>
      </div>
    </div>
  );
};

export default ApprovalRequestsPage;
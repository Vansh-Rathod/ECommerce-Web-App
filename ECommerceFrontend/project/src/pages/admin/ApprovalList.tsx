import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Store,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Bell,
  TrendingUp,
  Star,
  Package,
  FilterX,
  X,
  Download,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Empty,
  Input,
  List,
  message,
  notification,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { debounce, formatDate } from "../../utils/helpers";
import { GetPendingApprovals } from "../../services/AdminApiHelperService";

const { Option } = Select;
const { Title, Text } = Typography;

const ApprovalRequestsPage = () => {
  // const { pendingApprovals, getPendingApprovals } = useAdmin();

  const [pendingApprovals, setPendingApprovals] = useState<any>([]);
  const [totalPendingApprovals, setTotalPendingApprovals] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    sortField: "fullname",
    sortOrder: "asc",
  });
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  //   const [selectedCard, setSelectedCard] = useState(null);
  //   const [showDetails, setShowDetails] = useState(false);
  //   const [processingActions, setProcessingActions] = useState(new Set());

  // Debounced effect for all changes (pagination, searchText, filters)
  useEffect(() => {
    setLoading(true); // Start loading immediately on any change
    const handler = setTimeout(async () => {
      try {
        const fromDate = dateRange?.[0] ? dateRange[0].toISOString() : null;
        const toDate = dateRange?.[1] ? dateRange[1].toISOString() : null;

        const result = await GetPendingApprovals(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          fromDate,
          toDate
        );

        if (result.success) {
          setPendingApprovals(result.data.pendingUsers);
          setTotalPendingApprovals(result.data.totalPendingUsers);
        } else {
          setPendingApprovals([]);
          setTotalPendingApprovals(0);
        }
      } catch (error) {
        message.error("Something went wrong while fetching pending approvals");
        console.error(
          "Something went wrong while fetching pending approvals: ",
          error
        );
      } finally {
        setLoading(false); // Stop loading after API call
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [pagination, searchText, filters, dateRange]);

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
    totalApplications: totalPendingApprovals,
  };

  // Clear filters button
  const clearFilters = () => {
    const isFiltersActive =
      searchText !== "" ||
      filters.sortField !== "fullname" ||
      filters.sortOrder !== "asc" ||
      dateRange !== null; // also check dateRange

    if (isFiltersActive) {
      setSearchText("");
      setFilters({
        sortField: "fullname",
        sortOrder: "asc",
      });
      setDateRange(null); // reset dateRange
      setPagination((prev) => ({ ...prev, current: 1, pageSize: 10 }));
    }
  };

  // Export in excel functionality
  const handleExport = () => {
    // Implement export functionality
    notification.info({
      message: "Export",
      description: "Export functionality will be implemented.",
    });
  };

  const formatDateTime = (dateString: any) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role: any) => {
    switch (role) {
      case "Seller":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Customer":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Pending Applications"
              value={stats.pendingApplications}
              prefix={<Clock className="text-blue-600" size={20} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Approved Applications"
              value={stats.approvedApplications}
              prefix={<CheckCircle className="text-green-600" size={20} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Total Applications"
              value={stats.totalApplications}
              prefix={<User className="text-orange-600" size={20} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </div>

        {/* Search, Filter, & Export Section */}
        <Card className="mb-6 shadow-sm border-0">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <Input
                size="large"
                placeholder="Search sellers by name or store..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPagination((prev) => ({ ...prev, current: 1 }));
                }}
                prefix={<Search size={18} className="text-gray-400" />}
                allowClear
                className="shadow-lg"
              />
            </div>

            {/* Filters */}
            {/* Date Range */}
            <div className="flex flex-wrap gap-3">
              <DatePicker.RangePicker
                size="large"
                className="shadow-lg"
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates);
                  setPagination((prev) => ({
                    ...prev,
                    current: 1,
                    pageSize: 10,
                  }));
                }}
                allowClear
              />

              {/* Clear Filter */}
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

              {/* Export */}
              <Tooltip title="Export products">
                <Button
                  size="large"
                  icon={<Download size={18} />}
                  onClick={handleExport}
                  className="shadow-sm"
                >
                  Export
                </Button>
              </Tooltip>
            </div>
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
                        borderLeftColor: approval.isApproved
                          ? "#52c41a"
                          : "#fa8c16",
                      }}
                      actions={
                        !approval.isApproved
                          ? [
                              <Button
                                key="approve"
                                type="primary"
                                icon={<CheckCircle size={16} />}
                                loading={actionLoading === approval.userId}
                                //  onClick={() => handleApprove(approval.userId)}
                                onClick={() =>
                                  message.success(
                                    `${approval.name} Approved Successfully`
                                  )
                                }
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
                                onClick={() =>
                                  message.success(
                                    `${approval.name} Reejcted Successfully`
                                  )
                                }
                              >
                                Reject
                              </Button>,
                            ]
                          : [
                              <Tag
                                key="approved"
                                color="success"
                                icon={<CheckCircle size={14} />}
                              >
                                Approved
                              </Tag>,
                            ]
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size={64}
                            style={{
                              backgroundColor: approval.isApproved
                                ? "#52c41a"
                                : "#fa8c16",
                              fontSize: "20px",
                              fontWeight: "bold",
                            }}
                          >
                            {approval.name
                              .split(" ")
                              .map((n: any) => n[0])
                              .join("")
                              .toUpperCase()}
                          </Avatar>
                        }
                        title={
                          <Space direction="vertical" size={0}>
                            <Text strong style={{ fontSize: "18px" }}>
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
                                  color={
                                    role === "Seller"
                                      ? "blue"
                                      : role === "Customer"
                                      ? "purple"
                                      : "default"
                                  }
                                >
                                  {role}
                                </Tag>
                              ))}
                              <Tag
                                color={
                                  approval.isApproved ? "success" : "warning"
                                }
                              >
                                {approval.isApproved
                                  ? "Approved"
                                  : "Pending Review"}
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
                            <Card
                              size="small"
                              title={
                                <Space>
                                  <Store size={16} />
                                  Store Information
                                </Space>
                              }
                            >
                              <Descriptions size="small" column={1}>
                                <Descriptions.Item label="Store Name">
                                  {approval.storeName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Location">
                                  <Space>
                                    <MapPin size={14} />
                                    {approval.city}
                                  </Space>
                                </Descriptions.Item>
                                {approval.sellerId && (
                                  <Descriptions.Item label="Seller ID">
                                    <Text code>
                                      {approval.sellerId.slice(0, 8)}...
                                    </Text>
                                  </Descriptions.Item>
                                )}
                              </Descriptions>
                            </Card>
                          </Col>
                        )}

                        {/* Profile Status */}
                        <Col xs={24} sm={12}>
                          <Card
                            size="small"
                            title={
                              <Space>
                                <User size={16} />
                                Profile Status
                              </Space>
                            }
                          >
                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                            >
                              <div className="flex justify-between items-center">
                                <Text>Seller Profile</Text>
                                <Badge
                                  status={
                                    approval.sellerProfileStatus
                                      ? "success"
                                      : "error"
                                  }
                                  text={
                                    approval.sellerProfileStatus
                                      ? "Active"
                                      : "Inactive"
                                  }
                                />
                              </div>
                              {approval.customerId && (
                                <div className="flex justify-between items-center">
                                  <Text>Customer Profile</Text>
                                  <Badge
                                    status={
                                      approval.customerProfileStatus
                                        ? "success"
                                        : "error"
                                    }
                                    text={
                                      approval.customerProfileStatus
                                        ? "Active"
                                        : "Inactive"
                                    }
                                  />
                                </div>
                              )}
                            </Space>
                          </Card>
                        </Col>

                        {/* Timeline Information */}
                        <Col xs={24}>
                          <Card
                            size="small"
                            title={
                              <Space>
                                <Calendar size={16} />
                                Timeline
                              </Space>
                            }
                          >
                            <Row gutter={16}>
                              <Col xs={12}>
                                <Statistic
                                  title="Registered"
                                  value={formatDate(approval.registeredAt)}
                                  valueStyle={{ fontSize: "14px" }}
                                />
                              </Col>
                              <Col xs={12}>
                                <Statistic
                                  title="Last Login"
                                  value={formatDateTime(approval.lastLogin)}
                                  valueStyle={{ fontSize: "14px" }}
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
                  onChange={(page, pageSize) => {
                    setPagination({ current: page, pageSize: pageSize || 10 });
                  }}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} pending approvals`
                  }
                  pageSizeOptions={["5", "10", "20", "50"]}
                />
              </div>
            </>
          ) : (
            <Empty
              description="No pending approvals found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ApprovalRequestsPage;

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Users,
  Store,
  UserCheck,
  Calendar,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  Download,
  FilterX,
  Trash2,
  ImageIcon,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Input,
  MenuProps,
  notification,
  Select,
  Table,
  Tooltip,
  Form,
  Statistic,
  Typography,
  Modal,
  Spin,
  Badge,
  Tag,
  message,
} from "antd";
import { debounce, formatDate } from "../../utils/helpers";
import { useSeller } from "../../context/SellerContext";
import api from "../../services/api";

const { Option } = Select;
const { Title, Text } = Typography;

const SellersList = () => {
  const { sellers, getSellers } = useSeller();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    sortField: "fullName",
    sortOrder: "asc",
    filterByStatus: "all",
    filterByApproval: "all",
    filterByCity: "all",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewSeller, setViewSeller] = useState<any | null>(null);

  const cities = ["Ahmedabad", "New York", "Gandhinagar", "Rajkot", "Surat", "Mumbai", "Pune", "Thane", "Kanpur", "Jaipur", "Udaipur"];

  // Initial fetch of sellers
  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      try {
        await getSellers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus,
          filters.filterByApproval,
          filters.filterByCity
        );
      } catch (error) {
        console.error("Failed to fetch sellers:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch sellers. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, [pagination]);

  // Statistics calculation
  const stats = {
    totalSellers: sellers?.length || 0,
    activeSellers:
      sellers?.filter((seller: any) => seller.isActive)?.length || 0,
    inactiveSellers:
      sellers?.filter((seller: any) => !seller.isActive)?.length || 0,
    approvedSellers:
      sellers?.filter((seller: any) => seller.isApproved)?.length || 0,
    pendingSellers:
      sellers?.filter((seller: any) => !seller.isApproved)?.length || 0,
    totalProducts:
      sellers?.reduce(
        (sum: number, seller: any) => sum + (seller.sellerProducts?.length || 0),
        0
      ) || 0,
    totalOrders:
      sellers?.reduce(
        (sum: number, seller: any) => sum + (seller.sellerOrders?.length || 0),
        0
      ) || 0,
    totalValue:
      sellers?.reduce(
        (sum: number, seller: any) =>
          sum +
          (seller.sellerProducts?.reduce(
            (productSum: number, product: any) =>
              productSum + product.price * product.stockQuantity,
            0
          ) || 0),
        0
      ) || 0,
  };

  // Function for seller active status
  const getStatusIcon = (status: any) => {
    if (status === true)
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === false) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  // Function for seller approval status
  const getApprovalStatus = (isApproved: any) => {
    if (isApproved === true)
      return { text: "Approved", color: "text-green-600 bg-green-50" };
    if (isApproved === false)
      return { text: "Pending", color: "text-yellow-600 bg-yellow-50" };
    return { text: "N/A", color: "text-gray-600 bg-gray-50" };
  };

  // Debounced Search Function
  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      await getSellers(
        1,
        10,
        value,
        filters.sortField,
        filters.sortOrder,
        filters.filterByStatus,
        filters.filterByApproval,
        filters.filterByCity
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
      filters.sortOrder !== "asc" ||
      filters.filterByStatus !== "all" ||
      filters.filterByApproval !== "all" ||
      filters.filterByCity !== "all"
    ) {
      setSearchText("");
      setFilters({
        sortField: "fullName",
        sortOrder: "asc",
        filterByStatus: "all",
        filterByApproval: "all",
        filterByCity: "all",
      });
      setLoading(true);
      await getSellers(1, 10, "", "fullName", "asc", "all", "all", "all");
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = () => {
    notification.info({
      message: "Export",
      description: "Export functionality will be implemented.",
    });
  };

  // Get seller by sellerId
  const getSellerById = async (sellerId: any) => {
    if (sellerId) {
      setLoading(true);
      try {
        const response = await api.get(`/seller/${sellerId}`);
        if (response.data.status !== 200) {
          notification.error({
            message: "Error",
            description: "Something went wrong while fetching seller details.",
          });
          return null;
        }
        return response.data.data;
      } catch (error) {
        console.error("Failed to fetch seller details:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch seller details. Please try again.",
        });
        return null;
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle seller active status
  const toggleSellerStatus = async (seller: any) => {
    const sellerData = await getSellerById(seller.sellerId);
    if (sellerData !== null) {
      setActionLoading(sellerData.sellerId);
      try {
        const endpoint = seller.isActive
          ? `/seller/inactive/${sellerData.sellerId}`
          : `/seller/active/${sellerData.sellerId}`;

        const response = await api.put(endpoint);
        if (response.data.status !== 200) {
          notification.error({
            message: "Error",
            description: seller.isActive
              ? `Something went wrong while deactivating ${sellerData.sellerName}`
              : `Something went wrong while activating ${sellerData.sellerName}`,
          });
          return;
        }

        notification.success({
          message: "Success",
          description: seller.isActive
            ? `${sellerData.sellerName} has been deactivated successfully.`
            : `${sellerData.sellerName} has been activated successfully.`,
        });

        // Refresh the sellers list
        await getSellers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus,
          filters.filterByApproval,
          filters.filterByCity
        );
      } catch (error) {
        console.error("Failed to toggle seller status:", error);
        notification.error({
          message: "Error",
          description: "Failed to update seller status. Please try again.",
        });
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Approve Seller
  const approveSeller = async (seller: any) => {
    const sellerData = await getSellerById(seller.sellerId);
    if (sellerData !== null) {
      setActionLoading(sellerData.sellerId);
      try {
        const endpoint = `/seller/approve-seller/${sellerData.sellerId}`;
          // ? `/seller/disapprove/${sellerData.sellerId}`

        const response = await api.post(endpoint);
        if (response.data.status !== 200) {
          notification.error({
            message: "Error",
            description: `Something went wrong while approving ${sellerData.sellerName}`,
              // ? `Something went wrong while disapproving ${sellerData.sellerName}`
          });
          return;
        }

        notification.success({
          message: "Success",
          description: `${sellerData.sellerName} has been approved successfully.`,
            // ? `${sellerData.sellerName} has been disapproved successfully.`
        });

        // Refresh the sellers list
        await getSellers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus,
          filters.filterByApproval,
          filters.filterByCity
        );
      } catch (error) {
        console.error("Failed to toggle seller approval:", error);
        notification.error({
          message: "Error",
          description: "Failed to approve seller. Please try again.",
        });
      } finally {
        setActionLoading(null);
      }
    }
  };

   // Reject Seller
   const rejectSeller = async (seller: any) => {
    const sellerData = await getSellerById(seller.sellerId);
    if (sellerData !== null) {
      setActionLoading(sellerData.sellerId);
      try {
        const endpoint = `/seller/reject-seller/${sellerData.sellerId}`;

        const response = await api.delete(endpoint);
        if (response.data.status !== 200) {
          notification.error({
            message: "Error",
            description: `Something went wrong while rejecting ${sellerData.sellerName}`,
          });
          return;
        }

        notification.success({
          message: "Success",
          description: `${sellerData.sellerName} has been rejected successfully.`,
        });
        
        // Refresh the sellers list
        await getSellers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus,
          filters.filterByApproval,
          filters.filterByCity
        );
      } catch (error) {
        console.error("Failed to toggle seller approval:", error);
        notification.error({
          message: "Error",
          description: "Failed to reject seller. Please try again.",
        });
      } finally {
        setActionLoading(null);
      }
    }
  };

  // View seller details
  const handleViewDetails = async (seller: any) => {
    const sellerData = await getSellerById(seller.sellerId);
    if (sellerData) {
      setViewSeller(sellerData);
      setIsViewModalVisible(true);
    }
  };

  // Action menu for each seller
  const actionMenu = (record: any): MenuProps => ({
    items: [
      {
        key: "view",
        label: "View Details",
        icon: <Eye size={14} />,
        onClick: () => handleViewDetails(record),
      },
      {
        key: "edit",
        label: "Edit Seller",
        icon: <Edit size={14} />,
        // onClick: () => showModal(record),
      },
       // Conditionally show Activate/Deactivate only if seller is approved
    ...(record.isApproved
      ? [
      {
        key: "toggle",
        label: record.isActive ? "Deactivate" : "Activate",
        icon: record.isActive ? (
          <ToggleLeft size={14} />
        ) : (
          <ToggleRight size={14} />
        ),
        onClick: () => {
          Modal.confirm({
            title: record.isActive
              ? `Are you sure you want to Deactivate "${record.sellerName}"?`
              : `Are you sure you want to Activate "${record.sellerName}"?`,
            content: record.isActive
              ? `You can later Activate "${record.sellerName}".`
              : `You can later Deactivate "${record.sellerName}".`,
            okText: record.isActive ? "Deactivate" : "Activate",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => await toggleSellerStatus(record),
          });
        },
      },
    ]
    : []),
        // Show "Approve" only if seller is NOT approved
    ...(!record.isApproved
      ? [
          {
            key: "approve",
            label: "Approve",
            icon: <UserCheck size={14} />,
            onClick: () => {
              Modal.confirm({
                title: `Are you sure you want to Approve "${record.sellerName}"?`,
                content: "This will grant them seller privileges.",
                okText: "Approve",
                okType: "primary",
                cancelText: "Cancel",
                // onOk: async () => await toggleSellerApproval(record),
                onOk: () => approveSeller(record),
              });
            },
          },
          {
            key: "reject",
            label: "Reject",
            icon: <Ban size={14} />,
            onClick: () => {
              Modal.confirm({
                title: `Are you sure you want to Reject "${record.sellerName}"?`,
                content: "This will remove them from pending seller approvals.",
                okText: "Reject",
                okType: "danger",
                cancelText: "Cancel",
                onOk: () => rejectSeller(record),
              });
            },
          },
        ]
      : []), // Nothing added when isApproved is true
      {
        type: "divider",
      },
      {
        key: "delete",
        label: "Delete",
        icon: <Trash2 size={14} />,
        danger: true,
        // onClick: () => handleDelete(record),
      },
    ],
  });

  // Table Columns
  const columns = [
    {
      title: "Seller Info",
      key: "sellerInfo",
      width: 300,
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {record.sellerName?.charAt(0)?.toUpperCase() || "S"}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.sellerName || "N/A"}
            </div>
            <div className="text-sm text-gray-500 truncate flex items-center">
              <Store className="w-4 h-4 mr-1" />
              {record.storeName || "No store name"}
            </div>
            <div className="text-sm text-gray-500 truncate flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {record.sellerEmail || "No email"}
            </div>
            <div className="text-xs text-gray-400 mt-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {record.city || "No city"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {getStatusIcon(record.isActive)}
            <span className="text-sm text-gray-600">
              {record.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <Tag
              color={record.isApproved ? "green" : "orange"}
              className="text-xs"
            >
              {record.isApproved ? "Approved" : "Pending"}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Products",
      key: "products",
      width: 100,
      render: (_: any, record: any) => (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">
              {record.sellerProducts?.length || 0}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Active: {record.sellerProducts?.filter((p: any) => p.isActive)?.length || 0}
          </div>
        </div>
      ),
    },
    {
      title: "Orders",
      key: "orders",
      width: 100,
      render: (_: any, record: any) => (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <ShoppingCart className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">
              {record.sellerOrders?.length || 0}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Completed: {record.sellerOrders?.filter((o: any) => o.status === 1)?.length || 0}
          </div>
        </div>
      ),
    },
    {
      title: "Total Value",
      key: "totalValue",
      width: 120,
      render: (_: any, record: any) => {
        const totalValue = record.sellerProducts?.reduce(
          (sum: number, product: any) =>
            sum + product.price * product.stockQuantity,
          0
        ) || 0;
        return (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <DollarSign className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">
                ${totalValue.toLocaleString()}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Last Login",
      key: "lastLogin",
      width: 120,
      render: (_: any, record: any) => (
        <div className="text-sm text-gray-900 flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
          {record.sellerLastLogin ? formatDate(record.sellerLastLogin) : "Never"}
        </div>
      ),
    },
    {
      title: "Registration",
      key: "registration",
      width: 120,
      render: (_: any, record: any) => (
        <div className="text-sm text-gray-900 flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
          {formatDate(record.createdAt)}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: any, record: any) => (
        <Dropdown
          menu={actionMenu(record)}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreHorizontal size={18} />}
            loading={actionLoading === record.sellerId}
            className="hover:bg-gray-100"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Store className="w-8 h-8 text-blue-600" />
            <Title level={2} className="mb-2">
              Sellers Management
            </Title>
          </div>
          <Text type="secondary" className="text-lg">
            Manage all sellers and their stores in your platform
          </Text>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <Statistic
              title="Total Sellers"
              value={stats.totalSellers}
              prefix={<Users className="text-blue-600" size={20} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <Statistic
              title="Active Sellers"
              value={stats.activeSellers}
              prefix={<CheckCircle className="text-green-600" size={20} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
            <Statistic
              title="Pending Approval"
              value={stats.pendingSellers}
              prefix={<Clock className="text-orange-600" size={20} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<Package className="text-purple-600" size={20} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </div>

        {/* Filters and Actions */}
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
                      await getSellers(
                        1,
                        10,
                        "",
                        filters.sortField,
                        filters.sortOrder,
                        filters.filterByStatus,
                        filters.filterByApproval,
                        filters.filterByCity
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
            <div className="flex flex-wrap gap-3">
              <Select
                placeholder="Status"
                value={filters.filterByStatus || undefined}
                onChange={async (value) => {
                  const newStatusFilter = value || "all";
                  setFilters((prev) => ({
                    ...prev,
                    filterByStatus: newStatusFilter,
                  }));
                  setLoading(true);
                  await getSellers(
                    1,
                    10,
                    searchText,
                    filters.sortField,
                    filters.sortOrder,
                    newStatusFilter,
                    filters.filterByApproval,
                    filters.filterByCity
                  );
                  setLoading(false);
                }}
                style={{ width: 120 }}
                size="large"
                allowClear
                className="shadow-lg"
              >
                <Option value="all">All Status</Option>
                <Option value="true">Active</Option>
                <Option value="false">Inactive</Option>
              </Select>

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

              <Select
                placeholder="City"
                value={filters.filterByCity || undefined}
                onChange={async (value) => {
                  const newCityFilter = value || "all";
                  setFilters((prev) => ({
                    ...prev,
                    filterByCity: newCityFilter,
                  }));
                  setLoading(true);
                  await getSellers(
                    1,
                    10,
                    searchText,
                    filters.sortField,
                    filters.sortOrder,
                    filters.filterByStatus,
                    filters.filterByApproval,
                    newCityFilter
                  );
                  setLoading(false);
                }}
                style={{ width: 140 }}
                size="large"
                allowClear
                className="shadow-lg"
              >
                <Option value="all">All Cities</Option>
                {cities.map((city) => (
                  <Option key={city} value={city}>
                    {city}
                  </Option>
                ))}
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

              <Tooltip title="Export sellers">
                <Button
                  size="large"
                  icon={<Download size={18} />}
                  onClick={handleExport}
                  className="shadow-lg"
                >
                  Export
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>

        {/* Sellers Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <Card className="shadow-lg border-0">
            <Table
              dataSource={sellers}
              columns={columns}
              rowKey="sellerId"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: sellers?.length || 0,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} sellers`,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["5", "10", "20", "50", "100"],
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize: pageSize || 5 });
                },
              }}
              scroll={{ x: 1200 }}
              className="custom-table"
            />
          </Card>
        )}
        </div>
    </div>
  );
};

export default SellersList;
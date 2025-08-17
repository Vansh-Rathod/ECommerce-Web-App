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
  UserX,
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
import {
  ApproveSeller,
  GetSellerById,
  GetSellers,
  MakeSellerActive,
  MakeSellerInactive,
  RejectSeller,
} from "../../services/SellerApiHelperService";
import { CommonResponse } from "../../Types";
import { cities } from "../../Constants";

const { Option } = Select;
const { Title, Text } = Typography;

const SellersList = () => {
  const [sellers, setSellers] = useState<any>([]);
  const [totalSellers, setTotalSellers] = useState<number>(0);

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

  // Initial fetch of sellers
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const result = await GetSellers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus,
          filters.filterByApproval,
          filters.filterByCity
        );

        if (result.success) {
          setSellers(result.data.sellers);
          setTotalSellers(result.data.totalSellers);
        } else {
          setSellers([]);
          setTotalSellers(0);
        }
      } catch (error) {
        message.error("Something went wrong while fetching sellers");
        console.error("Something went wrong while fetching sellers: ", error);
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [pagination, searchText, filters]);

  // Statistics calculation
  const stats = {
    totalSellers: totalSellers || 0,
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
        (sum: number, seller: any) =>
          sum + (seller.sellerProducts?.length || 0),
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

  // Clear filters button
  const clearFilters = async () => {
    const isFiltersActive =
      searchText !== "" ||
      filters.sortField !== "fullname" ||
      filters.sortOrder !== "asc" ||
      filters.filterByStatus !== "all" ||
      filters.filterByApproval !== "all" ||
      filters.filterByCity !== "all";
    if (isFiltersActive) {
      setSearchText("");
      setFilters({
        sortField: "fullName",
        sortOrder: "asc",
        filterByStatus: "all",
        filterByApproval: "all",
        filterByCity: "all",
      });
      setPagination((prev) => ({ ...prev, current: 1, pageSize: 10 }));
    }
  };

  // Export functionality
  const handleExport = () => {
    notification.info({
      message: "Export",
      description: "Export functionality will be implemented.",
    });
  };

  // Toggle seller active status
  const toggleSellerStatus = async (seller: any) => {
    console.log("seller data:", seller);
    const sellerByIdData = await GetSellerById(seller.sellerId);

    if (!sellerByIdData.success) {
      message.error(sellerByIdData.error);
      return;
    }
    setActionLoading(seller.sellerId);

    if (sellerByIdData !== null && sellerByIdData.data !== null) {
      try {
        let result: CommonResponse<any>;

        if (seller.isActive) {
          // Deactivate Seller
          result = await MakeSellerInactive(seller.sellerId);
        } else {
          // Activate Seller
          result = await MakeSellerActive(seller.sellerId);
        }

        if (!result.success) {
          message.error(result.error);
          return;
        }

        message.success(result.message);

        // Refresh the sellers list
        const refreshedSellers = await GetSellers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus,
          filters.filterByApproval,
          filters.filterByCity
        );

        if (!refreshedSellers.success) {
          message.error(refreshedSellers.error);
          setSellers([]);
          setTotalSellers(0);
          return;
        }

        setSellers(refreshedSellers.data.sellers);
        setTotalSellers(refreshedSellers.data.totalSellers);
      } catch (error) {
        console.error("Failed to toggle seller status:", error);
        message.error("Failed to toggle seller status. Please try again.");
      } finally {
        setActionLoading(null);
      }
    } else {
      setActionLoading(null);
      console.log(sellerByIdData.error);
      message.error(sellerByIdData.error);
    }
  };

  // Handle seller approval
  const handleApproveSeller = async (seller: any) => {
    setActionLoading(seller.sellerId);
    // console.log("sellerData: ", seller);
    const sellerByIdResult = await GetSellerById(seller.sellerId);
    if (!sellerByIdResult.success) {
      message.error(sellerByIdResult.error);
      return;
    }
    if (
      sellerByIdResult !== null &&
      seller.sellerId !== null &&
      sellerByIdResult.data.sellerId !== null
    ) {
      try {
        const result = await ApproveSeller(seller.sellerId);
        if (!result.success) {
          message.error(result.error);
          return;
        }
        message.success(result.message);

        // Refresh the sellers list
        const refreshedSellers = await GetSellers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus,
          filters.filterByApproval,
          filters.filterByCity
        );

        if (!refreshedSellers.success) {
          message.error(refreshedSellers.error);
          setSellers([]);
          setTotalSellers(0);
          return;
        }

        setSellers(refreshedSellers.data.sellers);
        setTotalSellers(refreshedSellers.data.totalSellers);
      } catch (error) {
        console.error("Failed to approve seller: ", error);
        message.error("Failed to approve seller. Please try again");
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Handle seller rejection
  const handleRejectSeller = async (seller: any) => {
    setActionLoading(seller.sellerId);
    // console.log("sellerData: ", seller);
    const sellerByIdResult = await GetSellerById(seller.sellerId);
    if (!sellerByIdResult.success) {
      message.error(sellerByIdResult.error);
      return;
    }
    if (
      sellerByIdResult !== null &&
      seller.sellerId !== null &&
      sellerByIdResult.data.sellerId !== null
    ) {
      try {
        const result = await RejectSeller(seller.sellerId);
        if (!result.success) {
          message.error(result.error);
          return;
        }
        message.success(result.message);

        // Refresh the sellers list
        const refreshedSellers = await GetSellers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus,
          filters.filterByApproval,
          filters.filterByCity
        );

        if (!refreshedSellers.success) {
          message.error(refreshedSellers.error);
          setSellers([]);
          setTotalSellers(0);
          return;
        }

        setSellers(refreshedSellers.data.sellers);
        setTotalSellers(refreshedSellers.data.totalSellers);
      } catch (error) {
        console.error("Failed to reject seller: ", error);
        message.error("Failed to reject seller. Please try again");
      } finally {
        setActionLoading(null);
      }
    }
  };

  // View seller details
  const handleViewDetails = async (seller: any) => {
    setLoading(true);
    const sellerByIdData = await GetSellerById(seller.sellerId);
    if (!sellerByIdData.success) {
      message.error(sellerByIdData.error);
      return;
    }
    if (sellerByIdData !== null && sellerByIdData.data !== null) {
      try {
        setViewSeller(sellerByIdData.data);
        setIsViewModalVisible(true);
      } catch (error) {
        console.log("Error: ", error);
        message.error("Failed to fetch seller details. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      console.log(sellerByIdData.error);
      message.error(sellerByIdData.error);
    }
  };

  // Action menu for each seller
  const actionMenu = (record: any): MenuProps => {
    // Case 1: Not approved → view + approve + reject
    if (!record.isApproved && record.isApproved != null) {
      return {
        items: [
          {
            key: "view",
            label: "View Details",
            icon: <Eye size={14} />,
            // onClick: () => handleViewDetails(record),
          },
          {
            key: "approve",
            label: "Approve",
            icon: <UserCheck size={14} />,
            onClick: () => {
              Modal.confirm({
                title: `Are you sure you want to Approve "${record.name}"?`,
                content: "This will grant them seller privileges.",
                okText: "Approve",
                okType: "primary",
                cancelText: "Cancel",
                onOk: async () =>
                  // message.success("Need To Implement The Functionality"),
                  handleApproveSeller(record),
              });
            },
          },
          {
            key: "reject",
            label: "Reject",
            icon: <UserX size={14} />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: `Are you sure you want to Reject "${record.name}"?`,
                content: "They will not be able to act as a seller.",
                okText: "Reject",
                okType: "danger",
                cancelText: "Cancel",
                onOk: async () =>
                  // message.success("Need To Implement Reject Functionality"),
                  handleRejectSeller(record),
              });
            },
          },
        ],
      };
    }

    // Case 2: Approved → full menu
    return {
      items: [
        {
          key: "edit",
          label: "Edit Seller",
          icon: <Edit size={14} />,
          // onClick: () => showModal(record),
        },
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
                ? `Are you sure you want to Deactivate "${record.name}'s seller profile"?`
                : `Are you sure you want to Activate "${record.name}'s seller profile"?`,
              content: record.isActive
                ? `This action will make ${record.name}'s seller profile inactive. You can later activate it.`
                : `This action will make ${record.name}'s seller profile active. You can later deactivate it.`,
              okText: record.isActive ? "Deactivate" : "Activate",
              okType: "danger",
              cancelText: "Cancel",
              onOk: () => toggleSellerStatus(record),
            });
          },
        },
        {
          key: "view",
          label: "View Details",
          icon: <Eye size={14} />,
          // onClick: () => handleViewDetails(record),
          onClick: () => message.info("Need to implement functionality"),
        },
        { type: "divider" },
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 size={14} />,
          danger: true,
          onClick: () => {
            Modal.confirm({
              title: `Are you sure you want to delete "${record.sellerName}"?`,
              content: "This action cannot be undone.",
              okText: "Yes, Delete",
              okType: "danger",
              cancelText: "Cancel",
              onOk: () => message.success("Need to implement functionality"),
            });
          },
        },
      ],
    };
  };

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
            Active:{" "}
            {record.sellerProducts?.filter((p: any) => p.isActive)?.length || 0}
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
            Completed:{" "}
            {
    record.sellerOrders?.filter((order: any) =>
      order.orderItems.every((item: any) => item.status !== 0)
    ).length || 0
  }
          </div>
        </div>
      ),
    },
    {
      title: "Total Value",
      key: "totalValue",
      width: 120,
      render: (_: any, record: any) => {
        const totalValue =
          record.sellerProducts?.reduce(
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
          {record.sellerLastLogin
            ? formatDate(record.sellerLastLogin)
            : "Never"}
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
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Total Sellers"
              value={stats.totalSellers}
              prefix={<Users className="text-blue-600" size={20} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Active Sellers"
              value={stats.activeSellers}
              prefix={<CheckCircle className="text-green-600" size={20} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Pending Approval"
              value={stats.pendingSellers}
              prefix={<Clock className="text-orange-600" size={20} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
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
                  setSearchText(e.target.value);
                  setPagination((prev) => ({ ...prev, current: 1 }));
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
                }}
                style={{ width: 120 }}
                size="large"
                // allowClear
                className="shadow-lg"
              >
                <Option value="all">All</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>

              <Select
                placeholder="Approval"
                value={filters.filterByApproval}
                onChange={async (value) => {
                  const newApprovalFilter = value || "all";
                  setFilters((prev) => ({
                    ...prev,
                    filterByApproval: newApprovalFilter,
                  }));
                }}
                style={{ width: 140 }}
                size="large"
                // allowClear
                className="shadow-lg"
              >
                <Option value="all">All Approvals</Option>
                <Option value="approved">Approved</Option>
                <Option value="pending">Pending</Option>
              </Select>

              <Select
                placeholder="City"
                value={filters.filterByCity}
                onChange={async (value) => {
                  const newCityFilter = value || "all";
                  setFilters((prev) => ({
                    ...prev,
                    filterByCity: newCityFilter,
                  }));
                }}
                style={{ width: 140 }}
                size="large"
                // allowClear
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
                total: totalSellers || 0,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} sellers`,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["5", "10", "20", "50", "100"],
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize: pageSize || 10 });
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

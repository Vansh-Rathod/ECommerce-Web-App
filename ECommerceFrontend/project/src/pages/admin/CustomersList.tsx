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
} from "antd";
import { debounce, formatDate } from "../../utils/helpers";
import { useCustomer } from "../../context/CustomerContext";
import api from "../../services/api";

const { Option } = Select;
const { Title, Text } = Typography;

const CustomersList = () => {
  const { customers, getCustomers } = useCustomer();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    sortField: "fullname",
    sortOrder: "asc",
    filterByStatus: "all",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<any | null>(null);

  // Initial fetch of seller products
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        await getCustomers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus
        );
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch customers. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [pagination]);

  // Statistics calculation
  const stats = {
    totalCustomers: customers?.length || 0,
    activeCustomers:
      customers?.filter((customerObj: any) => customerObj.isActive)?.length ||
      0,
    inactiveCustomers:
      customers?.filter((customerObj: any) => !customerObj.isActive)?.length ||
      0,
    // pendingApprovals:
    //   users?.filter((userObj: any) => !userObj.isApproved && userObj.sellerId !== null)
    //     ?.length || 0,
    // totalValue:
    //   allSellerProducts?.reduce(
    //     (sum: any, productObj: any) =>
    //       sum + productObj.price * productObj.stockQuantity,
    //     0
    //   ) || 0,
  };

  // function for seller and customer active status
  const getStatusIcon = (status: any) => {
    if (status === true)
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === false) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  //   // function for seller approval status
  //   const getApprovalStatus = (isApproved: any) => {
  //     if (isApproved === true) return { text: 'Approved', color: 'text-green-600 bg-green-50' };
  //     if (isApproved === false) return { text: 'Pending', color: 'text-yellow-600 bg-yellow-50' };
  //     return { text: 'N/A', color: 'text-gray-600 bg-gray-50' };
  //   };

  // Debounced Search Function
  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      await getCustomers(
        1,
        10,
        value,
        filters.sortField,
        filters.sortOrder,
        filters.filterByStatus
      );
      setLoading(false);
    }, 1000),
    [] // prevent recreating on every render
  );

  // CLear filters button
  const clearFilters = async () => {
    if (
      searchText !== "" ||
      filters.sortField !== "fullname" ||
      filters.sortOrder !== "asc" ||
      filters.filterByStatus !== "all"
    ) {
      setSearchText("");
      setFilters({
        sortField: "fullname",
        sortOrder: "asc",
        filterByStatus: "all",
      });
      await getCustomers(1, 10, "", "fullname", "asc", "all");
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

  // Get customer by customerId
  const getCustomerById = async (customerId: any) => {
    if (customerId) {
      // console.log("Customer ID: ", customerId);
      setLoading(true);
      try {
        const response = await api.get(`/customer/${customerId}`);
        // setSelectedProduct(response.data.data);
        if (response.data.status != 200) {
          notification.error({
            message: "Error",
            description:
              "Something went wrong while fetching customer details.",
          });
          return null;
        }
        const customerByIdData = response.data.data;
        return customerByIdData;
      } catch (error) {
        console.error("Failed to fetch customer details:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch customer details. Please try again.",
        });
        return null;
      } finally {
        setLoading(false);
      }
    }
  };

  // Activate / Deactivate customer
  const toggleCustomerStatus = async (customer: any) => {
    const customerByIdData = await getCustomerById(customer.customerId);
    if (customerByIdData !== null) {
      setActionLoading(customerByIdData.customerId);
      try {
        const endpoint = customer.isActive
          ? `/customer/inactive/${customerByIdData.customerId}`
          : `/customer/active/${customerByIdData.customerId}`;

        const response = await api.put(endpoint);
        if (response.data.status !== 200) {
          notification.error({
            message: "Error",
            description: customerByIdData.isActive
              ? `Something went wrong while deactivating ${customerByIdData.customerName}`
              : `Something went wrong while activating ${customerByIdData.customerName}`,
          });
        }
        notification.success({
          message: "Success",
          description: customerByIdData.isActive
            ? `${customerByIdData.customerName} has been deactivated successfully.`
            : `${customerByIdData.customerName} has been activated successfully.`,
        });

        // Refresh the products list
        await getCustomers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByStatus
        );
      } catch (error) {
        console.error("Failed to toggle customer status:", error);
        notification.error({
          message: "Error",
          description: "Failed to update customer status. Please try again.",
        });
      } finally {
        setActionLoading(null);
      }
    } else {
      notification.error({
        message: "Error",
        description: "Failed to get customer data.",
      });
    }
  };

  // Edit, Activate/Deactivate, View, Duplicate , Delete Prodcut Options
  const actionMenu = (record: any): MenuProps => ({
    items: [
      {
        key: "edit",
        label: "Edit Customer",
        icon: <Edit size={14} />,
        // onClick: () => showModal(record),
      },
      {
        key: "view",
        label: "View Details",
        icon: <Eye size={14} />,
        // onClick: () => handleViewDetails(record),
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
              ? `Are you sure you want to Deactivate "${record.customerName}" customer profile`
              : `Are you sure you want to Activate "${record.customerName}" customer profile`,
            content: record.isActive
              ? "You can later Activate it."
              : "You can later Deactivate it.",
            okText: record.isActive ? "Deactivate" : "Activate",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => await toggleCustomerStatus(record),
          });
        },
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        label: "Delete",
        icon: <Trash2 size={14} />,
        danger: true,
        // onClick: () => {
        //   Modal.confirm({
        //     title: `Are you sure you want to delete "${record.name}"`,
        //     content: 'This action cannot be undone.',
        //     okText: 'Yes, Delete',
        //     okType: 'danger',
        //     cancelText: 'Cancel',
        //     onOk: () => handelDelete(record),
        //   });
        // },
      },
    ],
  });

  // Table Columns
  const columns = [
    {
      title: "Customer Info",
      key: "customerInfo",
      width: 300,
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-3">
          {/* if you found out the image of the user then use below code */}
          {/* <Avatar
            size={48}
            shape="square"
            scr={record.imageUrl}
            icon={<ImageIcon size={20} />}
            className="border-2 border-gray-100"
          /> */}
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {record.customerName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semiblod text-gray-900 truncate">
              {record.customerName}
            </div>
            <div className="text-sm text-gray-500 truncate flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {record.customerEmail}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Last login: {formatDate(record.customerLastLogin)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_: any, record: any) =>
        record.customerId ? (
          <div className="flex items-center space-x-2">
            {getStatusIcon(record.isActive)}
            <span className="text-sm text-gray-600">
              {record.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No customer profile</span>
        ),
      // sorter: (a: Product, b: Product) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: "Orders Placed",
      key: "ordersPlaced",
      width: 100,
      render: (_: any, record: any) =>
        record.customerId ? (
          <span className="text-sm text-gray-600">
            {Array.isArray(record.customerOrders)
              ? record.customerOrders.length
              : 0}
          </span>
        ) : (
          <span className="text-sm text-gray-400">No Customer Profile</span>
        ),
      // sorter: (a: Product, b: Product) => a.stockQuantity - b.stockQuantity,
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
            loading={actionLoading === record.customerId}
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
            <Users className="w-8 h-8 text-blue-600" />
            <Title level={2} className="mb-2">
              Customers Management
            </Title>
          </div>
          <Text type="secondary" className="text-lg">
            Manage all customers in your platform
          </Text>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <Statistic
              title="Total Customers"
              value={stats.totalCustomers}
              prefix={<Users className="text-blue-600" size={25} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <Statistic
              title="Active Customers"
              value={stats.activeCustomers}
              prefix={<Store className="text-green-600" size={25} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <Statistic
              title="Inactive Customers"
              value={stats.inactiveCustomers}
              prefix={<UserCheck className="text-gray-600" size={25} />}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
          {/* <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <Statistic
              title="Pending Approvals"
              value={stats.pendingApprovals}
              prefix={<Clock className="text-red-600" size={25} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card> */}
          {/* <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <Statistic
              title="Total Value"
              value={stats.totalValue}
              precision={2}
              prefix={<DollarSign className="text-purple-600" size={20} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card> */}
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6 shadow-sm border-0">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <Input
                size="large"
                placeholder="Search customers by name..."
                value={searchText}
                // onChange={handleSearch}
                onChange={(e) => {
                  setLoading(true);
                  const value = e.target.value;
                  setSearchText(value);
                  if (value.trim() === "") {
                    // Delay the fetch when clearing the input
                    setTimeout(async () => {
                      await getCustomers(
                        1,
                        10,
                        "",
                        filters.sortField,
                        filters.sortOrder,
                        filters.filterByStatus
                      );
                      setLoading(false);
                    }, 1000); // Adjust the delay (ms) as needed
                  } else {
                    debouncedSearch(value);
                  }
                }}
                prefix={<Search size={18} className="text-gray-400" />}
                allowClear
                className="shadow-lg"
              />
            </div>

            {/* Status Filter, Clear Filter, Export */}
            <div className="flex flex-wrap gap-3">
              <Select
                placeholder="Select Status"
                value={filters.filterByStatus || undefined}
                onChange={async (value) => {
                  const newStatusFilter = value || "";
                  setFilters((prev) => ({
                    ...prev,
                    filterByStatus: newStatusFilter,
                  }));

                  setLoading(true);
                  await getCustomers(
                    1,
                    10,
                    searchText,
                    filters.sortField,
                    filters.sortOrder,
                    newStatusFilter
                  );
                  setLoading(false);
                }}
                style={{ width: 140 }}
                size="large"
                allowClear
                className="shadow-lg"
              >
                <Option value="all">All</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
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

              <Tooltip title="Export products">
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

        {/* Customers Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <Card className="shadow-lg border-0">
            <Table
              dataSource={customers}
              columns={columns}
              rowKey="userId"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: customers?.length || 0,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} customers`,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["5", "10", "20", "50", "100"],
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize: pageSize || 5 });
                },
              }}
              scroll={{ x: 1000 }}
              className="custom-table"
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomersList;

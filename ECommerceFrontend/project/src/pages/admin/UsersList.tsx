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
  Plus,
  User,
  ShoppingCart,
  Currency,
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
  Row,
  Col,
  Skeleton,
  Spin,
  Modal,
  Divider,
  Switch,
  message,
  Tag,
} from "antd";
import { debounce, formatDate } from "../../utils/helpers";
import api from "../../services/api";

const { Option } = Select;
const { Title, Text } = Typography;

const UsersList = () => {
  const { users, getUsers, totalUsers, setTotalUsers } = useUser();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    sortField: "fullname",
    sortOrder: "asc",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewUser, setViewUser] = useState<any | null>(null);

  // Debounced effect for all changes (pagination, searchText, filters)
  useEffect(() => {
    setLoading(true); // Start loading immediately on any change
    const handler = setTimeout(async () => {
      try {
        await getUsers(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder
        );
      } finally {
        setLoading(false); // Stop loading after API call
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [pagination, searchText, filters]);

  // Statistics calculation
  const stats = {
    totalUsers: users?.length || 0,
    activeSellers:
      users?.filter(
        (userObj: any) =>
          userObj.sellerProfileStatus && userObj.sellerProfileStatus !== null
      )?.length || 0,
    totalCustomers:
      users?.filter((userObj: any) => userObj.customerId !== null)?.length || 0,
    pendingApprovals:
      users?.filter(
        (userObj: any) => !userObj.isApproved && userObj.sellerId !== null
      )?.length || 0,
    // totalValue:
    //   allSellerProducts?.reduce(
    //     (sum: any, productObj: any) =>
    //       sum + productObj.price * productObj.stockQuantity,
    //     0
    //   ) || 0,
  };

  // fucntion for role badge
  const getRoleBadgeColor = (role: any) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Seller":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Customer":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // function for seller and customer active status
  const getStatusIcon = (status: any) => {
    if (status === true)
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === false) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  // function for seller approval status
  const getApprovalStatus = (isApproved: any) => {
    if (isApproved === true)
      return { text: "Approved", color: "text-green-600 bg-green-50" };
    if (isApproved === false)
      return { text: "Pending", color: "text-yellow-600 bg-yellow-50" };
    return { text: "N/A", color: "text-gray-600 bg-gray-50" };
  };

  // CLear filters button
  const clearFilters = () => {
    if (
      searchText !== "" ||
      filters.sortField !== "fullname" ||
      filters.sortOrder !== "asc"
    ) {
      setSearchText("");
      setFilters({
        sortField: "fullname",
        sortOrder: "asc",
      });
      setPagination(prev => ({ ...prev, current: 1 }));
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

  // Get product by productId
  const getUserById = async (userId: any) => {
    if (userId) {
      // console.log("User ID: ", userId);
      setLoading(true);
      try {
        const response = await api.get(`/user/${userId}`);
        // setSelectedProduct(response.data.data);
        if (response.data.status != 200) {
          notification.error({
            message: "Error",
            description: "Something went wrong while fetching user details.",
          });
          return null;
        }
        const userByIdData = response.data.data;
        return userByIdData;
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch user details. Please try again.",
        });
        return null;
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = async (user: any) => {
    setLoading(true);
    const userByIdData = await getUserById(user.userId);
    if (userByIdData !== null) {
      try {
        setViewUser(userByIdData);
        setIsViewModalVisible(true);
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Failed to fetch user details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
    else {
      notification.error({
        message: "Error",
        description: "Failed to get user data.",
      });
    }
  }

  // Show Modal for Add/Edit
  const showModal = async (user?: any) => {
    if (user) {
      // Edit user click
      setLoading(true);
      try {
        // Fetch detailed product info if needed
        const response = await api.get(`/user/${user.userId}`);
        const userByIdData = response.data.data;
        setSelectedUser(userByIdData);

        form.setFieldsValue({
          name: userByIdData.name,
          email: userByIdData.email,
          storeName: userByIdData.storeName || "",
          city: userByIdData.city || "",
          isApproved: userByIdData.isApproved || false,
          sellerProfileStatus: userByIdData.sellerProfileStatus || false,
          customerProfileStatus: userByIdData.customerProfileStatus || false,
        });
        setIsModalVisible(true);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        // setSelectedProduct(product);
        // form.setFieldsValue({
        //   name: product.name,
        //   description: product.description,
        //   price: product.price,
        //   stockQuantity: product.stockQuantity,
        //   isActive: product.isActive,
        // });
        notification.error({
          message: "Error",
          description: "Failed to fetch user details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Add product click
      setSelectedUser(null);
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        stockQuantity: 0,
        price: 0,
      });
      setIsModalVisible(true);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
    form.resetFields();
  };

  // Handle form submit (Add/Edit)
  const handleFormSubmit = async () => {
    message.success("User Updated");
    setLoading(true);
    try {
      const values = await form.validateFields();
      console.log("Values: " + JSON.stringify(values));

      // const formData = new FormData();
      // formData.append("Name", values.name);
      // formData.append("Description", values.description);
      // formData.append("Price", values.price);
      // formData.append("StockQuantity", values.stockQuantity);
      // formData.append("IsActive", values.isActive ?? true);

      // const imageFile = values.images?.[0]?.originFileObj;
      // if (imageFile) {
      //   formData.append("Image", imageFile);
      // } else {
      //   notification.error({
      //     message: "Image Missing",
      //     description: "Please upload a product image before submitting.",
      //   });
      //   return;
      // }

      // if (selectedProduct) {
      //   // Update existing product
      //   // console.log("Exisiting Product Payload: ", formData);
      //   const resposne = await api.put(`/product/${selectedProduct.productId}`, formData, {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   });
      //   if (resposne.data.status !== 200) {
      //     notification.success({
      //       message: "Error",
      //       description: `Something went wrong while updating ${values.name}.`,
      //     });
      //   }
      //   notification.success({
      //     message: "Success",
      //     description: `${values.name} has been updated successfully.`,
      //   });
      // } else {
      //   // Create new product
      //   // console.log("New Product Form Data: ", formData);
      //   const resposne = await api.post("product/products", formData, {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   });
      //   if (resposne.data.status !== 200) {
      //     notification.success({
      //       message: "Error",
      //       description: `Something went wrong while adding ${values.name}.`,
      //     });
      //   }
      //   notification.success({
      //     message: "Success",
      //     description: `${values.name} has been added successfully.`,
      //   });
      // }

      // setIsModalVisible(false);
      // setSelectedProduct(null);
      // form.resetFields();

      // // Refresh the products list
      // await fetchAllSellerProducts(
      //   pagination.current,
      //   pagination.pageSize,
      //   filters.searchText,
      //   filters.sortField,
      //   filters.sortOrder,
      //   filters.priceFilter
      // );
    } catch (error) {
      console.error("Failed to save product:", error);
      notification.error({
        message: "Error",
        description: "Failed to save product. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete product
  // const handleDelete = async (product: Product) => {
  //   const productByIdData = getProductById(product.productId);
  //   if (productByIdData !== null) {

  //     setActionLoading(product.productId);
  //     try {
  //       const response = await api.delete(`/product/${product.productId}`);
  //       if (response.data.status !== 200) {
  //         notification.error({
  //           message: "Error",
  //           description: `Something went wrong while deleting ${product.name}`,
  //         });
  //       }
  //       notification.success({
  //         message: "Success",
  //         description: `${product.name} has been deleted successfully.`,
  //       });

  //       // Refresh the products list
  //       await fetchAllSellerProducts(
  //         pagination.current,
  //         pagination.pageSize,
  //         filters.searchText,
  //         filters.sortField,
  //         filters.sortOrder,
  //         filters.priceFilter
  //       );
  //     } catch (error) {
  //       console.error("Failed to delete product:", error);
  //       notification.error({
  //         message: "Error",
  //         description: "Failed to delete product. Please try again.",
  //       });
  //     } finally {
  //       setActionLoading(null);
  //     }
  //   };
  // }

  // Edit, Activate/Deactivate, View, Duplicate , Delete Prodcut Options
  const actionMenu = (record: any): MenuProps => ({
    items: [

      {
        key: "edit",
        label: "Edit User",
        icon: <Edit size={14} />,
        onClick: () => showModal(record),
      },
      // {
      //   key: "toggle",
      //   label: record.isActive ? "Deactivate" : "Activate",
      //   icon: record.isActive ? (
      //     <ToggleLeft size={14} />
      //   ) : (
      //     <ToggleRight size={14} />
      //   ),
      //   onClick: () => {
      //     Modal.confirm({
      //       title: record.isActive ? `Are you sure you want to Deactivate "${record.name}"` : `Are you sure you want to Activate "${record.name}"`,
      //       content: record.isActive ? 'You can later Activate it.' : 'You can later Deactivate it.',
      //       okText: record.isActive ? 'Deactivate' : "Activate",
      //       okType: 'danger',
      //       cancelText: 'Cancel',
      //       onOk: () => toggleProductStatus(record),
      //     });
      //   },
      // },
      {
        key: "view",
        label: "View Details",
        icon: <Eye size={14} />,
        onClick: () => handleViewDetails(record),
      },

      // Show "Approve" only if seller is NOT approved
      ...(!record.isApproved && record.isApproved != null
        ? [
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
                // onOk: async () => await toggleSellerApproval(record),
                onOk: async () => message.success("Need To Implement The Functionality"),
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
      title: "User Info",
      key: "userInfo",
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
                {record.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semiblod text-gray-900 truncate">
              {record.name}
            </div>
            <div className="text-sm text-gray-500 truncate flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {record.email}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Last login: {formatDate(record.lastLogin)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Seller Profile",
      key: "sellerProfile",
      width: 120,
      render: (_: any, record: any) =>
        record.sellerId ? (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900 flex items-center">
              <Store className="w-4 h-4 mr-1 text-blue-500" />
              {record.storeName}
            </div>
            {record.city && (
              <div className="text-sm text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {record.city}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatus(record.isApproved).color
                  }`}
              >
                {getApprovalStatus(record.isApproved).text}
              </span>
              {getStatusIcon(record.sellerProfileStatus)}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No seller profile</span>
        ),
      // sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: "Customer Profile",
      key: "customerProfile",
      width: 100,
      render: (_: any, record: any) =>
        record.customerId ? (
          <div className="flex items-center space-x-2">
            {getStatusIcon(record.customerProfileStatus)}
            <span className="text-sm text-gray-600">
              {record.customerProfileStatus ? "Active" : "Inactive"}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No customer profile</span>
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
          {formatDate(record.registeredAt)}
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
            loading={actionLoading === record.userId}
            className="hover:bg-gray-100"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <Title level={2} className="mb-2">
              Users Management
            </Title>
          </div>
          <Text type="secondary" className="text-lg">
            Manage all users, sellers, and customers in your platform
          </Text>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<Users className="text-blue-600" size={25} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <Statistic
              title="Active Sellers"
              value={stats.activeSellers}
              prefix={<Store className="text-green-600" size={25} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg">
            <Statistic
              title="Customers"
              value={stats.totalCustomers}
              prefix={<UserCheck className="text-gray-600" size={25} />}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
            <Statistic
              title="Pending Approvals"
              value={stats.pendingApprovals}
              prefix={<Clock className="text-red-600" size={25} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
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
        <Card className="mb-6 shadow-lg border-0">
          <div className="flex flex-col lg:flex-row gap-1 justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <Input
                size="large"
                placeholder="Search users by name or email..."
                value={searchText}
                onChange={e => {
                  setSearchText(e.target.value);
                  setPagination(prev => ({ ...prev, current: 1 }));
                }}
                prefix={<Search size={18} className="text-gray-400" />}
                allowClear
                className="shadow-lg"
              />
            </div>

            {/* SortField, SortOrder, Clear, Export */}
            <div className="flex flex-wrap gap-3">
              <Select
                placeholder="Sort Field"
                value={filters.sortField || undefined}
                onChange={value => {
                  setFilters(prev => ({ ...prev, sortField: value }));
                  setPagination(prev => ({ ...prev, current: 1 }));
                }}
                style={{ width: 140 }}
                size="large"
                allowClear
                className="shadow-lg"
              >
                <Option value="fullname">Name</Option>
                <Option value="email">Email</Option>
                <Option value="createdat">Registered At</Option>
              </Select>

              <Select
                placeholder="Sort Order"
                value={filters.sortOrder || undefined}
                onChange={value => {
                  setFilters(prev => ({ ...prev, sortOrder: value }));
                  setPagination(prev => ({ ...prev, current: 1 }));
                }}
                style={{ width: 140 }}
                size="large"
                allowClear
                className="shadow-lg"
              >
                <Option value="asc">Ascending</Option>
                <Option value="desc">Descending</Option>
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
                  className="shadow-sm"
                >
                  Export
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <Card className="shadow-lg border-0">
            <Table
              dataSource={users}
              columns={columns}
              rowKey="userId"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: totalUsers,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} users`,
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

        {/* Add/Edit User Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {selectedUser ? (
                  <Edit size={16} className="text-blue-600" />
                ) : (
                  <Plus size={16} className="text-blue-600" />
                )}
              </div>
              <span className="text-lg font-semibold">
                {selectedUser ? "Edit User" : "Add New User"}
              </span>
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          width={900}
          footer={[
            <Button key="cancel" size="large" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              loading={loading}
              onClick={handleFormSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {selectedUser ? "Update User" : "Add User"}
            </Button>,
          ]}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              isApproved: false,
              sellerProfileStatus: false,
              customerProfileStatus: true,
            }}
            className="mt-6"
          >
            <Divider orientation="left" className="text-gray-600 font-medium">
              Basic Information
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter user's full name",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter full name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Please enter email address" },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter email address" />
                </Form.Item>
              </Col>
            </Row>

            {/* <Form.Item
      name="roles"
      label="User Roles"
      rules={[{ required: true, message: "Please select at least one role" }]}
    >
      <Select
        mode="multiple"
        size="large"
        placeholder="Select user roles"
        options={[
          { label: "Customer", value: "Customer" },
          { label: "Seller", value: "Seller" },
          { label: "Admin", value: "Admin" },
        ]}
      />
    </Form.Item> */}

            {/* Seller Information Section */}
            <Divider orientation="left" className="text-gray-600 font-medium">
              Seller Information
            </Divider>

            {selectedUser && !selectedUser.sellerId ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      No Seller Profile
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      This user doesn't have a seller profile
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="storeName"
                      label="Store Name"
                      rules={
                        !selectedUser || selectedUser.sellerId
                          ? [
                            {
                              required: true,
                              message: "Please enter store name",
                            },
                          ]
                          : []
                      }
                    >
                      <Input size="large" placeholder="Enter store name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="city"
                      label="City"
                      rules={
                        !selectedUser || selectedUser.sellerId
                          ? [{ required: true, message: "Please enter city" }]
                          : []
                      }
                    >
                      <Input size="large" placeholder="Enter city" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="isApproved"
                      label="Seller Approval Status"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Approved"
                        unCheckedChildren="Pending"
                        size="default"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="sellerProfileStatus"
                      label="Seller Profile Status"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        size="default"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {selectedUser && selectedUser.sellerId && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Seller ID">
                        <Input
                          size="large"
                          value={selectedUser.sellerId}
                          readOnly
                          className="bg-gray-50"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Seller Profile Created">
                        <Input
                          size="large"
                          value={
                            selectedUser.sellerProfileCreatedDate
                              ? new Date(
                                selectedUser.sellerProfileCreatedDate
                              ).toLocaleDateString()
                              : "N/A"
                          }
                          readOnly
                          className="bg-gray-50"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </>
            )}

            {/* Customer Information Section */}
            <Divider orientation="left" className="text-gray-600 font-medium">
              Customer Information
            </Divider>

            {selectedUser && !selectedUser.customerId ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      No Customer Profile
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      This user doesn't have a customer profile
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Form.Item
                  name="customerProfileStatus"
                  label="Customer Profile Status"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    size="default"
                  />
                </Form.Item>

                {selectedUser && selectedUser.customerId && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Customer ID">
                        <Input
                          size="large"
                          value={selectedUser.customerId}
                          readOnly
                          className="bg-gray-50"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Customer Profile Created">
                        <Input
                          size="large"
                          value={
                            selectedUser.customerProfileCreatedDate
                              ? new Date(
                                selectedUser.customerProfileCreatedDate
                              ).toLocaleDateString()
                              : "N/A"
                          }
                          readOnly
                          className="bg-gray-50"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </>
            )}

            {selectedUser && (
              <>
                <Divider
                  orientation="left"
                  className="text-gray-600 font-medium"
                >
                  Account Information
                </Divider>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Registered Date">
                      <Input
                        size="large"
                        value={
                          selectedUser?.registeredAt
                            ? new Date(
                              selectedUser.registeredAt
                            ).toLocaleDateString()
                            : "N/A"
                        }
                        readOnly
                        className="bg-gray-50"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Last Login">
                      <Input
                        size="large"
                        value={
                          selectedUser?.lastLogin
                            ? new Date(
                              selectedUser.lastLogin
                            ).toLocaleDateString()
                            : "N/A"
                        }
                        readOnly
                        className="bg-gray-50"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="User ID">
                  <Input
                    size="large"
                    value={selectedUser?.userId || "N/A"}
                    readOnly
                    className="bg-gray-50"
                  />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

        {/* View User Details Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                <Eye size={18} className="text-white" />
              </div>
              <span className="text-lg font-semibold text-blue-700">
                User Details
              </span>
            </div>
          }
          open={isViewModalVisible}
          onCancel={() => {
            setIsViewModalVisible(false);
            setViewUser(null);
          }}
          width={800}
          footer={[
            <Button
              key="close"
              size="large"
              onClick={() => {
                setIsViewModalVisible(false);
                setViewUser(null);
              }}
            >
              Close
            </Button>,
          ]}
          destroyOnClose
        >
          {viewUser ? (
            <div className="p-2">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <Title
                    level={5}
                    className="!mb-3 text-blue-700 flex items-center"
                  >
                    <User size={16} className="mr-2" />
                    Basic Information
                  </Title>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text strong>Full Name:</Text>
                      <div className="text-lg font-semibold text-gray-800">
                        {viewUser.name}
                      </div>
                    </div>
                    <div>
                      <Text strong>Email:</Text>
                      <div className="text-blue-600">{viewUser.email}</div>
                    </div>
                    <div>
                      <Text strong>User Roles:</Text>
                      <div>
                        {viewUser.roles && viewUser.roles.length > 0 ? (
                          viewUser.roles.map((role: any, index: any) => (
                            <Tag
                              key={index}
                              color={
                                role === "Admin"
                                  ? "red"
                                  : role === "Seller"
                                    ? "orange"
                                    : "blue"
                              }
                            >
                              {role}
                            </Tag>
                          ))
                        ) : (
                          <Text type="secondary">No roles assigned</Text>
                        )}
                      </div>
                    </div>
                    <div>
                      <Text strong>User ID:</Text>
                      <div className="text-xs text-gray-500 font-mono">
                        {viewUser.userId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                  <Title
                    level={5}
                    className="!mb-3 text-green-700 flex items-center"
                  >
                    <Calendar size={16} className="mr-2" />
                    Account Information
                  </Title>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text strong>Registered Date:</Text>
                      <div>
                        {new Date(viewUser.registeredAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Text strong>Last Login:</Text>
                      <div>
                        {viewUser.lastLogin
                          ? new Date(viewUser.lastLogin).toLocaleString()
                          : "Never"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller Profile Section */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
                  <Title
                    level={5}
                    className="!mb-3 text-orange-700 flex items-center"
                  >
                    <Store size={16} className="mr-2" />
                    Seller Profile
                  </Title>
                  {viewUser.sellerId ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text strong>Store Name:</Text>
                        <div className="text-lg font-semibold text-gray-800">
                          {viewUser.storeName || "N/A"}
                        </div>
                      </div>
                      <div>
                        <Text strong>City:</Text>
                        <div>{viewUser.city || "N/A"}</div>
                      </div>
                      <div>
                        <Text strong>Approval Status:</Text>
                        <Tag
                          color={viewUser.isApproved ? "success" : "warning"}
                        >
                          {viewUser.isApproved ? "Approved" : "Pending"}
                        </Tag>
                      </div>
                      <div>
                        <Text strong>Profile Status:</Text>
                        <Tag
                          color={
                            viewUser.sellerProfileStatus ? "success" : "error"
                          }
                        >
                          {viewUser.sellerProfileStatus ? "Active" : "Inactive"}
                        </Tag>
                      </div>
                      <div>
                        <Text strong>Seller ID:</Text>
                        <div className="text-xs text-gray-500 font-mono">
                          {viewUser.sellerId}
                        </div>
                      </div>
                      <div>
                        <Text strong>Profile Created:</Text>
                        <div>
                          {viewUser.sellerProfileCreatedDate
                            ? new Date(
                              viewUser.sellerProfileCreatedDate
                            ).toLocaleString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Store size={24} className="text-orange-400" />
                        </div>
                        <p className="text-orange-600 font-medium">
                          No Seller Profile
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          This user doesn't have a seller profile
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Profile Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                  <Title
                    level={5}
                    className="!mb-3 text-purple-700 flex items-center"
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Customer Profile
                  </Title>
                  {viewUser.customerId ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text strong>Profile Status:</Text>
                        <Tag
                          color={
                            viewUser.customerProfileStatus ? "success" : "error"
                          }
                        >
                          {viewUser.customerProfileStatus
                            ? "Active"
                            : "Inactive"}
                        </Tag>
                      </div>
                      <div>
                        <Text strong>Customer ID:</Text>
                        <div className="text-xs text-gray-500 font-mono">
                          {viewUser.customerId}
                        </div>
                      </div>
                      <div>
                        <Text strong>Profile Created:</Text>
                        <div>
                          {viewUser.customerProfileCreatedDate
                            ? new Date(
                              viewUser.customerProfileCreatedDate
                            ).toLocaleString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ShoppingCart size={24} className="text-purple-400" />
                        </div>
                        <p className="text-purple-600 font-medium">
                          No Customer Profile
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          This user doesn't have a customer profile
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">Loading...</div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UsersList;

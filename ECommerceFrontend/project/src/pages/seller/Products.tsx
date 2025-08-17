import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  Upload,
  InputNumber,
  Divider,
  Typography,
  Radio,
  notification,
  Space,
  Dropdown,
  MenuProps,
  Row,
  Col,
  Avatar,
  Switch,
  Tooltip,
  Badge,
  Popconfirm,
  Statistic,
  Spin,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  FilterX,
  Download,
  Eye,
  UploadCloud,
  Copy,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import type { UploadProps } from "antd";
import { useProduct } from "../../context/ProductContext";
import { debounce } from "../../utils/helpers";
import api from "../../services/api";
import {
  AddProduct,
  DeleteProduct,
  GetProductById,
  GetSellerProducts,
  MakeProductActive,
  MakeProductInactive,
  UpdateProduct,
} from "../../services/ProductApiHelperService";
import { CommonResponse } from "../../Types";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SellerProducts = () => {
  // const { allSellerProducts, fetchAllSellerProducts } = useProduct();

  const [products, setProducts] = useState<any>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    sortField: "name",
    sortOrder: "asc",
    filterByPrice: "all",
    filterByStatus: "all",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewProduct, setViewProduct] = useState<any | null>(null);

  // Debounced effect for all changes (pagination, searchText, filters)
  useEffect(() => {
    setLoading(true); // Start loading immediately on any change
    const handler = setTimeout(async () => {
      try {
        const result = await GetSellerProducts(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByPrice,
          filters.filterByStatus
        );

        if (result.success) {
          setProducts(result.data.products);
          setTotalProducts(result.data.totalProducts);
        } else {
          setProducts([]);
          setTotalProducts(0);
        }
      } catch (error) {
        message.error("Something went wrong while fetching products");
        console.error("Something went wrong while fetching products: ", error);
      } finally {
        setLoading(false); // Stop loading after API call
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [pagination, searchText, filters]);

  // Statistics calculation
  const stats = {
    total: totalProducts || 0,
    active:
      products?.filter((productObj: any) => productObj.isActive)?.length || 0,
    inactive:
      products?.filter((productObj: any) => !productObj.isActive)?.length || 0,
    outOfStock:
      products?.filter((productObj: any) => productObj.stockQuantity === 0)
        ?.length || 0,
    totalValue:
      products?.reduce(
        (sum: any, productObj: any) =>
          sum + productObj.price * productObj.stockQuantity,
        0
      ) || 0,
  };

  // Get product status
  const getProductStatus = (product: any) => {
    if (!product.isActive) {
      return "inactive";
    } else if (product.isActive) {
      return "active";
    }
    return "inactive";
    // return product.stockQuantity > 0 ? "active" : "out_of_stock";
  };

  // Activate / Deactivate product
  const toggleProductStatus = async (product: any) => {
    console.log("productData:", product);

    const productByIdData = await GetProductById(product.productId);
    if (!productByIdData.success) {
      message.error(productByIdData.error);
      return;
    }

    setActionLoading(product.productId);
    if (productByIdData !== null && productByIdData.data !== null) {
      try {
        let result: CommonResponse<any>;

        if (product.isActive) {
          // Deactivate product
          result = await MakeProductInactive(product.productId);
        } else {
          // Activate product
          result = await MakeProductActive(product.productId);
        }

        if (!result.success) {
          message.error(result.error);
          return;
        }

        message.success(result.message);

        // Refresh the products list
        const refreshedProducts = await GetSellerProducts(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByPrice,
          filters.filterByStatus
        );

        if (!refreshedProducts.success) {
          message.error(refreshedProducts.error);
          return;
        }

        setProducts(refreshedProducts.data.products);
        setTotalProducts(refreshedProducts.data.totalProducts);
      } catch (error) {
        console.error("Failed to toggle product status:", error);
        message.error("Failed to toggle product status. Please try again.");
      } finally {
        setActionLoading(null);
      }
    } else {
      setActionLoading(null);
      console.log(productByIdData.error);
      message.error(productByIdData.error);
    }
  };

  const handleViewDetails = async (product: any) => {
    setLoading(true);
    const productByIdData = await GetProductById(product.productId);
    if (!productByIdData.success) {
      message.error(productByIdData.error);
      return;
    }

    if (productByIdData !== null && productByIdData.data !== null) {
      try {
        setViewProduct(productByIdData.data);
        setIsViewModalVisible(true);
      } catch (error) {
        console.log("Error: ", error);
        message.error("Failed to fetch product details. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      console.log(productByIdData.error);
      message.error(productByIdData.error);
    }
  };

  // Show Modal for Add/Edit
  const showModal = async (product?: any) => {
    if (product) {
      // Edit product click
      setLoading(true);

      const productByIdData = await GetProductById(product.productId);
      if (!productByIdData.success) {
        message.error(productByIdData.error);
        return;
      }

      if (productByIdData !== null && productByIdData.data !== null) {
        try {
          setSelectedProduct(productByIdData.data);

          form.setFieldsValue({
            name: productByIdData.data.name,
            description: productByIdData.data.description,
            price: productByIdData.data.price,
            stockQuantity: productByIdData.data.stockQuantity,
            isActive: productByIdData.data.isActive,
            images: productByIdData.data.imageUrl
              ? [
                  {
                    uid: "-1",
                    // name: productByIdData.imageUrl.split('/').pop() || 'image.jpg',
                    name:
                      productByIdData.data.imageUrl
                        .split("/")
                        .pop()
                        ?.replace(/^\d+_/, "")
                        .replace(/^\d+_/, "") || "image.jpg",
                    status: "done",
                    url: productByIdData.data.imageUrl,
                  },
                ]
              : [],
          });
          setIsModalVisible(true);
        } catch (error) {
          console.error("Failed to fetch product details: ", error);
          message.error("Failed to fetch product details. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        console.log(productByIdData.error);
        message.error(productByIdData.error);
      }
    } else {
      // Add product click
      setSelectedProduct(null);
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
    setSelectedProduct(null);
    form.resetFields();
  };

  // Handle form submit (Add/Edit)
  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      console.log("Values: ", values);

      // Check if we're updating and if image exists in selectedProduct
      const isUpdateWithExistingImage =
        selectedProduct?.imageUrl && !values.images?.[0]?.originFileObj;

      // Only require new image for new products
      if (!selectedProduct && !values.images?.[0]?.originFileObj) {
        notification.error({
          message: "Image Missing",
          description: "Please upload a product image before submitting.",
        });
        return;
      }

      // when updating without existing image then show error
      if (
        selectedProduct &&
        !isUpdateWithExistingImage &&
        !values.images?.[0]?.originFileObj
      ) {
        notification.error({
          message: "Image Missing",
          description: "Please upload a product image before submitting.",
        });
        return;
      }

      if (selectedProduct) {
        // Update existing product
        // console.log("Exisiting Product Payload: ", formData);
        const result = await UpdateProduct(
          selectedProduct.productId,
          values.name,
          values.description,
          values.price,
          values.stockQuantity,
          values.images?.[0]?.originFileObj
        );
        if (!result.success) {
          message.error(result.error);
          return;
        }
        message.success(result.message);
      } else {
        // Create new product
        // console.log("New Product Form Data: ", formData);
        const result = await AddProduct(
          values.name,
          values.description,
          values.price,
          values.stockQuantity,
          values.images?.[0]?.originFileObj
        );
        if (!result.success) {
          message.error(result.error);
          return;
        }
        message.success(result.message);
      }

      setIsModalVisible(false);
      setSelectedProduct(null);
      form.resetFields();

      // Refresh the products list
      const refreshedProducts = await GetSellerProducts(
        pagination.current,
        pagination.pageSize,
        searchText,
        filters.sortField,
        filters.sortOrder,
        filters.filterByPrice,
        filters.filterByStatus
      );

      if (!refreshedProducts.success) {
        message.error(refreshedProducts.error);
        return;
      }

      setProducts(refreshedProducts.data.products);
      setTotalProducts(refreshedProducts.data.totalProducts);
    } catch (error) {
      console.error("Failed to save product: ", error);
      message.error("Failed to save product. Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete product
  const handleDelete = async (product: any) => {
    setActionLoading(product.productId);
    // console.log("productData: ", product);
    const productByIdData = await GetProductById(product.productId);
    if (!productByIdData.success) {
      message.error(productByIdData.error);
      return;
    }

    if (productByIdData !== null && productByIdData.data !== null) {
      try {
        const result = await DeleteProduct(product.productId);
        if (!result.success) {
          message.error(result.error);
          return;
        }
        message.success(result.message);

        // Refresh the products list
        const refreshedProducts = await GetSellerProducts(
          pagination.current,
          pagination.pageSize,
          searchText,
          filters.sortField,
          filters.sortOrder,
          filters.filterByPrice,
          filters.filterByStatus
        );

        if (!refreshedProducts.success) {
          message.error(refreshedProducts.error);
          return;
        }

        setProducts(refreshedProducts.data.products);
        setTotalProducts(refreshedProducts.data.totalProducts);
      } catch (error) {
        console.error("Failed to delete product: ", error);
        message.error("Failed to delete product. Please try again");
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Upload Image Props
  // const uploadProps: UploadProps = {
  //   name: "file",
  //   multiple: true,
  //   listType: "picture-card",
  //   maxCount: 5,
  //   beforeUpload: () => false, // Prevent auto upload
  //   showUploadList: {
  //     showPreviewIcon: true,
  //     showRemoveIcon: true,
  //   },
  // };

  // Clear filters button
  const clearFilters = () => {
    const isFiltersActive =
      searchText !== "" ||
      filters.sortField !== "name" ||
      filters.sortOrder !== "asc" ||
      filters.filterByPrice !== "all" ||
      filters.filterByStatus !== "all";

    if (isFiltersActive) {
      setSearchText("");
      setFilters({
        sortField: "name",
        sortOrder: "asc",
        filterByPrice: "all",
        filterByStatus: "all",
      });
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

  // Edit, Activate/Deactivate, View, Duplicate , Delete Prodcut Options
  const actionMenu = (record: any): MenuProps => ({
    items: [
      {
        key: "edit",
        label: "Edit Product",
        icon: <Edit size={14} />,
        onClick: () => showModal(record),
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
              ? `Are you sure you want to Deactivate "${record.name}"`
              : `Are you sure you want to Activate "${record.name}"`,
            content: record.isActive
              ? "You can later Activate it."
              : "You can later Deactivate it.",
            okText: record.isActive ? "Deactivate" : "Activate",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => toggleProductStatus(record),
          });
        },
      },
      {
        key: "view",
        label: "View Details",
        icon: <Eye size={14} />,
        onClick: () => handleViewDetails(record),
      },
      {
        key: "duplicate",
        label: "Duplicate",
        icon: <Copy size={14} />,
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        label: "Delete",
        icon: <Trash2 size={14} />,
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: `Are you sure you want to delete "${record.name}"`,
            content: "This action cannot be undone.",
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => handleDelete(record),
          });
        },
      },
    ],
  });

  // Table Columns
  const columns = [
    {
      title: "Product",
      key: "product",
      width: 300,
      render: (record: any) => (
        <div className="flex items-center space-x-3">
          <Avatar
            size={48}
            shape="square"
            src={record.imageUrl}
            icon={<ImageIcon size={20} />}
            className="border-2 border-gray-100"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.name}
            </div>
            <div
              className="text-sm text-gray-500 truncate overflow-hidden whitespace-nowrap"
              style={{ maxWidth: "200px" }}
              title={record.description}
            >
              {record.description}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ID: {record.productId.slice(0, 8)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => (
        <div className="flex items-center space-x-1">
          {/* <DollarSign size={14} className="text-green-600" /> */}
          <span className="font-semibold text-green-600">
            ${price.toFixed(2)}
          </span>
        </div>
      ),
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 100,
      render: (stock: number) => (
        <div className="flex items-center space-x-1">
          <Package
            size={14}
            className={stock > 0 ? "text-blue-600" : "text-red-600"}
          />
          <Badge
            count={stock}
            showZero
            style={{
              backgroundColor: stock > 0 ? "#52c41a" : "#ff4d4f",
              fontSize: "12px",
            }}
          />
          {stock === 0 && (
            <Tooltip title="Out of Stock">
              <AlertCircle
                size={18}
                className="text-red-500 animate-bounce ml-2"
              />
            </Tooltip>
          )}
        </div>
      ),
      sorter: (a: any, b: any) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (record: any) => {
        const status = getProductStatus(record);
        let color = "";
        let text = "";

        switch (status) {
          case "active":
            color = "success";
            text = "Active";
            // console.log("Satauts: " + status);
            break;
          case "inactive":
            color = "error";
            text = "Inactive";
            // console.log("Satauts: " + status);
            break;
          // case "out_of_stock":
          //   color = "error";
          //   text = "Out of Stock";
          //   console.log("Satauts: " + status);
          //   break;
          default:
            color = "default";
            text = status;
        }

        return (
          <div className="flex items-center space-x-2">
            <Tag color={color}>{text}</Tag>
          </div>
        );
      },
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        // { text: "Out of Stock", value: "out_of_stock" },
      ],
      onFilter: (value: any, record: any) => getProductStatus(record) === value,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => (
        <div className="flex items-center space-x-1">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
        </div>
      ),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
            loading={actionLoading === record.productId}
            className="hover:bg-gray-100"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="mb-2">
            Product Management
          </Title>
          <Text type="secondary" className="text-lg">
            Manage your product catalog and inventory
          </Text>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Total Products"
              value={stats.total}
              prefix={<Package className="text-blue-600" size={20} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Active Products"
              value={stats.active}
              prefix={<CheckCircle className="text-green-600" size={20} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Inactive Products"
              value={stats.inactive}
              prefix={<XCircle className="text-gray-600" size={20} />}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Out of Stock"
              value={stats.outOfStock}
              prefix={<AlertCircle className="text-red-600" size={20} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer">
            <Statistic
              title="Total Value"
              value={stats.totalValue}
              precision={2}
              prefix={<DollarSign className="text-purple-600" size={20} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6 shadow-sm border-0">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-md">
              <Tooltip title="Search products by name or description">
                <Input
                  size="large"
                  placeholder="Search products by name or description..."
                  value={searchText}
                  // onChange={handleSearch}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPagination((prev) => ({
                      ...prev,
                      current: 1,
                      pageSize: 10,
                    }));
                  }}
                  prefix={<Search size={18} className="text-gray-400" />}
                  allowClear
                  className="shadow-lg"
                />
              </Tooltip>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                placeholder="Price Range"
                value={filters.filterByPrice}
                onChange={async (value) => {
                  const newPriceFilter = value || "all";
                  setFilters((prev) => ({
                    ...prev,
                    filterByPrice: newPriceFilter,
                  }));
                }}
                style={{ width: 140 }}
                size="large"
                // allowClear
                className="shadow-lg"
              >
                <Option value="all">All Prices</Option>
                <Option value="below100">Under $100</Option>
                <Option value="100to500">$100 - $500</Option>
                <Option value="above500">Above $500</Option>
              </Select>

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

              <Button
                type="primary"
                size="large"
                icon={<Plus size={18} />}
                onClick={() => showModal()}
                className="shadow-sm bg-blue-600 hover:bg-blue-700"
              >
                Add Product
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <Card className="shadow-sm border-0">
            <Table
              dataSource={products}
              columns={columns}
              rowKey="productId"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: totalProducts || 0,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} products`,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize: pageSize || 10 });
                },
              }}
              scroll={{ x: 1000 }}
              className="custom-table"
            />
          </Card>
        )}
        {/* Add/Edit Product Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {selectedProduct ? (
                  <Edit size={16} className="text-blue-600" />
                ) : (
                  <Plus size={16} className="text-blue-600" />
                )}
              </div>
              <span className="text-lg font-semibold">
                {selectedProduct ? "Edit Product" : "Add New Product"}
              </span>
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          width={800}
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
              {selectedProduct ? "Update Product" : "Add Product"}
            </Button>,
          ]}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              isActive: true,
              stockQuantity: 0,
              price: 0,
            }}
            className="mt-6"
          >
            <Divider orientation="left" className="text-gray-600 font-medium">
              Basic Information
            </Divider>

            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input size="large" placeholder="Enter product name" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter product description" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter detailed product description"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Divider orientation="left" className="text-gray-600 font-medium">
              Pricing & Inventory
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Price ($)"
                  rules={[
                    { required: true, message: "Please enter price" },
                    {
                      type: "number",
                      min: 0,
                      message: "Price must be positive",
                    },
                  ]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    precision={2}
                    style={{ width: "100%" }}
                    placeholder="0.00"
                    prefix="$"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="stockQuantity"
                  label="Stock Quantity"
                  rules={[
                    { required: true, message: "Please enter stock quantity" },
                    {
                      type: "number",
                      min: 0,
                      message: "Stock must be positive",
                    },
                  ]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="isActive"
              label="Product Status"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                size="default"
              />
            </Form.Item>

            <Divider orientation="left" className="text-gray-600 font-medium">
              Product Images
            </Divider>

            {/* <Form.Item name="images" label="Product Images">
              <Upload.Dragger
                {...uploadProps}
                className="border-2 border-dashed border-gray-300 hover:border-blue-400"
              >
                <div className="flex flex-col items-center justify-center py-6">
                  <UploadCloud className="text-blue-500 mb-3" size={48} />
                  <p className="text-lg font-medium text-gray-700">
                    Click or drag files to upload
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Support for multiple images. Maximum 5 images, each up to
                    10MB.
                  </p>
                </div>
              </Upload.Dragger>
            </Form.Item> */}

            <Form.Item
              name="images"
              label="Product Image"
              valuePropName="fileList"
              getValueFromEvent={(e) =>
                Array.isArray(e) ? e : e && e.fileList
              }
              rules={[
                { required: true, message: "Product image is required." },
              ]}
            >
              <Upload
                listType="picture"
                beforeUpload={() => false} // Prevent auto upload
                maxCount={1}
                showUploadList={{ showPreviewIcon: true }}
                onPreview={async (file) => {
                  let previewUrl = file.url;

                  if (!previewUrl && file.originFileObj) {
                    previewUrl = URL.createObjectURL(file.originFileObj);
                  }

                  if (previewUrl) {
                    window.open(previewUrl, "_blank");
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>
                  {selectedProduct ? "Change Image" : "Upload"}
                </Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Details Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Eye size={18} className="text-white" />
              </div>
              <span className="text-lg font-semibold text-purple-700">
                Product Details
              </span>
            </div>
          }
          open={isViewModalVisible}
          onCancel={() => {
            setIsViewModalVisible(false);
            setViewProduct(null);
          }}
          width={700}
          footer={[
            <Button
              key="close"
              size="large"
              onClick={() => {
                setIsViewModalVisible(false);
                setViewProduct(null);
              }}
            >
              Close
            </Button>,
          ]}
          destroyOnClose
        >
          {viewProduct ? (
            <div className="p-2">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-full md:w-64 h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {viewProduct.imageUrl ? (
                    <img
                      src={viewProduct.imageUrl}
                      alt={viewProduct.name}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-400 text-4xl">No Image</div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <Title level={4} className="!mb-1 text-purple-700">
                    {viewProduct.name}
                  </Title>
                  <Text type="secondary" className="block mb-2 text-base">
                    {viewProduct.description}
                  </Text>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Text strong>Price:</Text>
                      <div className="text-lg text-green-600 font-semibold">
                        ${viewProduct.price.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <Text strong>Stock:</Text>
                      <div
                        className={
                          viewProduct.stockQuantity > 0
                            ? "text-blue-600"
                            : "text-red-600"
                        }
                      >
                        {viewProduct.stockQuantity > 0
                          ? viewProduct.stockQuantity
                          : "Out of Stock"}
                      </div>
                    </div>
                    <div>
                      <Text strong>Status:</Text>
                      <Tag color={viewProduct.isActive ? "success" : "error"}>
                        {viewProduct.isActive ? "Active" : "Inactive"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Created At:</Text>
                      <div>
                        {new Date(viewProduct.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Text strong>Updated At:</Text>
                      <div>
                        {new Date(viewProduct.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Text strong>Product ID:</Text>
                      <div className="text-xs text-gray-500">
                        {viewProduct.productId}
                      </div>
                    </div>
                  </div>
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

export default SellerProducts;

// --------------------------------------------------------------------------------------------------------------------------------------

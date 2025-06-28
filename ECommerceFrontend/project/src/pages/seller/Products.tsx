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
} from "antd";
import { UploadOutlined } from '@ant-design/icons';
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

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  imageUrl: string | null;
}

const SellerProducts = () => {
  const { allSellerProducts, fetchAllSellerProducts } = useProduct();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({
    searchText: "",
    sortField: "name",
    sortOrder: "asc",
    priceFilter: "",
    statusFilter: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const filtersRef = useRef(filters);

  // Keep filtersRef updated
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);


  // Initial fetch of seller products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        await fetchAllSellerProducts(
          pagination.current,
          pagination.pageSize,
          filters.searchText,
          filters.sortField,
          filters.sortOrder,
          filters.priceFilter
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch products. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [pagination, filters]);

  // Statistics calculation
  const stats = {
    total: allSellerProducts?.length || 0,
    active:
      allSellerProducts?.filter((productObj: any) => productObj.isActive)
        ?.length || 0,
    inactive:
      allSellerProducts?.filter((productObj: any) => !productObj.isActive)
        ?.length || 0,
    outOfStock:
      allSellerProducts?.filter(
        (productObj: any) => productObj.stockQuantity === 0
      )?.length || 0,
    totalValue:
      allSellerProducts?.reduce(
        (sum: any, productObj: any) =>
          sum + productObj.price * productObj.stockQuantity,
        0
      ) || 0,
  };

  // Get product status
  const getProductStatus = (product: Product) => {
    if (!product.isActive) {
      return "inactive";
    } else if (product.isActive) {
      return "active";
    }
    return "inactive";
    // return product.stockQuantity > 0 ? "active" : "out_of_stock";
  };


  // Debounced Search Function
  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      console.log("search text: " + value)
      await fetchAllSellerProducts(
        1,
        10,
        value,
        filtersRef.current.sortField,
        filtersRef.current.sortOrder,
        filtersRef.current.priceFilter
      );
      setLoading(false);
    }, 1000),
    [] // prevent recreating on every render
  );

  // // HANDLE SEARCHING
  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setLoading(true);
  //   const value = e.target.value;
  //   setFilters((prev) => ({ ...prev, searchText: value }));

  //   if (value.trim() === "") {
  //     setTimeout(async () => {
  //       await fetchAllSellerProducts(
  //         1,
  //         10,
  //         "",
  //         filters.sortField,
  //         filters.sortOrder,
  //         filters.priceFilter
  //       );
  //       setLoading(false);
  //     }, 300);
  //   } else {
  //     debouncedSearch(value);
  //   }
  // };

  // Get product by productId
  const getProductById = async (productId: any) => {
    if (productId) {
      console.log("Product ID: ", productId);
      setLoading(true);
      try {
        const response = await api.get(`/product/${productId}`);
        // setSelectedProduct(response.data.data);
        if (response.data.status != 200) {
          notification.error({
            message: "Error",
            description: "Something went wrong while fetching product details.",
          });
          return null;
        }
        const productByIdData = response.data.data;
        return productByIdData;
      } catch (error) {
        console.error("Failed to fetch product details:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch product details. Please try again.",
        });
        return null;
      } finally {
        setLoading(false);
      }
    }
  }


  // Activate / Deactivate product 
  const toggleProductStatus = async (product: Product) => {

    const productByIdData = await getProductById(product.productId);
    if (productByIdData !== null) {


      setActionLoading(product.productId);
      try {
        const endpoint = product.isActive
          ? `/product/inactive/${product.productId}`
          : `/product/active/${product.productId}`;


        const response = await api.put(endpoint);
        if (response.data.status !== 200) {
          notification.error({
            message: "Error",
            description: product.isActive ? `Something went wrong while deactivating ${product.name}` : `Something went wrong while activating ${product.name}`,
          });
        }
        notification.success({
          message: "Success",
          description: product.isActive ? `${product.name} has been deactivated successfully.` : `${product.name} has been activated successfully.`,
        });


        // Refresh the products list
        await fetchAllSellerProducts(
          pagination.current,
          pagination.pageSize,
          filters.searchText,
          filters.sortField,
          filters.sortOrder,
          filters.priceFilter
        );
      } catch (error) {
        console.error("Failed to toggle product status:", error);
        notification.error({
          message: "Error",
          description: "Failed to update product status. Please try again.",
        });
      } finally {
        setActionLoading(null);
      }
    } else {
      notification.error({
        message: "Error",
        description: "Failed to get product data.",
      });
    }
  }

  const handleViewDetails = async (product: Product) => {
    setLoading(true);
    const productByIdData = await getProductById(product.productId);
    if (productByIdData !== null) {
      try {
        setViewProduct(productByIdData);
        setIsViewModalVisible(true);
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Failed to fetch product details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
    else {
      notification.error({
        message: "Error",
        description: "Failed to get product data.",
      });
    }
  }

  // Show Modal for Add/Edit
  const showModal = async (product?: Product) => {
    if (product) {
      // Edit product click
      setLoading(true);
      try {
        // Fetch detailed product info if needed
        const response = await api.get(`/product/${product.productId}`);
        const productByIdData = response.data.data;
        setSelectedProduct(productByIdData);

        form.setFieldsValue({
          name: productByIdData.name,
          description: productByIdData.description,
          price: productByIdData.price,
          stockQuantity: productByIdData.stockQuantity,
          isActive: productByIdData.isActive,
          images: productByIdData.imageUrl
            ? [
              {
                uid: '-1',
                // name: productByIdData.imageUrl.split('/').pop() || 'image.jpg',
                name: productByIdData.imageUrl.split('/').pop()?.replace(/^\d+_/, '').replace(/^\d+_/, '') || 'image.jpg',
                status: 'done',
                url: productByIdData.imageUrl,
              },
            ]
            : [],
        });
        setIsModalVisible(true);
      } catch (error) {
        console.error("Failed to fetch product details:", error);
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
          description: "Failed to fetch product details. Please try again.",
        });
      } finally {
        setLoading(false);
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

  // Hnadle edit product click
  const handleEditProductClick = async (product: Product) => {
    if (product) {
      console.log("Product: ", product);
      const productId = product.productId;
      setLoading(true);
      try {
        const response = await api.get(`/product/${productId}`);
        setSelectedProduct(response.data.data);
        form.setFieldsValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          isActive: product.isActive,
          images: product.imageUrl,
        });
        showModal(product);
      } catch (error) {
        console.error("Failed to fetch product details:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch product details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  }


  // Handle form submit (Add/Edit)
  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();

      const formData = new FormData();
      formData.append("Name", values.name);
      formData.append("Description", values.description);
      formData.append("Price", values.price);
      formData.append("StockQuantity", values.stockQuantity);
      formData.append("IsActive", values.isActive ?? true);

      const imageFile = values.images?.[0]?.originFileObj;
      if (imageFile) {
        formData.append("Image", imageFile);
      } else {
        notification.error({
          message: "Image Missing",
          description: "Please upload a product image before submitting.",
        });
        return;
      }

      if (selectedProduct) {
        // Update existing product
        // console.log("Exisiting Product Payload: ", formData);
        const resposne = await api.put(`/product/${selectedProduct.productId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (resposne.data.status !== 200) {
          notification.success({
            message: "Error",
            description: `Something went wrong while updating ${values.name}.`,
          });
        }
        notification.success({
          message: "Success",
          description: `${values.name} has been updated successfully.`,
        });
      } else {
        // Create new product
        // console.log("New Product Form Data: ", formData);
        const resposne = await api.post("product/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (resposne.data.status !== 200) {
          notification.success({
            message: "Error",
            description: `Something went wrong while adding ${values.name}.`,
          });
        }
        notification.success({
          message: "Success",
          description: `${values.name} has been added successfully.`,
        });
      }

      setIsModalVisible(false);
      setSelectedProduct(null);
      form.resetFields();

      // Refresh the products list
      await fetchAllSellerProducts(
        pagination.current,
        pagination.pageSize,
        filters.searchText,
        filters.sortField,
        filters.sortOrder,
        filters.priceFilter
      );
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
  const handleDelete = async (product: Product) => {
    const productByIdData = getProductById(product.productId);
    if (productByIdData !== null) {


      setActionLoading(product.productId);
      try {
        const response = await api.delete(`/product/${product.productId}`);
        if (response.data.status !== 200) {
          notification.error({
            message: "Error",
            description: `Something went wrong while deleting ${product.name}`,
          });
        }
        notification.success({
          message: "Success",
          description: `${product.name} has been deleted successfully.`,
        });

        // Refresh the products list
        await fetchAllSellerProducts(
          pagination.current,
          pagination.pageSize,
          filters.searchText,
          filters.sortField,
          filters.sortOrder,
          filters.priceFilter
        );
      } catch (error) {
        console.error("Failed to delete product:", error);
        notification.error({
          message: "Error",
          description: "Failed to delete product. Please try again.",
        });
      } finally {
        setActionLoading(null);
      }
    };
  }

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

  // Edit, Activate/Deactivate, View, Duplicate , Delete Prodcut Options
  const actionMenu = (record: Product): MenuProps => ({
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
            title: record.isActive ? `Are you sure you want to Deactivate "${record.name}"` : `Are you sure you want to Activate "${record.name}"`,
            content: record.isActive ? 'You can later Activate it.' : 'You can later Deactivate it.',
            okText: record.isActive ? 'Deactivate' : "Activate",
            okType: 'danger',
            cancelText: 'Cancel',
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
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
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
      render: (record: Product) => (
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
            <div className="text-sm text-gray-500 truncate">
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
      sorter: (a: Product, b: Product) => a.price - b.price,
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
      sorter: (a: Product, b: Product) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (record: Product) => {
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
      onFilter: (value: any, record: Product) =>
        getProductStatus(record) === value,
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
      sorter: (a: Product, b: Product) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: any, record: Product) => (
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

  // CLear filters button
  const clearFilters = () => {
    setFilters({
      searchText: "",
      sortField: "name",
      sortOrder: "asc",
      priceFilter: "",
      statusFilter: "",
    });
  };

  // Export in excel functionality
  const handleExport = () => {
    // Implement export functionality
    notification.info({
      message: "Export",
      description: "Export functionality will be implemented.",
    });
  };

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
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <Statistic
              title="Total Products"
              value={stats.total}
              prefix={<Package className="text-blue-600" size={20} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <Statistic
              title="Active Products"
              value={stats.active}
              prefix={<CheckCircle className="text-green-600" size={20} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <Statistic
              title="Inactive Products"
              value={stats.inactive}
              prefix={<XCircle className="text-gray-600" size={20} />}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <Statistic
              title="Out of Stock"
              value={stats.outOfStock}
              prefix={<AlertCircle className="text-red-600" size={20} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
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
              <Input
                size="large"
                placeholder="Search products by name or description..."
                value={filters.searchText}
                // onChange={handleSearch}
                onChange={(e) => {
                  setLoading(true);
                  const value = e.target.value;
                  setFilters((prev) => ({ ...prev, searchText: value }));
                  if (value.trim() === "") {
                    // Delay the fetch when clearing the input
                    setTimeout(async () => {
                      await fetchAllSellerProducts(
                        1,
                        10,
                        "",
                        filters.sortField,
                        filters.sortOrder,
                        filters.priceFilter
                      );
                      setLoading(false);
                    }, 1000); // Adjust the delay (ms) as needed
                  } else {
                    debouncedSearch(value);
                  }
                }}
                prefix={<Search size={18} className="text-gray-400" />}
                allowClear
                className="shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                placeholder="Price Range"
                value={filters.priceFilter || undefined}
                onChange={async (value) => {
                  const newPriceFilter = value || "";
                  setFilters((prev) => ({ ...prev, priceFilter: newPriceFilter }));

                  setLoading(true);
                  await fetchAllSellerProducts(
                    1,
                    10,
                    filters.searchText,
                    filters.sortField,
                    filters.sortOrder,
                    newPriceFilter
                  );
                  setLoading(false);
                }}
                style={{ width: 140 }}
                size="large"
                allowClear
              >
                <Option value="Below100">Under $100</Option>
                <Option value="100To500">$100 - $500</Option>
                <Option value="Above500">Above $500</Option>
              </Select>

              <Tooltip title="Clear all filters">
                <Button
                  size="large"
                  icon={<FilterX size={18} />}
                  onClick={clearFilters}
                  className="shadow-sm"
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
            dataSource={allSellerProducts}
            columns={columns}
            rowKey="productId"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: allSellerProducts?.length || 0,
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
              getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
              rules={[{ required: true, message: 'Product image is required.' }]}
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
                    window.open(previewUrl, '_blank');
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
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
              <span className="text-lg font-semibold text-purple-700">Product Details</span>
            </div>
          }
          open={isViewModalVisible}
          onCancel={() => { setIsViewModalVisible(false); setViewProduct(null); }}
          width={700}
          footer={[
            <Button key="close" size="large" onClick={() => { setIsViewModalVisible(false); setViewProduct(null); }}>
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
                  <Title level={4} className="!mb-1 text-purple-700">{viewProduct.name}</Title>
                  <Text type="secondary" className="block mb-2 text-base">{viewProduct.description}</Text>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Text strong>Price:</Text>
                      <div className="text-lg text-green-600 font-semibold">${viewProduct.price.toFixed(2)}</div>
                    </div>
                    <div>
                      <Text strong>Stock:</Text>
                      <div className={viewProduct.stockQuantity > 0 ? "text-blue-600" : "text-red-600"}>
                        {viewProduct.stockQuantity > 0 ? viewProduct.stockQuantity : "Out of Stock"}
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
                      <div>{new Date(viewProduct.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <Text strong>Updated At:</Text>
                      <div>{new Date(viewProduct.updatedAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <Text strong>Product ID:</Text>
                      <div className="text-xs text-gray-500">{viewProduct.productId}</div>
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

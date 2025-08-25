import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Pagination,
  Skeleton,
  Empty,
  notification,
  Form,
  message,
} from "antd";
import { ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/product/ProductCard";
import { useProduct } from "../../context/ProductContext";
import { GetProducts } from "../../services/ProductApiHelperService";

const { Search: SearchInput } = Input;
const { Option } = Select;

interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const ProductList = () => {
  // const { addItem } = useCart();
  // const [products, setProducts] = useState<Product[]>([]);
  // const [searchQuery, setSearchQuery] = useState("");
  // const [category, setCategory] = useState("all");
  // const [sortBy, setSortBy] = useState("popular");
  
  // const { allActiveProducts, fetchAllActiveProducts } = useProduct();
  
  const [products, setProducts] = useState<any>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    sortField: "name",
    sortOrder: "asc",
    filterByPrice: "all",
    filterByStatus: "active",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewProduct, setViewProduct] = useState<any | null>(null);

  // Initial fetch of products
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const result = await GetProducts(
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
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [pagination, searchText, filters]);


  return (
    <div className="section">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Explore Products</h1>
        <p className="text-gray-500">
          Browse through our collection of high-quality products
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
        <div className="flex-1">
          <SearchInput
            placeholder="Search products..."
            onChange={(e) => {
              setSearchText(e.target.value);
              setPagination((prev) => ({ ...prev, current: 1, pageSize: 10 }));
            }}
            className="w-full"
            prefix={<Search size={18} className="text-gray-400" />}
            allowClear
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            defaultValue="all"
            style={{ width: 140 }}
            // onChange={setCategory}
            className="w-full sm:w-auto"
          >
            <Option value="all">All Categories</Option>
            <Option value="Electronics">Electronics</Option>
            <Option value="Clothing">Clothing</Option>
            <Option value="Home">Home & Kitchen</Option>
            <Option value="Beauty">Beauty</Option>
          </Select>

          <Select
            defaultValue="popular"
            style={{ width: 140 }}
            // onChange={setSortBy}
            className="w-full sm:w-auto"
          >
            <Option value="popular">Most Popular</Option>
            <Option value="price-low">Price: Low to High</Option>
            <Option value="price-high">Price: High to Low</Option>
          </Select>
        </div>
      </div>

      {loading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card>
                <Skeleton.Image active className="w-full h-40" />
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : products.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {products.map((product: any) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.productId}>
                <ProductCard
                  product={{
                    id: product.productId,
                    name: product.name,
                    price: product.price,
                    image: product.imageUrl || "/placeholder-product.png",
                    description: product.description,
                    stock: product.stockQuantity,
                  }}
                 
                />
              </Col>
            ))}
          </Row>

          <div className="mt-8 flex justify-center">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={totalProducts}
              onChange={(page, pageSize) =>
                setPagination((prev) => ({
                  ...prev,
                  current: page,
                  pageSize,
                }))
              }
            />
          </div>
        </>
      ) : (
        <Empty description="No products found" className="my-12" />
      )}
    </div>
  );
};

export default ProductList;

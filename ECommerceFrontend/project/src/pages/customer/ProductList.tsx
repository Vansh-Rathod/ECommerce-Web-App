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
} from "antd";
import { ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/product/ProductCard";
import { useProduct } from "../../context/ProductContext";

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
  const [loading, setLoading] = useState(true);
  // const [searchQuery, setSearchQuery] = useState("");
  // const [category, setCategory] = useState("all");
  // const [sortBy, setSortBy] = useState("popular");

  const { allActiveProducts, fetchAllActiveProducts } = useProduct();

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({
    searchText: "",
    sortField: "name",
    sortOrder: "asc",
    priceFilter: "",
  });

  // useEffect(() => {
  //   // Simulate API call to fetch products
  //   const fetchProducts = async () => {
  //     setLoading(true);
  //     try {
  //       // Replace with actual API call
  //       await new Promise(resolve => setTimeout(resolve, 800));

  //       // Mock data
  //       const mockProducts = Array.from({ length: 12 }, (_, i) => ({
  //         id: `product-${i + 1}`,
  //         name: `Product ${i + 1}`,
  //         price: Math.floor(Math.random() * 100) + 10,
  //         image: `https://picsum.photos/seed/${i + 1}/300/300`,
  //         category: ['Electronics', 'Clothing', 'Home', 'Beauty'][Math.floor(Math.random() * 4)],
  //         rating: Math.floor(Math.random() * 5) + 1,
  //       }));

  //       setProducts(mockProducts);
  //     } catch (error) {
  //       notification.error({
  //         message: 'Error',
  //         description: 'Failed to load products',
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProducts();
  // }, []);

  useEffect(() => {
    // Simulate API call to fetch products
    const fetchProducts = async () => {
      setLoading(true);
      try {
        await fetchAllActiveProducts(
          pagination.current,
          pagination.pageSize,
          filters.searchText,
          filters.sortField,
          filters.sortOrder,
          filters.priceFilter
        );
      } catch (error) {
        console.log("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [pagination, filters]);

  // const handleAddToCart = (product: Product) => {
  //   addItem({
  //     id: product.productId,
  //     name: product.name,
  //     price: product.price,
  //     image: product.image,
  //   });

  //   notification.success({
  //     message: "Added to Cart",
  //     description: `${product.name} has been added to your cart.`,
  //     placement: "bottomRight",
  //   });
  // };

  // const filteredProducts = products
  //   .filter(
  //     (product) =>
  //       (category === "all" || product.category === category) &&
  //       product.name.toLowerCase().includes(searchQuery.toLowerCase())
  //   )
  //   .sort((a, b) => {
  //     if (sortBy === "price-low") return a.price - b.price;
  //     if (sortBy === "price-high") return b.price - a.price;
  //     return 0; // Default sort by popularity
  //   });

  // console.log("Active Products: " + allActiveProducts);

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
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                searchText: e.target.value,
              }))
            }
            className="w-full"
            prefix={<Search size={18} className="text-gray-400" />}
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
      ) : allActiveProducts.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {allActiveProducts.map((product: Product) => (
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
              total={allActiveProducts.length}
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

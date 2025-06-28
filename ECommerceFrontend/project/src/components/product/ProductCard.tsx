import { Card, Rate, Button, Typography, Badge, message } from "antd";
import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import SkeletonImage from "antd/es/skeleton/Image";

const { Text, Title } = Typography;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {

  const {addItemToCart} = useCart();

  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const onAddToCart = async (productId: any, quantity: any) => {
    setLoading(true);
    try{
      await addItemToCart(productId);
      message.success("Item added to cart successfully");
    }
    catch(error: any){
      console.log("Failed to add item");
      message.success("Failed to add item to cart");
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <Card
      hoverable
      className="overflow-hidden transition-all duration-300 h-full"
      cover={
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* {isDiscounted && (
            <Badge.Ribbon text={`${product.discount}% OFF`} color="red" className="z-10" />
          )} */}
          <div className="w-full h-48 overflow-hidden">
            <img
              alt={product.name}
              src={product.image}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
            />
          </div>
          <button
            onClick={toggleFavorite}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:shadow-md transition-all duration-300"
          >
            <Heart
              size={16}
              className={`${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button>
        </div>
      }
      bodyStyle={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <div className="flex flex-col flex-1">
        {/* Title and Description Section */}
        <div className="flex-1">
          <Title level={5} className="mb-1 line-clamp-1">
            {product.name}
          </Title>

          {product.description && (
            <Text type="secondary" className="mb-2 line-clamp-2 text-sm">
              {product.description}
            </Text>
          )}
        </div>

        {/* Price and Stock Section */}
        <div className="flex items-center justify-between">
          <Text strong className="text-lg">
            ${product.price.toFixed(2)}
          </Text>
          {product.stock !== undefined && (
            <Text type="secondary" className="text-sm">
              In Stock: {product.stock}
            </Text>
          )}
        </div>

        <Button
          type="primary"
          icon={<ShoppingCart size={16} />}
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(product.id, 1);
          }}
          className="w-full mt-2"
          // loading={loading}
        >
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;

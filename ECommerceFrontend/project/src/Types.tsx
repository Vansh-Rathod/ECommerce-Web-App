export interface APIResponse<T = any>{
    success: boolean;
    message: string;
    data: T | null
}

export interface PagedResponse<T> {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    items: T[];
  }

  export interface CommonResponse<T = any>{
    success: boolean;
    message?: string;
    data?: T | null;
    error?: string;
    timeStamp?: Date
}

//   export interface Role {
//     id: string; // Guid → string
//     name: string; // e.g., "Admin", "Seller", "Customer"
  
//     // Navigation property
//     userRoles?: UserRole[];
//   }

//   export interface UserApprovalRequest {
//     id: string; // Guid → string
//     userId: string; // Guid → string
//     requestedRole: string;
//     city: string;
//     status: UserApprovalStatus; // Enum mapping
//     rejectionReason?: string; // Nullable string → optional
  
//     // Navigation properties
//     user?: User;
//   }
  
//   export interface UserRole {
//     userId: string; // Guid → string
//     roleId: string; // Guid → string
//     createdAt: string; // DateTime → ISO date string
  
//     // Navigation properties
//     user?: User;
//     role?: Role;
//   }
  
//   export interface User {
//     id: string; // Guid → string
//     email: string;
//     passwordHash: string;
//     fullName: string;
//     createdAt: string; // DateTime → ISO date string
//     lastLogin: string; // DateTime → ISO date string
//     is2FAEnabled: boolean;
  
//     // Navigation properties
//     roles?: UserRole[]; 
//     sellerProfile?: Seller;
//     customerProfile?: Customer;
//     refreshTokens?: RefreshTokenModel[];
//     userOTP?: UserOTPModel;
//   }

//   export interface Seller {
//     id: string; // Guid → string
//     userId: string; // Guid → string
//     storeName: string;
//     city: string;
//     isApproved: boolean;
//     isActive: boolean;
//     createdAt: string; // DateTime → ISO date string
  
//     // Navigation properties
//     user?: User;
//     products?: Product[];
//     orderItems?: OrderItem[];
//   }

//   export interface Customer {
//     id: string; // Guid → string
//     userId: string; // Guid → string
//     isActive: boolean;
//     createdAt: string; // DateTime → ISO date string
  
//     // Navigation properties
//     user?: User;
//     wallet?: Wallet;
//     cart?: Cart;
//     orders?: Order[];
//   }

//   export interface Product {
//     id: string; // Guid → string
//     name: string;
//     description: string;
//     price: number; // decimal → number
//     stockQuantity: number;
//     isActive: boolean;
//     sellerId: string; // Guid → string
//     imageUrl: string;
//     createdAt: string; // DateTime → ISO date string
//     updatedAt: string; // DateTime → ISO date string
  
//     // Navigation properties
//     seller?: Seller;
//   }
  

//   export interface Order {
//     id: string; // Guid → string
//     customerId: string; // Guid → string
//     orderDate: string; // DateTime → ISO date string
//     estimatedDeliveryTime?: string; // Nullable DateTime → string | undefined
//     totalAmount: number; // decimal → number
//     status: OrderStatus; // Enum → matching TS enum or string
  
//     // Navigation properties
//     customer?: Customer;
//     orderItems?: OrderItem[];
//   }
  
//   export interface OrderItem {
//     id: string; // Guid → string
//     orderId: string; // Guid → string
//     productId: string; // Guid → string
//     sellerId: string; // Guid → string
//     quantity: number;
//     priceAtPurchase: number; // decimal → number
//     status: OrderItemStatus; // enum mapping
  
//     // Navigation properties
//     order?: Order;
//     product?: Product;
//     seller?: Seller;
//   }
  
  

//   export interface Cart {
//     id: string; // Guid in C# → string in TS
//     customerId: string; // Guid in C# → string in TS
//     updatedAt: string; // DateTime in C# → ISO date string in TS
//     customer?: Customer; // Navigation property (optional)
//     cartItems?: CartItem[]; // Collection in C# → array in TS
//   }

//   export interface CartItem {
//     id: string; // Guid → string
//     cartId: string; // Guid → string
//     productId: string; // Guid → string
//     quantity: number;
  
//     // Navigation properties
//     cart?: Cart;
//     product?: Product;
//   }

export interface ShippingData {
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  address2: string,
  city: string,
  state: string,
  zip: string,
  country: string,
  shippingMethod: string,
}

export interface PaymentData {
  paymentMethod: string,
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardName?: string;
}
  

import { Clock, ThumbsDown, ThumbsUp } from "lucide-react";

export const cities = [
    "Ahmedabad",
    "New York",
    "Gandhinagar",
    "Rajkot",
    "Surat",
    "Mumbai",
    "Pune",
    "Thane",
    "Kanpur",
    "Jaipur",
    "Udaipur",
  ];

  // Maps numeric enum values to display info
export const orderStatusMap: Record<
number,
{ color: string; text: string; icon: JSX.Element; tagColor?: string }
> = {
0: { color: "orange", text: "Pending", icon: <Clock size={14} />, tagColor: "text-warning-500" },
1: { color: "blue", text: "Partially Approved", icon: <Clock size={14} />, tagColor: "text-orange-500" },
2: { color: "green", text: "Approved", icon: <ThumbsUp size={14} />, tagColor: "text-primary-500" },
3: { color: "red", text: "Rejected", icon: <ThumbsDown size={14} />, tagColor: "text-red-500" },
4: { color: "red", text: "Cancelled", icon: <ThumbsDown size={14} />, tagColor: "text-gray-500" },
5: { color: "green", text: "Delivered", icon: <ThumbsUp size={14} />, tagColor: "text-success-500" },
};

export const orderItemStatusMap: Record<
number,
{ color: string; text: string; icon: JSX.Element }
> = {
0: { color: "orange", text: "Pending", icon: <Clock size={14} /> },
1: { color: "green", text: "Approved", icon: <ThumbsUp size={14} /> },
2: { color: "red", text: "Rejected", icon: <ThumbsDown size={14} /> },
};

export const ShippingDefaultValues = {
  first_name: "Vansh",
  last_name: "Rathod",
  email: "vansh@gmail.com",
  phone: "1234567890",
  address: "14 Siddeshwar Park, Nigam Road, Ghodasar, Ahmedabad",
  address2: "14",
  city: "Ahmedabad",
  state: "Gujarat",
  zip: "360050",
  country: "India",
  shipping_method: "standard",
};

export const PaymentDefaultValues = {
  payment_method: "credit_card",
  card_number: "6574 4783 1584 2349",
  expiry: "06/45",
  cvv: "451",
  card_name: "VANSH RATHOD",
};
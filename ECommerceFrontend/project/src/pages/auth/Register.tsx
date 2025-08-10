import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Divider,
  message,
  Card,
  Typography,
  Radio,
  Checkbox,
} from "antd";
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, ShoppingBag, MapPin, Store } from "lucide-react";
import api from "../../services/api";

const { Title, Text } = Typography;

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roles: ("Customer" | "Seller")[];
  city?: string;
  storeName?: string;
}

const Register = () => {
  const authController = import.meta.env.VITE_AUTH_CONTROLLER;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<(string | number)[]>([]);

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      if (!values.name || !values.email || !values.password || !values.roles || values.roles.length === 0) {
        message.error("Name, Email, Password & Roles are required fields");
        return;
      }
      if (values.roles.includes("Seller") && (!values.city || !values.storeName)) {
        message.error("City & Store Name are required for sellers");
        return;
      }

      const payload = {
        fullName: values.name,
        email: values.email,
        password: values.password,
        roles: values.roles,
        city: values.city ? values.city : null,
        storeName: values.storeName ? values.storeName : null,
      };

      const response = await api.post(`/${authController}/register`, payload);

      if (!response.data) {
        message.error("Network Error. Something went wrong while establishing connection with server");
        return;
      }

      if (response.data.status !== 200) {
        message.error(response.data.message);
        return;
      }

      message.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (checkedValues: (string | number)[]) => {
    setSelectedRoles(checkedValues);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-card">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <ShoppingBag className="text-primary-500 h-12 w-12" />
          </div>
          <Title level={3} className="mt-4">
            Create an account
          </Title>
          <Text type="secondary">Join Shop Hub today</Text>
        </div>

        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          className="mb-4"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input
              prefix={<User className="mr-2 text-gray-400" size={16} />}
              placeholder="John Doe"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<Mail className="mr-2 text-gray-400" size={16} />}
              placeholder="your@email.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              prefix={<Lock className="mr-2 text-gray-400" size={16} />}
              placeholder="Your password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<Lock className="mr-2 text-gray-400" size={16} />}
              placeholder="Confirm password"
            />
          </Form.Item>

          <Form.Item
            name="roles"
            label="Registering as"
            rules={[
              { 
                required: true, 
                message: "Please select at least one role",
                validator: (_, value) => {
                  if (!value || value.length === 0) {
                    return Promise.reject(new Error("Please select at least one role"));
                  }
                  return Promise.resolve();
                }
              },
            ]}
          >
            <Checkbox.Group onChange={handleRoleChange}>
              <Checkbox value="Customer">Customer</Checkbox>
              <Checkbox value="Seller">Seller</Checkbox>
            </Checkbox.Group>
          </Form.Item>

          {selectedRoles.includes("Seller") && (
            <>
              <Form.Item
                name="storeName"
                label="Store Name"
                rules={[
                  { required: true, message: "Please enter your store name" },
                ]}
              >
                <Input
                  prefix={<Store className="mr-2 text-gray-400" size={16} />}
                  placeholder="My Awesome Store"
                />
              </Form.Item>

              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: "Please enter your city" }]}
              >
                <Input
                  prefix={<MapPin className="mr-2 text-gray-400" size={16} />}
                  placeholder="City"
                />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider className="text-gray-400">OR</Divider>

        <div className="text-center">
          <Text type="secondary">Already have an account?</Text>{" "}
          <Link to="/login" className="text-primary-500 hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;

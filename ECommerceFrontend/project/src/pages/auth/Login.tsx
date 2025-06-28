import { useEffect, useState } from "react";
import { Form, Input, Button, Divider, message, Card, Typography, notification } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, ShoppingBag } from "lucide-react";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  // // Get the redirect path from location state or default to dashboard
  // const from = location.state?.from?.pathname || "/customer/dashboard"; 

  // Pre-fill email when coming back from OTP
  useEffect(() => {
    if (location.state?.email) {
      form.setFieldsValue({ email: location.state.email });
    }
  }, [location, form]);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        message.success("Login successful!");
        const role = localStorage.getItem("role");
        navigate(`/${role}/dashboard`, { replace: true });
      } else if (result.requires2FA) {

        // Show notification
        notification.info({
          message: "Verification Required",
          description:
            "A verification code has been sent to your email address.",
        });

        // Redirect to OTP verification
        navigate("/verify-otp", {
          state: { email: values.email },
        });
      } else {
        // message.error('Invalid email or password');
        message.error('Invalid email or password');
        console.log("Invalid email or password");
      }
    } catch (error) {
      // message.error("Login failed");
      console.log("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-card">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <ShoppingBag className="text-primary-500 h-12 w-12" />
          </div>
          <Title level={3} className="mt-4">
            Welcome to Shop Hub
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          className="mb-4"
          form={form}
        >
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
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<Lock className="mr-2 text-gray-400" size={16} />}
              placeholder="Your password"
            />
          </Form.Item>

          <Form.Item className="mb-2">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-500 hover:underline float-right"
            >
              Forgot password?
            </Link>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider className="text-gray-400">OR</Divider>

        <div className="text-center">
          <Text type="secondary">Don't have an account?</Text>{" "}
          <Link to="/register" className="text-primary-500 hover:underline">
            Sign up
          </Link>
        </div>

        {/* <div className="mt-6 text-center text-xs text-gray-500">
          <p>Use these test logins:</p>
          <p>Admin: admin@example.com / password</p>
          <p>Seller: seller@example.com / password</p>
          <p>Customer: customer@example.com / password</p>
        </div> */}
      </Card>
    </div>
  );
};

export default Login;

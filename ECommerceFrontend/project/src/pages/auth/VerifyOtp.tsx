import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Alert,
  Statistic,
  Flex,
  Avatar,
  Divider,
  message,
  notification,
} from "antd";
import {
  MailOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

// interface VerifyOtpProps {
//   email: string;
// }

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { verifyOtp } = useAuth();

  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [deadline, setDeadline] = useState(Date.now() + 10 * 60 * 1000); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Get email from location state
  const email = location.state?.email || '';

  //   // Mask email for display
  //   const maskedEmail = email.includes("@")
  //     ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
  //     : "your registered email";

  // Handle OTP change
  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    if (error) setError(""); // Clear error when user types
  };

  // Handle countdown finish
  const handleCountdownFinish = () => {
    setCanResend(true);
    message.warning("Verification code has expired. Please request a new one.");
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      message.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtp(otpValue);
      if (result.success) {
        message.success("Login successful!");
        const role = localStorage.getItem("role");
        navigate(`/${role}/dashboard`, { replace: true });
      } else {
        // Show notification
        notification.error({
          message: result.message,
          description: result.description,
        });
      }
    } catch (error) {
      console.error("Verification Failed. Error: " + error);
      message.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      // Simulate API call - replace with your actual resend OTP API
      // await api.post('/auth/resend-otp', { email });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset timer and state
      setDeadline(Date.now() + 10 * 60 * 1000);
      setCanResend(false);
      setOtpValue("");

      message.success("Verification code sent successfully!");
    } catch (error) {
      console.error("Failed to resend verification code. Please try again. Error: " + error);
      message.error("Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  };

  // Go back to previous page
  const handleGoBack = () => {
    navigate('/login', {
      state: { email } // Pass email back to login
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Back Button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{
            color: "white",
            marginBottom: "24px",
            fontSize: "16px",
          }}
        >
          Back to Login
        </Button>

        {/* Main Card */}
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <Flex vertical align="center" style={{ marginBottom: "32px" }}>
            <Avatar
              size={80}
              icon={<SafetyOutlined />}
              style={{
                backgroundColor: "#1890ff",
                marginBottom: "16px",
              }}
            />
            <Title level={2} style={{ margin: 0, textAlign: "center" }}>
              Verify Your Account
            </Title>
            <Paragraph
              style={{
                textAlign: "center",
                color: "#666",
                margin: "8px 0 0 0",
                fontSize: "16px",
              }}
            >
              We've sent a 6-digit verification code to
            </Paragraph>
            <Flex align="center" style={{ marginTop: "8px" }}>
              <MailOutlined style={{ color: "#1890ff", marginRight: "8px" }} />
              <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                {email}
              </Text>
            </Flex>
          </Flex>

          {/* OTP Input Section */}
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div className="flex justify-center w-full">
              <Space direction="vertical" size="large" className="w-full max-w-md">
                <div className="text-center">
                  <Text
                    strong
                    style={{
                      fontSize: "16px",
                      marginBottom: "12px",
                      display: "block",
                    }}
                  >
                    Enter Verification Code
                  </Text>
                  <div className="flex justify-center">
                    <Input.OTP
                      length={6}
                      value={otpValue}
                      onChange={handleOtpChange}
                      size="large"
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                      status={error ? "error" : undefined}
                    />
                  </div>
                </div>
              </Space>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ borderRadius: "8px" }}
              />
            )}

            {/* Timer Section */}
            <Card
              size="small"
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              {!canResend ? (
                <Flex vertical align="center">
                  <Text style={{ color: "#666", marginBottom: "8px" }}>
                    Code expires in
                  </Text>
                  <Countdown
                    value={deadline}
                    format="mm:ss"
                    onFinish={handleCountdownFinish}
                    valueStyle={{
                      color: "#ff4d4f",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                </Flex>
              ) : (
                <Text style={{ color: "#ff4d4f", fontSize: "16px" }}>
                  Verification code has expired
                </Text>
              )}
            </Card>

            {/* Verify Button */}
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              disabled={otpValue.length !== 6}
              onClick={handleVerifyOtp}
              icon={!loading ? <CheckCircleOutlined /> : undefined}
              style={{
                height: "48px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "8px",
              }}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <Divider plain>
              <Text style={{ color: "#666" }}>Didn't receive the code?</Text>
            </Divider>

            {/* Resend Button */}
            <Button
              type="default"
              size="large"
              block
              loading={isResending}
              disabled={!canResend}
              onClick={handleResendOtp}
              icon={<ReloadOutlined />}
              style={{
                height: "48px",
                fontSize: "16px",
                borderRadius: "8px",
                borderStyle: "dashed",
              }}
            >
              {isResending ? "Sending..." : "Resend Verification Code"}
            </Button>

            {/* Help Section */}
            <Card
              size="small"
              style={{
                backgroundColor: "#f6f8fa",
                borderRadius: "8px",
                marginTop: "16px",
              }}
            >
              <Paragraph
                style={{
                  margin: 0,
                  textAlign: "center",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                <SafetyOutlined style={{ marginRight: "8px" }} />
                If you're still having trouble, please contact our support team
                for assistance.
              </Paragraph>
            </Card>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOtp;

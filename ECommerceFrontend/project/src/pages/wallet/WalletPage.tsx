import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Statistic,
  Typography,
  Row,
  Col,
  Tag,
  Tabs,
  Timeline,
  Divider,
  Form,
  Modal,
  notification,
  Input,
} from "antd";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Banknote,
  CreditCard,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import api from "../../services/api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Item } = Form;

// Mock transaction data
const mockTransactions = [
  {
    id: "tx-001",
    date: "2023-06-01",
    amount: 250.0,
    type: "credit",
    description: "Refund for order #12345",
    status: "completed",
  },
  {
    id: "tx-002",
    date: "2023-05-28",
    amount: 120.5,
    type: "debit",
    description: "Payment for order #12340",
    status: "completed",
  },
  {
    id: "tx-003",
    date: "2023-05-25",
    amount: 50.0,
    type: "credit",
    description: "Reward points conversion",
    status: "completed",
  },
  {
    id: "tx-004",
    date: "2023-05-20",
    amount: 180.75,
    type: "debit",
    description: "Payment for order #12330",
    status: "completed",
  },
  {
    id: "tx-005",
    date: "2023-05-15",
    amount: 25.0,
    type: "credit",
    description: "Referral bonus",
    status: "completed",
  },
];

const WalletPage = () => {
  const { user } = useAuth();
  const { wallet, getWallet } = useWallet();
  // const [balance, setBalance] = useState(0);
  // const [transactions, setTransactions] = useState(mockTransactions);
  const [loading, setLoading] = useState(false);

  const [isAddFundsModalVisible, setIsAddFundsModalVisible] = useState(false);
  const [addFundsForm] = Form.useForm();

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        await getWallet();
      } catch (error) {
        console.log("Failed to fetch wallet");
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  // Update transactions to use actual wallet data
  const transactions =
    wallet?.walletTransactions?.map((tx: any) => ({
      id: tx.transactionId,
      date: tx.transactionDate,
      amount: tx.transactionAmount,
      type: tx.transactionType.toLowerCase(),
      description: tx.transactionDescription,
      status: "completed",
    })) || [];

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        };
        return new Date(date).toLocaleString('en-US', options);
      },
      sorter: (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: any, record: any) => (
        <span
          className={
            record.type === "credit" || record.type === "deposit" ? "text-success-500" : "text-error-500"
          }
        >
          {["credit", "deposit"].includes(record.type) ? "+" : "-"} ${amount.toFixed(2)}
        </span>
      ),
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: any) => (
        <Tag color={status === "completed" ? "success" : "processing"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const handleAddFunds = async (values: any) => {


    try {
      // Call add funds API
      await api.post('/wallet/add-funds', { 
        amount: values.amount,
        description: values.description
      });
      
      // Refresh wallet data
      await getWallet();
      
      notification.success({
        message: 'Funds Added',
        description: `$${values.amount} has been added to your wallet`,
      });
      
      setIsAddFundsModalVisible(false);
      addFundsForm.resetFields();
    } catch (error) {
      console.log("Error: " + error);
      notification.error({
        message: 'Add Funds Failed',
        description: 'Failed to add funds to wallet',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="section">
        <div className="mb-6">
          <Title level={3}>My Wallet</Title>
          <Text type="secondary">
            Manage your funds and view transaction history
          </Text>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12} lg={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Current Balance"
                value={wallet?.balance || 0}
                precision={2}
                prefix={<Wallet className="mr-2 text-primary-500" size={20} />}
                suffix="$"
              />
              <div className="mt-4">
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  onClick={() => setIsAddFundsModalVisible(true)}
                  loading={loading}
                >
                  Add Funds
                </Button>
                <Button className="ml-2" icon={<Banknote size={16} />}>
                  Withdraw
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card bordered={false} className="shadow-sm">
              <div className="mb-2">
                <Text strong>Quick Actions</Text>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button icon={<CreditCard size={16} className="mr-1" />}>
                  Link Card
                </Button>
                <Button icon={<RefreshCw size={16} className="mr-1" />}>
                  Transfer
                </Button>
                <Button icon={<Download size={16} className="mr-1" />}>
                  Statement
                </Button>
                <Button icon={<Filter size={16} className="mr-1" />}>
                  Filter
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card bordered={false} className="shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <Text strong>Activity Summary</Text>
              </div>
              <Timeline
                items={[
                  {
                    dot: (
                      <ArrowDownLeft className="text-success-500" size={16} />
                    ),
                    children: (
                      <div>
                        <Text>Income</Text>
                        <div className="text-success-500 font-semibold">
                          +$325.00
                        </div>
                      </div>
                    ),
                  },
                  {
                    dot: <ArrowUpRight className="text-error-500" size={16} />,
                    children: (
                      <div>
                        <Text>Spending</Text>
                        <div className="text-error-500 font-semibold">
                          -$301.25
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} className="shadow-sm">
          <Tabs defaultActiveKey="all">
            <TabPane tab="All Transactions" key="all">
              <Table
                dataSource={transactions}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </TabPane>
            <TabPane tab="Deposits" key="deposits">
            <Table
        dataSource={transactions.filter((tx: any) => 
          ["credit", "deposit"].includes(tx.type)
        )}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
            </TabPane>
            <TabPane tab="Withdrawals" key="withdrawals">
            <Table
        dataSource={transactions.filter((tx: any) => 
          tx.type === "debit"
        )}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
            </TabPane>
          </Tabs>
        </Card>
      </div>


      {/* Add the modal component */}
      <Modal
  title="Add Funds to Wallet"
  visible={isAddFundsModalVisible}
  onCancel={() => setIsAddFundsModalVisible(false)}
  footer={[
    <Button key="back" onClick={() => setIsAddFundsModalVisible(false)}>
      Cancel
    </Button>,
    <Button 
      key="submit" 
      type="primary" 
      loading={loading}
      onClick={() => addFundsForm.submit()}
    >
      Add Funds
    </Button>,
  ]}
>
  <Form
    form={addFundsForm}
    layout="vertical"
    onFinish={handleAddFunds}
  >
    <Item
      name="amount"
      label="Amount"
      rules={[
        { required: true, message: 'Please enter an amount' },
        { 
          validator: (_, value) => 
            value > 0 ? Promise.resolve() : Promise.reject('Amount must be greater than 0')
        }
      ]}
    >
      <Input
        type="number"
        prefix="$"
        step="0.01"
        min="0.01"
        placeholder="Enter amount to add"
      />
    </Item>

    <Item
      name="description"
      label="Description"
      rules={[{ required: true, message: 'Please enter a description' }]}
    >
      <Input.TextArea
        rows={3}
        placeholder="Enter transaction description (e.g. 'Funds added via credit card')"
        maxLength={100}
        showCount
      />
    </Item>
  </Form>
</Modal>
    </>
  );
};

export default WalletPage;

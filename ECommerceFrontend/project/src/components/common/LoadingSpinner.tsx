import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
}

const LoadingSpinner = ({ size = 50, fullScreen = true }: LoadingSpinnerProps) => {
  const spinner = (
    <Spin 
      indicator={<LoadingOutlined style={{ fontSize: size }} spin />} 
      className="text-primary-500"
    />
  );
  
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export default LoadingSpinner;
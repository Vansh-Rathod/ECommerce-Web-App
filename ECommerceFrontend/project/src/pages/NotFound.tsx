import { Button, Result } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/login';
  console.log(from);
  return (
    

    <div className="min-h-screen flex items-center justify-center">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Link to={from}>
            <Button type="primary" icon={<Home size={16} className="mr-1" />}>
              Back Home
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;
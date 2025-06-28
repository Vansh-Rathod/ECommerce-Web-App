import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter className="text-center text-gray-500 bg-white border-t border-gray-100">
      <p className="text-sm">Shop Hub © {new Date().getFullYear()} - All rights reserved</p>
    </AntFooter>
  );
};

export default Footer;
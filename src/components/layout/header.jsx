import React, { useContext } from 'react';
import { UsergroupAddOutlined, HomeOutlined, ShoppingOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu, Layout, Spin } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth, setAuth, appLoading } = useContext(AuthContext);

    // Tính key từ pathname
    const getKeyFromPath = (pathname) => {
        if (pathname === '/') return 'home';
        if (pathname.startsWith('/product')) return 'product';
        if (pathname.startsWith('/user')) return 'user';
        if (pathname.startsWith('/login')) return 'login';
        return 'home';
    };

    if (appLoading) {
        return (
            <AntHeader style={{ background: '#fff', boxShadow: '0 2px 8px #f0f1f2', padding: '0 40px' }}>
                <Spin />
            </AntHeader>
        );
    }

    const items = [
        {
            label: <Link to={"/"}>Trang Chủ</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        ...(auth.isAuthenticated ? [{
            label: <Link to={"/product"}>Sản Phẩm</Link>,
            key: 'product',
            icon: <ShoppingOutlined />,
        }] : []),
        ...(auth.isAuthenticated ? [{
            label: <Link to={"/user"}>Người Dùng</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
        }] : []),
        {
            label: `Xin chào ${auth?.user?.name || "Khách"}`,
            key: 'SubMenu',
            icon: <SettingOutlined />,
            children: [
                ...(auth.isAuthenticated ? [{
                    label: <span>Đăng xuất</span>,
                    key: 'logout',
                }] : [{
                    label: <Link to={'/login'}>Đăng nhập</Link>,
                    key: 'login',
                }]),
            ],
        },
    ];

    const onClick = (e) => {
        if (e.key === 'logout') {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            setAuth({
                isAuthenticated: false,
                user: null,
            });
            navigate("/");

        }
    };

    return (
        <AntHeader style={{ background: '#fff', boxShadow: '0 2px 8px #f0f1f2', padding: '0 40px' }}>
            <Menu
                onClick={onClick}
                selectedKeys={[getKeyFromPath(location.pathname)]}
                mode="horizontal"
                items={items}
                style={{ fontSize: 16, minWidth: 400 }}
            />
        </AntHeader>
    );
};

export default Header;
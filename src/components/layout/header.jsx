import React, { useContext, useMemo, useState } from 'react';
import { UsergroupAddOutlined, HomeOutlined, ShoppingOutlined, SettingOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Menu, Layout, Spin, Input, Button, Badge, Drawer, Empty, List, Avatar, Divider, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
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

    const [isCartOpen, setIsCartOpen] = useState(false);
    // TODO: Replace with real cart state from context/store when available
    const [cartItems] = useState([]);

    const cartCount = useMemo(() => {
        return Array.isArray(cartItems) ? cartItems.reduce((sum, it) => sum + (it.quantity || 1), 0) : 0;
    }, [cartItems]);

    const onSearch = (value) => {
        const query = value?.trim();
        if (query) {
            navigate(`/product?search=${encodeURIComponent(query)}`);
        } else {
            navigate('/product');
        }
    };

    const onLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setAuth({ isAuthenticated: false, user: null });
        navigate("/");
    };

    return (
        <AntHeader style={{ background: '#fff', boxShadow: '0 2px 8px #f0f1f2', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: '0 1 auto' }}>
                    <Menu
                        onClick={onClick}
                        selectedKeys={[getKeyFromPath(location.pathname)]}
                        mode="horizontal"
                        items={items}
                        style={{ fontSize: 16, minWidth: 360 }}
                    />
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Input.Search placeholder="Tìm kiếm sản phẩm..." allowClear onSearch={onSearch} style={{ maxWidth: 520, width: '100%' }} />
                </div>
                <div style={{ flex: '0 0 56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 14, lineHeight: 1 }}>
                            {auth.isAuthenticated ? (
                                <Dropdown
                                    menu={{
                                        items: [
                                            { key: 'logout', label: <span onClick={onLogout}>Đăng xuất</span> },
                                        ]
                                    }}
                                    placement="bottomRight"
                                    trigger={["click"]}
                                >
                                    <Button type="text" shape="circle" icon={<SettingOutlined />} onClick={(e) => e.preventDefault()} style={{ fontSize: 18, padding: 0, lineHeight: 1 }} />
                                </Dropdown>
                            ) : (
                                <Link to={'/login'}>Welcome - Đăng nhập</Link>
                            )}
                        </div>
                        <Badge count={cartCount} size="small" style={{ marginTop: 4 }}>
                            <Button type="text" shape="circle" onClick={() => setIsCartOpen(true)} icon={<ShoppingCartOutlined />} style={{ fontSize: 18, padding: 0, lineHeight: 1 }} />
                        </Badge>
                    </div>
                </div>
            </div>

            <Drawer
                title="Giỏ hàng"
                placement="right"
                width={360}
                onClose={() => setIsCartOpen(false)}
                open={isCartOpen}
            >
                {(!cartItems || cartItems.length === 0) ? (
                    <Empty description="Chưa có sản phẩm" />
                ) : (
                    <>
                        <List
                            itemLayout="horizontal"
                            dataSource={cartItems}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[<span key="qty">x{item.quantity || 1}</span>]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar shape="square" src={item.imageUrl} />}
                                        title={item.name}
                                        description={<span style={{ color: '#fa541c', fontWeight: 600 }}>{Number(item.price || 0).toLocaleString()} đ</span>}
                                    />
                                </List.Item>
                            )}
                        />
                        <Divider />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 600 }}>Tổng</div>
                            <div style={{ color: '#fa541c', fontWeight: 700 }}>
                                {cartItems.reduce((sum, it) => sum + (Number(it.price || 0) * (it.quantity || 1)), 0).toLocaleString()} đ
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <Button onClick={() => setIsCartOpen(false)} style={{ flex: 1 }}>Tiếp tục mua</Button>
                            <Button type="primary" style={{ flex: 1 }}>Thanh toán</Button>
                        </div>
                    </>
                )}
            </Drawer>
        </AntHeader>
    );
};

export default Header;
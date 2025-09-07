import React, { useContext } from 'react';
import { Button, Form, Input, notification, Card } from 'antd';
import { loginUserApi } from '../util/api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);

    const onFinish = async (values) => {
        const { email, password } = values;
        const res = await loginUserApi(email, password);
        if (res && res.EC === 0) {
            localStorage.setItem("accessToken", res.accessToken);
            notification.success({
                message: "Đăng nhập",
                description: "Thành công",
            });
            setAuth({
                isAuthenticated: true,
                user: {
                    email: res?.user?.email ?? "",
                    name: res?.user?.name ?? "",
                }
            })
            navigate('/');
        } else {
            notification.error({
                message: "Đăng nhập",
                description: res?.EM ?? "lỗi hệ thống",
            });
        }
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f7f8fa'
        }}>
            <Card
                title="Đăng nhập"
                style={{ width: 400, boxShadow: '0 2px 8px #f0f1f2' }}
            >
                <Form
                    name="basic"
                    layout='vertical'
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                        ]}
                    >
                        <Input 
                            type="email"
                            autoComplete="off"
                            name={`email-${Math.random().toString(36).substr(2, 9)}`}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Mật kh!' },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
import React from 'react';
import { Button, Form, Input, notification, Card } from 'antd';
import { createUserApi } from '../util/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const { name, email, password } = values;
        const res = await createUserApi(name, email, password);
        if (res) {
            notification.success({
                message: 'CREATE USER SUCCESS',
                description: `SUCCESS`,
            });
            navigate('/login');
        } else {
            notification.error({
                message: 'CREATE USER ERROR',
                description: `error`,
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
                title="Đăng ký tài khoản"
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
                            { required: true, message: 'Please input your email!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please input your name!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;
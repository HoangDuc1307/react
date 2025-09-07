import { notification, Table, Form, Input, Button, Card, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons"
import { useState, useEffect, useRef } from "react";
import { createProductApi, getProductApi, deleteProductApi, updateProductApi } from "../util/api";
import axios from "../util/axios.custiomize";

const ProductPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFirstLoad = useRef(true);

    // Lấy danh sách sản phẩm
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getProductApi();
            const products = Array.isArray(res) ? res : res?.products;
            if (Array.isArray(products)) {
                setDataSource(products);
            } else {
                setDataSource([]); // Không có sản phẩm
            }
        } catch (err) {
            setDataSource([]);
        }
        setLoading(false);
        isFirstLoad.current = false;
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Thêm sản phẩm mới
    const onFinish = async (values) => {
        const { name, price } = values;
        let imageUrl = "";

        // 1. Upload ảnh trước
        try {
            if (Array.isArray(values.image) && values.image.length > 0) {
                const fileObj = values.image[0]?.originFileObj || values.image[0];
                const formData = new FormData();
                formData.append("image", fileObj);

                const uploadData = await axios.post("v1/api/product/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                console.log("Upload response:", uploadData);
                // Tùy BE trả về key gì, ưu tiên các khả năng phổ biến
                imageUrl = uploadData?.imageUrl || uploadData?.url || uploadData?.data?.url || "";
            }
        } catch (error) {
            console.error("Upload image failed", error);
        }

        // 2. Tạo sản phẩm kèm imageUrl
        console.log("Creating product:", { name, price, imageUrl });
        const res = await createProductApi(name, price, imageUrl);
        if (res && res._id) {
            notification.success({ message: "Thêm sản phẩm thành công" });
            fetchProducts();
        } else {
            notification.error({
                message: "Thêm sản phẩm thất bại",
                description: res?.message || "Có lỗi xảy ra",
            });
        }
    };

    const [editingProduct, setEditingProduct] = useState(null);

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            render: (text) => {
                if (!text) return null;
                const isAbsolute = /^https?:\/\//i.test(text);
                const src = isAbsolute ? text : `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}${text.startsWith('/') ? '' : '/'}${text}`;
                return <img src={src} alt="product" style={{ width: 80 }} />
            },
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button onClick={() => setEditingProduct(record)}>Sửa</Button>
                    <Button danger onClick={async () => {
                        const res = await deleteProductApi(record._id);
                        if (res?.message === 'Deleted' || res?._id || res?.acknowledged) {
                            notification.success({ message: 'Xóa sản phẩm thành công' });
                            fetchProducts();
                        } else {
                            notification.error({ message: 'Xóa thất bại', description: res?.message || 'Có lỗi xảy ra' });
                        }
                    }}>Xóa</Button>
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: 50 }}>
            <Card title="Thêm sản phẩm mới" style={{ marginBottom: 24, maxWidth: 500 }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Ảnh" name="image" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}>
                        <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Giá" name="price" rules={[{ required: true, message: 'Nhập giá!' }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Thêm sản phẩm</Button>
                    </Form.Item>
                </Form>
            </Card>
            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey="_id"
                loading={loading}
            />
            {editingProduct && (
                <Form
                    layout="vertical"
                    style={{ marginTop: 24, maxWidth: 500 }}
                    initialValues={{ name: editingProduct.name, price: editingProduct.price }}
                    onFinish={async (vals) => {
                        const res = await updateProductApi(editingProduct._id, vals);
                        if (res && res._id) {
                            notification.success({ message: 'Cập nhật sản phẩm thành công' });
                            setEditingProduct(null);
                            fetchProducts();
                        } else {
                            notification.error({ message: 'Cập nhật thất bại', description: res?.message || 'Có lỗi xảy ra' });
                        }
                    }}
                >
                    <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Giá" name="price" rules={[{ required: true, message: 'Nhập giá!' }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button onClick={() => setEditingProduct(null)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </div>
                    </Form.Item>
                </Form>
            )}
        </div>
    );
};

export default ProductPage;
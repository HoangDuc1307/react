import { notification, Table, Form, Input, Button, Card, Upload, Modal, Segmented, Select, Space, Popconfirm, Switch, Radio, Alert } from "antd";
import { UploadOutlined } from "@ant-design/icons"
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { createProductApi, getProductApi, deleteProductApi, updateProductApi, getVariantsApi, upsertVariantsApi, deleteVariantApi, getCategoryConfigApi } from "../util/api";
import axios from "../util/axios.custiomize";

const ProductPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFirstLoad = useRef(true);
    const location = useLocation();
    const [searchText, setSearchText] = useState("");
    const [priceRange, setPriceRange] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

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

    // Sync search from URL (?search=...)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const s = params.get("search") || "";
        setSearchText(s);
    }, [location.search]);

    const filteredData = useMemo(() => {
        let list = Array.isArray(dataSource) ? [...dataSource] : [];
        // sort
        if (sortBy === "priceAsc") list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        else if (sortBy === "priceDesc") list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        else if (sortBy === "nameAsc") list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        else if (sortBy === "nameDesc") list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        // newest: leave as fetched order assuming API returns newest first
        return list;
    }, [dataSource, searchText, priceRange, sortBy]);

    // Thêm sản phẩm mới
    const onFinishAdd = async (values) => {
        const { name, price, category } = values;
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
        console.log("Creating product:", { name, price, imageUrl, category });
        const res = await createProductApi(name, price, imageUrl, category);
        if (res && res._id) {
            notification.success({ message: "Thêm sản phẩm thành công" });
            setIsAddOpen(false);
            addForm.resetFields();
            fetchProducts();
        } else {
            notification.error({
                message: "Thêm sản phẩm thất bại",
                description: res?.message || "Có lỗi xảy ra",
            });
        }
    };

    const [editingProduct, setEditingProduct] = useState(null);
    const [variantModal, setVariantModal] = useState({ open: false, product: null, items: [], saving: false, fashionType: 'ao', config: null, typeKeys: [] });

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
            title: 'Phân loại',
            dataIndex: 'category',
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
                    <Button onClick={() => {
                        setEditingProduct(record);
                        setIsEditOpen(true);
                        editForm.setFieldsValue({ name: record.name, price: record.price, category: record.category });
                    }}>Sửa</Button>
                    {['giay-dep','thoi-trang','dien-tu','phu-kien','khac'].includes(record.category) && (
                    <Button onClick={async () => {
                        try {
                            // Load category config from backend
                            let config = null;
                            try {
                                config = await getCategoryConfigApi(record.category);
                            } catch {}
                            const res = await getVariantsApi(record._id);
                            const variants = Array.isArray(res?.variants) ? res.variants : (Array.isArray(res) ? res : []);
                            let items = variants;
                            let typeKeys = [];
                            let fashionType = 'ao';
                            if (config && typeof config === 'object') {
                                const mode = config.sizeMode;
                                const predefined = Array.isArray(config.predefinedSizes) ? config.predefinedSizes : [];
                                const typeSets = config?.metadata && typeof config.metadata === 'object' ? config.metadata.typeSets : null;
                                if (mode === 'electronics') {
                                    const existing = variants.find(v => v.size === 'default');
                                    items = [ existing ? existing : { size: 'default', stock: 0, sku: '', priceDelta: 0 } ];
                                } else if (typeSets && typeof typeSets === 'object') {
                                    typeKeys = Object.keys(typeSets);
                                    fashionType = typeKeys[0] || 'ao';
                                    const sizes = typeSets[fashionType] || [];
                                    items = sizes.map(sz => {
                                        const found = variants.find(v => String(v.size) === String(sz));
                                        return found ? { ...found, size: String(sz) } : { size: String(sz), stock: 0, sku: '', priceDelta: 0 };
                                    });
                                } else if (predefined.length > 0 || mode === 'shoes' || mode === 'fashion_top' || mode === 'fashion_bottom') {
                                    const sizes = predefined.length > 0 ? predefined : [];
                                    items = sizes.map(sz => {
                                        const found = variants.find(v => String(v.size) === String(sz));
                                        return found ? { ...found, size: String(sz) } : { size: String(sz), stock: 0, sku: '', priceDelta: 0 };
                                    });
                                }
                            }
                            setVariantModal({ open: true, product: record, items, saving: false, fashionType, config, typeKeys });
                        } catch (e) {
                            setVariantModal({ open: true, product: record, items: [], saving: false, fashionType: 'ao', config: null, typeKeys: [] });
                        }
                    }}>Quản lý size</Button>
                    )}
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
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button type="primary" onClick={() => setIsAddOpen(true)}>Thêm sản phẩm mới</Button>
                <div style={{ flex: 1 }} />
                <Space wrap>

                    <Select value={sortBy} onChange={setSortBy} style={{ width: 180 }}>
                        <Select.Option value="newest">Mới nhất</Select.Option>
                        <Select.Option value="priceAsc">Giá tăng dần</Select.Option>
                        <Select.Option value="priceDesc">Giá giảm dần</Select.Option>
                        <Select.Option value="nameAsc">Tên A-Z</Select.Option>
                        <Select.Option value="nameDesc">Tên Z-A</Select.Option>
                    </Select>
                </Space>
            </div>
            <Modal
                title="Thêm sản phẩm mới"
                open={isAddOpen}
                onCancel={() => { setIsAddOpen(false); addForm.resetFields(); }}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" form={addForm} onFinish={onFinishAdd}>
                    <Form.Item label="Phân loại" name="category" rules={[{ required: true, message: 'Chọn phân loại!' }]}>
                        <Select placeholder="Chọn phân loại">
                            <Select.Option value="giay-dep">Giày dép</Select.Option>
                            <Select.Option value="dien-tu">Đồ điện tử</Select.Option>
                            <Select.Option value="thoi-trang">Thời trang</Select.Option>
                            <Select.Option value="phu-kien">Phụ kiện</Select.Option>
                            <Select.Option value="khac">Khác</Select.Option>
                        </Select>
                    </Form.Item>
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
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button onClick={() => { setIsAddOpen(false); addForm.resetFields(); }}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Thêm</Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
            <Table
                dataSource={filteredData}
                columns={columns}
                rowKey="_id"
                loading={loading}
            />
            <Modal
                title="Sửa sản phẩm"
                open={isEditOpen}
                onCancel={() => { setIsEditOpen(false); setEditingProduct(null); }}
                footer={null}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    form={editForm}
                    onFinish={async (vals) => {
                        if (!editingProduct) return;
                        const res = await updateProductApi(editingProduct._id, vals);
                        if (res && res._id) {
                            notification.success({ message: 'Cập nhật sản phẩm thành công' });
                            setIsEditOpen(false);
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
                    <Form.Item label="Phân loại" name="category" rules={[{ required: true, message: 'Chọn phân loại!' }]}>
                        <Select placeholder="Chọn phân loại">
                            <Select.Option value="giay-dep">Giày dép</Select.Option>
                            <Select.Option value="dien-tu">Đồ điện tử</Select.Option>
                            <Select.Option value="thoi-trang">Thời trang</Select.Option>
                            <Select.Option value="phu-kien">Phụ kiện</Select.Option>
                            <Select.Option value="khac">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Giá" name="price" rules={[{ required: true, message: 'Nhập giá!' }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button onClick={() => { setIsEditOpen(false); setEditingProduct(null); }}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={`Quản lý size - ${variantModal.product?.name || ''}`}
                open={variantModal.open}
                onCancel={() => setVariantModal({ open: false, product: null, items: [], saving: false })}
                onOk={async () => {
                    setVariantModal(v => ({ ...v, saving: true }));
                    try {
                        const payload = variantModal.items.map(it => ({ size: it.size, stock: Number(it.stock || 0), sku: it.sku, priceDelta: Number(it.priceDelta || 0) }));
                        await upsertVariantsApi(variantModal.product._id, payload);
                        notification.success({ message: 'Lưu size thành công' });
                        setVariantModal({ open: false, product: null, items: [], saving: false });
                    } catch (e) {
                        notification.error({ message: 'Lưu size thất bại' });
                        setVariantModal(v => ({ ...v, saving: false }));
                    }
                }}
                okButtonProps={{ loading: variantModal.saving }}
            >
                {variantModal.config && Array.isArray(variantModal.typeKeys) && variantModal.typeKeys.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <span style={{ marginRight: 8 }}>Loại thời trang:</span>
                        <Radio.Group value={variantModal.fashionType} onChange={(e) => {
                            const val = e.target.value;
                            const sizes = variantModal.config?.metadata?.typeSets?.[val] || [];
                            const merged = sizes.map(sz => {
                                const found = variantModal.items.find(v => String(v.size) === String(sz));
                                return found ? { ...found, size: String(sz) } : { size: String(sz), stock: 0, sku: '', priceDelta: 0 };
                            });
                            setVariantModal(v => ({ ...v, fashionType: val, items: merged }));
                        }}>
                            {variantModal.typeKeys.map(k => (
                                <Radio.Button key={k} value={k}>{k}</Radio.Button>
                            ))}
                        </Radio.Group>
                    </div>
                )}

                {variantModal.product?.category === 'dien-tu' && (
                    <Alert type="info" showIcon style={{ marginBottom: 12 }} message="Đồ điện tử: quản lý số lượng theo biến thể mặc định (default)." />
                )}

                {((!variantModal.config) || variantModal.config?.allowManual === true) && (!variantModal.typeKeys || variantModal.typeKeys.length === 0) && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <Input placeholder="Size (VD: 38, 39, 40 hoặc M, L)" value={variantModal.newSize}
                            onChange={(e) => setVariantModal(v => ({ ...v, newSize: e.target.value }))} style={{ width: 160 }} />
                        <Input placeholder="Tồn kho" type="number" value={variantModal.newStock}
                            onChange={(e) => setVariantModal(v => ({ ...v, newStock: e.target.value }))} style={{ width: 120 }} />
                
                        <Button type="primary" onClick={() => {
                            const size = (variantModal.newSize || '').trim();
                            if (!size) return;
                            const newItem = { size, stock: Number(variantModal.newStock || 0), sku: variantModal.newSku || '', priceDelta: Number(variantModal.newPriceDelta || 0) };
                            if (variantModal.items.some(it => (it.size || '') === size)) return;
                            setVariantModal(v => ({ ...v, items: [...v.items, newItem], newSize: '', newStock: '', newSku: '', newPriceDelta: '' }));
                        }}>Thêm size</Button>
                    </div>
                )}
                <Table
                    dataSource={variantModal.items}
                    rowKey={(r) => r.size}
                    pagination={false}
                    size="small"
                    columns={[
                        { title: 'Size', dataIndex: 'size' },
                        { title: 'Còn hàng', dataIndex: 'inStock', render: (t, r, idx) => (
                            <Switch checked={Number(r.stock || 0) > 0} onChange={(checked) => {
                                setVariantModal(v => ({ ...v, items: v.items.map((it, i) => i === idx ? { ...it, stock: checked ? (it.stock || 1) : 0 } : it) }));
                            }} />
                        )},
                        {
                            title: 'Tồn kho', dataIndex: 'stock', render: (t, r, idx) => (
                                <Input type="number" value={r.stock} onChange={(e) => {
                                    const val = Number(e.target.value || 0);
                                    setVariantModal(v => ({ ...v, items: v.items.map((it, i) => i === idx ? { ...it, stock: val } : it) }));
                                }} style={{ width: 100 }} />
                            )
                        },
                        {
                            title: '', key: 'action', render: (t, r) => (
                                <Popconfirm title="Xóa size này?" onConfirm={async () => {
                                    try {
                                        await deleteVariantApi(variantModal.product._id, r.size);
                                        setVariantModal(v => ({ ...v, items: v.items.filter(it => it.size !== r.size) }));
                                    } catch (e) {
                                        notification.error({ message: 'Xóa size thất bại' });
                                    }
                                }}>
                                    <Button danger>Xóa</Button>
                                </Popconfirm>
                            )
                        },
                    ]}
                />
            </Modal>
        </div>
    );
};

export default ProductPage;
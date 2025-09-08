import { CrownOutlined, FireOutlined, ShoppingCartOutlined, ThunderboltOutlined, GiftOutlined } from "@ant-design/icons";
import { Card, Input, Row, Col, Tag, Button } from "antd";
import { useEffect, useState } from "react";
import { getProductApi } from "../util/api";

const HomePage = () => {
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await getProductApi();
                const products = Array.isArray(res) ? res : res?.products;
                setFeatured(Array.isArray(products) ? products.slice(0, 8) : []);
            } catch (e) {
                setFeatured([]);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div style={{ padding: 24 }}>
            {/* Header now contains search and cart */}

           

            {/* Featured Products */}
            <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, marginRight: 12 }}>Sản phẩm</div>
                </div>
                <Row gutter={[16, 16]}>
                    {featured.map((p) => {
                        const isAbsolute = /^https?:\/\//i.test(p?.imageUrl || "");
                        const src = p?.imageUrl ? (isAbsolute ? p.imageUrl : `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}${p.imageUrl.startsWith('/') ? '' : '/'}${p.imageUrl}`) : undefined;
    return (
                            <Col key={p._id || p.id} xs={12} sm={8} md={6}>
                                <Card
                                    hoverable
                                    cover={src ? <img alt={p.name} src={src} style={{ height: 180, objectFit: 'cover' }} /> : null}
                                    actions={[<Button type="link" key="buy">Mua ngay</Button>]}
                                    style={{ borderRadius: 8 }}
                                >
                                    <Card.Meta title={p.name} description={<div style={{ color: '#fa541c', fontWeight: 700 }}>{Number(p.price || 0).toLocaleString()} đ</div>} />
            </Card>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </div>
    )
}

export default HomePage;
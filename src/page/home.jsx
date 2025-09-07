import { CrownOutlined } from "@ant-design/icons";
import { Result, Card } from "antd";

const HomePage = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <Card style={{ width: 500, boxShadow: '0 2px 8px #f0f1f2' }}>
                <Result
                    icon={<CrownOutlined style={{ fontSize: 48 }} />}
                    title="Welcome to the Home Page"
                    subTitle="Hãy đăng nhập hoặc đăng ký để sử dụng các chức năng!"
                />
            </Card>
        </div>
    )
}

export default HomePage;
import { notification, Table } from "antd";
import { useState, useEffect } from "react";
import { getUserApi } from "../util/api";

const UserPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUserApi();
            if (!res?.message) {
                setDataSource(res);
            } else {
                notification.error({
                    message: "Unauthorized",
                    description: res.message
                })
            }
        }
        fetchUser();
    }, [])
    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Role',
            dataIndex: 'role',
        }
    ];


    return (
        <div style={{ padding: 50 }}>
            <Table
                dataSource={dataSource} columns={columns}
                rowKey={"_id"}
                loading={loading}
            />

        </div>
    )
}
export default UserPage;
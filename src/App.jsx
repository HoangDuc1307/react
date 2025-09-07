import { Outlet } from 'react-router-dom';
import Header from './components/layout/header';
import axios from './util/axios.custiomize';
import { useContext, useEffect } from 'react'
import { AuthContext } from './components/context/auth.context';
import { Spin } from 'antd';

function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      try {
        const res = await axios.get(`/v1/api/account`);
        // Nếu API trả về lỗi hoặc không có user, set trạng thái chưa đăng nhập
        if (res && res.email && res.name) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: res.email,
              name: res.name,
            }
          });
        } else {
          setAuth({
            isAuthenticated: false,
            user: null,
          });
        }
      } catch (err) {
        setAuth({
          isAuthenticated: false,
          user: null,
        });
      }
      setAppLoading(false);
    }
    fetchAccount()
  }, [setAppLoading, setAuth])

  return (
    <div>
      {appLoading === true ?
        <div>
          <Spin size='large' style={{ position: 'fixed', top: '50%', left: '50%' }} />
        </div>
        :
        <>
          <Header />
          <Outlet />
        </>
      }
    </div>
  )
}

export default App

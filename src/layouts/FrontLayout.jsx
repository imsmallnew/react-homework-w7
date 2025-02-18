import { Outlet, NavLink } from 'react-router-dom';
import { useSelector } from "react-redux";
import Toast from '../components/Toast';
import Loading from '../components/Loading';

export default function FrontLayout() {
    const { isLoading, loadingText } = useSelector((state) => state.loading);
    const navList = [
        { path: "/", name: "首頁", navName: 'home' },
        { path: "/products", name: "商品列表", navName: 'products' },
        { path: "/cart", name: "檢視購物車", navName: 'cart' },
        { path: "/form", name: "結帳表單", navName: 'form' },
        { path: "login", name: "後台管理", navName: 'admin' },
    ];

    return (
        <>
            {/* 讀取效果 */}
            {isLoading && <Loading loadingText={loadingText} />}
            
            {/* 訊息提示 */}
            <Toast />

            {/* 導覽列 */}
            <nav className="navbar navbar-light navbar-expand text-primary navbar-toggleable fixed-top shadow">
                <div className="container">
                    <a className="navbar-brand">React W7</a>
                    <div className="d-flex">
                        {navList.map((route, index) => (
                            <NavLink
                                key={index}
                                to={route.path}
                                className={({ isActive }) =>
                                    `btn ${isActive ? "btn-secondary" : "btn-outline-secondary"} me-2`
                                }
                            >
                                {route.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>
            
            {/* 內容 */}
            <Outlet />
        </>
    )
}
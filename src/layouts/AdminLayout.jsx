import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from "react-redux";
import LogoutBtn from '../components/LogoutBtn';
import Toast from '../components/Toast';
import Loading from '../components/Loading';

export default function AdminLayout() {
    const { isLoading, loadingText } = useSelector((state) => state.loading);
    const location = useLocation(); // 獲取當前網址
    const isProductPage = location.pathname.startsWith("/admin/products/"); // 判斷是否在商品管理頁面
    const navList = [
        { path: "/admin", name: "後台首頁", navName: 'admin' },
        { path: "/admin/products/1", name: "商品管理", navName: 'products' },
        { path: "/", name: "返回前台", navName: 'front' },
    ];
    
    return (
        <>
            {/* 讀取效果 */}
            {isLoading && <Loading loadingText={loadingText} />}
            
            {/* 訊息提示 */}
            <Toast />

            {/* 導覽列 */}
            <nav className="navbar navbar-light navbar-expand text-primary navbar-toggleable fixed-top shadow bg-dark" data-bs-theme="dark">
                <div className="container">
                    <a className="navbar-brand">React W7</a>
                    <div className="d-flex">
                    {navList.map((route, index) => {
                            const isExactMatch = location.pathname === route.path; // 只匹配完全相同的路徑

                            return (
                                <NavLink
                                    key={index}
                                    to={route.path}
                                    className={() =>
                                        `btn ${
                                            (route.navName === "products" && isProductPage) ||
                                            (route.navName !== "products" && isExactMatch)
                                                ? "btn-secondary"
                                                : "btn-outline-secondary"
                                        } me-2`
                                    }
                                >
                                    {route.name}
                                </NavLink>
                            );
                        })}
                        <LogoutBtn />
                    </div>
                </div>
            </nav>

            {/* 內容 */}
            <Outlet />
        </>
    )
}
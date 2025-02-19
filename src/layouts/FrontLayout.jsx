import { Outlet, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react';
import Toast from '../components/Toast';
import Loading from '../components/Loading';
import { getCartList } from '../redux/cartSlice';

export default function FrontLayout() {
    const { isLoading, loadingText } = useSelector((state) => state.loading);
    const { cartList } = useSelector((state)=> state.cart);
    const dispatch = useDispatch();

    // 透過cartSlice取得購物車資料
    useEffect(() => {
        dispatch(getCartList());
    }, []);

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
                                    `btn btn-sm ${isActive ? "btn-secondary" : "btn-light"} ms-3 position-relative`
                                }
                            >
                                {route.name}

                                {/* 只有在購物車數量 > 0 時才顯示數字 */}
                                {route.navName === "cart" && cartList?.carts?.length > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger mt-1 me-1">
                                        {cartList?.carts?.length}
                                    </span>
                                )}
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
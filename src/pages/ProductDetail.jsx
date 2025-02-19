import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { pushMessage } from '../redux/toastSlice';
import { showLoading, hideLoading } from "../redux/loadingSlice";
import { getCartList } from '../redux/cartSlice';

export default function ProductDetail() {
    const API_URL = import.meta.env.VITE_BASE_URL;
    const AUTHOR = import.meta.env.VITE_API_PATH;

    const { id: product_id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [product, setProduct] = useState({});
    const [productImgUrl, setProductImgUrl] = useState(null);
    const [clientProductList, setClientProductList] = useState([]);
    const [prevProductId, setPrevProductId] = useState(null);
    const [nextProductId, setNextProductId] = useState(null);
    const [state, setState] = useState(false);
    const [orderQty, setOrderQty] = useState(1);

    // 取得所有商品資料
    const getClientProducts = async () => {
        dispatch(showLoading("讀取中..."));

        try {
            const res = await axios.get(`${API_URL}/v2/api/${AUTHOR}/products/all`)
            let data = res.data.products;
            setClientProductList(data);
        } catch (error) {
            console.error(error)
        } finally {
            dispatch(hideLoading());
        }
    }

    // 取得指定商品資料
    const getProductDetail = async () => {
        // dispatch(showLoading("讀取中..."));

        try {
            const res = await axios.get(`${API_URL}/v2/api/${AUTHOR}/product/${product_id}`)
            let data = res.data.product;
            setProduct(data) // 商品資料
            setProductImgUrl(data.imageUrl)
            setOrderQty(1)
        } catch (error) {
            console.error(error)
        } finally {
            dispatch(hideLoading());
        }
    }

    // 計算上一個 / 下一個商品 ID
    useEffect(() => {
        if (clientProductList.length === 0) return;

        const currentIndex = clientProductList.findIndex((v) => v.id === product_id);
        const prevId = currentIndex > 0 ? clientProductList[currentIndex - 1].id : null;
        const nextId = currentIndex < clientProductList.length - 1 ? clientProductList[currentIndex + 1].id : null;

        setPrevProductId(prevId);
        setNextProductId(nextId);
    }, [clientProductList, product_id]);

    useEffect(() => {
        getClientProducts();
    }, []);

    useEffect(() => {
        getProductDetail();
    }, [product_id]);

    // 加入購物車
    const addCartItem = async (item, qty) => {
        dispatch(showLoading("加入購物車中..."));

        try {
            const res = await axios.post(`${API_URL}/v2/api/${AUTHOR}/cart`, {
                data: {
                    product_id: item.id,
                    qty: Number(qty)
                }
            })
            dispatch(getCartList());
            dispatch(pushMessage({
                title: "更新數量成功",
                text: `[${item.title}] 已加入購物車 ${qty} ${item.unit}`,
                status: "success"
            }))
            setOrderQty(1); // 還原初始值數量
            setState(false); // 取消按鈕disabled
        } catch (error) {
            console.error(error)
            dispatch(pushMessage({
                title: "更新數量失敗",
                text: error?.response?.data?.message || `[${item.title}] 加到購物車失敗`,
                status: "failed"
            }))
        } finally {
            dispatch(hideLoading());
        }
    }

    // 選擇數量
    const handleItemQtyChange = async (e) => {
        setOrderQty(Number(e.target.value))
    };

    return (
        <div
            className="container-fluid"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1491960693564-421771d727d6?q=80&w=2863&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
                paddingTop: '60px',
                paddingBottom: '10px',
                position: "relative",
            }}
        >
            {/* 背景遮罩 */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1,

                }}
            ></div>

            <div className="row position-relative m-4" style={{ zIndex: 2 }}>
                {/* 左側箭頭 (若有上一個商品) */}
                <div className="col-1 d-flex align-items-center justify-content-center">
                    {prevProductId && (
                        <motion.button
                            className="arrow-btn3 left"
                            onClick={() => navigate(`/products/${prevProductId}`)}
                            whileHover={{ scale: 1.2, boxShadow: "0px 0px 15px rgba(255, 215, 0, 0.8)" }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            ❮
                        </motion.button>
                    )}
                </div>

                {/* 產品詳細卡片 */}
                <div className="col-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            className="card shadow-lg p-4"
                            key={product_id} // 每次id變更，觸發動畫
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                background: "rgba(255, 255, 255, 0.1)",
                                backdropFilter: "blur(10px)",
                                borderRadius: "12px",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                            }}
                        >
                            <div className="row">

                                {/* 主圖片區塊 */}
                                <div className="col-md-4">
                                    <div className="mainWrap overflow-hidden position-relative ms-3" style={{ borderRadius: "12px", height: "100%" }}>
                                        <motion.img
                                            src={productImgUrl}
                                            className="object-fit-cover img-fluid w-100 h-100 rounded"
                                            alt="主圖"
                                            style={{
                                                position: "absolute",
                                                top: "0",
                                                left: "0",
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                transformOrigin: "center",
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>


                                {/* 產品內容 */}
                                <div className="col-md-8">
                                    <div className="card-body text-white">
                                        <h2 className="card-title">{product.title}</h2>
                                        <h5><span className="badge bg-danger">{product.category}</span></h5>
                                        <p className="card-text">商品描述: <small className="text-light">{product.description}</small></p>
                                        <p className="card-text">商品內容: <small className="text-light">{product.content}</small></p>

                                        {/* 價格 */}
                                        <div className="d-flex align-items-center">
                                            <h4 className="card-text text-warning fw-bold">{product.price} 元</h4>
                                            <h5 className="text-light mx-2"><del>{product.origin_price} 元</del></h5>
                                        </div>

                                        {/* 數量選擇 */}
                                        <div className="d-flex align-items-center my-3">
                                            <label htmlFor="price" className="form-label me-2">訂購數量:</label>
                                            <select
                                                className="form-select w-auto"
                                                value={orderQty}
                                                onChange={(e) => handleItemQtyChange(e)}
                                            >
                                                {Array.from({ length: 10 }).map((_, index) => (
                                                    <option key={index} value={index + 1}>{index + 1}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* 按鈕 */}
                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="button"
                                                className="btn btn-outline-light w-50 d-flex justify-content-center align-items-center"
                                                onClick={() => navigate("/products")}
                                            >
                                                返回商品列表
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-warning w-50 d-flex justify-content-center align-items-center ms-2"
                                                onClick={() => addCartItem(product, orderQty)}
                                            >
                                                加入購物車
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 副圖區塊 */}
                                {productImgUrl ? (
                                    <div className="col-md-12 mt-3">
                                        <p className="ps-3 text-white">更多圖片 (點圖放大):</p>
                                        <div className="row ps-3 pe-3">
                                            {product.imageUrl && (
                                                <motion.div
                                                    className="col-md-2 mb-3"
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="subWrap">
                                                        <div className="imgFrame">
                                                            <img
                                                                src={product.imageUrl}
                                                                className="card-img w-100 h-100 object-fit-cover rounded"
                                                                alt="副圖"
                                                                onClick={() => setProductImgUrl(product.imageUrl)}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {product?.imagesUrl?.map((item, index) => (
                                                item && (
                                                    <motion.div
                                                        key={index}
                                                        className="col-md-2 mb-3"
                                                        whileHover={{ scale: 1.1 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="subWrap">
                                                            <div className="imgFrame">
                                                                <img
                                                                    src={item}
                                                                    className="card-img w-100 h-100 object-fit-cover rounded"
                                                                    alt="副圖"
                                                                    onClick={() => setProductImgUrl(item)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <h6 className="text-danger"><i className="fa-regular fa-image"></i> 主圖 尚未提供連結</h6>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 右側箭頭 (若有下一個商品) */}
                <div className="col-1 d-flex align-items-center justify-content-center">
                    {nextProductId && (
                        <motion.button
                            className="arrow-btn3 right"
                            onClick={() => navigate(`/products/${nextProductId}`)}
                            whileHover={{ scale: 1.2, boxShadow: "0px 0px 15px rgba(255, 215, 0, 0.8)" }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            ❯
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
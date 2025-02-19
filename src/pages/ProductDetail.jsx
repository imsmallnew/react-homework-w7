import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import axios from 'axios';
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
        dispatch(showLoading("讀取中..."));

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
            // setTimeout(() => {
            //     navigate(-1);
            // }, 1000) // 1秒後返回商品清單
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
        <>
            <div className="container main">
                <div className='row'>
                    {/* 左側箭頭 (如果不是第一個商品) */}
                    <div className='col-1 d-flex align-items-center justify-content-center'>
                        {prevProductId && (
                            <button
                                type="button"
                                className="arrow-btn3 left"
                                onClick={() => navigate(`/products/${prevProductId}`)}
                            />
                        )}
                    </div>
                    <div className='col-10'>
                        <div className="card shadow">
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="mainWrap">
                                        <img src={productImgUrl} className="object-fit-cover img-fluid w-100 h-100 p-3" alt="主圖" />
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <div className="card-body pl-3 pr-3">
                                        <h2 className="card-title">{product.title}</h2><h5><span className="badge bg-danger">{product.category}</span></h5>
                                        <p className="card-text">商品描述: <small className="text-muted">{product.description}</small></p>
                                        <p className="card-text">商品內容: <small className="text-muted">{product.content}</small></p>
                                        <div className="d-flex">
                                            <h4 className="card-text text-primary fw-bold">{product.price} 元  / </h4><h4 className="card-text text-secondary"><del>{product.origin_price} 元</del></h4>
                                        </div>
                                        <label htmlFor="price" className="form-label me-2">
                                            訂購數量:
                                        </label>
                                        <select value={orderQty} onChange={(e) => handleItemQtyChange(e)}>
                                            {Array.from({ length: 10 }).map((_, index) => {
                                                return (<option key={index} value={index + 1}>
                                                    {index + 1}
                                                </option>)
                                            })}
                                        </select>
                                        <div className='d-flex float-end'>
                                            <button type="button" className="btn btn-secondary me-3" onClick={() => navigate("/products")}>
                                                返回商品列表
                                            </button>
                                            <button type="button" className={`btn btn-danger`} onClick={() => addCartItem(product, orderQty)}>
                                                加入購物車
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {productImgUrl ? <div className="col-md-12">
                                    <p className="ps-3">更多圖片(點圖放大):</p>
                                    <div className="row ps-3 pe-3">
                                        {product.imageUrl && <div className="col-md-2 mb-3">
                                            <div className="subWrap">
                                                <div className="imgFrame">
                                                    <img src={product.imageUrl} className="card-img w-100 h-100 text-start object-fit-cover" alt="副圖" onClick={() => { setProductImgUrl(product.imageUrl) }} />
                                                </div>
                                            </div>
                                        </div>}
                                        {product?.imagesUrl?.map((item, index) => {
                                            if (!item) return null; // 副圖連結為空時不顯示圖片
                                            return (
                                                <div key={index} className="col-md-2 mb-3">
                                                    <div className="subWrap">
                                                        <div className="imgFrame">
                                                            <img src={item} className="card-img w-100 h-100 text-start object-fit-cover" alt="副圖" onClick={() => { setProductImgUrl(item) }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div> : <h6 className='text-danger'><i className="fa-regular fa-image"></i> 主圖 尚未提供連結</h6>
                                }
                            </div>

                        </div>
                    </div>
                    <div className='col-1 d-flex align-items-center justify-content-center'>
                        {/* 右側箭頭 (如果不是最後一個商品) */}
                        {nextProductId && (
                            <button
                                type="button"
                                className="arrow-btn3 right"
                                onClick={() => navigate(`/products/${nextProductId}`)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
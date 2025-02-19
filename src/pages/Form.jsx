import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { pushMessage } from '../redux/toastSlice';
import { showLoading, hideLoading } from "../redux/loadingSlice";
import { getCartList } from '../redux/cartSlice';

export default function Form() {
  const API_URL = import.meta.env.VITE_BASE_URL;
  const AUTHOR = import.meta.env.VITE_API_PATH;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartList } = useSelector((state)=> state.cart);
  // const [cartList, setCartList] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    const { message, ...user } = data;
    const userInfo = {
      data: {
        user,
        message
      }
    }
    if (Object.keys(errors).length === 0) {
      checkout(userInfo)
    }
  }

  const navToMenu = () => {
    const timer = setTimeout(() => {
      navigate("/products"); //   4秒後導航到商品頁
    }, 4000);

    return () => clearTimeout(timer);
  }

  // 結帳表單
  const checkout = async (data) => {
    dispatch(showLoading("表單傳送中..."));
    try {
      const res = await axios.post(`${API_URL}/v2/api/${AUTHOR}/order`, data)
      reset()
      dispatch(getCartList())
      dispatch(pushMessage({
        title: "系統提示",
        text: "購物表單已傳送成功, 請回商品列表繼續購物",
        status: "success"
      }))
    } catch (error) {
      dispatch(pushMessage({
        title: "系統提示",
        text: '結帳失敗',
        status: "failed"
      }))
    } finally {
      dispatch(hideLoading());
    }
  }

  // 取得購物車資料
  // const getCartList = async () => {
  //   dispatch(showLoading("讀取中..."));

  //   try {
  //     const res = await axios.get(`${API_URL}/v2/api/${AUTHOR}/cart`)
  //     let data = res.data?.data;
  //     setCartList(data)
  //     data?.carts?.length === 0 && navToMenu() // 如果購物車為空則跳回商品頁面
  //   } catch (error) {
  //     console.error(error)
  //     dispatch(pushMessage({
  //       title: "系統提示",
  //       text: error?.response?.data?.message || `取得購物車清單失敗`,
  //       status: "failed"
  //     }))
  //   } finally {
  //     dispatch(hideLoading());
  //   }
  // }

  // 透過cartSlice取得購物車資料
  useEffect(() => {
    dispatch(getCartList());
    cartList?.carts?.length === 0 && navToMenu() // 如果購物車為空則跳回商品頁面
  }, [cartList?.carts?.length === 0]);

  return (
    <>
      <div
        className="container-fluid"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1491960693564-421771d727d6?q=80&w=2863&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          paddingTop: "60px",
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
  
        <div className="container position-relative pb-5 pt-4" style={{ zIndex: 2 }}>
          <div className="row justify-content-center">
            {/* 左側：購物清單 */}
            <div className="col-md-5 mb-3">
              <h4 className="text-warning mb-3 text-center">您的購物清單</h4>
              <div className="p-3 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(8px)" }}>
                {cartList?.carts?.length === 0 ? (
                  <div className="text-center">
                    <span className="badge bg-warning p-2 pe-3 ps-3 text-dark fs-6">購物車目前為空</span>
                  </div>
                ) : (
                  cartList?.carts?.map((cartItem) => (
                    <div key={cartItem.id} className="d-flex align-items-center border-bottom py-2">
                      <img
                        src={cartItem?.product?.imageUrl}
                        className="rounded border border-gold"
                        alt="商品圖片"
                        width="100"
                      />
                      <div className="ms-3 flex-grow-1">
                        <h6 className="text-white">{cartItem.product.title}</h6>
                        <small className="text-warning mt-3">
                          <div className='row'>
                            <div className='col-12 col-md-6'>數量: {cartItem.qty} </div>
                            <div className='col-12 col-md-6 count text-end'>小計: {cartItem.total} 元</div>
                          </div>
                        </small>
                      </div>
                    </div>
                  ))
                )}
                {cartList?.carts?.length > 0 && (
                  <div className="mt-3 text-end">
                    <h5 className="text-white">總計: <span className="text-white">{cartList.total} 元</span></h5>
                    <h5 className="text-warning">折扣價: <span className="text-warning">{cartList.final_total} 元</span></h5>
                  </div>
                )}
              </div>
            </div>
  
            {/* 右側：結帳表單 */}
            <div className="col-md-7">
              <h4 className="text-warning mb-3 text-center">填寫訂單資訊</h4>
              <div className="p-4 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.85)" }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-bold">收件人姓名</label>
                    <input
                      id="name"
                      type="text"
                      className={`form-control ${errors.name && 'is-invalid'}`}
                      placeholder="請輸入姓名"
                      {...register("name", { required: "收件人姓名必填" })}
                    />
                    {errors.name && <p className="text-danger">{errors.name.message}</p>}
                  </div>
  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-bold">Email</label>
                    <input
                      id="email"
                      type="email"
                      className={`form-control ${errors.email && 'is-invalid'}`}
                      placeholder="請輸入 Email"
                      {...register("email", {
                        required: "Email必填",
                        pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Email 格式不正確。" }
                      })}
                    />
                    {errors.email && <p className="text-danger">{errors.email.message}</p>}
                  </div>
  
                  <div className="mb-3">
                    <label htmlFor="tel" className="form-label fw-bold">收件人電話</label>
                    <input
                      id="tel"
                      type="tel"
                      className={`form-control ${errors.tel && 'is-invalid'}`}
                      placeholder="請輸入電話"
                      {...register("tel", {
                        required: "收件人電話必填",
                        minLength: { value: 8, message: "電話號碼至少需要8碼" },
                        pattern: { value: /^\d+$/, message: "電話號碼格式不正確，僅限數字。" }
                      })}
                    />
                    {errors.tel && <p className="text-danger">{errors.tel.message}</p>}
                  </div>
  
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label fw-bold">收件人地址</label>
                    <input
                      id="address"
                      type="text"
                      className={`form-control ${errors.address && 'is-invalid'}`}
                      placeholder="請輸入地址"
                      {...register("address", { required: "收件人地址必填" })}
                    />
                    {errors.address && <p className="text-danger">{errors.address.message}</p>}
                  </div>
  
                  <div className="mb-3">
                    <label htmlFor="message" className="form-label fw-bold">留言</label>
                    <textarea
                      id="message"
                      className="form-control"
                      placeholder="請輸入留言"
                      rows="3"
                      {...register("message")}
                    />
                  </div>
  
                  <div className={`${cartList?.carts?.length > 0 ? "text-end" : "text-center text-danger"}`}>
                    <button type="submit" className="btn btn-gold px-4 py-2" disabled={cartList?.carts?.length === 0}>
                      {cartList?.carts?.length > 0 ? "送出訂單" : "[溫馨提示]: 購物車需有商品才可結帳唷 ( *´ސު｀*)"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
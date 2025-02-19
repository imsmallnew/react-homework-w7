import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import { Modal } from 'bootstrap';
import { Link } from 'react-router-dom';
import DeleteModal from '../components/DeleteModal';
import { pushMessage } from '../redux/toastSlice';
import { showLoading, hideLoading } from "../redux/loadingSlice";
import { getCartList } from '../redux/cartSlice';

export default function Cart() {
  const API_URL = import.meta.env.VITE_BASE_URL;
  const AUTHOR = import.meta.env.VITE_API_PATH;

  const dispatch = useDispatch();
  const { cartList } = useSelector((state)=> state.cart);
  
  const defaultModalState = {
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: 0,
    imageUrl: "",
    imagesUrl: []
  };
  // const [cartList, setCartList] = useState({});
  const [state, setState] = useState(false);
  const [tempProduct, setTempProduct] = useState(defaultModalState);
  const [cartItem, setCartItem] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [navigation, setNavigation] = useState("cart");
  const deleteModalRef = useRef(null);
  const deleteModalInstanceRef = useRef(null);

  // 確保模態框 DOM 已掛載後初始化 Modal 實例
  useEffect(() => {
    if (deleteModalRef.current) {
      deleteModalInstanceRef.current = new Modal(deleteModalRef.current, { backdrop: false });
    }
  }, []);

  // 開啟 DeleteModal
  const openDeleteModal = (item) => {
    setCartItem(item);
    setTimeout(() => {
      setState(false)
    }, 500)
    if (deleteModalInstanceRef.current) {
      deleteModalInstanceRef.current.show(); // 確保 Modal 實例已初始化後調用 show()
    } else {
      console.error("Modal instance is not initialized.");
    }
  };

  // 關閉 DeleteModal
  const closeDeleteModal = () => {
    if (deleteModalInstanceRef.current) {
      deleteModalInstanceRef.current.hide(); // 確保 Modal 實例已初始化後調用 hide()
    } else {
      console.error("Modal instance is not initialized.");
    }
  };

  // 將焦點從 modal 中移除
  window.addEventListener('hide.bs.modal', () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  // 取得購物車資料
  // const getCartList = async () => {
  //   dispatch(showLoading("讀取中..."));

  //   try {
  //     const res = await axios.get(`${API_URL}/v2/api/${AUTHOR}/cart`)
  //     let data = res.data?.data;
  //     setCartList(data)
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

  // 更新購物車
  const updateCartItem = async (cartItem, qty) => {
    dispatch(showLoading("更新購物車中..."));

    try {
      const res = await axios.put(`${API_URL}/v2/api/${AUTHOR}/cart/${cartItem.id}`, {
        data: {
          product_id: cartItem.product.id,
          qty: Number(qty)
        }
      })
      dispatch(getCartList())
      dispatch(pushMessage({
        title: "更新成功",
        text: `[${cartItem.product.title}] 數量已更新為 ${res.data?.data?.qty} ${cartItem.product.unit}`,
        status: "success"
      }))
    } catch (error) {
      console.error(error)
      dispatch(pushMessage({
        title: "系統提示",
        text: error?.response?.data?.message || `購物車更新數量失敗`,
        status: "failed"
      }))
    } finally {
      dispatch(hideLoading());
    }
  }

  // 刪除購物車單一商品
  const removeCartItem = async (cartItem) => {
    dispatch(showLoading("移除購物車商品中..."));

    try {
      const res = await axios.delete(`${API_URL}/v2/api/${AUTHOR}/cart/${cartItem.id}`)
      closeDeleteModal()
      dispatch(getCartList())
      dispatch(pushMessage({
        title: "刪除成功",
        text: `[${cartItem.product?.title}] 已從購物車移除`,
        status: "success"
      }))
    } catch (error) {
      console.error(error)
      dispatch(pushMessage({
        title: "系統提示",
        text: error?.response?.data?.message || `刪除購物車商品失敗`,
        status: "failed"
      }))
    } finally {
      dispatch(hideLoading());
    }
  }

  // 刪除購物車所有商品
  const removeAllCart = async () => {
    dispatch(showLoading("清空購物車商品中..."));

    try {
      const res = await axios.delete(`${API_URL}/v2/api/${AUTHOR}/carts`)
      closeDeleteModal()
      dispatch(getCartList())
      dispatch(pushMessage({
        title: "系統提示",
        text: `購物車已清空`,
        status: "success"
      }))
    } catch (error) {
      console.error(error)
      dispatch(pushMessage({
        title: "系統提示",
        text: error?.response?.data?.message || `清空購物車商品失敗`,
        status: "failed"
      }))
    } finally {
      dispatch(hideLoading());
    }
  }

  return (
    <>
      <div className="container main mb-5">
        <div className="mt-4">
          <table className="table mt-3 table-hover">
            <thead>
              <tr className="table-warning border-2 text-center">
                <th>圖片</th>
                <th>商品名稱</th>
                <th>分類</th>
                <th style={{ width: '150px' }}>訂購數量</th>
                <th>單價</th>
                <th>小計</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartList?.carts?.map((cartItem, index) => (
                <tr key={cartItem.id} className='align-middle text-center'>

                  <td><img src={cartItem?.product?.imageUrl} className="object-fit-cover p-1" alt="主圖" width='100' /></td>
                  <td>{cartItem.product.title}</td>
                  <td><span className="badge bg-danger">{cartItem.product.category}</span></td>
                  <td>
                    <div className='btn-group' role='group'>
                      <button type='button'
                        disabled={cartItem.qty === 1 || isLoading}
                        className='btn btn-secondary btn-sm'
                        onClick={() => updateCartItem(cartItem, cartItem.qty - 1)}
                      >-</button>
                      <span className='btn border border-secondary' style={{ width: "50px", cursor: "auto" }}>
                        {cartItem.qty}
                      </span>
                      <button type='button'
                        disabled={isLoading}
                        className='btn btn-secondary btn-sm'
                        onClick={() => updateCartItem(cartItem, cartItem.qty + 1)}
                      >+</button>
                    </div>
                  </td>
                  <td className='text-primary'><h6>{cartItem.product.price}</h6></td>
                  <td className='text-primary'><h6>{cartItem.total}</h6></td>
                  <td>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => {
                      openDeleteModal(cartItem)
                    }}>
                      <i className="fas fa-remove"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="6" className="text-end">總計</td>
                <td className="text-end"><h4>{cartList.total} 元</h4></td>
              </tr>
              <tr>
                <td colSpan="6" className="text-end text-success">折扣價</td>
                <td className="text-end text-success"><h4>{cartList.final_total} 元</h4></td>
              </tr>
            </tfoot>
          </table>
          <div className="text-end">
            <Link className="btn btn-outline-danger me-2" type="button" to={'/products'}>繼續購物</Link>
            {cartList?.carts?.length !== 0 && <button className="btn btn-outline-danger me-2" type="button" onClick={() => {
              openDeleteModal({})
            }}>清空購物車</button>}
            <Link className="btn btn-outline-danger" type="button" to={'/form'}>結帳表單</Link>
          </div>
        </div>
      </div>

      {/***  刪除Modal ***/}
      <DeleteModal
        deleteModalRef={deleteModalRef}
        tempProduct={tempProduct}
        navigation={navigation}
        cartItem={cartItem}
        removeCartItem={removeCartItem}
        removeAllCart={removeAllCart}
        closeDeleteModal={closeDeleteModal}
      />
    </>

  )
}
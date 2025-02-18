import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import axios from 'axios';
import ReactLoading from 'react-loading';
import { pushMessage } from '../redux/toastSlice';
import { showLoading, hideLoading } from "../redux/loadingSlice";

export default function ProductsList() {
  const API_URL = import.meta.env.VITE_BASE_URL;
  const AUTHOR = import.meta.env.VITE_API_PATH;

  const dispatch = useDispatch();
  const [cartItem, setCartItem] = useState({});
  const [state, setState] = useState(false);
  const [clientProductList, setClientProductList] = useState(null);
  const [navigation, setNavigation] = useState("menu");

  // 取得客戶商品資料
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

  useEffect(() => {
    getClientProducts()
  }, [['menu'].includes(navigation)])

  // 加入購物車
  const addCartItem = async (item, qty) => {
    try {
      const res = await axios.post(`${API_URL}/v2/api/${AUTHOR}/cart`, {
        data: {
          product_id: item.id,
          qty: Number(qty)
        }
      })
      dispatch(pushMessage({
        title: "更新數量成功",
        text: `[${item.title}] 已加入購物車 ${qty} ${item.unit}`,
        status: "success"
      }))
      setState(false); // 取消按鈕disabled
    } catch (error) {
      dispatch(pushMessage({
        title: "更新數量失敗",
        text: error?.response?.data?.message || `[${item.title}] 加到購物車失敗`,
        status: "failed"
      }))
      console.error(error)
    }
  }

  return (
    <>
      <div className="container main">
        <div className="mt-4">
          <table className="table mt-3 table-hover">
            <thead>
              <tr className="table-success border-2 text-center">
                <th scope="col" >圖片</th>
                <th scope="col" >商品名稱</th>
                <th scope="col" className="text-center">分類</th>
                <th scope="col-2" className="text-center">售價 / 原價</th>
                <th scope="col" className="text-center"></th>
              </tr>
            </thead>
            <tbody className='align-middle'>
              {clientProductList?.map((item) => {
                return (
                  <tr key={item.id} className='text-center'>
                    <td><img src={item?.imageUrl} className="object-fit-cover p-1" alt="主圖" width='100' /></td>
                    <td>{item.title}</td>
                    <td><span className="badge bg-danger">{item.category}</span></td>
                    <td>
                      <h4 className="card-text text-primary d-inline">{item.price} 元  / </h4><h6 className="card-text text-secondary d-inline"><del>{item.origin_price} 元</del></h6>
                    </td>
                    <td>
                      <div className="btn-group">
                        <Link
                          className={`btn btn-outline-success btn-sm`}
                          to={`/products/${item.id}`}
                        >
                          商品詳情 <i className="fas fa-search"></i>
                        </Link>
                        <button type="button" className={`btn btn-outline-danger btn-sm ${cartItem && state && item.id === cartItem.id && "d-flex"}`}
                          disabled={cartItem && state && item.id === cartItem.id}
                          onClick={() => {
                            setCartItem(item)
                            addCartItem(item, 1)
                            setState(true)
                          }}>加到購物車 {cartItem && state && item.id === cartItem.id ?
                            <ReactLoading
                              type={"spin"}
                              color={"#FF0000"}
                              height={"1rem"}
                              width={"1rem"}
                            /> :
                            <i className="fa-solid fa-cart-shopping"></i>}</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
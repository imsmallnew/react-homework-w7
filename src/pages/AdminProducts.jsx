import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import axios from 'axios';
import { Modal } from 'bootstrap';
import ProductMenu from "../components/ProductMenu";
import ProductContent from "../components/ProductContent"
import Pagination from "../components/Pagination";
import ProductModal from '../components/ProductModal';
import DeleteModal from '../components/DeleteModal';
import { pushMessage } from '../redux/toastSlice';
import { showLoading, hideLoading } from "../redux/loadingSlice";

export default function AdminProducts() {
  const API_URL = import.meta.env.VITE_BASE_URL;
  const AUTHOR = import.meta.env.VITE_API_PATH;

  const { page: page_value } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const [isAuth, setInsAuth] = useState(false);
  const [pageInfo, setPageInfo] = useState({});
  const [page, setPage] = useState(Number(page_value));
  const [productList, setProductList] = useState([]);
  const [tempProduct, setTempProduct] = useState(defaultModalState);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [tempImgUrl, setTempImgUrl] = useState(null);
  const [state, setState] = useState(false);
  const [target, setTarget] = useState(null);
  const [navigation, setNavigation] = useState("admin");
  const [cartItem, setCartItem] = useState({});
  const productModalRef = useRef(null);
  const productModalInstanceRef = useRef(null);
  const deleteModalRef = useRef(null);
  const deleteModalInstanceRef = useRef(null);

  // 檢查登入狀態
  const checkUserLogin = async () => {
    dispatch(showLoading("讀取中..."));

    try {
      const res = await axios.post(`${API_URL}/v2/api/user/check`)
      getProducts(page)
      setInsAuth(true);
    } catch (error) {
      dispatch(pushMessage({
        title: "系統提示",
        text: error?.response?.data?.message || `驗證登入失敗`,
        status: "failed"
      }))
      navigate("/login")
    } finally {
      dispatch(hideLoading());
    }
  }

  // 若有Cookie則直接驗證, 若失敗則導回login
  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)reactHWToken\s*\=\s*([^;]*).*$)|^.*$/, "$1",
    );
    if (token.length > 0) {
      axios.defaults.headers.common['Authorization'] = token;
      checkUserLogin()
    } else {
      navigate("/login")
    }
  }, [])

  // 當 `page` 變更時，取得資料
  useEffect(() => {
    getProducts(page);
  }, [page]);

  // 當網址 (`page_value`) 變更時，更新 `page`
  useEffect(() => {
    if (Number(page_value) !== page) {
      setPage(Number(page_value));
    }
  }, [page_value]);

  // 點擊頁碼時，更新網址 & page
  const handlePageChange = (newPage) => {
    setPage(newPage);
    navigate(`/admin/products/${newPage}`, { replace: true });
  };

  // 取得商品資料
  const getProducts = async (page) => {
    dispatch(showLoading("讀取中..."));

    try {
      await axios.get(`${API_URL}/v2/api/${AUTHOR}/admin/products?page=${page}`)
        .then((res) => {
          // 因API建立商品是最先建的num數字在後面,可重新排序顯示.sort((a, b) => b.num - a.num)
          let data = res.data.products;
          let categoriesData = [...new Set(data.map(item => item.category))];
          let unitsData = [...new Set(data.map(item => item.unit))];
          setProductList(data) // 商品資料
          data?.length > 0 && setTempProduct(data[0]) // 預設商品檢視
          data?.length > 0 && setTempImgUrl(data[0].imageUrl) // 預設商品檢視圖
          setPageInfo(res.data.pagination) // 頁碼
          setCategories(categoriesData) // ProductModal中的已選分類清單
          setUnits(unitsData) // ProductModal中的已選單位清單
        })
    } catch (error) {
      console.error(error)
      dispatch(pushMessage({
        title: "系統提示",
        text: error?.response?.data?.message || `取得商品資料失敗`,
        status: "failed"
      }))
    } finally {
      dispatch(hideLoading());
    }
  }

  // 新增商品資料
  const createProduct = async () => {
    dispatch(showLoading("新增商品資料中..."));

    try {
      // 記得型別轉換
      await axios.post(`${API_URL}/v2/api/${AUTHOR}/admin/product`, {
        data: {
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price),
          price: Number(tempProduct.price),
          imagesUrl: tempProduct.imagesUrl?.length === 0 ? [""] : tempProduct.imagesUrl
        }
      })
      dispatch(pushMessage({
        title: "新增商品成功",
        text: "商品名稱:" + tempProduct.title,
        status: "success"
      }))
      getProducts(); // 重新取得商品清單
      closeProductModal(); // 關閉Modal
    } catch (error) {
      console.error(error)
      dispatch(pushMessage({
        title: "系統提示",
        text: error?.response?.data?.message || `新增商品失敗`,
        status: "failed"
      }))
    } finally {
      dispatch(hideLoading());
    }
  }

  // 更新商品資料
  const updateProduct = async (product) => {
    const modalElement = document.getElementById("productModal");
    dispatch(showLoading("更新商品資料中..."));

    try {
      // 記得型別轉換
      await axios.put(`${API_URL}/v2/api/${AUTHOR}/admin/product/${product.id}`, {
        data: {
          ...product,
          origin_price: Number(product.origin_price),
          price: Number(product.price),
          imagesUrl: product.imagesUrl?.length === 0 ? [""] : product.imagesUrl
        }
      })
      if (modalElement?.classList.contains("show")) {
        dispatch(pushMessage({
          title: "更新商品成功",
          text: "商品名稱:" + tempProduct.title,
          status: "success"
        }))
      }
      getProducts(); // 重新取得商品清單
      closeProductModal(); // 關閉Modal
    } catch (error) {
      console.error(error)
      if (modalElement?.classList.contains("show")) {
        dispatch(pushMessage({
          title: "系統提示",
          text: error?.response?.data?.message || `更新商品失敗`,
          status: "failed"
        }))
      }
    } finally {
      dispatch(hideLoading());
    }
  }

  // 刪除商品資料
  const deleteProduct = async (id) => {
    dispatch(showLoading("刪除商品資料中..."));

    try {
      await axios.delete(`${API_URL}/v2/api/${AUTHOR}/admin/product/${tempProduct.id}`)
      dispatch(pushMessage({
        title: "刪除商品成功",
        text: "商品名稱:" + tempProduct.title,
        status: "success"
      }))
      getProducts();
      setTempProduct(defaultModalState)
      closeDeleteModal();
    } catch (error) {
      closeDeleteModal();
      console.error(error)
      dispatch(pushMessage({
        title: "系統提示",
        text: error?.response?.data?.message || `刪除商品失敗`,
        status: "failed"
      }))
    } finally {
      dispatch(hideLoading());
    }
  }

  // 處理輸入框
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    // Modal Input
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value || "",
    })
  }

  // ProductModal按下確定
  const handleModalUpdate = async (product) => {
    try {
      if (target === 'create') {
        await createProduct(); // 新增商品
      } else {
        await updateProduct(product); // 更新商品
      }
    } catch (error) {
      let type = target === 'create' ? "新增" : "更新";
      dispatch(pushMessage({
        title: `系統提示`,
        text: error?.response?.data?.message || `${type}商品失敗`,
        status: "failed"
      }))
      alert("更新商品失敗！\n\n" + error?.response.data.message.join("\n"))
    }
  }

  // 商品副圖連結更新
  const handleImageChange = (e, index) => {
    const { value } = e.target;
    const newImage = [...tempProduct.imagesUrl]
    newImage[index] = value

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImage,
    })
  }

  // ProductModal選取已有分類或單位
  const badgeReplace = (e) => {
    const { innerText, htmlFor } = e.target;
    setTempProduct({
      ...tempProduct,
      [htmlFor]: innerText,
    })
  }

  // 商品列表啟用狀態改變時更新商品
  const handleChangeOption = async (e, item) => {
    const newValue = e.target.value === "Y" ? 1 : 0;
    const updateItem = { ...item, is_enabled: newValue };
    try {
      await updateProduct(updateItem); // 更新商品
      getProducts(); // 重新取得商品清單
      const status = updateItem.is_enabled === 1 ? "已啟用" : "已停用";
      dispatch(pushMessage({
        title: "系統提示",
        text: `[商品]${updateItem.title}: ${status}`,
        status: "success"
      }))
    } catch (error) {
      dispatch(pushMessage({
        title: `系統提示`,
        text: error?.response?.data?.message || `[商品]${updateItem.title}: 更新啟用狀態失敗`,
        status: "failed"
      }))
    }
  };

  // ProductModal按下新增副圖
  const imagesUrlAdd = () => {
    const newImage = [...tempProduct.imagesUrl]
    newImage.push('') //新增空字串的輸入框

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImage,
    })
  }

  // ProductModal按下刪除副圖
  const imagesUrlRemove = (index) => {
    const newImage = [...tempProduct.imagesUrl]
    newImage.splice(index, 1)

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImage,
    })
  }

  // ProductModal處理圖片上傳
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    if (file) {
      formData.append("file-to-upload", file)
      uploadImage(formData)
    } else {
      dispatch(pushMessage({
        title: `系統提示`,
        text: "尚未取得圖片資料來源, 無法上傳!",
        status: "failed"
      }))
    }
  }

  // 圖片上傳
  const uploadImage = async (data) => {
    dispatch(showLoading("上傳圖片中..."));

    try {
      const result = await axios.post(`${API_URL}/v2/api/${AUTHOR}/admin/upload`, data)
      const uploadImageURL = result.data.imageUrl
      dispatch(pushMessage({
        title: "系統提示",
        text: "圖片上傳成功",
        status: "success"
      }))
      uploadImageURL && setTempProduct({
        ...tempProduct,
        imageUrl: uploadImageURL,
      })
    } catch (error) {
      console.error(error)
      dispatch(pushMessage({
        title: "系統提示",
        text: "上傳圖片失敗",
        status: "failed"
      }))
    } finally {
      dispatch(hideLoading());
    }
  }

  // 確保模態框 DOM 已掛載後初始化 Modal 實例
  useEffect(() => {
    if (productModalRef.current) {
      productModalInstanceRef.current = new Modal(productModalRef.current, { backdrop: false });
    }
    if (deleteModalRef.current) {
      deleteModalInstanceRef.current = new Modal(deleteModalRef.current, { backdrop: false });
    }
  }, []);

  // 開啟 ProductModal
  const openProductModal = (type, item) => {
    setTarget(type) // create, edit
    setTempProduct(type === "edit" ? item : defaultModalState)
    setTimeout(() => {
      setState(false)
    }, 500)
    if (productModalInstanceRef.current) {
      productModalInstanceRef.current.show(); // 確保 Modal 實例已初始化後調用 show()
    } else {
      console.error("Modal instance is not initialized.");
    }
  };

  // 關閉 ProductModal
  const closeProductModal = () => {
    if (productModalInstanceRef.current) {
      productModalInstanceRef.current.hide(); // 確保 Modal 實例已初始化後調用 hide()
    } else {
      console.error("Modal instance is not initialized.");
    }
  };

  // 開啟 DeleteModal
  const openDeleteModal = (item) => {
    navigation === 'admin' ? setTempProduct(item) : setCartItem(item);
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

  return (
    <>
      {/* 商品列表 */}
      <div className="container main">
        <div className="container">
          <div className="row">
            <div className="col-md-9 mt-4 mb-5">
              <ProductMenu
                state={state}
                productList={productList}
                tempProduct={tempProduct}
                openProductModal={openProductModal}
                openDeleteModal={openDeleteModal}
                handleChangeOption={handleChangeOption}
                setTempProduct={setTempProduct}
                setTempImgUrl={setTempImgUrl}
                setState={setState}
              />
              <Pagination
                pageInfo={pageInfo}
                handlePageChange={handlePageChange}
              />
            </div>
            <div className="col-md-3 mt-5 mb-5">
              <ProductContent
                tempProduct={tempProduct}
                tempImgUrl={tempImgUrl}
                setTempImgUrl={setTempImgUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/***  商品Modal ***/}
      <ProductModal
        productModalRef={productModalRef}
        target={target}
        tempProduct={tempProduct}
        categories={categories}
        units={units}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleImageChange={handleImageChange}
        imagesUrlRemove={imagesUrlRemove}
        badgeReplace={badgeReplace}
        imagesUrlAdd={imagesUrlAdd}
        closeProductModal={closeProductModal}
        handleModalUpdate={handleModalUpdate}
      />

      {/***  刪除Modal ***/}
      <DeleteModal
        deleteModalRef={deleteModalRef}
        tempProduct={tempProduct}
        navigation={navigation}
        cartItem={cartItem}
        deleteProduct={deleteProduct}
        closeDeleteModal={closeDeleteModal}
      />
    </>
  )
}
import { useNavigate } from 'react-router-dom';
import { useState} from 'react';
import { useDispatch } from "react-redux"
import axios from 'axios';
import { pushMessage } from '../redux/toastSlice';
import { showLoading, hideLoading } from "../redux/loadingSlice";

export default function LogoutBtn() {
    const API_URL = import.meta.env.VITE_BASE_URL;
    const AUTHOR = import.meta.env.VITE_API_PATH;
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [account, setAccount] = useState({
        username: "",
        password: ""
    });

    // 登出按鈕
    const handleLogout = async () => {
        dispatch(showLoading("讀取中..."));

        try {
            const res = await axios.post(`${API_URL}/v2/logout`)
            document.cookie = `reactHWToken=; expires=`; // 清除Cookie
            dispatch(pushMessage({
                title: "系統提示",
                text: `使用者 ${account.username} 已登出`,
                status: "success"
            }))
            navigate("/login");
        } catch (error) {
            console.error(error)
            dispatch(pushMessage({
                title: "系統提示",
                text: error?.response?.data?.message || `使用者 ${account.username} 登出失敗`,
                status: "failed"
            }))
        } finally {
            dispatch(hideLoading());
        }
    }

    return (
        <>
            <div className="nav float-end">
                <button className="btn btn-sm btn-outline-secondary" type="button" id="logoutBtn" onClick={handleLogout}>登出後台</button>
            </div>
        </>
    )
}
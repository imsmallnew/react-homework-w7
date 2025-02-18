import { useSelector, useDispatch } from "react-redux"
import { Toast as BsToast } from "bootstrap"
import { useEffect, useRef } from "react"
import { removeMessage } from "../redux/toastSlice"

function Toast() {
    const messages = useSelector(state => state.toast.messages)
    const dispatch = useDispatch();
    const toastRefs = useRef({})
    const timeoutRef = useRef(null);

    useEffect(() => {
        messages?.forEach((message) => {
            const toastElement = toastRefs.current[message.id]
            // 開啟 Toast
            if (toastElement) {
                const toastInstance = new BsToast(toastElement)
                toastInstance.show()
            }

            // 先清除舊的計時器，避免多次點擊產生多個 `setTimeout`
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // 
            timeoutRef.current = setTimeout(() => {
                dispatch(removeMessage(message.id));
                timeoutRef.current = null; // 清空 reference
            }, 3000); // 三秒後關閉
        })
    }, [messages])

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <div className="position-fixed bottom-0 end-0 mb-4 me-3" style={{ zIndex: 9000 }}>
                {messages?.map((message) => (
                <div 
                    key={message.id}
                    ref={(el) => toastRefs.current[message.id] = el}
                    className="toast mt-3" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className={`toast-header ${message.status === "success" ? "bg-success " : "bg-danger"} text-white`}>
                        <strong className="me-auto">{message.title}</strong>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="toast-body">{message.text}</div>
                </div>))}
            </div>
        </>
    )
}

export default Toast
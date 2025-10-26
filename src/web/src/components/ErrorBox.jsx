import { useEffect } from "react";
import "../css/root.css"
import "../css/ErrorBox.css"
import { LiveButton } from "./LiveUI";

const ErrorBox = ({ errorMessage, setErrorMessage }) => {

    const deleteItem = (id) => {
        setErrorMessage(prev => prev.filter((_, index) => index !== id));
    };

    useEffect(() => {
        if (!errorMessage.length) return;
        const timer = setTimeout(() => {
            setErrorMessage((prev) => prev.slice(1)); // remove first message immutably
        }, 1500);
        return () => clearTimeout(timer);
    }, [errorMessage]);

    return (
        <div className="error-box-container-parent">
            {errorMessage.map((v, i) => {
                return (
                    <div key={i} className="error-box-container">
                        <p>{v}</p>
                        <LiveButton onClick={() => deleteItem(i)}>&times;</LiveButton>
                    </div>
                )
            })}
        </div>
    );
};

export default ErrorBox;
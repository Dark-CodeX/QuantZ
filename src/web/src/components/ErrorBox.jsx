import "../css/root.css"
import "../css/ErrorBox.css"
import { LiveButton } from "./LiveUI";

const ErrorBox = ({ msg, setErrorMessage }) => {

    const deleteItem = (id) => {
        setErrorMessage(prev => prev.filter((_, index) => index !== id));
    };

    return (
        <div className="error-box-container-parent">
            {msg.map((v, i) => {
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
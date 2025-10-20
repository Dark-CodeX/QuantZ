import "../css/root.css"
import "../css/ErrorBox.css"
import { LiveButton } from "./LiveUI";

const ErrorBox = ({ msg }) => {
    return (
        <div className="error-box-container-parent">
            {msg.map((v, i) => {
                return (
                    <div key={i} className="error-box-container">
                        <p>{v}</p>
                        <LiveButton onClick={() => { }}>X</LiveButton>
                    </div>
                )
            })}
        </div>
    );
};

export default ErrorBox;
import { useState } from "react";
import Home from './components/Home'
import Main from './components/Main';
import Navbar from "./components/Navbar"
import ErrorBox from "./components/ErrorBox";

function App() {
    const [CSVData, setCSVData] = useState([]);
    const [errorMessage, setErrorMessage] = useState([]);
    const [showMain, setShowMain] = useState(false);
    return (
        <>
            <Navbar />
            {errorMessage.length > 0 && (
                <ErrorBox errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
            )}
            {!showMain ? (
                <Home setShowMain={setShowMain} setCSVData={setCSVData} setErrorMessage={setErrorMessage} />
            ) : (
                <Main CSVData={CSVData} setErrorMessage={setErrorMessage} />
            )}
        </>
    );
}


export default App;

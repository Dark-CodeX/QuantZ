import { useState } from "react";
import Home from './components/Home'
import Main from './components/Main';
import Navbar from "./components/Navbar"
import ErrorBox from "./components/ErrorBox";

function App() {
    const [file, setFile] = useState(null);
    const [CSVData, setCSVData] = useState([]);
    const [errorMessage, setErrorMessage] = useState([]);
    return (
        <>
            <Navbar />
            {!file ? (
                <Home file={file} setFile={setFile} setCSVData={setCSVData} />
            ) : (
                <Main CSVData={CSVData} setErrorMessage={setErrorMessage} />
            )}
            {errorMessage && (
                <ErrorBox errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
            )}
        </>
    );
}


export default App;

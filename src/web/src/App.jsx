import Home from './components/Home'
import Main from './components/Main';
import Navbar from "./components/Navbar"
import { useState } from "react";

function App() {
    const [file, setFile] = useState(null);
    const [CSVData, setCSVData] = useState([]);

    return (
        <>
            <Navbar />
            {!file ? (
                <Home file={file} setFile={setFile} />
            ) : (
                <Main CSVData={CSVData} />
            )}
        </>
    );
}


export default App;

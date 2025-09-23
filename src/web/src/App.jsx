import Home from './components/Home'
import Main from './components/Main';
import Navbar from "./components/Navbar"
import React, { useEffect, useState } from "react";

function App() {
    const [files, setFiles] = useState(null);

    return (
        <>
            <Navbar />
            {!files ? (
                <Home files={files} setFiles={setFiles} />
            ) : (
                <Main files={files} />
            )}
        </>
    );
}


export default App;

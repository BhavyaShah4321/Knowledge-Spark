import React from 'react'
import { Route, Routes } from "react-router"
function Root() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Login />} />
            </Routes>
        </>
    )
}

export default Root

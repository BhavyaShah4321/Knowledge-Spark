import React from "react";
import Root from "../src/Common/Root"; // Or your main routing component
// import "../src/Styles/Main.css";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    
    <div className="App">
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </div>
  );
}

export default App;

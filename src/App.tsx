import React from "react";
import logo from "./assets/404.png";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p style={{ fontSize: 36 }}>
          We’re doing a bit of maintenance right now.
          <br />
          Thanks for your patience!
        </p>

        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfOWXnJOxnUO4SA_4AFdXBB0sXmm1EWle8j_kQmBn3Vz901Nw/viewform">
          <span className="button_top"> Contact us</span>
        </a>
      </header>
    </div>
  );
}

export default App;

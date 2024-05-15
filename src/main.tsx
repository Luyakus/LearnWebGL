import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

let root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App/>);

window.addEventListener('resize', draw);
function draw() {
  if (root) {
    root.unmount();
    root = ReactDOM.createRoot(document.getElementById("root")!);
  }
  root.render(<App/>)
  
}



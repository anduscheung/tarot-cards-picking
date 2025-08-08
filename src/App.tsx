import "./App.css";
import AskAQuestion from "./features/AskAQuestion/AskAQuestion";
import Login from "./features/Login/Login";

function App() {
  return (
    <div className="App">
      <Login />
      <AskAQuestion />
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import Loader from "./components/loader/loader";
import Home from "./pages/Home";
import { ChatContainer } from "./features/chatbot";
import { restoreUser } from "./features/authentication/auth.slice";
import { useDispatch } from "react-redux";

function App() {
  const [loading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      dispatch(restoreUser({ token, role }));
    }
  }, [dispatch]);

  return (
    <>
      {loading ? <Loader /> : <Home />}
      <ChatContainer />
    </>
  );
}

export default App;

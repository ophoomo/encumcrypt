import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
]);

export default router;
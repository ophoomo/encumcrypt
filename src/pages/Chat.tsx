import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import MessageBox from "../components/MessageBox";
import Loading from "../components/Loading";

export default function Chat() {
  interface IChat {
    name: string;
    payload: string;
  }

  const history = useNavigate();
  const { NameState, HostState } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<IChat[]>([]);
  let ws = useRef<WebSocket>();

  const onClickExitRoom = () => {
    ws.current?.close();
    history("/");
  };

  const connectServer = () => {
    ws.current = new WebSocket(HostState.value);
    // ws.current.onopen = wsOpen;
    ws.current.onopen = () => ws.current?.send("asdad");
    ws.current.onmessage = wsMessage;
    ws.current.onclose = wsClose;
  };

  const wsOpen = () => {
    ws.current?.send("hello");
  };

  const wsMessage = (event: MessageEvent) => {
    console.log(event);
    const data = JSON.parse(event.data);
    if (data.server) {
      setLoading(false);
    }
    setChats((prev) => [...prev, data]);
  };

  const wsClose = (event: CloseEvent) => {
    if (event.wasClean) {
      alert(`Connection closed cleanly`);
    } else {
      alert("Connection died");
    }
  };

  const sendData = () => {
    ws.current?.send(
      JSON.stringify({
        name: NameState.value,
        payload: encodeData("asd"),
      } as IChat)
    );
  };

  const encodeData = (data: string): string => {
    return data;
  };

  useEffect(() => {
    connectServer();
  }, []);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <div>
            {chats.map((chat, i) => (
              <MessageBox key={i} {...chat} />
            ))}
          </div>
          <button onClick={onClickExitRoom}>Exit</button>
          <input placeholder="Enter Text" />
        </div>
      )}
    </div>
  );
}

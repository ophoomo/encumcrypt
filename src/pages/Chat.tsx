import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import MessageBox from "../components/MessageBox";
import Loading from "../components/Loading";
import Swal from "sweetalert2";

export default function Chat() {
  interface IChat {
    state: string;
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
  };

  const connectServer = () => {
    ws.current = new WebSocket(HostState.value);
    ws.current.onopen = wsOpen;
    ws.current.onmessage = wsMessage;
    ws.current.onclose = wsClose;
  };

  const wsOpen = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current?.send(
        JSON.stringify({
          state: "Join",
          name: NameState.value,
        })
      );
    } else if (ws.current?.readyState == WebSocket.CONNECTING) {
      ws.current?.addEventListener("open", () => wsOpen());
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "can't connecting to server",
        timer: 10000,
      }).then((res) => {
        if (res) {
          ws.current?.close();
          history("/");
        }
      });
    }
  };

  const wsMessage = (event: MessageEvent) => {
    console.log(event);
    const data = JSON.parse(event.data);
    switch (data.state) {
      case "Connected":
        setLoading(false);
        break;
    }
    setChats((prev) => [...prev, data]);
  };

  const wsClose = (event: CloseEvent) => {
    let text = "";
    if (event.wasClean) {
      text = `Connection closed cleanly`;
    } else {
      text = "Connection died";
    }
    Swal.fire({
      icon: "error",
      title: "Error",
      text: text,
      timer: 10000,
    }).then((res) => {
      if (res) {
        history("/");
      }
    });
  };

  const sendData = (message: string) => {
    ws.current?.send(
      JSON.stringify({
        state: "Chat",
        name: NameState.value,
        payload: encodeData(message),
      } as IChat)
    );
  };

  const encodeData = (data: string): string => {
    return data;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == "Enter") {
      let input = document.getElementById("input") as HTMLInputElement;
      sendData(input.value);
      input.value = "";
    }
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
          <h1>{HostState.value}</h1>
          <div>
            {chats.map((chat, i) => (
              <MessageBox key={i} {...chat} />
            ))}
          </div>
          <button onClick={onClickExitRoom}>Exit</button>
          <input id="input" onKeyDown={onKeyDown} placeholder="Enter Text" />
        </div>
      )}
    </div>
  );
}

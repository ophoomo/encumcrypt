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
    let text_to_hex = '';
    
    for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i).toString(16); // แปลงตัวอักษรในรูปแบบฐาน 16
        text_to_hex += charCode.padStart(2, '0'); // ใส่ 0 ด้านหน้าถ้าต้องการ
    }
    const hexArray_1 = [];                                  //เอาhexที่แปลงมาจาก text ใส่ใน array
    for (let i = 0; i < text_to_hex.length; i += 2) {
        const hexPair = text_to_hex.substr(i, 2);
        hexArray_1.push(hexPair);
    }

    let lentext  = data.length;                       // จำนวนตัวอักษร

    const decimalArray_1 = hexArray_1.map(hex => {
        return parseInt(hex, 16);                     // แปลงเลขฐาน 16 เป็นเลขฐาน 10
    });

    const result_decimal_push_lentext = decimalArray_1.map(number => number + lentext); // เอาฐาน 16 ที่แปลงเป็นฐาน 10 มาบวกกับ จำนวนตัวอักษร

    const numberOfTexts = result_decimal_push_lentext.length;  // นับจำนวนข้อความแล้วหาร 2 ถ้ามัเศษให้ปัดขึ้น
    const resultOfdiv_lentext = Math.ceil(numberOfTexts / 2);

    
    const array1 = result_decimal_push_lentext.slice(0, resultOfdiv_lentext);  // ตั้งแต่ index 0 ถึงครึ่งหนึ่งของอาร์เรย์
    const array2 = result_decimal_push_lentext.slice(resultOfdiv_lentext);  //แบ่งครึ่ง Array

    const mergedArray_decimal = [...array2, ...array1];

    const hexArray = mergedArray_decimal.map(item => {
        const decimalValue = parseInt(item,10);  // แปลงเลขในฐาน 10 เป็น decimal
        return decimalValue.toString(16);          // แปลง decimal เป็น hex
      });

      const Data_Cyphertext_Array = hexArray.map(hexValue => {
        const decimalValue = parseInt(hexValue, 16); // แปลงค่าฐาน 16 เป็นตัวเลขในฐาน 10
        return String.fromCharCode(decimalValue); // แปลงตัวเลขในฐาน 10 เป็นข้อความ
      });
      const Data_Cyphertext = Data_Cyphertext_Array.join("")
    return Data_Cyphertext;
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

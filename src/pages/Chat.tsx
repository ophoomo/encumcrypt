import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import MessageBox from "../components/MessageBox";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import { message } from 'antd';

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
  const refContainerChat = useRef<HTMLDivElement>(null);

  const [messageApi, contextHolder] = message.useMessage();

  // function click ออกจากห้อง
  const onClickExitRoom = () => {
    // ตัดการเชื่อมต่อกับ server
    ws.current?.close();
  };

  const connectServer = () => {
    try {
      // เปิดช่องการเชื่อมต่อไปยัง Socket Server
      ws.current = new WebSocket(HostState.value);
      // เมื่อเปิดการเชื่อมต่อ ให้ไปทำ function wsOpen
      ws.current.onopen = wsOpen;
      // เมื่อมีการปิดให้ไปทำ function wsMessage
      ws.current.onmessage = wsMessage;
      // เมื่อมีการปิดให้ไปทำ function wsClose
      ws.current.onclose = wsClose;
    } catch (err: any) {
      console.log('err on connect server', err);
      window.location.href = "/";
    }
  };

  // function เมื่อเปิดการเชื่อมต่อ Socket
  const wsOpen = () => {
    // เช็คว่า เชื่อมต่อ Socket ได้หรือยัง
    if (ws.current?.readyState === WebSocket.OPEN) {
      // เมื่อได้แล้ว ให้ส่งข้อความไปที่ Socket
      ws.current?.send(
        JSON.stringify({
          state: "Join",
          name: NameState.value,
        })
      );
    } else if (ws.current?.readyState == WebSocket.CONNECTING) {
      // ถ้ากำลังเชื่อมต่อให้สร้างทำการสั่งเชื่อมต่อใหม่
      ws.current?.addEventListener("open", () => wsOpen());
    } else {
      // ถ้าเชื่อมต่อแล้วยังไม่ได้อีกให้ขึ้น error แล้วเด้งกลับไปหน้าหลัก
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

  // function เมื่อมีการส่งข้อความกลับมา
  const wsMessage = (event: MessageEvent) => {
    // แปลงข้อความให้อยู่ในรูปแบบ JSON
    const data = JSON.parse(event.data);
    // ตรวจสอบ State
    switch (data.state) {
      // ถ้า state เท่ากับ Connected
      case "Connected":
        // ให้ปิด loading
        setLoading(false);
        break;
    }
    // นำข้อความเก็บลงตัวแปรแล้วนำไปแสดง
    setChats((prev) => [...prev, data]);
  };

  // function เมื่อมีการส่งข้อความกลับมา
  const wsClose = (event: CloseEvent) => {
    let text = "";
    // เช็คว่ามีการปิดเซิฟเวอร์ที่ถูกต้องหรือไม่
    if (event.wasClean) {
      text = `Connection closed cleanly`;
    } else {
      text = "Connection died";
    }
    // แสดงข้อความออกทางจอภาพ
    Swal.fire({
      icon: text === 'Connection died' ? 'error' : 'success',
      title: "",
      html: `${text === 'Connection died' 
        ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ,<br />โปรดตรวจสอบ URL แล้วลองใหม่อีกครั้ง' 
        : 'ออกจากห้องสนทนาเรียบร้อยแล้ว'}<br />
        ERR: ${text}
      `,
      timer: 2000,
      showConfirmButton: false,
    }).then((res) => {
      if (res) {
        history("/");
      }
    });
  };

  // function ส่งข้อความไปยัง server
  const sendData = (message: string) => {
    // ส่งข้อความไป server ในรูปแบบ JSON
    ws.current?.send(
      JSON.stringify({
        state: "Chat",
        name: NameState.value,
        payload: encodeData(message),
      } as IChat)
    );
  };

  const encodeData = (text: string): string => {
    let encodedText = [];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charCode = char.charCodeAt(0);
      // encodedText += '%' + charCode.toString(16).toUpperCase();
      encodedText.push(charCode.toString(16).toUpperCase());
    }
    const lentext = encodedText.length
    const resultOfdiv_lentext = Math.ceil(lentext / 2);
    const array1 = encodedText.slice(0, resultOfdiv_lentext);  // ตั้งแต่ index 0 ถึงครึ่งหนึ่งของอาร์เรย์
    const array2 = encodedText.slice(resultOfdiv_lentext);  //แบ่งครึ่ง Array
    const mergedArray_decimal = [...array2, ...array1];

    const data = mergedArray_decimal.map(item => item + "%").join('');

    
    return data
  };

  const sendMsg = () => {
    let input = document.getElementById("input") as HTMLInputElement;
      if (input.value.length > 0) {
        sendData(input.value);
        input.value = "";
      }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == "Enter") {
      sendMsg();
    }
  };

  const onCopyChatURL = () => {
    navigator.clipboard.writeText(HostState.value);
    messageApi.open({
      type: 'success',
      content: 'คัดลอกที่อยู่ห้องแชทแล้ว',
      style: {
        marginTop: '2rem',
      },
    });
  }

  useEffect(() => {
    connectServer();
  }, []);

  useEffect(() => {
    refContainerChat.current?.scrollTo(0, refContainerChat.current.scrollHeight);
  }, [chats, refContainerChat.current?.scrollHeight]);


  return (
    <>
      { contextHolder }
    
      <div>
        {loading ? (
          <Loading />
        ) : (

          <div id="chat" className="overflow-x-hidden">
            <div className={`
              pt-0.5 fixed top-0 left-0 w-full bg-white/90 h-14 px-4 shadow-lg
              grid grid-cols-[2.5rem_1fr_2.5rem] items-center justify-center
            `}>
              <div className="text-xs">
                <svg onClick={onClickExitRoom} className="mt-0.4 p-2 rounded-full cursor-pointer" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
              </div>
              <p className="font-200 text-sm xl:text-base text-center">
                ลิ้งห้องสนทนา:&nbsp;&nbsp;
                <span className={`text-blue-700 cursor-pointer underline`} onClick={onCopyChatURL}>
                  { HostState.value } 
                </span>
                <span className="ml-1 text-xs p-1 cursor-pointer" onClick={onCopyChatURL}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>
                </span>
              </p>
              <div></div>
            </div>
          
            <div 
              ref={refContainerChat}
              className="flex flex-col gap-2 py-20 xl:w-[40%] xl:mx-auto px-4 h-[70dvh] lg:h-[76dvh]"
              style={{
                overflowY: 'scroll',
              }}
            >
              {chats.map((chat, i) => (
                <MessageBox 
                  key={i} 
                  {...chat} 
                  ownerMsg={chat.name === NameState.value}
                />
              ))}
            </div>
            
            <div className="fixed bg-white w-full bottom-0 py-4 px-4">
              <div className="w-11/12 xl:w-[40%] mx-auto flex gap-2 h-10">
                <input 
                  id="input" 
                  onKeyDown={onKeyDown} 
                  placeholder="พูดอะไรสักหน่อย..." 
                  className={`
                    w-full rounded-lg border-2 py-2 px-3 lg:px-6 
                    border-black/20 focus:outline-none 
                    focus:border-black/50 outline-none
                    text-sm -ml-5 xl:-ml-8
                  `}
                  style={{
                    letterSpacing: 0.4
                  }}
                />
                <div 
                  onClick={sendMsg}
                  className={`btn w-20 flex-center bg-blue-500 hover:bg-blue-700`} 
                >
                  ส่ง
                </div>
                <div></div>
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  );
}

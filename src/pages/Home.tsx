import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api";
import Swal from "sweetalert2";
import { useContext } from "react";
import { AppContext } from "../AppContext";
import BannerImg from './../assets/img/banner.svg'


export default function Home() {
   const { NameState, HostState } = useContext(AppContext);
  const history = useNavigate();

  const onClickCreateServer = async () => {
    const name = await enterName();
    if (name.length > 0) {
      NameState.set(name);
      invoke("create_server")
      invoke("get_ip")
        .then((res) => {
            const data = res as string;
            if (data.length > 0) {
              HostState.set("ws://"+data);
              history("/chat");
            }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const onClickConnectServer = async () => {
    const name = await enterName();
    const host = await enterHost();
    // add verify ws pattern
    if (!host.startsWith("ws://")) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "URL WS ไม่ถูกต้อง, โปรดลองใหม่อีกครั้ง",
        confirmButtonText: "เข้าใจแล้ว",
      });
      return;
    }
    NameState.set(name);
    HostState.set(host);
    if (name.length > 0 && host.length > 0) {
      history("/chat");
    }
  };

  const enterName = (): Promise<string> => {
    return new Promise((res, _) => {
      Swal.fire({
        icon: "question",
        title: "",
        text: "ชื่อของคุณในห้องสนทนา",
        input: "text",
        allowOutsideClick: false,
        inputAttributes: {
          autocapitalize: "off",
        },
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
        preConfirm: (value) => {
          if (!value) {
            Swal.showValidationMessage(
              '<i class="fa fa-info-circle"></i> โปรดระบุชื่อของคุณ'
            );
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          res(result.value);
        }
      });
    });
  };

  const enterHost = (): Promise<string> => {
    return new Promise((res, _) => {
      Swal.fire({
        icon: "question",
        title: "",
        text: "ระบุ URL ของห้องสนทนา ( ws://....... )",
        input: "text",
        allowOutsideClick: false,
        inputAttributes: {
          autocapitalize: "off",
        },
        showCancelButton: true,
        confirmButtonText: "Confirm",
        preConfirm: (value) => {
          if (!value) {
            Swal.showValidationMessage(
              '<i class="fa fa-info-circle"></i> โปรดระบุ URL ของห้องสนทนา'
            );
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          res(result.value);
        }
      });
    });
  };

  return (
    <>

      <div className={`flex flex-col w-full h-screen flex-center hidden`}>

        <p className="-mt-20 lg:-mt-10 text-xl lg:text-xl 2xl:text-2xl" style={{letterSpacing: '0.06rem'}}>
          Encumcrypt Chat
        </p>
        
        <img 
          src={BannerImg} alt="#" 
          className="mt-10 w-8/12 lg:w-4/12 2xl:w-6/12 max-h-[24rem]" 
        />
        
        <div className="mt-10 w-8/12 lg:w-4/12 flex-center flex-col lg:flex-row gap-y-3 gap-x-6 lg:gap-x-4">
          
          <button 
            onClick={onClickConnectServer}
            className={`
              flex-center
              btn text-[0.9rem] lg:text-[1rem] w-full h-10 lg:h-11
              bg-indigo-500 hover:bg-indigo-700
              border-transparent shadow-md lg:order-2
            `}
            style={{
              letterSpacing: 0.6
            }}
          >
            เชื่อมต่อห้องแชท
          </button>

          <button 
            onClick={onClickCreateServer}
            className={`
              flex-center
              btn text-[0.88rem] lg:text-[1rem] w-full text-black border-black/60
              hover:bg-gray-200 bg-white border shadow-md h-9 lg:h-11
            `}
            style={{
              letterSpacing: 0.6
            }}
          >
            สร้างห้องแชท
          </button>

        </div>
      </div>

    </>
  );
}

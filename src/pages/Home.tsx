import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api";
import Swal from "sweetalert2";
import { useContext } from "react";
import { AppContext } from "../AppContext";

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
        title: "Question",
        text: "Enter Your Name",
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
              '<i class="fa fa-info-circle"></i> Your name is required'
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
        title: "Question",
        text: "Enter Your Host",
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
              '<i class="fa fa-info-circle"></i> Your Host is required'
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
    <div>
      <button onClick={onClickCreateServer}>Create Room</button>
      <button onClick={onClickConnectServer}>Connect Room</button>
    </div>
  );
}

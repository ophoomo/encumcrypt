// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures::channel::mpsc::unbounded;
use futures::channel::mpsc::UnboundedSender;
use futures_util::future;
use futures_util::pin_mut;
use futures_util::StreamExt;
use futures_util::TryStreamExt;
use local_ip_address::local_ip;
use serde_json::json;
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use std::sync::Mutex;
use tokio::net::TcpListener;
use tokio::net::TcpStream;
use tokio_tungstenite::{accept_async, tungstenite::Message};

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;

// ฟังก์ชันเริ่มต้นเซิร์ฟเวอร์แบบอะซิงโครนัสบนที่อยู่ `host` ที่กำหนด
async fn start_server(host: String) {
    // พยายามสร้างการฟังของ TCP listener บนที่อยู่ที่กำหนด
    let try_socket = TcpListener::bind(&host).await;
    // รับ listener หรือแสดงข้อผิดพลาดหากไม่สามารถทำได้
    let listener: TcpListener = try_socket.expect("Failed to bind");
    
    // สร้างสถานะแบบร่วมเพื่อเก็บ peer ที่กำลังใช้งาน
    let state = PeerMap::new(Mutex::new(HashMap::new()));

    // วนลูปและรับการเชื่อมต่อ TCP ที่เข้ามา
    while let Ok((stream, addr)) = listener.accept().await {
        // สร้างงานใหม่แบบอะซิงโครนัสเพื่อจัดการการเชื่อมต่อ
        tokio::spawn(handle_connection(stream, addr, state.clone()));
    }
}

// ฟังก์ชันจัดการการเชื่อมต่อแบบอะซิงโครนัสสำหรับลูกค้าแต่ละราย
async fn handle_connection(stream: TcpStream, addr: SocketAddr, state: PeerMap) {
    // แสดงที่อยู่ของการเชื่อมต่อที่เข้ามา
    println!("Incoming TCP connection from: {}", addr);

    // อัพเกรดการเชื่อมต่อ TCP เป็น WebSocket
    let ws_stream = accept_async(stream)
        .await
        .expect("Error during the websocket handshake occurred");

    // สร้างช่องสำหรับรับข้อความ WebSocket
    let (tx, rx) = unbounded::<Message>();
    // ล็อคและเพิ่มที่อยู่และช่องส่งของลูกค้า
    state.lock().unwrap().insert(addr, tx);

    // แยก WebSocket stream เป็นส่วนส่งและส่วนรับ
    let (ws_sender, ws_receiver) = ws_stream.split();

    // แสดงข้อความที่รับมา
    let broadcast_incoming = ws_receiver.try_for_each(|msg| {
        println!(
            "Received a message from {}: {}",
            addr,
            msg.to_text().unwrap()
        );
        // ล็อคสถานะเพื่ออ่าน peer ที่กำลังใช้งาน
        let peers = state.lock().unwrap();
        // แปลงข้อความ WebSocket เป็นสตริง
        let msg_str: &str = match &msg {
            Message::Text(text) => text,
            _ => "",
        };

        // พยายามแปลงสตริงเป็นค่า JSON
        let v: serde_json::Value = match serde_json::from_str(&msg_str) {
            Ok(it) => it,
            Err(_) => serde_json::Value::Null,
        };

        // รับรายการผู้รับเพื่อส่งข้อความ
        let broadcast_recipients = peers
            .iter()
            // .filter(|(peer_addr, _)| peer_addr != &&addr)
            .map(|(_, ws_sink)| ws_sink);

        for recp in broadcast_recipients {
            // จัดการประเภทข้อความเฉพาะ ("Join" หรือ "Chat")
            if v["state"] == serde_json::Value::String("Join".to_string()) {
                let response_msg = Message::Text(
                    serde_json::to_string(&json!({
                        "state": "Connected",
                        "name": v["name"],
                    }))
                    .unwrap(),
                );
                // ส่งข้อมูลกลับไปว่า state กลับไปหาทุกคนว่า name คนนี้ได้ Join เข้ามาแล้ว
                recp.unbounded_send(response_msg).unwrap();
            } else if v["state"] == serde_json::Value::String("Chat".to_string()) {
                // ส่งข้อความหาทุกคน
                recp.unbounded_send(msg.clone()).unwrap();
            }
        }

        future::ok(())
    });

    // ส่งข้อความจากลูกค้าอื่นไปยังลูกค้านี้
    let receive_from_others = rx.map(Ok).forward(ws_sender);
    pin_mut!(broadcast_incoming, receive_from_others);
    // เลือกฟิวเจอร์ที่จะทำงานและหยุดเมื่อมีฟิวเจอร์เสร็จสิ้น
    future::select(broadcast_incoming, receive_from_others).await;
    println!("{} disconnected", &addr);
    // ตรวจสอบว่าลูกค้านี้เป็นเพียงผู้เดียวใน map หรือไม่
    if state.lock().unwrap().keys().next() == Some(&addr) {
        // how to shutdown TcpListener?
        // TODO: สั่งให้ปิดเซิฟเวอร์ เมื่อเจ้าของห้องออก
    }
    // ลบรายการลูกค้านี้ออกจาก map
    state.lock().unwrap().remove(&addr);
}

// เป็นคำสั่งสำหรับดึง IP จากเครื่องและส่งออกมาพร้อม port ที่กำหนด
fn get_ip_user() -> String {
    let my_local_ip = local_ip().unwrap();
    let port: i32 = 6142;
    let host = format!("{}:{}", my_local_ip, port);
    return host;
}

// เป็น API ที่เชื่อมระหว่าง Website กับ โปรแกรมบนเครื่อง
// เป็นคำสั่งที่จะเปิด Socket ที่เครื่องไว้ให้คนอื่นเชื่อมต่อเข้ามา
#[tauri::command]
async fn create_server() {
    let host = get_ip_user();
    start_server(host).await;
}

// เป็น API ที่เชื่อมระหว่าง Website กับ โปรแกรมบนเครื่อง
// เป็นคำสั่งที่ดึง IP จากเครื่องแล้วส่งกลับไปให้ Website
#[tauri::command]
async fn get_ip() -> String {
    let host = get_ip_user();
    return host;
}

// รันตัวโปรแกรมบนเครื่อง
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![create_server, get_ip])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

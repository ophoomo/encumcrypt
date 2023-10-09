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

async fn start_server(host: String) {
    let try_socket = TcpListener::bind(&host).await;
    let listener: TcpListener = try_socket.expect("Failed to bind");

    let state = PeerMap::new(Mutex::new(HashMap::new()));

    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(handle_connection(stream, addr, state.clone()));
    }
}

async fn handle_connection(stream: TcpStream, addr: SocketAddr, state: PeerMap) {
    println!("Incoming TCP connection from: {}", addr);
    let ws_stream = accept_async(stream)
        .await
        .expect("Error during the websocket handshake occurred");

    let (tx, rx) = unbounded::<Message>();
    state.lock().unwrap().insert(addr, tx);

    let (ws_sender, ws_receiver) = ws_stream.split();

    let broadcast_incoming = ws_receiver.try_for_each(|msg| {
        println!(
            "Received a message from {}: {}",
            addr,
            msg.to_text().unwrap()
        );
        let peers = state.lock().unwrap();
        let msg_str: &str = match &msg {
            Message::Text(text) => text,
            _ => "",
        };

        let v: serde_json::Value = match serde_json::from_str(&msg_str) {
            Ok(it) => it,
            Err(_) => serde_json::Value::Null,
        };

        // ws_sender.send(Message::Text(("helloo".into())));

        // We want to broadcast the message to everyone except ourselves.
        let broadcast_recipients = peers
            .iter()
            // .filter(|(peer_addr, _)| peer_addr != &&addr)
            .map(|(_, ws_sink)| ws_sink);

        for recp in broadcast_recipients {
            // recp.unbounded_send(msg.clone()).unwrap();
            if v["state"] == serde_json::Value::String("Join".to_string()) {
                println!("{}", "hello");
                let response_msg = Message::Text(
                    serde_json::to_string(&json!({
                        "state": "Connected",
                        "name": v["name"],
                    }))
                    .unwrap(),
                );
                recp.unbounded_send(response_msg).unwrap();
            } else if v["state"] == serde_json::Value::String("Chat".to_string()) {
                recp.unbounded_send(msg.clone()).unwrap();
            }
        }

        future::ok(())
    });

    let receive_from_others = rx.map(Ok).forward(ws_sender);
    pin_mut!(broadcast_incoming, receive_from_others);
    future::select(broadcast_incoming, receive_from_others).await;
    println!("{} disconnected", &addr);
    state.lock().unwrap().remove(&addr);
}

fn get_ip_user() -> String {
    let my_local_ip = local_ip().unwrap();
    let port: i32 = 6142;
    let host = format!("{}:{}", my_local_ip, port);
    return host;
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn create_server() {
    let host = get_ip_user();
    start_server(host).await;
}

#[tauri::command]
async fn get_ip() -> String {
    let host = get_ip_user();
    return host;
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![create_server, get_ip])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

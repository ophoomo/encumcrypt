// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use std::net::SocketAddr;
use futures_util::{SinkExt, StreamExt};
use local_ip_address::local_ip;
use serde_json::json;
use tokio::net::TcpListener;
use tokio::net::TcpStream;
use tokio_tungstenite::{accept_async, tungstenite::Message};

async fn start_server(host: String) {
    let try_socket = TcpListener::bind(&host).await;
    let listener: TcpListener = try_socket.expect("Failed to bind");

    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(handle_connection(stream, addr));
    }
}

async fn handle_connection(
    stream: TcpStream,
    addr: SocketAddr,
) {
    println!("Incoming TCP connection from: {}", addr);
    let ws_stream = accept_async(stream)
        .await
        .expect("Error during the websocket handshake occurred");

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    while let Some(Ok(msg)) = ws_receiver.next().await {
        match msg {
            Message::Text(text) => {
                let v: serde_json::Value = match serde_json::from_str(&text) {
                    Ok(it) => it,
                    Err(_) => return,
                };
                if v["state"] == serde_json::Value::String("Join".to_string()) {
                    let response_msg = Message::Text(
                        serde_json::to_string(&json!({
                            "state": "Connected",
                            "name": v["name"],
                        }))
                        .unwrap(),
                    );
                    let _ = ws_sender.send(response_msg).await;

                } else if v["state"] == serde_json::Value::String("Chat".to_string()) {
                    let _ = ws_sender.send(Message::Text(text.clone())).await;
                }
            }
            Message::Close(_) => {
                println!("IP Address {} Disconnedted", addr);
                break;
            }
            _ => {}
        }
    }
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

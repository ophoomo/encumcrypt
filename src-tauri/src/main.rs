// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::SocketAddr;

use local_ip_address::local_ip;
use tokio::net::{TcpStream, TcpListener};

async fn start_server(host: String) {
    let try_socket = TcpListener::bind(&host).await;
    let listener: TcpListener = try_socket.expect("Failed to bind");

    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(accept_connection(stream, addr));
    }
}

async fn accept_connection(stream: TcpStream, addr: SocketAddr) {
    println!("Incoming TCP connection from: {}", addr);

    let mut ws_stream = tokio_tungstenite::accept_async(stream)
        .await
        .expect("Error during the websocket handshake occurred");
    
    let (r, w) = ws_stream.get_mut().split();

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

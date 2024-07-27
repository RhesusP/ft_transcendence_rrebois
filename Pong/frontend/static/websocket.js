async function initializeWebSocket() {
    const response = await fetch('/get_ws_token/');
    const jwt = await response.json();
    if (response.ok) {
        const token = jwt.token
        console.log("token is :", token)
        const wsSelect = window.location.protocol === "https:" ? "wss://" : "ws://";
        const socket = new WebSocket(wsSelect + window.location.host + '/ws/user/' + token + '/');
        socket.onopen = function(e) {
            console.log("WebSocket connection established");
        };

        socket.onmessage = function(event) {
            console.log("Message from server:", event.data);
        };

        socket.onclose = function(event) {
            if (event.wasClean) {
                console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
                console.log('Connection died');
            }
            setTimeout(initializeWebSocket, 3000);
        };

        socket.onerror = function(error) {
            console.log(`WebSocket Error: ${error.message}`);
        };
    window.mySocket = socket; // to access as a global var
    }
}

// to try to reconnect on refresh
document.addEventListener('DOMContentLoaded', initializeWebSocket);
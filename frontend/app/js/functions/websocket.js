import {isUserConnected} from "./user_auth.js";
import ToastComponent from "@js/components/Toast.js";
import {getCookie} from "./cookie.js";
import { create_friend_div, create_friend_request_div, remove_friend_div } from "@js/functions/friends_management.js";

export async function initializeWebSocket() {
    return new Promise(async (resolve, reject) => {
        console.log("In Init WS FRONT")
        const response = await fetch('https://localhost:8443/get_ws_token/', {
            credentials: 'include',
        });
        const jwt = await response.json();
        const isUserAuth = await isUserConnected();
        if (isUserAuth) {
            const token = jwt.token
            console.log("In Init WS FRONT, USER AUTHENTICATED")
            const wsSelect = window.location.protocol === "https:" ? "wss://" : "ws://";
            const url = wsSelect + "localhost:8443" + '/ws/user/' + token + '/'
            console.log("url is:", url);
            const socket = new WebSocket(wsSelect + "localhost:8443" + '/ws/user/' + token + '/');

            socket.onopen = function (e) {
                console.log("WebSocket connection established");
                resolve(socket);
            };

            socket.onmessage = function (event) {
                console.log("Message from server:", event.data);
                const data = JSON.parse(event.data);
                if (data.type === 'status_change') {
                    // updateFriendStatus(data.user_id, data.status);
                    console.log("Status change detected");
                    handle_friend_status(socket, data);
                }
                if (data.type === 'test_message') {
                    console.log('Received test message:', data.message);
                }
                if (data.type === 'friend_request') {     // received friend request
                    console.log("Friend request received");
                    console.log("data is:", data);
                    handle_received_friend_request(socket, data);
                }
                if (data.type === 'friend_req_accept') {  // accept friend request
                    console.log("Friend request accepted");
                    handle_friend_req_accept(socket, data);
                    // load_friends_list(data);
                }
                if (data.type === 'friend_remove') {      // remove friend
                    console.log("Friend removed");
                    handle_friend_removed(socket, data);
                    // load_friends_list(data);
                }
                // TODO : handle friend request decline
                if (data.type === 'friend_delete_acc') {
                    console.log("Friend delete accepted");
                    // load_friends_list(data);
                }
                if (data.type === 'friend_data_edit') {
                    console.log("Friend data edit");
                    // load_friends_list(data);
                }
            };

            socket.onclose = function (event) {
                if (event.wasClean) {
                    console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
                } else {
                    console.log('Connection died');
                }
                setTimeout(initializeWebSocket, 2000);
            };

            socket.onerror = function (error) {
                console.log(`WebSocket Error: ${error.message}`);
                reject(error);
            };
            window.mySocket = socket; // to access as a global var
        }
         else {
            reject(new Error("User not authenticated"));
        }
    });
}

function handle_received_friend_request(socket, message) {
    console.log("socket is:", socket);
    console.log("message is:", message);

    const toast = new ToastComponent();
    toast.throwToast('received-friend-request', `You have received a new friend request`, 5000);
    create_friend_request_div(message);
}

function handle_friend_req_accept(socket, message){
    console.log("socket is:", socket);
    console.log("message is:", message);

    const toast = new ToastComponent();
    toast.throwToast('received-friend-request', `${message.from_user} Is now your friend !`, 5000);
    create_friend_div(message, message.from_user_id);
}

function handle_friend_removed(socket, message){
    console.log("socket is:", socket);
    console.log("message is:", message);

    const toast = new ToastComponent();
    toast.throwToast('received-friend-request', `${message.from_user} Is no longer your friend !`, 5000);
    remove_friend_div(message.from_user_id);
}

function handle_friend_status(socket, message){
    console.log("socket is:", socket);
    console.log("message is:", message);
    console.log("status change detected for user:", message.user_id, "new status is:", message.status);

    const friendStatus = document.getElementById(`friend-status-${message.user_id}`);
    const friendStatusText = document.getElementById(`friend-status-text-${message.user_id}`);
    console.log("friendStatus is:", friendStatus);
    console.log("friendStatusText is:", friendStatusText);
    if (friendStatus && friendStatusText) {
        friendStatus.classList.remove('bg-success', 'bg-danger');
        friendStatusText.innerText = message.status;
        if (message.status === 'online') {
            friendStatus.classList.add('bg-success');
        } else {
            friendStatus.classList.add('bg-danger');
        }
    }
}

//
// async function accept_friend_request(event) {
//     const button = event.target;
//     const userId = button.getAttribute('data-id');
//     console.log('click on accept button ', userId);
//     fetch ('https://localhost:8443/accept_friend', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-CSRFToken': getCookie('csrftoken')
//         },
//         credentials: 'include',
//         body: JSON.stringify({from_id: userId})
//     })
//         .then(response => response.json().then(data => ({ok: response.ok, data})))
//         .then(({ok, data}) => {
//             if (!ok) {
//                 const toastComponent = new ToastComponent();
//                 toastComponent.throwToast('Error', data.message || 'Something went wrong', 5000, 'error');
//             } else {
//                 const toastComponent = new ToastComponent();
//                 toastComponent.throwToast('Success', data.message || 'Friend request accepted', 5000);
//                 // handle_received_friend_request();
//             }
//         })
//         .catch(error => {
//             console.error('Error accepting friend request: ', error);
//             const toastComponent = new ToastComponent();
//             toastComponent.throwToast('Error', 'Network error or server is unreachable', 5000, 'error');
//         });
// }
//
// async function decline_friend_request(event){
//     const button = event.target;
//     const userId = button.getAttribute('data-id');
//    console.log('click on decline button ', userId);
// }
//
// async function handle_friend_req_accept(socket, data){
//     console.log("socket is:", socket);
//     console.log("message is:", message);
//
//     const toast = new ToastComponent();
//     toast.throwToast('received-friend-request', 'You have received a friend request', 5000);
// }
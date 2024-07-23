function initializeWebSocket() {
    const socket = new WebSocket('ws://' + window.location.host + '/ws/user/');

    socket.onopen = function(e) {
        console.log('WebSocket connection established');
    };

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log('Message from server:', data);
        // Handle incoming messages
    };

    socket.onclose = function(e) {
        console.log('WebSocket connection closed');
    };
    return socket;
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-pwd').value;

    fetch('login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(async data => {
        if (data.is_authenticated) {
            document.getElementById('divLoginForm').style.display = 'none';
            // document.getElementById('authenticatedContent').style.display = 'block';

            const response = await fetch('/get_ws_token/');
            const jwt = await response.json();
            if (response.ok) {
                const token = jwt.token
                const wsSelect = window.location.protocol === "https:" ? "wss://" : "ws://";
                const ws_url = wsSelect + window.location.host + '/ws/user/' + '?token=' + token;
                console.log('Attempting to connect to WebSocket at:', ws_url);
                const socket = new WebSocket(wsSelect + window.location.host + '/ws/user/' + '?token=' + token);
            } else {
                console.error('Failed to get WebSocket token');
                }

        } else if (data.otp_required) {
            showOTPForm(data.user_id);
        } else {
            alert(data.message || 'Login failed');
        }
    })
    .catch(error => console.error('Error:', error));
}

// function getCookie(name) {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     console.log("cookie is: ", value);
//     if (parts.length === 2) return parts.pop().split(';').shift();
// }

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        console.log("cookie is: ", cookies);
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showAuthenticatedContent(username) {
    const loginForm = document.getElementById('divLoginForm');
    const authenticatedContent = document.getElementById('authenticatedContent');

    if (loginForm) {
        loginForm.style.display = 'none';
    }

    if (authenticatedContent) {
        authenticatedContent.style.display = 'block';

    } else {
        console.error('Element with id "authenticated-content" not found');
    }
}

function showLoginForm() {
    const loginForm = document.getElementById('divLoginForm');
    const authenticatedContent = document.getElementById('authenticatedContent');

    // loginForm.innerHTML = `
    //     <form action="{% url 'login' %}" method="post"
    //           class="bg-white d-flex flex-column align-items-center py-2 px-5 rounded login-card"
    //           style="--bs-bg-opacity: .5;" id="loginForm">
    //         {% csrf_token %}
    //         <h1><a class="text-justify play-bold" href="{% url 'index' %}" >ft_transcendence 🏓</a></h1>
    //         <div class="w-100">
    //             <label for="login-username" class="visually-hidden">Username</label>
    //             <div class="input-group">
    //                 <div class="input-group-text">
    //                     <i class="bi bi-person"></i>
    //                 </div>
    //                 <input type="text" name="username" id="login-username" class="form-control" placeholder="username"
    //                        autofocus required/>
    //             </div>
    //         </div>
    //         <div class="w-100 text-end d-flex flex-column gap-1">
    //             <div>
    //                 <label for="login-pwd" class="visually-hidden">Password</label>
    //                 <div class="input-group">
    //                     <div class="input-group-text">
    //                         <i class="bi bi-lock"></i>
    //                     </div>
    //                     <input type="password" name="password" id="login-pwd" class="form-control" placeholder="••••••••"
    //                            required/>
    //                 </div>
    //             </div>
    //             <a href="" class="text-decoration-none" id="Alzheimer">Forgot password?</a>
    //         </div>
    //         <button type="submit" class="btn btn-primary">Log in</button>
    //         {% if login_error %}
    //         <div class="alert alert-danger" role="alert">
    //             {{ login_error }}
    //         </div>
    //         {% endif %}
    //         <div class="d-flex flex-row align-items-center w-100">
    //             <hr class="flex-grow-1">
    //             <span class="px-2">or</span>
    //             <hr class="flex-grow-1">
    //         </div>
    //         <a href="{% url 'login42' %}">
    //         <button type="button" class="btn btn-dark">
    //             <img height="32" width="32" src="https://cdn.simpleicons.org/42/fff" alt="42 school logo"
    //                  style="margin-right: 10px"/>
    //             Sign in with your 42 account
    //         </button>
    //         </a>
    //         <a href="{% url 'register' %}" class="text-decoration-none">Don't have an account? Register here.</a>
    //     </form>
    // `;

    if (loginForm) {
        loginForm.style.display = 'block';
    } else {
        console.error('Element with id "login-form" not found');
    }

    if (authenticatedContent) {
        authenticatedContent.style.display = 'none';
    }
}

function initializeApp() {
    fetch('login', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.is_authenticated) {
            showAuthenticatedContent();
            initializeWebSocket();
        } else {
            showLoginForm();
        }
    })
    .catch(error => console.error('Error:', error));

    const loginForm = document.getElementById('divLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found');
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

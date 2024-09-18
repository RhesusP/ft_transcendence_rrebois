import { getCookie } from "@js/functions/cookie.js";
import ToastComponent from "@js/components/Toast.js";
import {create_previous_avatar_div} from "../functions/create.js";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {appRouter} from "@js/spa-router/initializeRouter.js";

export default class Navbar {
	constructor(user = null) {
		this.user = user;
		this.setUser = this.setUser.bind(this);
	}

	setUser(user) {
		this.user = user;
	}

	logoutUser = async (event) => {
		event.preventDefault();
		const csrfToken = getCookie('csrftoken');
		fetch('https://localhost:8443/logout', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken
			},
			credentials: 'include'
		}).then(response => {
			console.log('Logout response:', response);
			appRouter.navigate('/');
			if (window.mySocket && window.mySocket.readyState === WebSocket.OPEN) {
				window.mySocket.close();
				console.log('WebSocket connection closed');
			}
		}).catch(error => {
			console.error('Logout error:', error);
			const toastComponent = new ToastComponent();
			toastComponent.throwToast('Error', 'Network error or server is unreachable', 5000, 'error');
		})
	}

	changeAvatar = (event) => {
		event.preventDefault();
		const newImage = document.getElementById("profile-picture").files[0];
		const formData = new FormData();
		formData.append('newAvatar', newImage);
		const saveBtn = document.getElementById("save-avatar-btn");
		if (saveBtn)
			saveBtn.disabled = true;
		const csrfToken = getCookie('csrftoken');
		fetch('https://localhost:8443/uploadAvatar', {
			method: 'POST',
			headers: {
				'X-CSRFToken': csrfToken
			},
			credentials: "include",
			body: formData
		})
		.then(response => response.json().then(data => ({ok: response.ok, data})))
		.then(({ok, data}) => {
			if (!ok) {
				const toastComponent = new ToastComponent();
				toastComponent.throwToast('Error', data.message || 'Something went wrong', 5000, 'error');
				saveBtn.disabled = false;
			} else {
				sessionStorage.setItem('toastMessage', JSON.stringify({
					title: 'Success',
					message: data.message,
					duration: 5000,
					type: 'success'
				}));
				saveBtn.disabled = false;
				if (data.redirect) {
					window.location.href = data.redirect_url;
				}
			}
		})
		.catch(error => {
			console.error('Error:', error);
			const toastComponent = new ToastComponent();
			toastComponent.throwToast('Error', 'Network error or server is unreachable', 5000, 'error');
			saveBtn.disabled = false;
		})
	}

	loadPreviousAvatar() {
		fetch("https://localhost:8443/getAllTimeUserAvatars", {
			method: "GET",
			credentials: "include"
		})
		.then(response => response.json().then(data => ({ok: response.ok, data})))
		.then(({ok, data}) => {
			console.log("Data: ", data);
			if (!ok) {
				if (data.message === "superuser") {
					return;
				}
				const toastComponent = new ToastComponent();
				toastComponent.throwToast("Error", data.message || "Something went wrong", 5000, "error");
			} else {
				data.map(avatar => {
					create_previous_avatar_div(avatar, this.change_previous_avatar.bind(this));
				});
			}
		})
		.catch(error => {
			console.error("Error fetching previous avatars: ", error);
			const toastComponent = new ToastComponent();
			toastComponent.throwToast("Error", "Network error or server is unreachable", 5000, "error");
		});
	}

	change_previous_avatar(avatarId) {
		const csrfToken = getCookie('csrftoken');
		
		fetch('https://localhost:8443/setPreviousAvatar', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken
			},
			credentials: 'include',
			body: JSON.stringify({ avatar_id: avatarId })
		})
		.then(response => response.json().then(data => ({ok: response.ok, data})))
		.then(({ok, data}) => {
			if (!ok) {
				const toastComponent = new ToastComponent();
				toastComponent.throwToast('Error', data.message || 'Something went wrong', 5000, 'error');
			} else {
				const currentAvatar = document.querySelector(".navbar img.rounded-circle");
				if (currentAvatar) {
					currentAvatar.src = data.new_avatar_url;
				}
				const modalAvatar = document.querySelector("#update-user-picture img.rounded-circle");
				if (modalAvatar) {
					modalAvatar.src = data.new_avatar_url;
				}
				sessionStorage.setItem('toastMessage', JSON.stringify({
					title: 'Success',
					message: data.message,
					duration: 5000,
					type: 'success'
				}));
				if (data.redirect) {
					window.location.href = data.redirect_url;
				}
			}
		})
		.catch(error => {
			console.error('Error:', error);
			const toastComponent = new ToastComponent();
			toastComponent.throwToast('Error', 'Network error or server is unreachable', 5000, 'error');
		});
	}
	

	render() {
		return `
			<nav class="navbar navbar-expand-lg w-full bg-light">
				<div class="container-fluid">
					<a href="/dashboard" route="/dashboard" class="navbar-brand play-bold">ft_transcendence 🏓</a>
					<div class="d-flex align-items-center">
						${(this.user?.stud42 || this.user?.username === "superuser") ?
							`<img src="${this.user?.image_url}" class="rounded-circle h-40 w-40 me-2" alt="avatar">` :
							`<a role="button" data-bs-toggle="modal" data-bs-target="#update-user-picture" title="Update your profile picture !" data-bs-toggle="tooltip">
								<img src="${this.user?.image_url}" class="rounded-circle h-40 w-40 me-2" alt="avatar">
							</a>`
						}
						<div class="dropdown">
							<button class="btn dropdown-toggle d-flex align-items-center" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
								<p class="d-none d-md-block mb-0 me-2">${this.user?.username}</p>
							</button>
							<ul class="dropdown-menu dropdown-menu-end">
								<li><a class="dropdown-item" route="/my-profile" href="/my-profile">My profile</a></li>
								<li><a class="dropdown-item" route="/stats/${this.user?.username}" href="/stats/${this.user?.username}">My stats</a></li>
								<li><a class="dropdown-item" route="/friends" href="/friends">Friends</a></li>
								<li><hr class="dropdown-divider"></li>
								<li><a role="button" id="logout-btn" class="dropdown-item text-danger">Logout</a></li>
							</ul>
						</div>
					</div>
				</div>
				<!--	MODAL PART		-->
				<div class="modal fade" id="update-user-picture" tabindex="-1" aria-labelledby="create match modal" aria-hidden="true">
					<div class="modal-dialog">
						<div class="modal-content">
							<div class="modal-header">
								<h1 class="modal-title fs-5">Update your profile picture</h1>
								<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
							</div>
							<div class="modal-body">
								<p class="play-bold">Your current avatar</p>
								<img src="${this.user?.image_url}" class="rounded-circle h-128 w-128" alt="avatar">
								<div>
									<p class="play-bold mt-1">Select one of your previous avatars</p>
									<!-- Previous profile pictures to load here -->
									<div class="d-flex" id="previous-pp-list">
									</div>
								</div>
								<hr />
								<div class="row g-2">
									<label for="profile-picture" class="form-label play-bold">Or upload a new one</label>
									<input type="file" id="profile-picture" accept=".png, .jpg, .jpeg" class="form-control" />
									<div class="form-text">Supported format: <code>png</code>, <code>jpg</code> and <code>jpeg</code></div>
								<div class="invalid-feedback">test</div>
							</div>
						</div>
							<div class="modal-footer">
								<button type="button" class="btn text-danger" data-bs-dismiss="modal">Close</button>
								<button type="button" id="save-avatar-btn" class="btn btn-primary">Save changes</button>
							</div>
						</div>
					</div>
				</div>
			</nav>
		`;
	}

	setupEventListeners() {
		const logout = document.getElementById('logout-btn');
		if (logout) {
			logout.addEventListener('click', this.logoutUser);
		}
		// Initialize Bootstrap tooltips
		const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
		const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
			return new bootstrap.Tooltip(tooltipTriggerEl);
		});
		const saveAvatarBtn = document.getElementById("save-avatar-btn");
		if (saveAvatarBtn){
			saveAvatarBtn.addEventListener("click", this.changeAvatar);
		}
		this.loadPreviousAvatar();
	}
}

import {getCookie} from "@js/functions/cookie.js";
import ToastComponent from "@js/components/Toast.js";
import {appRouter} from "@js/spa-router/initializeRouter.js";
import * as bootstrap from "bootstrap";
import {applyFontSize} from "../functions/display.js";

export default class Dashboard {
	constructor(props) {
		this.props = props;
		this.handleGameRequest = this.handleGameRequest.bind(this);
		this.user = null;
		this.setUser = this.setUser.bind(this);
		this.pongGameConnectivity = 'offline';
		this.pongGameNbPlayers = 'bot';
		this.purrinhaGameConnectivity = 'offline';
		this.purrinhaGameNbPlayers = 'bot';
	}

	setUser(user) {
		this.user = user;
	}

	setProps(newProps) {
		this.props = newProps;
	}

	getGameCode = (nb_players) => {
		let code = null;
		switch (nb_players) {
			case 'bot':
				code = '10';
				break;
			case 'offline-1v1':
				code = '20';
				break;
			case 'online-1v1':
				code = '22';
				break;
			case 'online-2v2':
				code = '40';
				break;
			default:
				code = null;
		}
		return code;
	}

	handleGameRequest = (game_type) => {
		let code = null;
		if (game_type === 'pong') {
			code = this.getGameCode(this.pongGameNbPlayers);
		} else {
			code = this.getGameCode(this.purrinhaGameNbPlayers);
		}
		if (!code || !game_type) {
			return;
		}
		const csrfToken = getCookie('csrftoken');
		fetch(`https://${window.location.hostname}:8443/game/${game_type}/${code}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken
			},
			credentials: 'include'
		})
			.then(response => response.json().then(data => ({ok: response.ok, data})))
			.then(({ok, data}) => {
				if (!ok) {
					const toastComponent = new ToastComponent();
					toastComponent.throwToast("Error", data.message || "Something went wrong", 5000, "error");
				} else {
					console.log("Game request success: ", data);
					data.code = code;
					const params = new URLSearchParams(data).toString();
					// Close modal
					const createMatchModal = bootstrap.Modal.getInstance(document.getElementById('create-match-modal'));
					if (createMatchModal)
						createMatchModal.hide();
					appRouter.navigate(`/${game_type}?${params}`);
				}
			})
			.catch(error => {
				console.error("Error fetching friend requests: ", error);
				const toastComponent = new ToastComponent();
				toastComponent.throwToast("Error", "Network error or server is unreachable", 5000, "error");
			});
	}

	setupEventListeners() {
		const pong_modal = document.getElementById('create-pong-match-modal');
		if (pong_modal) {
			pong_modal.addEventListener('show.bs.modal', (event) => {
				// Handle game request
				const pongGameRequestBtn = document.getElementById('pong-game-request-btn');
				if (pongGameRequestBtn) {
					if (!pongGameRequestBtn.hasAttribute('data-listener')) {
						pongGameRequestBtn.addEventListener('click', () => this.handleGameRequest('pong'));
						pongGameRequestBtn.setAttribute('data-listener', 'true');
					}
				}
				// Get initial number of players options
				const nbPlayersContainer = document.querySelectorAll('input[name="pong-nb-players"]');
				nbPlayersContainer.forEach(radio => {
					radio.addEventListener('change', (event) => {
						this.pongGameNbPlayers = event.target.value;
					});
				});
				// Update number of players options depending on game connectivity (local / offline)
				const connectivityRadios = document.querySelectorAll('input[name="pong-connectivity"]');
				connectivityRadios.forEach(radio => {
					radio.addEventListener('change', (event) => {
						const connectivityValue = this.pongGameConnectivity = event.target.value;
						const nbPlayersContainer = document.getElementById('pong-radio-btn-players-container');
						if (nbPlayersContainer) {
							nbPlayersContainer.innerHTML = '';
							if (connectivityValue === 'offline') {
								this.pongGameNbPlayers = 'bot';
								nbPlayersContainer.innerHTML = `
                                    <input type="radio" class="btn-check" name="pong-nb-players" id="pong-radio-btn-offline-bot" value="bot" autocomplete="off" checked>
                                    <label class="btn btn-outline-primary" for="pong-radio-btn-offline-bot">
                                        <i class="bi bi-robot"></i>
                                        <p>1v1 against a bot</p>
                                    </label>
                                    <input type="radio" class="btn-check" name="pong-nb-players" id="pong-radio-btn-offline-1v1" value="offline-1v1" autocomplete="off">
                                    <label class="btn btn-outline-primary" for="pong-radio-btn-offline-1v1">
                                        <i class="bi bi-keyboard"></i>
                                        <p>1v1 on the same keyboard</p>
                                    </label>
                                   `;
								const nbPlayersRadios = document.querySelectorAll('input[name="pong-nb-players"]');
								nbPlayersRadios.forEach(radio => {
									radio.addEventListener('change', (event) => {
										this.pongGameNbPlayers = event.target.value;
									});
								});
							} else {
								this.pongGameNbPlayers = 'online-1v1';
								nbPlayersContainer.innerHTML = `
                                    <input type="radio" class="btn-check" name="pong-nb-players" id="pong-radio-btn-online-1v1" value="online-1v1" autocomplete="off" checked>
                                    <label class="btn btn-outline-primary" for="pong-radio-btn-online-1v1">
                                        <i class="bi bi-person"></i>
                                        <p>1v1</p>
                                    </label>

                                    <input type="radio" class="btn-check" name="pong-nb-players" id="pong-radio-btn-online-2v2" value="online-2v2" autocomplete="off">
                                    <label class="btn btn-outline-primary" for="pong-radio-btn-online-2v2">
                                        <i class="bi bi-people"></i>
                                        <p>2v2</p>
                                    </label>
                                   `;
								const nbPlayersRadios = document.querySelectorAll('input[name="pong-nb-players"]');
								nbPlayersRadios.forEach(radio => {
									radio.addEventListener('change', (event) => {
										this.pongGameNbPlayers = event.target.value;
									});
								});
							}
						}
					});
				});
			});
			applyFontSize();
		}

		const purrinha_modal = document.getElementById('create-purrinha-match-modal');
		if (purrinha_modal) {
			purrinha_modal.addEventListener('show.bs.modal', (event) => {
				// Handle game request
				const purrinhaGameRequestBtn = document.getElementById('purrinha-game-request-btn');
				if (purrinhaGameRequestBtn) {
					if (!purrinhaGameRequestBtn.hasAttribute('data-listener')) {
						purrinhaGameRequestBtn.addEventListener('click', () => this.handleGameRequest('purrinha'));
						purrinhaGameRequestBtn.setAttribute('data-listener', 'true');
					}
				}
				// Get initial number of players options
				const nbPlayersContainer = document.querySelectorAll('input[name="purrinha-nb-players"]');
				nbPlayersContainer.forEach(radio => {
					radio.addEventListener('change', (event) => {
						this.purrinhaGameNbPlayers = event.target.value;
					});
				});
				// Update number of players options depending on game connectivity (local / offline)
				const connectivityRadios = document.querySelectorAll('input[name="purrinha-connectivity"]');
				connectivityRadios.forEach(radio => {
					radio.addEventListener('change', (event) => {
						const connectivityValue = this.purrinhaGameConnectivity = event.target.value;
						const nbPlayersContainer = document.getElementById('purrinha-radio-btn-players-container');
						if (nbPlayersContainer) {
							nbPlayersContainer.innerHTML = '';
							if (connectivityValue === 'offline') {
								this.purrinhaGameNbPlayers = 'bot';
								nbPlayersContainer.innerHTML = `
                                    <input type="radio" class="btn-check" name="purrinha-nb-players" id="purrinha-radio-btn-offline-bot" value="bot" autocomplete="off" checked>
                                    <label class="btn btn-outline-primary" for="purrinha-radio-btn-offline-bot">
                                        <i class="bi bi-robot"></i>
                                        <p>1v1 against a bot</p>
                                    </label>
                                   `;
								const nbPlayersRadios = document.querySelectorAll('input[name="purrinha-nb-players"]');
								nbPlayersRadios.forEach(radio => {
									radio.addEventListener('change', (event) => {
										this.purrinhaGameNbPlayers = event.target.value;
									});
								});
							} else {
								this.purrinhaGameNbPlayers = 'online-1v1';
								nbPlayersContainer.innerHTML = `
                                    <input type="radio" class="btn-check" name="purrinha-nb-players" id="purrinha-radio-btn-online-1v1" value="online-1v1" autocomplete="off" checked>
                                    <label class="btn btn-outline-primary" for="purrinha-radio-btn-online-1v1">
                                        <i class="bi bi-person"></i>
                                        <p>1v1</p>
                                    </label>

                                    <input type="radio" class="btn-check" name="purrinha-nb-players" id="purrinha-radio-btn-online-2v2" value="online-2v2" autocomplete="off">
                                    <label class="btn btn-outline-primary" for="purrinha-radio-btn-online-2v2">
                                        <i class="bi bi-people"></i>
                                        <p>2v2</p>
                                    </label>
                                   `;
								const nbPlayersRadios = document.querySelectorAll('input[name="purrinha-nb-players"]');
								nbPlayersRadios.forEach(radio => {
									radio.addEventListener('change', (event) => {
										this.purrinhaGameNbPlayers = event.target.value;
									});
								});
							}
						}
					});
				});
			});
		}
	}


	render() {
		document.title = "ft_transcendence";
		return `
		<div class="d-flex w-75 min-h-full flex-grow-1 justify-content-center align-items-center">
            <div class="h-100 w-full d-flex flex-column justify-content-center align-items-center px-5" style="gap: 16px;">
            	<div class="d-flex flex-row justify-content-center w-full" style="gap: 16px">
            		<!-- Pong game -->
            		<div class="w-full bg-white d-flex flex-column align-items-center py-2 px-5 rounded gap-3" style="--bs-bg-opacity: .5;">
            			<p class="play-bold title">Pong 🏓</p>
            			<div class="d-flex flex-column justify-content-center align-items-center gap-3 w-full">
            				<button type="button" class="btn d-flex justify-content-center align-items-center w-fit px-4 py-1 play-btn" data-bs-toggle="modal" data-bs-target="#create-pong-match-modal" style="background-color: #3b82f6">
            					<p class="play-regular cta-text m-0 play-btn-text text-white">Play</p>
							</button>
            			</div>
					</div>

            		<!-- Purrinha game -->
            		<div class="w-full bg-white d-flex flex-column align-items-center py-2 px-5 rounded gap-3" style="--bs-bg-opacity: .5;">
            			<p class="play-bold title">Purrinha ✋</p>
            			<div class="d-flex flex-column justify-content-center align-items-center gap-3 w-full">
            				<button type="button" class="btn d-flex justify-content-center align-items-center w-fit px-4 py-1 play-btn" data-bs-toggle="modal" data-bs-target="#create-purrinha-match-modal" style="background-color: #3b82f6">
            					<p class="play-regular cta-text m-0 play-btn-text text-white">Play</p>
							</button>
            			</div>
					</div>
            	</div>

            	<!-- Tournament -->
            	<div class="w-full bg-white d-flex flex-column align-items-center py-2 px-5 rounded" style="--bs-bg-opacity: .5;">
            		<p class="play-bold title">Tournament</p>
            		<div class="d-flex">
            			<div class="d-flex flex-column justify-content-center">
            				<label for="tournament-id">Join a tournament</label>
            				<div class="input-group mb-3">
								<input type="text" class="form-control" id="tournament-id" placeholder="XXX-XXX-XXX" aria-label="Tournament ID">
								<div class="input-group-append">
									<button class="btn btn-primary" type="button">Join</button>
								</div>
							</div>
						</div>
						<div class="d-flex flex-column justify-content-center align-items-center">
							<button type="button" class="btn d-flex justify-content-center align-items-center w-fit px-4 py-1 play-btn" style="background-color: #3b82f6">
								<i class="bi bi-plus-circle"></i>
								<p class="play-regular text m-0 play-btn-text text-white">Create a tournament</p>
							</button>
						</div>
					</div>
            	</div>

				<!--	Pong modal	-->
				<div class="modal fade" id="create-pong-match-modal" tabindex="-1" aria-labelledby="create pong match modal" aria-hidden="true">
					<div class="modal-dialog">
						<div class="modal-content">
							<div class="modal-header">
								<h1 class="modal-title title">Play pong 🏓</h1>
								<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
							</div>
							<div class="modal-body">
								<div class="mb-3">
									<p class="text mb-1">Choose a game type</p>
									<div class="btn-group" role="group" aria-label="Game connectivity selection">
										<input type="radio" class="btn-check" name="pong-connectivity" id="pong-radio-btn-offline" value="offline" autocomplete="off" checked>
										<label class="btn btn-outline-primary" for="pong-radio-btn-offline">
											<i class="bi bi-wifi-off"></i>
											<p>Local</p>
										</label>
										<input type="radio" class="btn-check" name="pong-connectivity" id="pong-radio-btn-online" value="online" autocomplete="off">
										<label class="btn btn-outline-primary" for="pong-radio-btn-online">
											<i class="bi bi-wifi"></i>
											<p>Online</p>
										</label>
									</div>
								</div>
								<div class="mb-3">
									<p class="text mb-1">Choose a number of players</p>
									<div id="pong-radio-btn-players-container" class="btn-group" role="group" aria-label="Game connectivity selection">
										<input type="radio" class="btn-check" name="pong-nb-players" id="pong-radio-btn-offline-bot" value="bot" autocomplete="off" checked>
										<label class="btn btn-outline-primary" for="pong-radio-btn-offline-bot">
											<i class="bi bi-robot"></i>
											<p>1v1 against a bot</p>
										</label>
										<input type="radio" class="btn-check" name="pong-nb-players" id="pong-radio-btn-offline-1v1" value="offline-1v1" autocomplete="off">
										<label class="btn btn-outline-primary" for="pong-radio-btn-offline-1v1">
											<i class="bi bi-keyboard"></i>
											<p>1v1 on the same keyboard</p>
										</label>
									</div>
								</div>
							</div>
							<div class="modal-footer">
								<button type="button" class="btn text-danger" data-bs-dismiss="modal">Close</button>
								<button id="pong-game-request-btn" type="button" class="btn btn-primary">Launch a game! 🚀</button>
							</div>
						</div>
					</div>
				</div>

				<!--	Purrinha modal	-->
				<div class="modal fade" id="create-purrinha-match-modal" tabindex="-1" aria-labelledby="create purrinha match modal" aria-hidden="true">
					<div class="modal-dialog">
						<div class="modal-content">
							<div class="modal-header">
								<h1 class="modal-title title">Play purrinha ✋</h1>
								<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
							</div>
							<div class="modal-body">
								<div class="mb-3">
									<p class="text mb-1">Choose a game type</p>
									<div class="btn-group" role="group" aria-label="Game connectivity selection">
										<input type="radio" class="btn-check" name="purrinha-connectivity" id="purrinha-radio-btn-offline" value="offline" autocomplete="off" checked>
										<label class="btn btn-outline-primary" for="purrinha-radio-btn-offline">
											<i class="bi bi-wifi-off"></i>
											<p>Local</p>
										</label>
										<input type="radio" class="btn-check" name="purrinha-connectivity" id="purrinha-radio-btn-online" value="online" autocomplete="off">
										<label class="btn btn-outline-primary" for="purrinha-radio-btn-online">
											<i class="bi bi-wifi"></i>
											<p>Online</p>
										</label>
									</div>
								</div>
								<div class="mb-3">
									<p class="text mb-1">Choose a number of players</p>
									<div id="purrinha-radio-btn-players-container" class="btn-group" role="group" aria-label="Game connectivity selection">
										<input type="radio" class="btn-check" name="purrinha-nb-players" id="purrinha-radio-btn-offline-bot" value="bot" autocomplete="off" checked>
										<label class="btn btn-outline-primary" for="purrinha-radio-btn-offline-bot">
											<i class="bi bi-robot"></i>
											<p>1v1 against a bot</p>
										</label>
									</div>
								</div>
							</div>
							<div class="modal-footer">
								<button type="button" class="btn text-danger" data-bs-dismiss="modal">Close</button>
								<button id="purrinha-game-request-btn" type="button" class="btn btn-primary">Launch a game! 🚀</button>
							</div>
						</div>
					</div>
				</div>
            </div>
        `;
	}
}
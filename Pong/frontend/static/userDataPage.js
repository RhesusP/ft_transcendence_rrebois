document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', event => {
        const element = event.target;
        const addDiv = document.createElement('div');
            setAttributes(addDiv, {'id': element.parentElement.id + 'expand'});

        if (element.classList.contains('fa-eye') || element.classList.contains('fa-eye-slash')) {
            const addDiv = document.createElement('div');
            setAttributes(addDiv, {'id': element.parentElement.id + 'expand'});

            if (element.classList.contains("shrink"))
            {
                // fetch for the scoreboard
                fetch(`match/${element.parentElement.id}`)
                .then(response => response.json())
                .then(data => { // if we do 3v3 and or 4v4 create API to display all games, or only 3v3 or 4v4
                    let j = Math.round((100 / `${data.count}`));

                    for (let i = 0; i < `${data.count}`; i++)
                    {
                        const   subDiv = document.createElement('div');
                        const   subDivChild1 = document.createElement('div');
                        const   subDivChild2 = document.createElement('div');

                        subDivChild1.innerHTML = `${Object.keys(data.players)[i]}`;
                        subDivChild1.style.textDecoration = "underline";
                        subDivChild1.style.width = "100%";

                        // Check if already on username profile, if so, do not reload username profile page, else do it
                        const titleText = document.getElementsByName("top")[0].textContent.split(" ");
                        let found = false;
                        for (let j = 0; j < titleText.length; j++)
                            if (titleText[j] === `${Object.keys(data.players)[i]}`)
                                found = true;

                        // If user not same username, allows to jump to user profile
                        if (!found) {
                            // Add link to user profile
                            subDivChild1.addEventListener('click', () => {
                                load_stats_page(`${Object.keys(data.players)[i]}`);
                            })
                        }

                        subDivChild2.innerHTML = `${Object.values(data.players)[i]}`;
                        subDivChild2.style.width = "100%";

                        subDiv.append(subDivChild1, subDivChild2);
                        if (`${Object.keys(data.players)[i]}` === `${data.winner}`) {
                            subDiv.classList.add("matchWonSub");
                            subDiv.style.width = `${j}%`;
                        }
                        else {
                            subDiv.classList.add("matchLostSub");
                            subDiv.style.width = `${j}%`;
                        }
                        addDiv.append(subDiv);
                    }
                })
                .catch (error => {
                // add error message
                })
                element.className = "fa-solid fa-eye-slash expander";
                element.parentElement.append(addDiv);
            }
            else if (element.classList.contains("expander")){
                element.className = "fa-solid fa-eye shrink";
                const test = document.getElementById(element.parentElement.id + 'expand')
                test.remove();
            }
            event.preventDefault();
        }
        else if (element.id === "statsPage" || element.id === "profile" || element.id === "userImg" ||
                element.id === "friendsPage") {
            fetch("/getUsernameConnected")
            .then(response => response.json())
            .then(username => {
                if (element.id === "statsPage")
                    load_stats_page(username);
                else if (element.id === "profile")
                    load_profile_page(username);
                else if (element.id === "friendsPage")
                    load_friends_page(username);
                else
                    load_change_profile_pic(username);
            })
            event.preventDefault();
        }
        else {
            if (!element.classList.contains('profilePicShadowBox')) {
                if (document.getElementById('profilePic') !== null) {
                    document.getElementById('profilePic').innerHTML = "";
                    document.getElementById('profilePic').display = "none";
                    document.getElementById('profilePic').classList.remove("profilePicShadowBox");
                }
            }
        }
    })
    const mainPage = document.getElementById('mainPage');
    if (mainPage != null)
        mainPage.addEventListener('click', () => {
            load_main_page();
        });
})

function    load_change_profile_pic(username) {
    const   picDiv = document.getElementById("profilePic");
    picDiv.innerHTML = "";
    picDiv.style.display = "block";
    picDiv.classList.add("profilePicShadowBox");

    // Title div
    const   title = document.createElement("div");
    title.innerHTML = "Change your avatar";
    title.className = "title_div gradient-background";
    title.setAttribute("name", "top");
    picDiv.append(title);

    // Current profile image
    fetch(`user/${username}/information`)
    .then(response => response.json())
    .then(data => {console.log(data);

        const   divImages = document.createElement("div");
        const   currentImgTitle = document.createElement("div");
        const   currentImg = document.createElement("img");

        // Current avatar
        currentImgTitle.innerHTML = "Current avatar";
        setAttributes(currentImg, {"src": `${data.img}`, "alt": "avatar", "id": "currentImg"});

        divImages.append(currentImgTitle, currentImg);
        picDiv.append(divImages);

        // Available avatars
        fetch("media/")
        .then(response => response.json())
        .then(pics => {
            console.log(pics);
        })
    })
    .catch (err => {
        displayMessage(err, "danger");
    });
}

function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

function create_div_title(username, str, divName) {
    document.getElementById(divName).innerHTML = "";
    const   title = document.createElement('div');
    title.innerHTML = username + " " + str;

    // Add CSS to created div
    title.className = "title_div gradient-background";
    title.setAttribute("name", "top");

    document.querySelector(`#${divName}`).append(title);
}

function    create_add_friend_icon() {
    // Create button if user connected looking at other user's stats page
    const checkUsers = document.getElementsByName("top")[0].textContent.split(" ");
    let userMatch = false;
    for (let j = 0; j < checkUsers.length; j++)
        if (checkUsers[j] === document.getElementById("ownUsername").textContent.trim())
            userMatch = true;

// Common to all results??
const   mainFriend = document.createElement("div");
mainFriend.setAttribute("class", "mainFriendDiv");
const   friendTxt = document.createElement("span");
//friendTxt.innerHTML = "Send friend request "

    fetch("get_friends")
    .then(response => response.json())
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < checkUsers.length; j++) {
                if (checkUsers[j] === data[i].username) {
                    const friendItem = document.createElement('div');
                    friendItem.classList.add('friendPage', 'list-group-item', 'list-group-item-action', 'bg-white',
                        'login-card', 'd-flex', 'py-2', 'px-5', 'rounded');
                    friendItem.style.cssText = '--bs-bg-opacity: .5; margin-bottom: 15px; justify-content: space-between; width: 50%; ' +
                        'display: block; margin-left: auto; margin-right: auto';
                    friendItem.innerHTML = `User in your friend list
                        <p class="roundBorder nav-item friendImg" style="/*display: flex*/">
                            <img src="media/${data[i].image}" alt="avatar">
                        </p>
                        <p class="mb-1" style="display: flex">${data[i].username}</p>
                        <p class="mb-1" style="display: flex">Status: ${data[i].status}</p>
                        `;
                    document.querySelector("#statsDiv").append(friendItem);



//                    friendTxt.innerHTML = "User already in friend list";
//                    mainFriend.append(friendTxt, friendReq);
//                    document.querySelector("#statsDiv").append(mainFriend);
                    return;
                }
            }
        }
        console.log(data);
    })
    .catch(error => console.error('Error fetching friend list: ', error));
//    if (!userMatch) {
////        const   mainFriend = document.createElement("div");
////        mainFriend.setAttribute("class", "mainFriendDiv");
////        const   friendTxt = document.createElement("span");
//        friendTxt.innerHTML = "Send friend request "
//        const   friendReq = document.createElement("span");
//        friendReq.className = "fa-solid fa-user-plus";
//        friendReq.setAttribute("if", "addFriend");
//
//        const   referenceTitle = document.getElementsByName("top");
//        mainFriend.append(friendTxt, friendReq);
//        document.querySelector("#statsDiv").append(mainFriend);
//
//        // add event listener to friendReq
//        friendReq.addEventListener("click", () => {
//
//        });
//    }
}

function    load_stats_page(username) {
    // Hides main page elements and display user stats elements:
    document.getElementById('greetings').style.display = 'none';
    document.getElementById('userDataDiv').style.display = 'none';
    document.getElementById('userDataDiv').innerHTML = "";
    document.getElementById('profilePic').style.display = 'none';
    document.getElementById('profilePic').innerHTML = "";
    document.getElementById('friendsDiv').style.display = 'none';
    document.getElementById('friendsDiv').innerHTML = "";
    document.getElementById('statsDiv').style.display = 'block';
    document.getElementById('statsDiv').innerHTML = "";

    create_div_title(username, "game stats", "statsDiv");
    create_add_friend_icon();

    // Create radio button groups to display both game data or pong data or purrinha data
    const   radioDiv = document.createElement('div');
    radioDiv.style.textAlign = 'center';
    radioDiv.style.margin = '10px 0px';
    const   radioSubDiv1 = document.createElement('div');
    const   radioSubDiv2 = document.createElement('div');
    const   radioSubDiv3 = document.createElement('div');
    radioSubDiv1.className = "form-check form-check-inline";
    radioSubDiv2.className = "form-check form-check-inline";
    radioSubDiv3.className = "form-check form-check-inline";

    const   radioInput1 = document.createElement('input');
    const   radioInput2 = document.createElement('input');
    const   radioInput3 = document.createElement('input');
    setAttributes(radioInput1, {'class': 'form-check-input', 'type': 'checkbox', 'name': 'radioBtn', 'id': 'radio1', 'value': 'pong'});
    setAttributes(radioInput2, {'class': 'form-check-input', 'type': 'checkbox', 'name': 'radioBtn', 'id': 'radio2', 'value': 'all'});
    radioInput2.checked = true;
    setAttributes(radioInput3, {'class': 'form-check-input', 'type': 'checkbox', 'name': 'radioBtn', 'id': 'radio3', 'value': 'purrinha'});

    const   radioLabel1 = document.createElement('label');
    const   radioLabel2 = document.createElement('label');
    const   radioLabel3 = document.createElement('label');
    setAttributes(radioLabel1, {'class': 'form-check-label'});
    radioLabel1.textContent = "Pong stats";
    setAttributes(radioLabel2, {'class': 'form-check-label'});
    radioLabel2.textContent = "Both games stats";
    setAttributes(radioLabel3, {'class': 'form-check-label'});
    radioLabel3.textContent = "Purrinha stats";

    radioSubDiv1.append(radioInput1, radioLabel1);
    radioSubDiv2.append(radioInput2, radioLabel2);
    radioSubDiv3.append(radioInput3, radioLabel3);
    radioDiv.append(radioSubDiv1, radioSubDiv2, radioSubDiv3);
    setAttributes(radioDiv, {'id': 'radioDiv'});
    document.querySelector('#statsDiv').append(radioDiv);

    // Calculate width depending on how many stats divs are displayed
    let   widthValue = 1;
    let widthV = (Math.round(100 / widthValue) - 2);

    // By default, display all data chart and info
    fetch(`stats/${username}`)
    .then(response => response.json())
    .then(values => {
        // Create main div to display stats of selected checkbox
        const   mainDivStats = document.createElement('div');
        setAttributes(mainDivStats, {'id': 'divall', 'class': 'mainDivStats'});
        mainDivStats.style.width = `${widthV}%`;

        // create other div to display elo
        const   stat = document.createElement('div');
        const   statEloPong = document.createElement('div');
        statEloPong.classList.add("divElo");
        statEloPong.innerHTML = "Pong current elo / highest: " + values['elo_pong'] + " / " + values['elo_highest'][0];
        stat.append(statEloPong);
        const   statEloPurr = document.createElement('div');
        statEloPurr.classList.add("divElo");
        statEloPurr.innerHTML = "Purrinha current elo / highest: " + values['elo_purrinha'] + " / " + values['elo_highest'][1];
        stat.append(statEloPurr);
        mainDivStats.append(stat);

        // Create pie chart to display winrate
        const chart = document.createElement('div');
        chart.className = "d-none d-sm-block";

        const   pieChart = document.createElement('canvas');
        setAttributes(pieChart, {'id': 'winratePieall'});

        chart.style.maxWidth = "50vh";
        chart.style.maxHeight = "50vh";
        chart.style.minWidth = "30vh";
        chart.style.minHeight = "30vh";
        chart.style.margin = "0px auto";

        let wins, losses, winrate;
        wins = values['wins'][0] + values['wins'][1];
        losses = values['losses'][0] + values['losses'][1];
        winrate = Math.round(((values['wins'][0] + values['wins'][1]) /
                (values['wins'][0] + values['wins'][1] +
                values['losses'][0] + values['losses'][1])) * 100);

        if (wins + losses === 0) {
            chart.innerHTML = "Pie chart not available yet!";
            chart.style.textAlign = "center";
        }
        else {
            const winrateData = {
                labels: [`Defeats (${losses})` , `Victories (${wins})`],
                datasets: [{
                    label: "Winrate",
                    data: [losses, wins],
                    backgroundColor: ["rgb(255,99,132)", "rgb(0,128,0)"],
                    borderColor: "black",
                    hoverOffset: 4,
                    pointBorderWidth: 1,
                    pointHoverBorderWidth: 2
                }]
            };
            const   ctx = pieChart.getContext("2d");
            new Chart(ctx, {
            type: "pie",
            data: winrateData,
            options: {
                title: {
                    display: true,
                    text: `Winrate ${winrate}%`,
                    },
                }
            });
            chart.append(pieChart);
        }

        // Append all into mainDiv
        mainDivStats.append(chart);
        radioDiv.after(mainDivStats);
    })
    .catch (err => console.log(err));

    // Add event listener to all checkboxes to add or remove chart infos
    const   checkBtn = document.getElementsByName('radioBtn');
    checkBtn.forEach(element => {
        element.addEventListener('click', () => {
            fetch(`stats/${username}`)
            .then(response => response.json())
            .then(values => {

                // Calculate width depending on how many stats divs are displayed
                for (let i = 0; i < checkBtn.length; i++)
                    if (checkBtn[i].checked === true)
                        widthValue += 1;
                if (widthValue != 0)
                    widthV = (Math.round(100 / widthValue) - 2);

                if (element.checked === false) {
                    const   rmDivStats = document.getElementById(`div${element.value}`);
                    if (rmDivStats != null)
                        rmDivStats.remove();
                    const   allMainDivStats = document.querySelectorAll('.mainDivStats');
                    if (allMainDivStats.length > 0)
                        allMainDivStats.forEach(element => {
                            element.style.width = `${widthV}%`;
                        });
                }
                else {
                    // Create main div to display stats of selected checkbox
                    const   mainDivStats = document.createElement('div');
                    setAttributes(mainDivStats, {'id': `div${element.value}`, 'class': 'mainDivStats'});

                    const   allMainDivStats = document.querySelectorAll('.mainDivStats');
                    if (allMainDivStats.length > 0)
                        allMainDivStats.forEach(element => {
                            element.style.width = `${widthV}%`;
                        });
                    mainDivStats.style.width = `${widthV}%`;

                    // create other div to display elo
                    const   stat = document.createElement('div');
                    if (element.value === 'all' || element.value === 'pong') {
                        const   statEloPong = document.createElement('div');
                        statEloPong.classList.add("divElo");
                        statEloPong.innerHTML = "Pong current elo / highest: " + values['elo_pong'] + " / " + values['elo_highest'][0];
                        stat.append(statEloPong);
                    }
                    if (element.value === 'all' || element.value === 'purrinha') {
                        const   statEloPurr = document.createElement('div');
                        statEloPurr.classList.add("divElo");
                        statEloPurr.innerHTML = "Purrinha current elo / highest: " + values['elo_purrinha'] + " / " + values['elo_highest'][1];
                        stat.append(statEloPurr);
                    }
                    mainDivStats.append(stat);

                    // Create pie chart to display winrate
                    const chart = document.createElement('div');
                    chart.className = "d-none d-sm-block";

                    const   pieChart = document.createElement('canvas');
                    setAttributes(pieChart, {'id': `winratePie${element.value}`});

                    chart.style.maxWidth = "50vh";
                    chart.style.maxHeight = "50vh";
                    chart.style.minWidth = "30vh";
                    chart.style.minHeight = "30vh";
                    chart.style.margin = "0px auto";

                    if (element.value === 'pong') {
                        wins = values['wins'][0];
                        losses = values['losses'][0];
                        winrate = values['winrate'][0];
                    }
                    else if (element.value === 'all') {
                        wins = values['wins'][0] + values['wins'][1];
                        losses = values['losses'][0] + values['losses'][1];
                        winrate = Math.round(((values['wins'][0] + values['wins'][1]) /
                                (values['wins'][0] + values['wins'][1] +
                                values['losses'][0] + values['losses'][1])) * 100);
                    }
                    else {
                        wins = values['wins'][1];
                        losses = values['losses'][1];
                        winrate = values['winrate'][1];
                    }

                    if (wins + losses === 0) {
                        chart.innerHTML = "Pie chart not available yet!";
                        chart.style.textAlign = "center";
                    }
                    else {
                        const winrateData = {
                            labels: [`Defeats (${losses})` , `Victories (${wins})`],
                            datasets: [{
                                label: "Winrate",
                                data: [losses, wins],
                                backgroundColor: ["rgb(255,99,132)", "rgb(0,128,0)"],
                                borderColor: "black",
                                hoverOffset: 4,
                                pointBorderWidth: 1,
                                pointHoverBorderWidth: 2
                            }]
                        };
                        const   ctx = pieChart.getContext("2d");
                        new Chart(ctx, {
                        type: "pie",
                        data: winrateData,
                        options: {
                            title: {
                                display: true,
                                text: `Winrate ${winrate}%`,
                                },
                            }
                        });
                        chart.append(pieChart);
                    }

                    // Append all into mainDiv
                    mainDivStats.append(chart);
                    if (mainDivStats.id === 'divpong')
                        document.getElementById('radioDiv').after(mainDivStats);
                    else if (mainDivStats.id === 'divall')
                        if (document.getElementById('divpong') != null)
                            document.getElementById('divpong').after(mainDivStats);
                        else
                            radioDiv.after(mainDivStats);
                    else
                        if (document.getElementById('divall') != null)
                            document.getElementById('divall').after(mainDivStats);
                        else if (document.getElementById('divpong') != null)
                            document.getElementById('divpong').after(mainDivStats);
                        else
                            radioDiv.after(mainDivStats);
                }
            })
            .catch (err => console.log(err));
        })
    })

    // Creating div history
    const   matchHistory = document.createElement("div");
    matchHistory.innerHTML = "";
    setAttributes(matchHistory, {"class": "matchHistoryDiv", "id": "matchHistoryDiv"});

    const   header = document.createElement("div");
    header.innerHTML = "Match history   ";
    setAttributes(header, {"class": "txtSectionDiv", "id": "txtSection"});

    const   rad1 = document.createElement('div');
    const   rad2 = document.createElement('div');
    const   rad3 = document.createElement('div');
    rad1.className = "form-check form-check-inline rad";
    rad2.className = "form-check form-check-inline rad";
    rad3.className = "form-check form-check-inline rad";

    const   radIn1 = document.createElement("input");
    const   radIn2 = document.createElement("input");
    const   radIn3 = document.createElement("input");
    setAttributes(radIn1, {"class": "form-check-input", "type": "radio", "name": "radIn", "id": "radIn1", "value": "all"});
    setAttributes(radIn2, {"class": "form-check-input", "type": "radio", "name": "radIn", "id": "radIn2", "value": "pong"});
    setAttributes(radIn3, {"class": "form-check-input", "type": "radio", "name": "radIn", "id": "radIn3", "value": "purrinha"});
    radIn1.checked = true;

    const   radLab1 = document.createElement("label");
    const   radLab2 = document.createElement("label");
    const   radLab3 = document.createElement("label");
    setAttributes(radLab1, {"class": "form-check-label", "for": "radIn1"});
    setAttributes(radLab2, {"class": "form-check-label", "for": "radIn2"});
    setAttributes(radLab3, {"class": "form-check-label", "for": "radIn3"});
    radLab1.innerHTML = "All games";
    radLab2.innerHTML = "Pong games";
    radLab3.innerHTML = "Purrinha games";

    rad1.append(radIn1, radLab1);
    rad2.append(radIn2, radLab2);
    rad3.append(radIn3, radLab3);
    header.append(rad1, rad2, rad3);
    matchHistory.append(header);
    load_match_history(username, matchHistory, "all");
    document.querySelector('#statsDiv').append(matchHistory);

    // Add eventListener to radioGroup
    let position = 0;
    let start = 0;
    const   radAll = document.getElementsByName('radIn');
    radAll.forEach(el => {
        el.addEventListener('click', () => {
            const   childrenDiv = matchHistory.childNodes;
            for (let i = childrenDiv.length - 1; i > 0; i--)
                childrenDiv[i].remove();
            load_match_history(username, matchHistory, el.value);
        });
    });
}

function    load_match_history(username, matchHistory, str) {
    fetch(`matches/${username}:${str}`)
    .then(response => response.json())
    .then(matches => {
        if (matches.length > 0)
            for (let i = 0; i < matches.length; i++) {
                if (i === matches.length - 1)
                    create_div(matches[i], matchHistory, username, 1);
                else
                    create_div(matches[i], matchHistory, username, 0);
            }
        else if (document.getElementById("tmpToRm") === null && i === 0) {
            const   tmp = document.createElement('div');
            tmp.setAttribute("id", "tmpToRm");
            tmp.innerHTML = "No game played yet! Start a pong game here or a purrinha game here."
            matchHistory.append(tmp);
        }
    })
    .catch (err => console.log(err));
}

function    load_main_page() {
    document.getElementById('greetings').style.display = 'block';

    document.getElementById('statsDiv').style.display = 'none';
    document.getElementById('statsDiv').innerHTML = "";
    document.getElementById('userDataDiv').style.display = 'none';
    document.getElementById('userDataDiv').innerHTML = "";
    document.getElementById('friendsPage').style.display = 'none';
    document.getElementById('friendsPage').innerHTML = "";
}

function    create_div(match, matchHistory, username, value) {
    const   tmp = document.createElement('div');
    tmp.classList.add("matchDisplay");
    setAttributes(tmp, {'id': `${match.id}`});

    var txt;
    if (match.game === "Pong")
        txt = `${match.count} players 🏓 game played on ${match.timestamp}. `;
    else
        txt = `${match.count} players game played on ${match.timestamp}. `;
    tmp.innerHTML = txt;

    if (username === `${match.winner}`)
        tmp.classList.add("matchWon");
    else
        tmp.classList.add("matchLost");

    const eye = document.createElement('div');
    eye.className = "fa-solid fa-eye shrink";
    tmp.append(eye);

    if (value)
    {
        // Add link to title
        const   back_to_top = document.createElement("div");
        back_to_top.className = "fa-solid fa-up-long";
        back_to_top.textContent = "Top";
        tmp.style.position = "relative";
        tmp.append(back_to_top);

        back_to_top.style.position = "absolute";
        back_to_top.style.right = "0";

        back_to_top.addEventListener("click", () => {
            document.documentElement.scrollTop = 0;
        });
    }
    matchHistory.append(tmp);
}
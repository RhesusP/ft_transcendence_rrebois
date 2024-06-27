document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', () => {
        const element = event.target;
        if (element.classList.contains("fa-square-caret-down") || element.classList.contains("fa-square-caret-up"))
            display_user_data(element);
    });
})
// a remodifier, mettre les fetchs dans le if square caret down pour pas fetch si on close els onglets
function    display_user_data(element) {
    // fetch user_connected and all of his information
    if ((element.id === "info" || element.id === "security")
        && element.classList.contains("fa-square-caret-down"))
    {
        // Change arrow down to arrow up
        element.classList.remove("fa-square-caret-down");
        element.classList.add("fa-square-caret-up");

        fetch("getUsernameConnected")
        .then(response => response.json())
        .then(user_connected => {
            fetch(`user/${user_connected}/information`)
            .then(response => response.json())
            .then(user_info => {
                // Create expand div
                const   exDiv = document.createElement('div');
                setAttributes(exDiv, {"id": element.parentElement.parentElement.id + "Child"});
                exDiv.classList.add("displayAnim");

                if (element.id === "info") {
                    // Add img to edit info
                    const   img = document.createElement('span');
                    img.className = "fa-solid fa-user-pen displayAnimImg";
                    setAttributes(img, {"id": element.parentElement.parentElement.id + "img"})
                    element.parentElement.append(img);

                    // Create span with all data fetched
                    const   divData = document.createElement('div');
                    setAttributes(divData, {'id': 'userDataDisplayed'});
                    exDiv.append(divData);
                    var   isStud = false;
                    for (const key in user_info)
                        if (key != "stud42" && key != "2fa")
                            append_info(divData, key, user_info[key]);
                        else if (key == "stud42")
                            isStud = user_info[key];
                    element.parentElement.parentElement.append(exDiv);

                    // run animation
                    exDiv.style.animationPlayState = "running";
                    img.style.animationPlayState = "running";

                    exDiv.addEventListener("animationend", (event) => {
                        // stop animation
                        exDiv.style.animationPlayState = "paused";
                        img.style.animationPlayState = "paused";

                        // rm animation class
                        exDiv.classList.remove("displayAnim");
                        img.classList.remove("displayAnimImg");
                    });
                    exDiv.style.opacity = "1px";

                    // Add form when editing image is clicked
                    img.addEventListener('click', () => {
                        load_form_edit_info(isStud, user_connected);
                    })
                }
                else if (element.id === "security") {
                    document.getElementById('section3').style.display = 'block';

                    element.parentElement.parentElement.append(exDiv);

                    // Create div to contain change password and 2FA
                    const   subExDiv = document.createElement('div');

                    // Add content to subExDiv
                    const   togDiv = document.createElement('div');
                    togDiv.className = 'form-check form-switch';

                    togDiv.style.margin = 'auto';
                    togDiv.style.width = 'fit-content';

                    const   togLabel = document.createElement('label');
                    setAttributes(togLabel, {'for': 'flexSwitchCheckDefault', 'id': 'togLab'});
                    togLabel.className = "form-check-label";
                    togLabel.style.textAlign = 'center';
                    togLabel.style.width = '100%';

                    const   togInput = document.createElement('input');
                    setAttributes(togInput, {'type': 'checkbox', 'id': 'flexSwitchCheckDefault'});
                    togInput.className = "form-check-input";

                    const   key2fa = user_info["2fa"];
                    if (key2fa) {
                        togInput.checked = true;
                        togLabel.innerHTML = "2FA Activated.";
                    }
                    else {
                        togInput.checked = false;
                        togLabel.innerHTML = "2FA Deactivated."
                    }
                    togLabel.style.width = 'fit-content';
                    let new2fa = key2fa;
                    togInput.addEventListener('click', () => {
                        new2fa = !new2fa;
                        fetch("/2FA", {
                            method: 'PUT',
                            headers: {
                                'content-Type': 'application/json',
                                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                            },
                            body: JSON.stringify({ value: new2fa })
                        })
                        .then(response => {
                            if (response.ok) { console.log("HTTP request successful")}
                            else { console.log("HTTP request unsuccessful")}
                            return response.json();
                        })
                        .then(data => {
                            if (data.message)
                                displayMessage(data.message, "success");
                            if (new2fa) {
                                togInput.checked = true;
                                togLabel.innerHTML = "2FA activated.";
                                const   QR = document.createElement('div');
                                setAttributes(QR, {'id': 'QRcode'});
                                QR.classList.add('QRcss');
                                QR.innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(data.qr_url) + '&size=100x100" alt="QR Code" />';
                                subExDiv.append(QR);
                            }
                            else {
                                togInput.checked = false;
                                togLabel.innerHTML = "2FA deactivated."
                                const rmQR = document.querySelector('#QRcode');
                                if (rmQR != null)
                                    rmQR.remove();
                            }
                        })
                        .catch(error => {
                            displayMessage(error, "error");
                        });
                        event.preventDefault();
                    });

                    togDiv.append(togInput, togLabel);
                    subExDiv.append(togDiv);
                    exDiv.append(subExDiv);

                    // Change password display
                    const   subExDiv2 = document.createElement('div');
                    const   changeP = document.createElement('button');
                    setAttributes(changeP, {'class': 'btn btn-primary', 'type': 'submit', 'id': 'changePassword'});
                    changeP.textContent = "Change password";

                    subExDiv2.append(changeP);
                    exDiv.append(subExDiv2);

                    // run animation
                    exDiv.style.animationPlayState = "running";
                    exDiv.addEventListener("animationend", (event) => {
                        // stop animation
                        exDiv.style.animationPlayState = "paused";

                        // rm animation class
                        exDiv.classList.remove("displayAnim");
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
        })
        .catch(err => {
            console.log(err);
        });
    }
    else if (element.classList.contains("fa-square-caret-up") &&
        (element.id === 'info' || element.id === 'security'))
    {
        if (element.id === "info")
        {
            // Select div displaying infos
            var divRM = document.getElementById(element.parentElement.parentElement.id + "Child");
            var img = document.getElementById(element.parentElement.parentElement.id + "img");

            // Add animation class
            divRM.classList.add("rmAnim");
            img.classList.add("rmAnimImg");

            //            divRM.style.opacity = '0px';
            // run animation
            divRM.style.animationPlayState = "running";
            img.style.animationPlayState = "running";

            // remove div after animation ended
            divRM.addEventListener("animationend", (event) => {
                divRM.remove();
                img.remove();
            });
        }
        else if (element.id === "security") {
            // Select div displaying infos
            var divRM = document.getElementById(element.parentElement.parentElement.id + "Child");
            // Add animation class
            divRM.classList.add("rmAnim");

            // run animation
            divRM.style.animationPlayState = "running";

            // remove div after animation ended
            divRM.addEventListener("animationend", (event) => {
                divRM.remove();
                document.getElementById('section3').style.display = 'none';
            });
        }

        // Change arrow up to arrow down
        element.classList.add("fa-square-caret-down");
        element.classList.remove("fa-square-caret-up");
    }
}

function load_form_edit_info(isStud, user_connected) {
    const   infoDiv = document.getElementById('section1Child');
    const   img = document.getElementById('section1img');
    const   checkForm = document.getElementById('editForm');

    // hides displayed data to show form;
    const   divData = document.getElementById('userDataDisplayed');
    divData.style.display = 'none';

    if (checkForm == null && img != null)
    {
        const   infoKeys = document.querySelectorAll('.infoKey');
        const   infoValues = document.querySelectorAll('.infoValue');

        const   newForm = document.createElement('form');
        setAttributes(newForm, {'id': 'editForm'});

        const   mainDiv = [];
        const   mainSpan = [];
        const   mainInput = []
        const   names = ["first_name", "last_name", "email", "username"]
        for (let i = 0; i < document.querySelectorAll('.infoDiv').length; i++) {

            mainDiv[i] = document.createElement('div');
            mainDiv[i].classList.add('infoDiv');
            mainSpan[i] = document.createElement('span');
            mainSpan[i].innerHTML = infoKeys[i].innerHTML;
            mainSpan[i].classList.add('infoKey');
            if (isStud && names[i] == "email") {
                mainInput[i] = document.createElement('span');
                mainInput[i].innerHTML = infoValues[i].innerHTML;
            }
            else {
                mainInput[i] = document.createElement('input');
                mainInput[i].value = infoValues[i].innerHTML;
            }
            setAttributes(mainInput[i], {'name': names[i], 'id': names[i]});

            mainDiv[i].append(mainSpan[i]);
            mainDiv[i].append(mainInput[i]);
            newForm.append(mainDiv[i]);
        }
        mainInput[0].autofocus = true;

        // create Div for both buttons
        const   butDiv = document.createElement('div');

        // Add save and cancel buttons
        const   save = document.createElement('button');
        setAttributes(save, {'class': 'btn btn-primary', 'type': 'submit', 'id': 'saveData'});
        save.style.marginRight = '5px;';
        save.textContent = "Save";

        save.addEventListener('click', () => {
            const formData = {
                'first_name': document.getElementById('first_name').value,
                'last_name': document.getElementById('last_name').value,
                'username': document.getElementById('username').value,
                'email': document.getElementById('email').value
            }
            fetch("edit_data", {
                method: 'PUT',
                headers: {
                    'content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (response.ok) { console.log("HTTP request successful")}
                else { console.log("HTTP request unsuccessful")}
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Show success message
                    const   msg = "You have successfully updated your data."
                    displayMessage(msg, "success");

                                    alert("You have successfully updated your data.");    console.log(user_connected);
                    fetch(`user/${document.getElementById('username').value}/information`)
                    .then(response => response.json())
                    .then(user_info => {
                        for (const key in user_info) {
                            switch(key) {
                                case 'First name':
                                    document.getElementById("First name").innerHTML = user_info[key];
                                    break;
                                case 'Last name':
                                    document.getElementById("Last name").innerHTML = user_info[key];
                                    break;
                                case 'Email':
                                    document.getElementById("Email").innerHTML = user_info[key];
                                    break;
                                case 'Username':
                                    // update username in navbar
                                    var updateUsername = document.getElementById('ownUsername');
                                    const arrow = document.getElementById('arrowUsername');
                                    updateUsername.innerHTML = user_info[key] + "  ";
                                    updateUsername.append(arrow);

                                    //update username in title
                                    var updateTitle = document.querySelector('.title_div');
                                    updateTitle.innerHTML = user_info[key] + " profile";

                                    //update username in form
                                    document.getElementById("Username").innerHTML = user_info[key];
                                    break;
                                default:
                                    break;
                            }
                        }
                        divData.style.display = 'block';
                        newForm.remove();
                    })
                    .catch (err => {
                        console.log(err);
                        alert(err);
                    });
                }
                else {
                    // show error msg
                    const errors = [];
                    for (const [field, messages] of Object.entries(data.errors)) {
                        errors.push(`${field}: ${messages.join(", ")}`);
                    }
                        alert("Error: " + errors.join("\n"));
                }
            })
            .catch(error => {
                console.error("Error: " + error);
                alert("Error: " + error);
            });
            event.preventDefault();
        });

        const   cancel = document.createElement('button');
        setAttributes(cancel, {'class': 'btn btn-primary', 'type': 'submit', 'id': 'cancelData'});
        cancel.style.marginLeft = '5px';
        cancel.textContent = "Cancel";

        cancel.addEventListener('click', () => {
            divData.style.display = 'block';
            newForm.remove();
            event.preventDefault();
        })

        butDiv.append(save, cancel);
        butDiv.style.textAlign = 'center';
        butDiv.style.marginTop = '5px';
        newForm.append(butDiv);

        infoDiv.append(newForm);
    }
}

function append_info(exDiv, key, value) {
    const   infoDiv = document.createElement('div');
    const   addKey = document.createElement('span');
    const   addValue = document.createElement('span');

    infoDiv.classList.add("infoDiv")
    addKey.classList.add("infoKey");
    addValue.classList.add("infoValue");
    setAttributes(addValue, {'id': `${key}`});

    addKey.innerHTML = key + ":";
    addValue.innerHTML = value;

    infoDiv.append(addKey);
    infoDiv.append(addValue);
    exDiv.append(infoDiv);
}

function load_profile_page(username) {
    let   mainDivEl = document.getElementById('userDataDiv');

    // hide or display elements
    mainDivEl.style.display = 'block';
    mainDivEl.innerHTML = "";
    create_div_title(username, "profile", "userDataDiv");
    document.getElementById('greetings').style.display = 'none';
    document.getElementById('statsDiv').style.display = 'none';
    document.getElementById('statsDiv').innerHTML = "";
    document.getElementById('friendsDiv').style.display = 'none';
    document.getElementById('userDataDiv').style.display = 'block';

    // Create elements to display
    const   title1 = document.createElement('div');
    const   title2 = document.createElement('div');
    const   title3 = document.createElement('div');
    const   part1 = document.createElement('div');
    const   part2 = document.createElement('div');
    const   part3 = document.createElement('div');
    const   arrowSpan1 = document.createElement('span');
    const   arrowSpan2 = document.createElement('span');

    arrowSpan1.className = "fa-regular fa-square-caret-down";
    setAttributes(arrowSpan1, {"id": "info"});
    arrowSpan1.style.margin = "0 10px";
    arrowSpan2.className = "fa-regular fa-square-caret-down";
    setAttributes(arrowSpan2, {"id": "security"});
    arrowSpan2.style.margin = "0 10px";

    setAttributes(title1, {"id": "section1"});
    setAttributes(title2, {"id": "section2"});
    setAttributes(title3, {"id": "section3"});

    part1.classList.add("txtSectionDiv");
    part1.innerHTML = "Personal information";
    part1.append(arrowSpan1);
    title1.append(part1);

    part2.classList.add("txtSectionDiv");
    part2.innerHTML = "Account security";
    part2.append(arrowSpan2);
    title2.append(part2);

    part3.classList.add("txtSectionDiv");
    part3.style.borderBottom = '0px';
    title3.append(part3);
    title3.style.display = 'none';
    mainDivEl.append(title1, title2, title3);
}
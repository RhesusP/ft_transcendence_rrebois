import * as THREE from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {initializePongWebSocket} from "../functions/websocket.js";
import { DirectionalLight } from 'three';

export default class MatchPong {
    constructor(props) {
        this.props = props;
        initializePongWebSocket(this);
    }

    init() { // For responside device check the Resizer class: https://discoverthreejs.com/book/first-steps/world-app/#components-the-cube-module

//        this.y_pos_p1 = 0;  // left player
//        this.y_pos_p2 = 0;  // right player
//        this.stadium_length = 25;
//        this.stadium_width = 10;
//        this.stadium_height = 1;
//        this.stadium_thickness = 0.25;
//        this.paddle_length = 2;

        // Ball initial stats
//        this.ball_x = 0;
//        this.ball_y = 0;
//        this.ball_radius = 1;
//        const   initialSpeed = 0.2;
//        this.baseSpeed = initialSpeed;
//        this.currentSpeed = this.baseSpeed;
//        this.ball_velocity_x = this.currentSpeed * ((Math.random() - 0.5));
//        this.ball_velocity_y = this.currentSpeed * ((Math.random() - 0.5));


        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

       // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.lookAt(0, 0, 0);

       // Renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Create light
        // const   light = this.createLights();
        // light.name = "startlight";
        // this.scene.add(light);

        // Create stade group with all objetcs so when rotate everything follows
        const   stadiumGroup = new THREE.Group();
        const   stadium = new THREE.Object3D();
        stadium.name = "stadium";
        stadiumGroup.add(stadium);
        this.scene.add(stadiumGroup);

        // Display text from the beginning
        const    textGroup = new THREE.Group();
        textGroup.rotation.set(20, 0, 0);
        textGroup.name = "textGroup";
        textGroup.position.y = 30;
        this.scene.add(textGroup);

        // Create Euler for saving initial rotation values of stadium
//        this.initialStadiumRotation = new THREE.Euler();
//        this.initialStadiumRotation.z = stadium.rotation.z;

        // Wait for stadium walls to be created
//        this.createGameElements();

        // Controls pad
//        window.addEventListener('keydown', this.handleKeyEvent.bind(this));
//        window.addEventListener('keyup', this.handleKeyEvent.bind(this));


        // Resize scene
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // this.renderer.addEventListener( 'pointerdown', onPointerDown );
        // Animate
        this.animate = this.animate.bind(this);
        this.animate();
    }

    createLights() {
        const   light = new DirectionalLight("white", 15);

        light.position.set(0, -10, 50);
        light.lookAt(0, 0, 0);
        return light;
    }


    waiting() {
        //set the camera position and lights
        this.camera.position.set(0, 0, 50);
        this.scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

        const   dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
        dirLight.position.set( 0, 0, 1 ).normalize();
        dirLight.name = "light_1";
        this.scene.add( dirLight );

        const   pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
        pointLight.color.setHSL( Math.random(), 1, 0.5 );
        pointLight.position.set( 0, 100, 90 );
        pointLight.name = "light_2";
        this.scene.add( pointLight );

        const   txt = "Waiting for an opponent!\nMatch will start soon...";
        const   textGroup = new THREE.Group();
        textGroup.name = "waitTxt";
        this.scene.add(textGroup);

        // Create plane for mirror text to appear ghosty
        const   planeGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
        const   planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
        const   plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.name = "waitPlane";
        // plane.rotation.z = - Math.PI / 2;
        this.scene.add(plane);

        // Create Text to display
        const   loader = new FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const   geometry = new TextGeometry(txt, {
                font: font,
                size: 5,
                depth: 1.5,
                bevelEnabled: false,
            });
            const   materials = [
                new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ),
                new THREE.MeshPhongMaterial( { color: 0xffffff } )
            ];

            // Create bounding box
            geometry.computeBoundingBox();
            const   boundingBox = geometry.boundingBox;
            const   textWidth = boundingBox.max.x - boundingBox.min.x;
            const   textheight = boundingBox.max.y - boundingBox.min.y;

            const   textAdd = new THREE.Mesh(geometry, materials);
            textAdd.position.set(-0.5 * textWidth, 15, 0);
            textAdd.rotation.set(0, 2 * Math.PI, 0);

            const   mirror = new THREE.Mesh(geometry, materials);
            mirror.position.set(-0.5 * textWidth, 18 - (2 * textheight), 1.5);
            mirror.rotation.set(Math.PI, 2 * Math.PI, 0);

            plane.position.set(0, - window.innerHeight * 0.5, 40);
            textGroup.add(textAdd, mirror);
        });
    }

    builGameSet(data) {
        this.camera.position.set(0, -10, 50);
        // Remove wait page display if any
        // const   waitTxt = this.scene.getObjectByName("waitTxt");
        // if (waitTxt)
        //     waitTxt.remove();
        // const   waitP = this.scene.getObjectByName("waitPlane");
        // if (waitP)
        //     waitP.remove();
        // const   l1 = this.scene.getObjectByName("light_1");
        // const   l2 = this.scene.getObjectByName("light_2");

        // for (const [key, value] of Object.entries(data)) {
        //     if (key === "players") {
        //         this.player1_nickname = Object.keys(data.players)[0];
        //         console.log(this.player1_nickname);
        //     }
        //     console.log(`Testing: ${key}: ${value}`);
        // }

        // Set players info
        this.xPosition = 0;
        this.score_p1 = 0;
        this.score_p2 = 0;
        this.nameArray = ["p1Nick", "p1Score", "hyphen", "p2Score", "p2Nick"];
        this.player1_nickname = Object.keys(data.players)[0];
        this.player2_nickname = Object.keys(data.players)[1];
        if (Object.keys(data.players).length > 2) {
            this.player3_nickname = Object.keys(data.players)[2];
            this.player4_nickname = Object.keys(data.players)[3];
            this.textArray = [`${this.player1_nickname} + " " + ${this.player2_nickname}`,
                            this.score_p1.toString(), "-", this.score_p2.toString(),
                            `${this.player3_nickname} + " " + ${this.player4_nickname}`];

        }
        else {
            this.textArray = [`${this.player1_nickname}`,
                this.score_p1.toString(), "-", this.score_p2.toString(),
                `${this.player2_nickname}`];
        }

        // Display scores to the scene
        const   light = this.createLights();
        this.scene.add(light);
        this.printInitScores();
        this.createGameElements();
    }

    async createGameElements() {
        await this.createStadium();
        this.createPaddle('p1');
        this.createPaddle('p2');
        this.createBall();
    }

    printInitScores() { //https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_ttf.html try it
    //https://discourse.threejs.org/t/different-textures-on-each-face-of-cube/23700 onWResize
    //https://github.com/Fasani/three-js-resources?tab=readme-ov-file#images
    // bloom https://threejs.org/examples/#webgl_postprocessing_unreal_bloom

        const   textGroup = this.scene.getObjectByName("textGroup");
        const   loader = new FontLoader();
        this.xPosition = 0;

        // vecto to get coords of text and center it on scene
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            this.textArray.forEach((text, index) => {
                if (index === 0)
                    text = "Team 1\n" + text
                else if (index === 4)
                    text = "Team 2\n" + text
                const textGeometry = new TextGeometry(text, {
                    font: font,
                    size: 7,
                    depth: .8,
                    hover: 30,
                    curveSegments: 4,
                    bevelThickness: 2,
                    bevelSize: 1.5,
                });

                // Material for nicknames
                const nickTextMaterialP1 = new THREE.MeshStandardMaterial({
                    color: 0xdc143c,
                    emissive: 0xff0000,
                    roughness: 0,
                    metalness: 0.555,
                });

                const nickTextMaterialP2 = new THREE.MeshStandardMaterial({
                    color: 0x1f51ff,
                    emissive: 0x009afa,
                    roughness: 0,
                    metalness: 0.555,
                });

                // Material for scores
                const textMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8cff00,
                    emissive: 0x00ff00, // Green light
                    emissiveIntensity: 0.8,
                    metalness: 0.8,
                    roughness: 0,
                });

                let textAdd;
                if (this.nameArray[index] === "p1Nick") {
                    textAdd = new THREE.Mesh(textGeometry, nickTextMaterialP1);
                    textAdd.name = this.nameArray[index];
                }
                else if (this.nameArray[index] === "p2Nick") {
                    textAdd = new THREE.Mesh(textGeometry, nickTextMaterialP2);
                    textAdd.name = this.nameArray[index];
                }
                else {
                    textAdd = new THREE.Mesh(textGeometry, textMaterial);
                    textAdd.name = this.nameArray[index];
                }

                textGeometry.computeBoundingBox();
                const   boundingBox = textGeometry.boundingBox;
                const   textWidth = boundingBox.max.x - boundingBox.min.x;

                textAdd.position.x = this.xPosition;
                if (index === 0 || index === 3)
                    this.xPosition += textWidth + 5;
                else
                    this.xPosition += textWidth + 1.5;
                textGroup.add(textAdd);

                if (index === 4)
                    textGroup.position.x = -(this.xPosition / 2);

                // Add a pulsing effect
                const animate = () => {
                    requestAnimationFrame(animate);
                    if (textAdd.name === "p1Nick" || textAdd.name === "p2Nick")
                        textAdd.material.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
                    else
                        textAdd.material.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
                };
                animate();
            });
        });
    }

//    reset_stadium_view() {
//        // return new Promise((resolve) => {
//            const   stadium = this.scene.getObjectByName("stadium");
//            const   stadiumSpeed = 0.05;
//            // Check if the stadium is in initial pos
//            if (Math.abs(stadium.rotation.z - this.initialStadiumRotation.z) > 0.01) {
//                stadium.rotation.z += (this.initialStadiumRotation.z - stadium.rotation.z) * stadiumSpeed;
//
//                // Ensure the stadium stops exactly at the target rotation
//                if (Math.abs(this.initialStadiumRotation.z - stadium.rotation.z) < 0.01) {
//                    stadium.rotation.z = this.initialStadiumRotation.z;
//                    resolve();
//                }
//                requestAnimationFrame(animate);
//            }
//            // Start the animation
//            animate();
//        // });
//    }

     handleKeyEvent(event) {
        const   key = event.key;
        const   isKeyDown = event.type === 'keydown';
        const   speed = 0.2;
        const   stadium = this.scene.getObjectByName("stadium");

        switch (key) {
            case 'z':
                this.y_pos_p1 = isKeyDown ? speed : 0;
                break;
//            case 'r': // Stop reseting on keyup
//                this.reset_stadium_view();
//                break;
            case 'q':
                this.y_pos_p1 = isKeyDown ? speed : 0;
                break;
            case 's':
                this.y_pos_p1 = isKeyDown ? -speed : 0;
                break;
            case '-':
                break;
            case 'a':
                stadium.rotation.z += 0.03;
                break;
            case 'e':
                stadium.rotation.z -= 0.03;
                break;
            case 'ArrowUp':
                this.y_pos_p2 = isKeyDown ? speed : 0;
                break;
            case 'ArrowDown':
                this.y_pos_p2 = isKeyDown ? -speed : 0;
                break;
        }
    }

    createBall() {
        const   textureLoader = new THREE.TextureLoader();
        const   ballTexture = textureLoader.load('/football.jpg');

        const geometry = new THREE.SphereGeometry(this.ball_radius, 48, 48);
        const material = new THREE.MeshStandardMaterial({map: ballTexture});
        const ball = new THREE.Mesh(geometry, material);
        ball.position.set(this.ball_x, this.ball_y, 0);
        ball.name = 'ball';
        const   stadium = this.scene.getObjectByName("stadium");
        stadium.add(ball);
    }

    createPaddle(player = 'p1') {
        const geometry = new THREE.BoxGeometry(0.2, this.paddle_length, 1);
        let x = Math.round(-this.stadium_length / 2);
        let color = 0xff0000;
        if (player === 'p2') {
            x = Math.round(this.stadium_length / 2 - 1);
            color = 0x0000ff;
        }
        const material = new THREE.MeshStandardMaterial({color: color});
        const paddle = new THREE.Mesh(geometry, material);
        paddle.position.set(x, 0, 0);
        paddle.name = player;
        const   stadium = this.scene.getObjectByName("stadium");
        stadium.add(paddle);
    }

    // Create blocks all around + needs floor + animation
    createStadium() {
        return new Promise(async (resolve) => {
            const   stadium = this.scene.getObjectByName("stadium");
            // const   cubes = [];
            let i = -1;
            let x = -14;
            let y = -8;
            while (++i < 16) {
                const   cube = this.createCube(x);
                if (i < 16) {
                    cube.position.set(x, y, 0);
//                    cube.rotation.set(60,0,0);
                    x += 2;
                }
//                 if (i >= 16 && i < 24) {
//                     cube.position.set(x, y, 0);
// //                    cube.rotation.set(60,0,0);
//                     y += 2;
//                 }
//                 if (i > 24 && i <= 40) {
//                     cube.position.set(x, y, 0);
// //                    cube.rotation.set(60,0,0);
//                     x -= 2;
//                 }
//                else {
//                    cube.position.set(x, y, 0);
// //                    cube.rotation.set(60,0,0);
//                    y -= 2;
//                }
                stadium.add(cube);
                // cubes.push(cube);
                await this.stadiumCreation(cube);
            }
            resolve();
        });
//        }
//        this.createWall(0, this.stadium_width / 2, 0, this.stadium_length, this.stadium_thickness, this.stadium_height);  // up
//        this.createWall(-this.stadium_length / 2, 0, 0, this.stadium_thickness, this.stadium_width, this.stadium_height);  // left
//        this.createWall(this.stadium_length / 2, 0, 0, this.stadium_thickness, this.stadium_width, this.stadium_height);  // right
//        this.createWall(0, -this.stadium_width / 2, 0, this.stadium_length, this.stadium_thickness, this.stadium_height);  // down
    }

    stadiumCreation(cube) {
        return new Promise((resolve) => {
            const   duration = 500;
            const   startPositions = [];

            const   s1 = new THREE.Vector3(cube.position.x, cube.position.y, 50);
            const   s2 = new THREE.Vector3(cube.position.x + 50, cube.position.y, 0);
            const   s3 = new THREE.Vector3(cube.position.x, cube.position.y + 50, 0);
            startPositions.push(s1, s2, s3);
            const   start = Math.floor(Math.random() * 3);

            const   endPosition = new THREE.Vector3(cube.position.x, cube.position.y, 0);
console.log(endPosition);
            const   startTime = Date.now();

            const   animate = () => {
                const   elapsedTime = Date.now() - startTime;
                const   time = elapsedTime / duration;

//                const   linear = 1 * time + 0;

//                cube.position.lerpVectors(startPositions[start], endPosition, linear);
//                cube.translate(endPosition);



                if (time < 1) {
                    requestAnimationFrame(animate);
                } else {
                    console.log(`Cube position: ${cube.position.x}, Y: ${cube.position.y}`);
                    resolve();
                }
            };
            animate();
        });
    }


    createBlueMaterial() {
        // create a texture loader.
        const   textureLoader = new THREE.TextureLoader();

        // load a texture
        const   texture = textureLoader.load("/blue_wall.jpg");
        const   material = new THREE.MeshStandardMaterial({map: texture});

        return material;
    }

    createRedMaterial() {
        // create a texture loader.
        const   textureLoader = new THREE.TextureLoader();

        // load a texture
        const   texture = textureLoader.load("/red_wall.png");
        const   material = new THREE.MeshStandardMaterial({map: texture});

        return material;
    }

    createCube(i) {
        const   geometry = new THREE.BoxGeometry(2, 2, 2);
        let     material;
        if (i > 0) {
            material = this.createBlueMaterial();
        }
        else {
            material = this.createRedMaterial();
        }

        const   cube = new THREE.Mesh(geometry, material);
//        const   stadium = this.scene.getObjectByName("stadium");
        return  cube;
//        cube.position.set(15,15,5);
//        stadium.add(cube);
    }

    createWall(x, y, z, width, height, depth) {
        const   textureLoader = new THREE.TextureLoader();
        const   wallTexture = textureLoader.load('/ball_basecolor.png');

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({map: wallTexture, reflectivity: 1});
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y, z);
        const   stadium = this.scene.getObjectByName("stadium");
        stadium.add(wall);
    }

    updatePaddlePosition(player, y_pos) {
        const paddle = this.scene.getObjectByName(player);
        if (paddle) {
            const offset = this.paddle_length / 2;
            if ((paddle.position.y + y_pos + offset) > this.stadium_width / 2 || (paddle.position.y + y_pos - offset) < -this.stadium_width / 2) {
                return;
            }
            paddle.position.y += y_pos;
        }
    }

    rotateScore(i) {
        return new Promise((resolve) => {
            if (i === 1) {
                this.score = this.scene.getObjectByName('p1Score');
            }
            else {
               this.score = this.scene.getObjectByName('p2Score');
            }
            if (this.score) {
                // Rotation on the X axis
                this.startRotation = this.score.rotation.x;
                this.endRotation = this.startRotation + Math.PI;
                const duration = 700;
                const   startTime = Date.now();

                const animate = () => {
                    const deltaT = Date.now() - startTime;
                    const progress = deltaT / duration;

                    if (progress < 1) {
                        this.score.rotation.x = this.startRotation + progress * (this.endRotation - this.startRotation);
                        requestAnimationFrame(animate);
                    } else {
                        this.score.rotation.x = this.endRotation;
                        resolve();
                    }
                };
             animate();
            }
        });
    }

    updateScores() {
        // Select textGroup
        const   text = this.scene.getObjectByName("textGroup");
        let     toRemove;
        this.nameArray.forEach(value => {
            toRemove = text.getObjectByName(value);
            text.remove(toRemove);
        })
        this.printInitScores();
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.updatePaddlePosition('p1', this.y_pos_p1);
        this.updatePaddlePosition('p2', this.y_pos_p2);

        const   msg = this.scene.getObjectByName("waitTxt");
        if (msg)
            this.waitMSGMove(msg);

        this.updateBallPosition();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    waitMSGMove(msg) {

        msg.rotation.y += 0.001;
        // const   light = this.scene.getObjectByName("startlight");
        // if (light) {
        //     // Randomly adjust the intensity of the light between 0.5 and 1.5
        //     light.intensity = 1 + (Math.random() - 0.5) * 0.5;
        // }


    }

    updateBallPosition() {
        const ball = this.scene.getObjectByName('ball');

        if (ball) {
            // Update position
            if (this.ball_velocity_x !== 0 || this.ball_velocity_y !== 0) {
                ball.position.x += this.ball_velocity_x;
                ball.position.y += this.ball_velocity_y;

                // Calculate the direction of movement
                const movementDirection = new THREE.Vector2(this.ball_velocity_x, this.ball_velocity_y);
                const movementLength = movementDirection.length();

                // Normalize the direction vector to get the direction of rotation
                movementDirection.normalize();

                // Ball rotation towards its movement
                const rotationAxis = new THREE.Vector3(-movementDirection.y, movementDirection.x, 0);
                const rotationAngle = movementLength / ball.geometry.parameters.radius;

                // Apply the rotation to the ball
                ball.rotateOnWorldAxis(rotationAxis, rotationAngle);

                // Increase ball speed over time
                this.currentSpeed *= 1.0005;
                this.ball_velocity_x = movementDirection.x * this.currentSpeed;
                this.ball_velocity_y = movementDirection.y * this.currentSpeed;

                if (this.ball_velocity_x === 0)
                    this.newRound();

                // Check for collisions
                this.checkCollisions(ball);
            }
        }
    }

    async checkCollisions(ball) {
        // Check for collisions with paddles
        const paddle1 = this.scene.getObjectByName('p1');
        const paddle2 = this.scene.getObjectByName('p2');
        if (paddle1 && paddle2) {
            if (ball.position.x - this.ball_radius < paddle1.position.x + 0.2 && ball.position.y <= paddle1.position.y + this.paddle_length / 2 && ball.position.y >= paddle1.position.y - this.paddle_length / 2) {
                this.ball_velocity_x = -this.ball_velocity_x;
            }
            if (ball.position.x + this.ball_radius > paddle2.position.x - 0.2 && ball.position.y <= paddle2.position.y + this.paddle_length / 2 && ball.position.y >= paddle2.position.y - this.paddle_length / 2) {
                this.ball_velocity_x = -this.ball_velocity_x;
            }
        }

        // Check for collisions with walls
        if (ball.position.y + this.ball_radius > this.stadium_width / 2 || ball.position.y - this.ball_radius < -this.stadium_width / 2) {
            this.ball_velocity_y = -this.ball_velocity_y;
        }
        // Player 2 wins the round
        if (ball.position.x - this.ball_radius < -this.stadium_length / 2) {
            ball.position.set(0, 0, 0);
            this.ball_velocity_x = 0;
            this.ball_velocity_y = 0;
            await this.rotateScore(2);
            this.score_p2++;
            this.textArray[3] = this.score_p2.toString();
            this.updateScores();
            // // if (this.score_p2 === 5)
            // //     ;
            this.newRound();
        }
        // Player 1 wins the round
        else if (ball.position.x + this.ball_radius > this.stadium_length / 2) {
            ball.position.set(0, 0, 0);
            this.ball_velocity_x = 0;
            this.ball_velocity_y = 0;
            await this.rotateScore(1);
            this.score_p1++;
            this.textArray[1] = this.score_p1.toString();
            this.updateScores();
            // // if (this.score_p1 === 5)
            // //     this.scene.remove(ball);
            // //    ;
            this.newRound();
        }
    }

    newRound() {
        this.ball_x = 0;
        this.ball_y = 0;
        this.currentSpeed = this.baseSpeed;
        this.ball_velocity_x = this.currentSpeed * ((Math.random() - 0.5));
        this.ball_velocity_y = this.currentSpeed * ((Math.random() - 0.5));

        const ball = this.scene.getObjectByName('ball');
        ball.position.set(this.ball_x, this.ball_y, 0);
    }

    setupEventListeners() {}

}

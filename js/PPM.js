/*
    Three.js "tutorials by example"
    Author: Lee Stemkoski
    Date: July 2013 (three.js v59dev)
*/

// MAIN
//TODO:
// Find the correspondance between movements of the MovingCube and the uv mapping of the rendered object (using the blue cube in this case);
//      - [DONE] Find world space coordinates of vertices
//      - [DONE] Set up distance calculation
//      - [IP] Figure out factor to multiply distance by to use in UV change calculation


// standard global variables
var container, container2, container3, scene, hudScene, renderer, renderer2, renderer3, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var pressed = false;
var firstTime = true;
var interrim, throwaway;
// custom global variables
var movingCube, targetCube, renderedCube, objOfInterest;
var textureCamera, mainCamera;
var raycaster;
// intermediate scene for reflecting the reflection
var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;
var plus = 0;
var grow = true;

//Definition of UV Tris/Mesh Faces on target cube
var tcTris;
var tcFaces;

$(function() {
    init();
    animate();
});

// FUNCTIONS        
function init() {

    $.each([1, 2, 3, 4, 5, 6, 7, 8], function(idx, val) {
        $("#TextureView").append("<div class='vertexDiv' id='vert" + idx + "'></div>")
    })

    $.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(idx, val) {
        $("#TextureView").append("<div class='UVDiv' id='UV" + idx + "'></div>")
    })


    // SCENE
    scene = new THREE.Scene();

    // CAMERAS
    var tcan = document.getElementById("ThreeJS");
    console.log(tcan);

    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight;
    //  var SCREEN_WIDTH = tcan.offsetWidth, SCREEN_HEIGHT = tcan.offsetHeight;
    //    console.log(SCREEN_WIDTH, SCREEN_HEIGHT);

    var VIEW_ANGLE = 45,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 0.1,
        FAR = 20000;
    // camera 1
    mainCamera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(mainCamera);

    mainCamera.position.set(300, 200, 800);
    mainCamera.lookAt(scene.position);
    // camera 2
    textureCamera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    //scene.add(textureCamera);

    //Additional Cameras for HUD



    // RENDERER
    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer({ antialias: true });
    else
        renderer = new THREE.CanvasRenderer();
    renderer.setSize(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);
    $('#ThreeJS canvas').attr("id", 'TJSCanvas')


    renderer2 = new THREE.WebGLRenderer();
    renderer2.setSize(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    container2 = document.getElementById('TextureView');
    container2.appendChild(renderer2.domElement);
    $('#TextureView canvas').attr("id", 'TextureViewCanvas')

    renderer3 = new THREE.WebGLRenderer({ antialias: true });
    renderer3.setSize(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    container3 = document.getElementById('UVView');
    container3.appendChild(renderer3.domElement);
    $('#UVView canvas').attr("id", 'UVViewCanvas')

    // EVENTS
    THREEx.WindowResize(renderer, mainCamera);
    THREEx.WindowResize(renderer2, mainCamera);
    THREEx.WindowResize(renderer3, mainCamera);

    THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });

    // STATS
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);

    // LIGHT
    var hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    var light = new THREE.PointLight(0xffffff);
    light.position.set(100, 250, 1000);
    scene.add(hemiLight);

    // FLOOR
    var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
    var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = 0;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    // RAYCASTERS
    raycaster = new THREE.Raycaster();

    // SKYBOX/FOG
    var materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/dawnmountain-xpos.png') }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/dawnmountain-xneg.png') }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/dawnmountain-ypos.png') }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/dawnmountain-yneg.png') }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/dawnmountain-zpos.png') }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/dawnmountain-zneg.png') }));
    for (var i = 0; i < 6; i++)
        materialArray[i].side = THREE.BackSide;
    var skyboxMaterial = new THREE.MeshFaceMaterial(materialArray);

    var skyboxGeom = new THREE.CubeGeometry(5000, 5000, 5000, 1, 1, 1);

    var skybox = new THREE.Mesh(skyboxGeom, skyboxMaterial);
    scene.add(skybox);

    ////////////
    // CUSTOM //
    ////////////

    //Whoever works on this next, DO NOT delete or modify this array. It was carefully created by observing the faces of the renderedCube.
    //DEFINES THE FACES OF IBID
    tcFaces = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [4, 5, 1, 0],
        [7, 2, 6, 3],
        [5, 0, 7, 2],
        [1, 4, 3, 6]
    ]

    // create an array with six textures for a cool cube
    var materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/xpos.png'), overdraw: 0.5 }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/xneg.png'), overdraw: 0.5 }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/ypos.png'), overdraw: 0.5 }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/yneg.png'), overdraw: 0.5 }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/zpos.png'), overdraw: 0.5 }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/zneg.png'), overdraw: 0.5 }));

    var movingCubeMat = new THREE.MeshFaceMaterial(materialArray);
    var movingCubeGeom = new THREE.CubeGeometry(50, 50, 50, 1, 1, 1, materialArray);
    movingCube = new THREE.Mesh(movingCubeGeom, movingCubeMat);
    movingCube.position.set(286, 160, 118);
    movingCube.name = "Projector"

    var fixedRotation = new THREE.Matrix4().makeRotationY(Math.PI);
    textureCamera.applyMatrix(fixedRotation);

    movingCube.add(textureCamera);
    scene.add(movingCube);

    var blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.25, overdraw: 0.5 });
    var cubeGeometry = new THREE.CubeGeometry(100, 100, 100);
    targetCube = new THREE.Mesh(cubeGeometry, blueMaterial);

    var icoMat = new THREE.MeshNormalMaterial({ shading: THREE.FlatShading });
    var icoGeo = new THREE.IcosahedronGeometry(50, 0);
    objOfInterest = new THREE.Mesh(icoGeo, icoMat);

    targetCube.position.set(0, cubeGeometry.parameters.height / 2, 400);
    objOfInterest.position.set(0, 50, 400);

    targetCube.name = "Target Object";
    scene.add(targetCube);
    scene.add(objOfInterest);

    // a little bit of scenery...
    var ambientlight = new THREE.AmbientLight(0x111111);
    scene.add(ambientlight);


    // intermediate scene.
    //   this solves the problem of the mirrored texture by mirroring it again.
    //   consists of a camera looking at a plane with the mirrored texture on it. 
    screenScene = new THREE.Scene();

    screenCamera = new THREE.OrthographicCamera(
        window.innerWidth / -2, window.innerWidth / 2,
        window.innerHeight / 2, window.innerHeight / -2, -10000, 10000);
    screenCamera.position.z = 1;
    //  screenCamera.rotation.y = 1;
    screenScene.add(screenCamera);

    var screenGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

    firstRenderTarget = new THREE.WebGLRenderTarget(1024, 1024, { format: THREE.RGBFormat });
    var screenMaterial = new THREE.MeshBasicMaterial({ map: firstRenderTarget });

    var quad = new THREE.Mesh(screenGeometry, screenMaterial);
    // quad.rotation.x = Math.PI / 2;
    screenScene.add(quad);

    // final version of camera texture, used in scene. 
    var renderedCubeGeom = new THREE.CubeGeometry(120, 120, 120);
    var rktex = THREE.ImageUtils.loadTexture('images/rubix_cube2.jpg');
    finalRenderTarget = new THREE.WebGLRenderTarget(1024, 1024, { format: THREE.RGBFormat });
    var planeMaterial = new THREE.MeshBasicMaterial({ map: finalRenderTarget.texture });
    //  var planeMaterial = new THREE.MeshBasicMaterial( { map: rktex} );

    renderedCube = new THREE.Mesh(renderedCubeGeom, planeMaterial);

    renderedCube.position.set(0, renderedCubeGeom.parameters.height / 2, -200);
    renderedCube.name = "CubeRenderTarget";
    renderedCube.rotation.y = -Math.PI / 2;
    // scene.add(renderedCube);

    //start rubix
    var projectionCube = new THREE.Geometry();
    projectionCube.vertices.push(new THREE.Vector3(50, -50, -50));
    projectionCube.vertices.push(new THREE.Vector3(50, -50, 50));
    projectionCube.vertices.push(new THREE.Vector3(-50, -50, 50));
    projectionCube.vertices.push(new THREE.Vector3(50, 50, -50));
    projectionCube.vertices.push(new THREE.Vector3(50, 50, 50));
    projectionCube.vertices.push(new THREE.Vector3(-50, 50, 50));
    projectionCube.vertices.push(new THREE.Vector3(-50, 50, -50));
    var loader = new THREE.TextureLoader();
    var rubiksTex = loader.load("textures/rubix_cube2.jpg");
    //   var material = new THREE.MeshBasicMaterial({map: rubiksTex, side: THREE.DoubleSide, overdraw: 0.5});
    var material = new THREE.MeshBasicMaterial({ map: finalRenderTarget.texture, side: THREE.DoubleSide, overdraw: 0.5 });
    var color = new THREE.Color(0xffaa00); //optional
    var materialIndex = 0; //optional


    var points = [
        //red
        [
            [0.507120, 0.638653],
            [0.952325, 0.834875],
            [0.897624, 0.308543],
        ],
        [
            [0.507120, 0.638653],
            [0.952325, 0.834875],
            [0.897624, 0.308543],
        ],
        //blue
        [
            [0.499073, 0.039900],
            [0.042908, 0.834260],
            [0.086556, 0.314496]
        ],
        [
            [0.507120, 0.638653],
            [0.042908, 0.834260],
            [0.499073, 0.039900],
        ],
        //yellow
        [
            [0.491259, 0.982841],
            [0.507120, 0.638653],
            [0.042908, 0.834260],
        ],
        [
            [0.507120, 0.638653],
            [0.491259, 0.982841],
            [0.042908, 0.834260],
        ]
    ];

    var faceInfo = [
        [4, 3, 0],
        [4, 1, 0],
        [1, 5, 4],
        [2, 5, 1],
        [5, 3, 6],
        [3, 5, 4]
    ];



    var faceHolder = [];
    faceInfo.forEach(function(val, index, array) {
        projectionCube.faces.push(new THREE.Face3(val[0], val[1], val[2], color, materialIndex))
    });


    points.forEach(function(val, index, array) {
        var faceUV = [];
        val.forEach(function(val2, index2, array2) {
            faceUV.push(new THREE.Vector2(val2[0], val2[1]));
        });
        projectionCube.faceVertexUvs[0].push(faceUV);
    });


    // change geometry -> projectionCube if used
    //This injected code calculates the UVs for a Planar Surface
    //Consider modifying to fit three planar surfaces (since that's what makes up our mesh)
    //                geometry.computeBoundingBox();
    //                var max = geometry.boundingBox.max,
    //                min = geometry.boundingBox.min;                
    //                var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    //                var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
    //                
    //                for(var i = 0; i < geometry.faces.length; i++)
    //                {
    //                    var v1 = geometry.vertices[geometry.faces[i].a],
    //                        v2 = geometry.vertices[geometry.faces[i].b],
    //                        v3 = geometry.vertices[geometry.faces[i].c];
    //                    
    //                    geometry.faceVertexUvs[0].push(
    //                    [
    //                        new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
    //                        new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
    //                        new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
    //                    ]);
    //                }

    projectionCube.computeFaceNormals();
    projectionCube.computeVertexNormals();


    cube = new THREE.Mesh(projectionCube, material);
    cube.position.y = 150;
    scene.add(cube);
    //end rubix
}


function uv2vert(geometry, faceIndex, vertexIndex) {
    return geometry.vertices[
        geometry.faces[faceIndex][String.fromCharCode(97 + vertexIndex)]
    ];
}


function update() {
    var delta = clock.getDelta(); // seconds.
    var moveDistance = 200 * delta; // 200 pixels per second
    var rotateAngle = Math.PI / 2 * delta; // pi/2 radians (90 degrees) per second
    var angleLimit = 0.894;
    // local transformations

    // move forwards/backwards/left/right
    if (keyboard.pressed("W") || keyboard.pressed("up")) {
        movingCube.translateZ(-moveDistance);
    }

    if (keyboard.pressed("S") || keyboard.pressed("down")) {
        movingCube.translateZ(moveDistance);
    }

    if (keyboard.pressed("A") || keyboard.pressed("left")) {
        if (movingCube.rotation.y <= angleLimit) {
            movingCube.translateX(-moveDistance);
        }
    }
    if (keyboard.pressed("D") || keyboard.pressed("right")) {
        if (movingCube.rotation.y >= -angleLimit) {
            movingCube.translateX(moveDistance);
        }
    }

    if (keyboard.pressed("V")) {
        console.log(tcFaces)
            //        console.log(renderedCube.geometry.faceVertexUvs);
    }
    movingCube.lookAt(targetCube.position);
    stats.update();
}

function getWorldPosVertices(object) {
    object.updateMatrixWorld();
    var container = [];
    for (var i = 0; i < object.geometry.vertices.length; i++) {
        var vector = object.geometry.vertices[i].clone();
        vector.applyMatrix4(object.matrixWorld);
        container[i] = vector;
    }
    return container;
}





function Point3DToScreen2D(point3D, camera) {
    return vectorToScreen(Point3DtoCoord(point3D, camera))
}

function Point3DtoCoord(point3D, camera) {
    var p = point3D.clone();

    var canvas = document.getElementById('TJSCanvas');
    var width = renderer.context.canvas.width;
    var height = renderer.context.canvas.height;

    var frustum = new THREE.Frustum();
    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

    if (frustum.containsPoint(p)) {
        var vector = p.project(camera);

        // vector.x = (vector.x + 1) * width / 2;
        // vector.y = -(vector.y - 1) * height / 2;

        return vector
    } else {
        return new THREE.Vector2(0, 0);
    }
}


function vectorToScreen(vector) {
    var width = renderer.context.canvas.width;
    var height = renderer.context.canvas.height;
    return new THREE.Vector2((vector.x + 1) * width / 2, vector.y = -(vector.y - 1) * height / 2);
}


//MAIN TO-DO: Revise code so that the facevertexuvs correctly move with the vertices of the target cube 
function translateUV(geo, pnt) {
    //Okay, so this function grabs the normalized point that corresponds to the vertex that forms a face on the target cube. Then, it uses that point to create triangles for the face vertex uvs (fuvs), 12 in total. 
    fuvs = geo.faceVertexUvs;
    // console.log(fuvs)

    //These'll be reused...one day, maybe...
    //    var tri1, tri2, tri3;

    for (var k = 0; k < 12; k++) {
        for (var j = 0; j < 6; j++) {
            fuvs[0][k][0] = new THREE.Vector2(pnt[tcFaces[j][0]][0], pnt[tcFaces[j][0]][1]);
            fuvs[0][k][1] = new THREE.Vector2(pnt[tcFaces[j][2]][0], pnt[tcFaces[j][2]][1]);
            fuvs[0][k][2] = new THREE.Vector2(pnt[tcFaces[j][1]][0], pnt[tcFaces[j][1]][1]);
        }
    }
    geo.uvsNeedUpdate = true;
}


function findDupFuvs(pntArr) {
    var dups = [];
    //    var temp = -1;

    //Creates a new vector2 for every unique ordered pair
    //So, in the end there should be 7 unique vector2s...right?
    //Right.
    for (var i = 0; i < pntArr.length; i++) {
        var len2 = pntArr[i].length;
        for (var j = 0; j < len2; j++) {
            var temp = makeVector2(pntArr[i][j]);
            if (contains(dups, temp) == false) {
                dups.push(temp);
            }
        }
    }
    return dups;
}

function contains(arr, obj) {
    for (var i = 0; i < arr.length; i++) {
        var comp = new THREE.Vector2(arr[i].x, arr[i].y);
        //        console.log(comp);
        if (comp.x == obj.x && comp.y == obj.y)
            return true;
    }
    return false;
}

function animate() {
    objOfInterest.rotation.x += .04;
    objOfInterest.rotation.y += .02;

    requestAnimationFrame(animate);
    render();
    ppmCamera();
    update();
}


function render() {
    // textureCamera is located at the position of movingCube
    //   (and therefore is contained within it)
    // Thus, we temporarily hide movingCube 
    //    so that it does not obscure the view from the camera.
    movingCube.visible = false;
    // put the result of textureCamera into the first texture.
    renderer.render(scene, textureCamera, finalRenderTarget, true);
    movingCube.visible = true;

    // slight problem: texture is mirrored.
    //    solve problem by rendering (and hence mirroring) the texture again

    // render another scene containing just a quad with the texture
    //    and put the result into the final texture
    //renderer.render( screenScene, screenCamera, finalRenderTarget, true );

    // render the main scene
    renderer.render(scene, mainCamera);
    renderer2.render(scene, textureCamera);

    var worldTC = getWorldPosVertices(targetCube);
    var pts = []
    $.each(worldTC, function(index, val) {
        //var screenPoint = Point3DToScreen2D(val, textureCamera)

        var coordPoint = Point3DtoCoord(val, textureCamera);
        console.log(coordPoint)
            // console.log(vectorToUV(coordPoint));

        var screenPoint = vectorToScreen(coordPoint);
        drawPoint('TextureViewCanvas', screenPoint.x, screenPoint.y, index, "red");
    });
    console.log("done")
    firstTime = false;
}

function vectorToUV(vector) {
    var vect = vector.clone();
    // console.log(vect);
    vect.addScalar(1);
    vect.divideScalar(2);
    return vect;
}

function makeVector2(points) {
    return new THREE.Vector2(points[0], points[1]);
}

function ppmCamera() {
    var worldTC = getWorldPosVertices(targetCube); // 8 of these total (0 - 7)
    var targs = [];

    $.each(worldTC, function(index, val) {
        var screenPoint = Point3DToScreen2D(val, textureCamera);
        targs.push(normPoint('TextureViewCanvas', screenPoint.x, -screenPoint.y));
    });
    // console.log(translateUV(renderedCube.geometry, targs));
}

function normPoint(canvasID, x, y) {
    var can = document.getElementById(canvasID);
    //    console.log(can.width, can.height);
    return [x / (can.width), -y / (can.height)]

}

function drawPoint(canvasID, x, y, idx, color) {
    var can = document.getElementById(canvasID);
    // console.log(x * width, y * height);
    //    console.log(x * width, y * height);
    $("#vert" + idx).css({ "left": (x) + "px", "top": (y) + "px", "backgroundColor": color });
    return [x / can.width, -y / can.width]
}

/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: July 2013 (three.js v59dev)
*/

// MAIN
//TODO:
//Raycast from the movingCube to the targetCube
//Get matrix uvs and find out how to manipulate them
// standard global variables
var container, scene, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var movingCube, targetCube, renderedCube;
var textureCamera, mainCamera;
var raycaster;
// intermediate scene for reflecting the reflection
var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;
$(function(){
init();
animate();
});
// FUNCTIONS 		
function init() 
{
	// SCENE
	scene = new THREE.Scene();

	// CAMERAS
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	// camera 1
	mainCamera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	scene.add(mainCamera);
	mainCamera.position.set(300,200,800);
	mainCamera.lookAt(scene.position);
	// camera 2
	textureCamera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	//scene.add(textureCamera);

	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
    
	// EVENTS
	THREEx.WindowResize(renderer, mainCamera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
    
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
    
	// FLOOR
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y =0;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
    
    // RAYCASTERS
    raycaster = new THREE.Raycaster();
    
	// SKYBOX/FOG
	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-xpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-xneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-ypos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-yneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-zpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-zneg.png' ) }));
	for (var i = 0; i < 6; i++)
	   materialArray[i].side = THREE.BackSide;
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	
	var skyboxGeom = new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1 );
	
	var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
	scene.add( skybox );	
	
	////////////
	// CUSTOM //
	////////////
	
	// create an array with six textures for a cool cube
	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/xpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/xneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/ypos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/yneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/zpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/zneg.png' ) }));
	var movingCubeMat = new THREE.MeshFaceMaterial(materialArray);
	var movingCubeGeom = new THREE.CubeGeometry( 50, 50, 50, 1, 1, 1, materialArray );
	movingCube = new THREE.Mesh( movingCubeGeom, movingCubeMat );
	movingCube.position.set(0, 25.1, 0);
    
    var fixedRotation = new THREE.Matrix4().makeRotationY(Math.PI);
    textureCamera.applyMatrix(fixedRotation);
    
    movingCube.add(textureCamera);
	scene.add( movingCube );	
    var blueMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.9 } );
	var cubeGeometry = new THREE.CubeGeometry( 100, 100, 100);
    targetCube = new THREE.Mesh( cubeGeometry , blueMaterial );
    
    targetCube.position.set(0, cubeGeometry.height/2, 400);
    targetCube.name = "Target Object";
    scene.add( targetCube );
	// a little bit of scenery...
	var ambientlight = new THREE.AmbientLight(0x111111);
	scene.add( ambientlight );
	
	
	// intermediate scene.
	//   this solves the problem of the mirrored texture by mirroring it again.
	//   consists of a camera looking at a plane with the mirrored texture on it. 
	screenScene = new THREE.Scene();
	
	screenCamera = new THREE.OrthographicCamera( 
		window.innerWidth  / -2, window.innerWidth  /  2, 
		window.innerHeight /  2, window.innerHeight / -2, 
		-10000, 10000 );
	screenCamera.position.z = 1;
    //	screenCamera.rotation.y = 1;
	screenScene.add( screenCamera );
				
	var screenGeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
	
	firstRenderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );	
	var screenMaterial = new THREE.MeshBasicMaterial( { map: firstRenderTarget } );
	
	var quad = new THREE.Mesh( screenGeometry, screenMaterial );
	// quad.rotation.x = Math.PI / 2;
	screenScene.add( quad );
    				
	// final version of camera texture, used in scene. 
    var renderedCubeGeom = new THREE.CubeGeometry( 120, 120, 120);
	finalRenderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
	var planeMaterial = new THREE.MeshBasicMaterial( { map: finalRenderTarget } );
	renderedCube = new THREE.Mesh( renderedCubeGeom, planeMaterial );
	renderedCube.position.set(0,renderedCubeGeom.height/2,-200);
	scene.add(renderedCube);
	// pseudo-border for plane, to make it easier to see

	
}

function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}

function update()
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 200 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
	
	// local transformations

	// move forwards/backwards/left/right
	if ( keyboard.pressed("W") )
		movingCube.translateZ( -moveDistance );
	if ( keyboard.pressed("S") )
		movingCube.translateZ(  moveDistance );
	if ( keyboard.pressed("A") )
		movingCube.translateX( -moveDistance );
	if ( keyboard.pressed("D") )
		movingCube.translateX(  moveDistance );	
	
	if ( keyboard.pressed("Z") )
	{
//        console.log(findRaycasterIntersections(movingCube, new THREE.Vector3(0,0,1), targetCube));
//        var results = getWorldToScreen(movingCube, textureCamera);
        updateUVS(renderedCube);
//        console.log(results);
	}


	movingCube.lookAt(targetCube.position);
    
    
	// update the texture camera's position and look direction
//	var relativeCameraOffset = new THREE.Vector3(0,0,1);
//	var cameraOffset = movingCube.matrixWorld.multiplyVector3( relativeCameraOffset );
//	textureCamera.position.x = cameraOffset.x;
//	textureCamera.position.y = cameraOffset.y;
//	textureCamera.position.z = cameraOffset.z;
//	var relativeCameraLookOffset = new THREE.Vector3(0,0,0);
//	var cameraLookOffset = relativeCameraLookOffset.applyMatrix4( movingCube.matrixWorld );
//	textureCamera.lookAt( cameraLookOffset );
    //cameraLookOffset			
	stats.update();
}

function findRaycasterIntersections(originObj, direction, object)
{
    raycaster.set(originObj.position, direction);
    return raycaster.intersectObject(object);
}

function getWorldToScreen(object, camera)
{
    var vector = new THREE.Vector3();
    var projector = new THREE.Projector();
    
    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    object.updateMatrixWorld();
    projector.projectVector(vector.setFromMatrixPosition(object.matrixWorld), camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    };
}

function grabVertices(object)
{
   console.log(object.geometry);
   
}

function updateUVS(object)
{
    var fuvs = object.geometry.faceVertexUvs;
    
    fuvs[0] = [];
    
    for(var i = 0; i < 12; i++)
    {
        fuvs[0][i] = [new THREE.Vector2(0.5, 1), new THREE.Vector2(0, 1), new THREE.Vector2(0.33, 1), new THREE.Vector2(0.3, 0.6)];
    }
    
    object.geometry.uvsNeedUpdate = true;
    console.log(fuvs);
    
}
function render() 
{
	// textureCamera is located at the position of movingCube
	//   (and therefore is contained within it)
	// Thus, we temporarily hide movingCube 
	//    so that it does not obscure the view from the camera.
	movingCube.visible = false;	
	// put the result of textureCamera into the first texture.
	renderer.render( scene, textureCamera, firstRenderTarget, true );
	movingCube.visible = true;

	// slight problem: texture is mirrored.
	//    solve problem by rendering (and hence mirroring) the texture again
	
	// render another scene containing just a quad with the texture
	//    and put the result into the final texture
	renderer.render( screenScene, screenCamera, finalRenderTarget, true );
	
	// render the main scene
	renderer.render( scene, mainCamera );
}

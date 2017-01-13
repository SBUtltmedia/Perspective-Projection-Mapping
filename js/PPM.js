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
var container,container2,container3, scene, renderer,renderer2,renderer3, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var pressed = false;

var interrim, throwaway;
// custom global variables
var movingCube, targetCube, renderedCube;
var textureCamera, mainCamera;
var hudTexCam, hudUVCam; 
var raycaster;
// intermediate scene for reflecting the reflection
var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;
var plus = 0;
var grow = true;
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
    
    //Additional Cameras for HUD
    hudTexCam = new THREE.OrthographicCamera(window.innerWidth  / -4, window.innerWidth  /  4, 
		window.innerHeight /  4, window.innerHeight / -4, 
		-500, 10000 );
    
    
    hudUVCam = new THREE.OrthographicCamera(window.innerWidth  / -4, window.innerWidth  /  4, 
		window.innerHeight /  4, window.innerHeight / -4, -10000, 10000 );
    hudUVCam.position.z = 1;
    

	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
    $('#ThreeJS canvas').attr("id",'TJSCanvas' )
    
    
    	renderer2 = new THREE.CanvasRenderer(); 
	renderer2.setSize(SCREEN_WIDTH/4, SCREEN_HEIGHT/4);
	container2 = document.getElementById( 'TextureView' );
	container2.appendChild( renderer2.domElement );
    $('#TextureView canvas').attr("id",'TextureViewCanvas' )
       	renderer3 = new THREE.CanvasRenderer(); 
	renderer3.setSize(SCREEN_WIDTH/4, SCREEN_HEIGHT/4);
	container3 = document.getElementById( 'UVView' );
	container3.appendChild( renderer3.domElement );
        $('#UVView canvas').attr("id",'UVViewCanvas' )
    
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
    movingCube.name = "Projector"
    var fixedRotation = new THREE.Matrix4().makeRotationY(Math.PI);
    textureCamera.applyMatrix(fixedRotation);
    
    movingCube.add(textureCamera);
    movingCube.add(hudTexCam);
	scene.add( movingCube );	
    var blueMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.9 } );
	var cubeGeometry = new THREE.CubeGeometry( 100, 100, 100);
    targetCube = new THREE.Mesh( cubeGeometry , blueMaterial );
    
    console.log(cubeGeometry);
    targetCube.position.set(0, cubeGeometry.parameters.height / 2, 400);
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
    console.log(finalRenderTarget);
	renderedCube = new THREE.Mesh( renderedCubeGeom, planeMaterial );
	renderedCube.position.set(0,renderedCubeGeom.parameters.height / 2 ,-200);
    renderedCube.name = "CubeRenderTarget";
    renderedCube.rotation.y = -Math.PI/2;
	scene.add(renderedCube);
    
    
    
    
   

	
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
	
    
    
	if ( keyboard.pressed("Z") && !pressed)
	{
        pressed = true;
//        console.log(findRaycasterIntersections(movingCube, new THREE.Vector3(0,0,1), targetCube));
        var targCubeVx = getWorldPosVertices(targetCube);        
        var throwaway = new THREE.Object3D();
        for(var k = 0; k < targCubeVx.length; k++)
        {
            throwaway.position.x = targCubeVx[k].x;
            throwaway.position.y = targCubeVx[k].y;
            var interrim = getWorldToScreen(throwaway, mainCamera);
            
            drawPoint('TextureViewCanvas', interrim.x / renderer2.domElement.width - .5 , interrim.y / renderer2.domElement.height- .5);            
            console.log(interrim);
            console.log(renderer2.domElement.width);
            
            console.log(interrim.x / renderer2.domElement.width);
        }
	}
    
    if ( keyboard.pressed("C") )
	{
        console.log(renderedCube.geometry.faceVertexUvs);
        
        console.log(renderedCube.material.map);
        
        grabVertices(targetCube);
	}
    
    if(keyboard.pressed("X"))
    {
//        
        var targCubeVx = getWorldPosVertices(targetCube);        
        var moveCubeVx = getWorldPosVertices(movingCube);   
 
        for(var c = 0; c < moveCubeVx.length; c++)
        {
            var distance = findDistBwPoints(moveCubeVx[c], targCubeVx[c]);
            updateUVS(renderedCube, 0, plus, targCubeVx);

        }
        
        
        
    }
    
    if ( keyboard.pressed("O") )
        grow = true;
    if ( keyboard.pressed("P") )
        grow = false; 
    
    if(grow);
//        plus += delta * 0.3;
           


	movingCube.lookAt(targetCube.position);			
	stats.update();
}


function findRaycasterIntersections(originObj, direction, object)
{
     raycaster.set(originObj.position, direction);
     return raycaster.intersectObject(object);
}

//originPoint and endPoint are Vector3s
function findDistBwPoints(originPoint, endPoint)
{
    return originPoint.distanceTo(endPoint);

}

function getWorldPosVertices(object)
{
//    object.updateMatrixWorld();
    var container = [];
    for(var i = 0; i < object.geometry.vertices.length; i++)
    {
        var vector = object.geometry.vertices[i];
//        vector.applyMatrix4(object.matrixWorld);
        container[i] = vector;
    }
    
    return container;
    
}

//function getWorldToScreen(object, camera)
//{
//     var vector = new THREE.Vector3();
//     var projector = new THREE.Projector();
//     
//     var widthHalf = 0.5*renderer.context.canvas.width;
//     var heightHalf = 0.5*renderer.context.canvas.height;
// 
//     object.updateMatrixWorld();
//     projector.projectVector(vector.applyMatrix4(object.matrixWorld), camera);
// 
//     vector.x = ( vector.x * widthHalf ) + widthHalf;
//     vector.y = - ( vector.y * heightHalf ) + heightHalf;
// 
//     return { 
//         x: vector.x,
//         y: vector.y
//     };
//}


function getWorldToXY(vertex, camera)
{
     var vector = vertex.clone();
    vector.project(camera)
     
     var widthHalf = 0.5*renderer.context.canvas.width;
     var heightHalf = 0.5*renderer.context.canvas.height;
 
     object.updateMatrixWorld();
     projector.projectVector(vector.applyMatrix4(object.matrixWorld), camera);
 
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

function updateUVS(object, addU, addV, targetArr)
{
    var fuvs = object.geometry.faceVertexUvs;
    object.geometry.computeBoundingBox();
    
    var min = object.geometry.boundingBox.min;
    var max = object.geometry.boundingBox.max;

    for(var i = 0; i < fuvs.length; i+=2)
    {
//        fuvs[0][i] = [];
        
        //This is the default texture mapping
            fuvs[0][i] = [ new THREE.Vector2(0 , addV), new THREE.Vector2(0, 0), new THREE.Vector2(addV, addV)];
            fuvs[0][++i] = [ new THREE.Vector2(0, 0),  new THREE.Vector2(addV , 0),new THREE.Vector2(addV, addV)];
//        console.log(fuvs[0][i]);
    }
    
    object.geometry.uvsNeedUpdate = true;
    
//    for(var j = 0; j < targetArr.length; j++)
//    {
//    console.log(planePosToTextureWorld(object, object.position));
    
}

function texturePosToPlaneWorld(planeOb, texcoord)
{    
    var pos = new THREE.Vector3();
    pos.x = (texcoord.x - 0.5) * 512;
    pos.y = (texcoord.y - 0.5) * 512;

    pos.applyMatrix4(planeOb.matrix);
    return pos;
}

function planePosToTextureWorld(planeOb, worldcoord)
{    
    var pos = new THREE.Vector3();
    pos.x = (worldcoord.x) / 512;
    pos.y = (worldcoord.y) / 512;

    pos.applyMatrix4(new THREE.Matrix4(0, 0, 512, 512));
    return pos;
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
    
    renderer2.render(scene, textureCamera, true);
    drawPoint('TextureViewCanvas',.5,.5);
    
    ///////// TEXTURE VIEW RENDERERING //////////
    
    
////      console.log(findRaycasterIntersections(movingCube, new THREE.Vector3(0,0,1), targetCube));
//        var targCubeVx = getWorldPosVertices(targetCube);        
//        throwaway = new THREE.Object3D();
//        for(var k = 0; k < targCubeVx.length; k++)
//        {
//            throwaway.position.x = targCubeVx[k].x;
//            throwaway.position.y = targCubeVx[k].y;
//            interrim = getWorldToScreen(throwaway, mainCamera);
//            
//            drawPoint('TextureViewCanvas', interrim.x / renderer2.domElement.width - .5 , interrim.y / renderer2.domElement.height - .5);            
//
//        }
    
}

function drawPoint(canvasID,x,y) { 

           var canvas = document.getElementById(canvasID); 
            var plotx=(x)*canvas.width;
            var ploty=(y)*canvas.height;
           if (canvas.getContext) { 
               var context = canvas.getContext("2d"); 
               context.fillStyle = "white"; 
               context.strokeStyle = "Blue"; 
 
              context.fillRect(plotx,ploty,4,4)
           } 
       }     
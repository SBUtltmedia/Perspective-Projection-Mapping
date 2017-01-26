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

var interrim, throwaway;
// custom global variables
var movingCube, targetCube, renderedCube;
var textureCamera, mainCamera;
var raycaster;
// intermediate scene for reflecting the reflection
var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;
var plus = 0;
var grow = true;
$(function() 
{
    init();
    animate();
});
// FUNCTIONS 		
function init() 
{
    
    $.each([1,2,3,4,5,6,7,8],function(idx,val){
           
           $("#TextureView").append("<div class='vertexDiv' id='vert"+idx+"'></div>")
           })
    
	// SCENE
	scene = new THREE.Scene();
	// CAMERAS
    var tcan = document.getElementById("ThreeJS");
    console.log(tcan);
    
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
//	var SCREEN_WIDTH = tcan.offsetWidth, SCREEN_HEIGHT = tcan.offsetHeight;
//    console.log(SCREEN_WIDTH, SCREEN_HEIGHT);
    
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
  
    

	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
    $('#ThreeJS canvas').attr("id",'TJSCanvas' )

    
    renderer2 = new THREE.WebGLRenderer(); 
	renderer2.setSize(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
	container2 = document.getElementById( 'TextureView' );
	container2.appendChild( renderer2.domElement );
    $('#TextureView canvas').attr("id",'TextureViewCanvas' )
    
    renderer3 = new THREE.WebGLRenderer( {antialias:true} );
	renderer3.setSize(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
	container3 = document.getElementById( 'UVView' );
	container3.appendChild( renderer3.domElement );
    $('#UVView canvas').attr("id",'UVViewCanvas' )
    
	// EVENTS
	THREEx.WindowResize(renderer, mainCamera);
	THREEx.WindowResize(renderer2, mainCamera);
	THREEx.WindowResize(renderer3, mainCamera);
    
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
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/xpos.png' ), overdraw:0.5}));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/xneg.png' ), overdraw:0.5 }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/ypos.png' ), overdraw:0.5 }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/yneg.png' ), overdraw:0.5 }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/zpos.png' ), overdraw:0.5 }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/zneg.png' ), overdraw:0.5 }));
	var movingCubeMat = new THREE.MeshFaceMaterial(materialArray);
	var movingCubeGeom = new THREE.CubeGeometry( 50, 50, 50, 1, 1, 1, materialArray );
	movingCube = new THREE.Mesh( movingCubeGeom, movingCubeMat );
	movingCube.position.set(0, 25.1, 0);
    movingCube.name = "Projector"
    var fixedRotation = new THREE.Matrix4().makeRotationY(Math.PI);
    textureCamera.applyMatrix(fixedRotation);
    
    movingCube.add(textureCamera);
	scene.add( movingCube );	
    var blueMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.9, overdraw:0.5 } );
	var cubeGeometry = new THREE.CubeGeometry( 100, 20, 200);
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
	
	firstRenderTarget = new THREE.WebGLRenderTarget( 1024 , 1024, { format: THREE.RGBFormat } );	
	var screenMaterial = new THREE.MeshBasicMaterial( { map: firstRenderTarget } );
	
	var quad = new THREE.Mesh( screenGeometry, screenMaterial );
	// quad.rotation.x = Math.PI / 2;
	screenScene.add( quad );
    				
	// final version of camera texture, used in scene. 
    var renderedCubeGeom = new THREE.CubeGeometry( 120, 120, 120);
	finalRenderTarget = new THREE.WebGLRenderTarget( 1024, 1024, { format: THREE.RGBFormat } );
	var planeMaterial = new THREE.MeshBasicMaterial( { map: finalRenderTarget.texture } );
    
    console.log(finalRenderTarget);
	renderedCube = new THREE.Mesh( renderedCubeGeom, planeMaterial );
    
	renderedCube.position.set(0,renderedCubeGeom.parameters.height / 2 ,-200);
    renderedCube.name = "CubeRenderTarget";
    renderedCube.rotation.y = -Math.PI/2;
	scene.add(renderedCube);
}


function uv2vert(geometry,faceIndex,vertexIndex){
    
return geometry.vertices[
    geometry.faces[faceIndex][ String.fromCharCode(97 + vertexIndex) ]
];    
    
}


function update()
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 200 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
    var angleLimit = 0.894;
	// local transformations

	// move forwards/backwards/left/right
	if ( keyboard.pressed("W") || keyboard.pressed("up") )
    {
		movingCube.translateZ( -moveDistance );
//        translateUV(renderedCube.geometry, new THREE.Vector2(0, moveDistance / 500));    
    }
	if ( keyboard.pressed("S") || keyboard.pressed("down"))
    {
		movingCube.translateZ(  moveDistance );
//        translateUV(renderedCube.geometry, new THREE.Vector2(0, -moveDistance / 500));    
    }
	if ( keyboard.pressed("A") || keyboard.pressed("left"))
	{
        if(movingCube.rotation.y <= angleLimit)
        {
            movingCube.translateX( -moveDistance );
            var worldTC = getWorldPosVertices(targetCube);
            $.each(worldTC,function(index , val){
                var screenPoint = Point3DToScreen2D(val, textureCamera)
                var normed = normPoint('TextureViewCanvas',screenPoint.x,screenPoint.y,index);
                translateUV(renderedCube.geometry, makeVector2(0, 0));    
            });
        }
        
    }
	if ( keyboard.pressed("D") || keyboard.pressed("right"))
    {
        if(movingCube.rotation.y >= -angleLimit)
        {
		    movingCube.translateX(  moveDistance );	 
            var worldTC = getWorldPosVertices(targetCube);
            $.each(worldTC,function(index , val){
                var screenPoint = Point3DToScreen2D(val, textureCamera)
                var normed = normPoint('TextureViewCanvas',screenPoint.x,screenPoint.y,index);
                translateUV(renderedCube.geometry, makeVector2(normed[0], 0));    
            });
        }
    }
    
	movingCube.lookAt(targetCube.position);			
	stats.update();
}

function getWorldPosVertices(object)
{
    object.updateMatrixWorld();
    var container = [];
    for(var i = 0; i < object.geometry.vertices.length; i++)
    {
        var vector = object.geometry.vertices[i].clone();
        vector.applyMatrix4(object.matrixWorld);
        container[i] = vector;
    }
    
    return container;
    
}



 function Point3DToScreen2D(point3D,camera)
{
    var p = point3D.clone();

    var canvas = document.getElementById('TJSCanvas');
    var width = renderer.context.canvas.width;
    var height = renderer.context.canvas.height;

    var frustum = new THREE.Frustum();
    frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );

    if(frustum.containsPoint( p )) {        
      var vector = p.project(camera);
      
      vector.x = (vector.x + 1)   * width/2;
      vector.y = -(vector.y - 1) * height/2;

      return vector;
    } else { return false}


 }

function translateUV(geo, transVec)
{
    
    fuvs = geo.faceVertexUvs;
    fuvs.forEach(function(val, index, array )
    {
        val.forEach(function(vec, index, array )
        {
            for(var j = 0; j < 3; j++)
            {
               
                
                var dx = (vec[j].x - (transVec.x * 0.005)) ;
                var dy = (vec[j].y - (transVec.y * 0.005));
                
                 if(transVec.x == 0)
                    dx = 0;
                
                if(transVec.y == 0)
                    dy = 0;
                
//                console.log( dx, dy );
                vec[j].x += dx;
                vec[j].y += dy;

                geo.uvsNeedUpdate = true;
            } 

        });
    });

}

function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}


function render() 
{
	// textureCamera is located at the position of movingCube
	//   (and therefore is contained within it)
	// Thus, we temporarily hide movingCube 
	//    so that it does not obscure the view from the camera.
	movingCube.visible = false;	
	// put the result of textureCamera into the first texture.
	renderer.render( scene, textureCamera, finalRenderTarget, true );
	movingCube.visible = true;

	// slight problem: texture is mirrored.
	//    solve problem by rendering (and hence mirroring) the texture again
	
	// render another scene containing just a quad with the texture
	//    and put the result into the final texture
	//renderer.render( screenScene, screenCamera, finalRenderTarget, true );
	
	// render the main scene
	renderer.render( scene, mainCamera );
    
    renderer2.render(scene, textureCamera);
    
    var worldTC = getWorldPosVertices(targetCube);
    $.each(worldTC,function(index,val){
      var screenPoint = Point3DToScreen2D(val, textureCamera)
      drawPoint('TextureViewCanvas',screenPoint.x,screenPoint.y,index);
        
    });
    
}

function makeVector2(points)
{

        return new THREE.Vector2(points[0], points[1]);

}

function normPoint(canvasID,x,y,idx)
{
    var can = document.getElementById(canvasID);
    return [x / can.width, -y / can.width]
    
}
function drawPoint(canvasID,x,y,idx) 
{ 
    var can = document.getElementById(canvasID);
   // console.log(x * width, y * height);
//    console.log(x * width, y * height);
    $("#vert"+idx).css({"left":(x)+"px","top":(y)+"px"});
    return [x / can.width, -y / can.width]
}     
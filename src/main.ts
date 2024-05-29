import { GeometryBuffersCollection } from "./attribute_buffers/GeometryBuffersCollection";
import { Camera } from "./camera/Camera";
import { ShadowCamera } from "./camera/ShadowCamera";
import { BallGameObject } from "./game_objects/Ball";
import { Floor } from "./game_objects/Floor";
import { Paddle } from "./game_objects/Paddle";
import { InputManager } from "./input/InputManager";
import { AmbientLight } from "./lights/AmbientLight";
import { DirectionalLight } from "./lights/DirectionalLight";
import { PointLightsCollection } from "./lights/PointLight";
import { Color } from "./math/Color";
import { Vec3 } from "./math/Vec3";
import { Texture2D } from "./texture/Texture2D";

/**
 * Initialize the WebGPU context and the game objects.
 */
async function init() {

  // - INITIALIZE WEBGPU
  // First we need canvas.
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  // From canvas we can get the WebGPU context.
  const gpuContext = canvas.getContext("webgpu") as GPUCanvasContext;

  // If there is no WebGPU context, we can't do anything.
  if (!gpuContext) {
    alert("WebGPU not supported")
    return;
  }

  // Request adapter and device.
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter!.requestDevice();

  // Configure the WebGPU context.
  gpuContext.configure({
    device: device,
    format: "bgra8unorm"
  });

  // - INITIALIZE GAME RESOURCES AND MANAGERS
  GeometryBuffersCollection.intitialize(device);
  const inputManager = new InputManager();

  // - TEXTURES
  const depthTexture = Texture2D.createDepthTexture(device, canvas.width, canvas.height);
  const shadowTexture = Texture2D.createShadowTexture(device, 1024, 1024);

  // - LIGHTS
  const ambientLight = new AmbientLight(device);
  ambientLight.color = new Color(1, 1, 1, 1);
  ambientLight.intensity = 0.2;

  const directionalLight = new DirectionalLight(device);
  directionalLight.color = new Color(1, 1, 1, 1);
  directionalLight.intensity = 1;
  directionalLight.direction = new Vec3(0, 0, 1);

  const pointLights = new PointLightsCollection(device);

  pointLights.lights[0].color = new Color(1, 0, 0, 1);
  pointLights.lights[0].intensity = 2;
  pointLights.lights[0].specularIntensity = 16;
  pointLights.lights[0].specularColor = Color.red();
  pointLights.lights[0].position = new Vec3(4, 2, -1);

  pointLights.lights[1].color = new Color(0, 1, 0, 1);
  pointLights.lights[1].intensity = 2;
  pointLights.lights[1].position = new Vec3(-4, 2, -1);

  pointLights.lights[2].color = new Color(0, 0, 1, 1);
  pointLights.lights[2].intensity = 2;
  pointLights.lights[2].position = new Vec3(2, -4, -1);


  // GAME OBJECTS

  // - CAMERAS
  const camera = new Camera(device, canvas.width / canvas.height);
  camera.eye = new Vec3(0, 0, -20);
  const shadowCamera = new ShadowCamera(device);
  shadowCamera.eye = new Vec3(0, 0, -20); 

  const player1Camera = new Camera(device, canvas.width / (canvas.height / 2));
  player1Camera.eye = new Vec3(-16, 0, -4);
  player1Camera.up = new Vec3(0, 0, -1);

  const player2Camera = new Camera(device, canvas.width / (canvas.height / 2));
  player2Camera.eye = new Vec3(16, 0, -4);
  player2Camera.up = new Vec3(0, 0, -1);

  // - PADDLES, BALL, FLOOR etc...
  const paddle1 = new Paddle(inputManager, device, camera, shadowCamera, ambientLight, directionalLight, pointLights);
  paddle1.shadowTexture = shadowTexture;
  paddle1.position.x = -10;
  paddle1.color = new Color(1, 0.3, 0.3, 1);
  paddle1.camera = player1Camera;

  const paddle2 = new Paddle(inputManager, device, camera, shadowCamera, ambientLight, directionalLight, pointLights);
  paddle2.shadowTexture = shadowTexture;
  paddle2.position.x = 10;
  paddle2.color = new Color(0.3, 0.3, 1, 1);
  paddle2.playerOne = false;
  paddle2.camera = player1Camera;

  const ball = new BallGameObject(device, camera, shadowCamera, ambientLight, directionalLight, pointLights);
  ball.shadowTexture = shadowTexture;
  ball.camera = player1Camera;

  const floor = new Floor(device, camera, shadowCamera, ambientLight, directionalLight, pointLights);
  floor.shadowTexture = shadowTexture;
  floor.camera = player1Camera;


  const update = () => {

    // Update the lights
    ambientLight.update();
    directionalLight.update();
    pointLights.update();

    // Update the cameras.
    camera.update();
    player1Camera.update();
    player2Camera.update();
    shadowCamera.update();

    // Update the game objects.
    paddle1.update();
    paddle2.update();
    ball.update();
    floor.update();

    // Check collisions
    ball.collidesPaddle(paddle1);
    ball.collidesPaddle(paddle2);

  }

  /**
   * Shadow pass is a pass that renders the scene from the light perspective. 
   * It is used to generate the shadow map.
   * We render only into the depth texture.
   * @param commandEncoder - The GPUCommandEncoder object.
   */
  const shadowPass = (commandEncoder: GPUCommandEncoder) => {

    const renderPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [], // No color attachments, we only care about depth
      // CONFIGURE DEPTH
      depthStencilAttachment: {
        view: shadowTexture.texture.createView(), // Notice here that we use shadow texture and render only depth
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    // DRAW HERE
    paddle1.drawShadows(renderPassEncoder);
    paddle2.drawShadows(renderPassEncoder)
    ball.drawShadows(renderPassEncoder);

    renderPassEncoder.end();
  }

  /**
   * Normal scene pass. This pass renders the scene from the camera perspective when split screen is not active.
   * Appears as 2d game.
   * @param commandEncoder - The GPUCommandEncoder object. 
   */
  const scenePass = (commandEncoder: GPUCommandEncoder) => {

    const renderPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: gpuContext.getCurrentTexture().createView(),
        storeOp: "store",
        clearValue: { r: 0.4, g: 0.9, b: 0.9, a: 1.0 },
        loadOp: "clear"
      }],
      // CONFIGURE DEPTH
      depthStencilAttachment: {
        view: depthTexture.texture.createView(),
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    // DRAW HERE
    paddle1.draw(renderPassEncoder);
    paddle2.draw(renderPassEncoder)
    ball.draw(renderPassEncoder);
    floor.draw(renderPassEncoder);

    renderPassEncoder.end();

  }

  /**
   * The split screen pass. This pass renders the scene from the perspective of player1Camera and player2Camera.
   * Splits the screen in half and render for each player.
   * @param commandEncoder - The GPUCommandEncoder object.
   */
  const splitScreenPass = (commandEncoder: GPUCommandEncoder) => {

    // - TOP PLAYER PASS
    const topPlayerPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: gpuContext.getCurrentTexture().createView(),
        storeOp: "store",
        clearValue: { r: 0.4, g: 0.9, b: 0.9, a: 1.0 },
        loadOp: "clear"
      }],
      depthStencilAttachment: {
        view: depthTexture.texture.createView(),
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    // - SET TOP PLAYER VIEWPORT
    topPlayerPassEncoder.setViewport(0, 0, canvas.width, canvas.height / 2, 0, 1);

    // - SETUP TOP PLAYER CAMERA
    paddle1.camera = player1Camera;
    paddle2.camera = player1Camera;
    ball.camera = player1Camera;
    floor.camera = player1Camera;

    // - DRAW TOP PLAYER OBJECTS
    paddle1.draw(topPlayerPassEncoder);
    paddle2.draw(topPlayerPassEncoder)
    ball.draw(topPlayerPassEncoder);
    floor.draw(topPlayerPassEncoder);

    // - END TOP PLAYER PASS
    topPlayerPassEncoder.end();

    // - BOTTOM PLAYER PASS
    const bottomPlayerPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: gpuContext.getCurrentTexture().createView(),
        storeOp: "store",
        loadOp: "load"
      }],
      // While there is no reason to have second depth texture pass we 
      // do need to configure it because Render Pipelines are configured to take it
      depthStencilAttachment: {
        view: depthTexture.texture.createView(),
        depthLoadOp: "load",
        depthStoreOp: "discard" // Discard, don't care about rewriting it
      },
    });

    // - SET BOTTOM PLAYER VIEWPORT
    bottomPlayerPassEncoder.setViewport(0, canvas.height / 2, canvas.width, canvas.height / 2, 0, 1);

    // - SETUP BOTTOM PLAYER CAMERA
    paddle1.camera = player2Camera;
    paddle2.camera = player2Camera;
    ball.camera = player2Camera;
    floor.camera = player2Camera;

    // - DRAW BOTTOM PLAYER OBJECTS
    paddle1.draw(bottomPlayerPassEncoder);
    paddle2.draw(bottomPlayerPassEncoder)
    ball.draw(bottomPlayerPassEncoder);
    floor.draw(bottomPlayerPassEncoder);

    // - END BOTTOM PLAYER PASS
    bottomPlayerPassEncoder.end();
  }


  /**
   * Draw function. This function is called every frame.
   */
  const draw = () => {

    // Update the game objects.
    update();

    const commandEncoder = device.createCommandEncoder();

    shadowPass(commandEncoder);
    // Draw either scenePass or splitScreenPass
    // scenePass(commandEncoder); 
    splitScreenPass(commandEncoder);

    device.queue.submit([
      commandEncoder.finish()
    ]);

    requestAnimationFrame(draw);
  }

  draw();
}


init();
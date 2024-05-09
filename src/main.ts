import { GeometryBuffers } from "./attribute_buffers/GeometryBuffers";
import { GeometryBuffersCollection } from "./attribute_buffers/GeometryBuffersCollection";
import { Camera } from "./camera/Camera";
import { ShadowCamera } from "./camera/ShadowCamera";
import { Ball } from "./game_objects/Ball";
import { Floor } from "./game_objects/Floor";
import { Paddle } from "./game_objects/Paddle";
import { GeometryBuilder } from "./geometry/GeometryBuilder";
import { InputManager } from "./input/InputManager";
import { AmbientLight } from "./lights/AmbientLight";
import { DirectionalLight } from "./lights/DirectionalLight";
import { PointLightsCollection } from "./lights/PointLight";
import { Color } from "./math/Color";
import { Mat4x4 } from "./math/Mat4x4";
import { Vec2 } from "./math/Vec2";
import { Vec3 } from "./math/Vec3";
import { UnlitRenderPipeline } from "./render_pipelines/UnlitRenderPipeline";
import { Texture2D } from "./texture/Texture2D";
import { UniformBuffer } from "./uniform_buffers/UniformBuffer";
import { Util } from "./util/Util";


async function init() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const gpuContext = canvas.getContext("webgpu") as GPUCanvasContext;

  if (!gpuContext) {
    alert("WebGPU not supported")
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();

  const device = await adapter!.requestDevice();

  gpuContext.configure({
    device: device,
    format: "bgra8unorm"
  });

  GeometryBuffersCollection.intitialize(device);

  const inputManager = new InputManager();

  // DEPTH TEXTURE 
  const depthTexture = Texture2D.createDepthTexture(device, canvas.width, canvas.height);
  const shadowTexture = Texture2D.createShadowTexture(device, 1024, 1024);

  // LIGHTS
  const ambientLight = new AmbientLight(device);
  ambientLight.color = new Color(1, 1, 1, 1);
  ambientLight.intensity = 0.2;
  const directionalLight = new DirectionalLight(device);
  directionalLight.color = new Color(1, 1, 1, 1);
  directionalLight.intensity = 1;
  directionalLight.direction = new Vec3(0,0,1);
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
  
  // - CAMERA
  const camera = new Camera(device, canvas.width / canvas.height);
  camera.eye = new Vec3(0,0, -20);
  const shadowCamera = new ShadowCamera(device);
  shadowCamera.eye = new Vec3(0, 0, -20); // Let's imagine it as negative directional light * -20 ( or any other fitting scalar)

  // - PADDLES, BALL, FLOOR etc...
  const paddle1 = new Paddle(device, inputManager, camera, shadowCamera, ambientLight, directionalLight, pointLights);
  paddle1.pipeline.shadowTexture = shadowTexture;
  paddle1.position.x = -10;
  paddle1.color = new Color(1,0.3,0.3,1);
  const paddle2 = new Paddle(device, inputManager, camera, shadowCamera, ambientLight, directionalLight,pointLights);
  paddle2.pipeline.shadowTexture = shadowTexture;
  paddle2.position.x = 10;
  paddle2.color = new Color(0.3,0.3,1,1);
  paddle2.playerOne = false;
  const ball = new Ball(device, camera, shadowCamera, ambientLight, directionalLight,pointLights);
  ball.pipeline.shadowTexture = shadowTexture;
  const floor = new Floor(device, camera, shadowCamera, ambientLight, directionalLight,pointLights);
  floor.pipeline.shadowTexture = shadowTexture;


  const update = () => {
    ambientLight.update();
    directionalLight.update();
    camera.update();
    paddle1.update();
    paddle2.update();
    ball.update();
    floor.update();
    pointLights.update();
    shadowCamera.update();
    ball.collidesPaddle(paddle1);
    ball.collidesPaddle(paddle2);
  }

  const shadowPass = (commandEncoder: GPUCommandEncoder) => {
    
    const renderPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [],
      // CONFIGURE DEPTH
      depthStencilAttachment: {
        view: shadowTexture.texture.createView(),
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


  const draw = () => {

    update();

    const commandEncoder = device.createCommandEncoder();

    shadowPass(commandEncoder);
    scenePass(commandEncoder);

    device.queue.submit([
      commandEncoder.finish()
    ]);

    requestAnimationFrame(draw);
  }

  draw();
}


init();
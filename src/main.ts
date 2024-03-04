import { GeometryBuffers } from "./attribute_buffers/GeometryBuffers";
import { GeometryBuffersCollection } from "./attribute_buffers/GeometryBuffersCollection";
import { Camera } from "./camera/Camera";
import { Ball } from "./game_objects/Ball";
import { Floor } from "./game_objects/Floor";
import { Paddle } from "./game_objects/Paddle";
import { GeometryBuilder } from "./geometry/GeometryBuilder";
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

  // DEPTH TEXTURE 
  const depthTexture = Texture2D.createDepthTexture(device, canvas.width, canvas.height);

  // LIGHTS
  const ambientLight = new AmbientLight(device);
  ambientLight.color = new Color(1, 1, 1, 1);
  ambientLight.intensity = 0.2;
  const directionalLight = new DirectionalLight(device);
  directionalLight.color = new Color(1, 1, 1, 1);
  directionalLight.intensity = 1;
  directionalLight.direction = new Vec3(0,0,1);
  const pointLights = new PointLightsCollection(device);
  pointLights.pointLigts[0].color = new Color(1, 0, 0, 0);
  pointLights.pointLigts[0].intensity = 3;
  pointLights.pointLigts[0].position = new Vec3(-10, 4, -1);
  pointLights.pointLigts[1].color = new Color(0, 1, 0, 0);
  pointLights.pointLigts[1].intensity = 3;
  pointLights.pointLigts[1].position = new Vec3(4, 5, -1);
  pointLights.pointLigts[2].color = new Color(0, 0, 1, 0);
  pointLights.pointLigts[2].intensity = 3;
  pointLights.pointLigts[2].position = new Vec3(6, -3, -1);

  // GAME OBJECTS
  const camera = new Camera(device, canvas.width / canvas.height);
  camera.eye = new Vec3(0,0, -20);
  const paddle1 = new Paddle(device, camera, ambientLight, directionalLight, pointLights);
  paddle1.position.x = -10;
  paddle1.color = new Color(1,0.2,0.2,1);
  const paddle2 = new Paddle(device, camera, ambientLight, directionalLight, pointLights);
  paddle2.position.x = 10;
  paddle2.color = new Color(0.2,0.2,1,1);
  const ball = new Ball(device, camera, ambientLight, directionalLight, pointLights);
  const floor = new Floor(device, camera, ambientLight, directionalLight, pointLights);


  const update = () => {
    ambientLight.update();
    directionalLight.update();
    camera.update();
    paddle1.update();
    paddle2.update();
    ball.update();
    pointLights.update();
    floor.update();
  }

  const draw = () => {

    update();

    const commandEncoder = device.createCommandEncoder();

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
    device.queue.submit([
      commandEncoder.finish()
    ]);

    requestAnimationFrame(draw);
  }

  draw();
}


init();
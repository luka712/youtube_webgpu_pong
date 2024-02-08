import { GeometryBuffers } from "./attribute_buffers/GeometryBuffers";
import { GeometryBuffersCollection } from "./attribute_buffers/GeometryBuffersCollection";
import { Camera } from "./camera/Camera";
import { Ball } from "./game_objects/Ball";
import { Paddle } from "./game_objects/Paddle";
import { GeometryBuilder } from "./geometry/GeometryBuilder";
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



  // GAME OBJECTS
  const camera = new Camera(device, canvas.width / canvas.height);
  camera.eye = new Vec3(0,0, -20);
  const paddle1 = new Paddle(device, camera);
  paddle1.position.x = -10;
  paddle1.color = new Color(1,0,0,1);
  const paddle2 = new Paddle(device, camera);
  paddle2.position.x = 10;
  paddle2.color = new Color(0,0,1,1);
  const ball = new Ball(device, camera)


  const update = () => {
    camera.update();
    paddle1.update();
    paddle2.update();
    ball.update();
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

    renderPassEncoder.end();
    device.queue.submit([
      commandEncoder.finish()
    ]);

    requestAnimationFrame(draw);
  }

  draw();
}


init();
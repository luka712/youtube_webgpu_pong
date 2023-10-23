import shaderSource from "./shaders/UnlitMaterialShader.wgsl?raw"


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


  const shaderModule = device.createShaderModule({
    code: shaderSource
  });

  const renderPipeline = device.createRenderPipeline({
    layout: "auto",
    label: "Unlit Render Pipeline",
    vertex: {
      module: shaderModule,
      entryPoint: "unlitMaterialVS"
    },
    fragment: {
      module: shaderModule,
      entryPoint: "unlitMaterialFS",
      targets: [{
        format: "bgra8unorm"
      }]
    }
  });

  const draw = () => {

    const commandEncoder = device.createCommandEncoder();

    const renderPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: gpuContext.getCurrentTexture().createView(),
        storeOp: "store",
        clearValue: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: "clear"
      }]
    });

    renderPassEncoder.setPipeline(renderPipeline);
    renderPassEncoder.draw(3, 1, 0, 0);


    renderPassEncoder.end();
    device.queue.submit([
      commandEncoder.finish()
    ]);

    requestAnimationFrame(draw);
  }

  draw();
}


init();
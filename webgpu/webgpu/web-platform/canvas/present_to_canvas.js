/**
* AUTO-GENERATED - DO NOT EDIT. Source: https://github.com/gpuweb/cts
**/

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let impl = undefined;
function getGPU() {
  if (impl) {
    return impl;
  }

  impl = navigator.gpu;
  return impl;
}

class DevicePool {
  constructor() {
    _defineProperty(this, "device", undefined);

    _defineProperty(this, "state", 'uninitialized');
  }

  async initialize() {
    try {
      const gpu = getGPU();
      const adapter = await gpu.requestAdapter();
      this.device = await adapter.requestDevice();
    } catch (ex) {
      this.state = 'failed';
      throw ex;
    }
  }

  async acquire() {
    const state = this.state;
    this.state = 'acquired';

    if (state === 'uninitialized') {
      await this.initialize();
    }

    return this.device;
  }

  release(device) {
    this.state = 'free';
  }

}

const devicePool = new DevicePool();
class GPURenderingTest {
  constructor() {
    _defineProperty(this, "objects", undefined);

    _defineProperty(this, "initialized", false);
  }

  get device() {
    return this.objects.device;
  }

  get queue() {
    return this.objects.queue;
  }

  async init() {
    const device = await devicePool.acquire();
    const queue = device.defaultQueue;
    this.objects = {
      device,
      queue
    };

    try {
      await device.popErrorScope();
    } catch (ex) {}

    device.pushErrorScope('out-of-memory');
    device.pushErrorScope('validation');
    this.initialized = true;
  }

  async finalize() {
    // Note: finalize is called even if init was unsuccessful.
    if (this.objects) {
      devicePool.release(this.objects.device);
    }
  }

}

async function test() {
  const t = new GPURenderingTest();
  await t.init();

  if (typeof document === 'undefined') {
    // Skip if there is no document (Workers, Node)
    console.log('DOM is not available to create canvas element');
    return;
  }

  const canvas = document.getElementById('gpucanvas');

  if (canvas === null) {
    console.log('DOM is null');
    return;
  } // TODO: fix types so these aren't necessary


  const ctx = canvas.getContext('gpupresent');
  const swapChain = ctx.configureSwapChain({
    device: t.device,
    format: 'rgba8unorm'
  });
  const colorAttachment = swapChain.getCurrentTexture();
  const colorAttachmentView = colorAttachment.createView();
  const encoder = t.device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      attachment: colorAttachmentView,
      loadValue: {
        r: 0.0,
        g: 1.0,
        b: 0.0,
        a: 1.0
      },
      storeOp: 'store'
    }]
  });
  pass.endPass();
  t.device.defaultQueue.submit([encoder.finish()]);
  await t.finalize();
}

test().then(() => {
  takeScreenshotDelayed(50);
});
//# sourceMappingURL=present_to_canvas.js.map
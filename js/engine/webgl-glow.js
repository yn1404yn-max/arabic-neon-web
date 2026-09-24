/**
 * WebGL Glow & Bloom Post-Processing Engine
 * GPU-accelerated real-time post-processing:
 * - Dual-pass bloom
 * - Chromatic aberration (RGB shift)
 * - Vignette and film noise
 * Graceful fallback to 2D canvas if WebGL is not available.
 */

export class WebGLGlowFilter {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.texture = null;
    this.vertexBuffer = null;
    this.isSupported = false;

    this.initGL();
  }

  initGL() {
    try {
      this.gl = this.canvas.getContext('webgl', {
        antialias: false,
        alpha: true,
        preserveDrawingBuffer: true
      }) || this.canvas.getContext('experimental-webgl');

      if (!this.gl) {
        console.warn('WebGL not supported, falling back to pure 2D Canvas');
        return;
      }

      this.initShaders();
      this.initBuffers();
      this.isSupported = true;
    } catch (e) {
      console.warn('WebGL initialization error:', e);
      this.isSupported = false;
    }
  }

  initShaders() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        vTexCoord = aTexCoord;
      }
    `;

    // Advanced Fragment Shader: Bloom + Chromatic Aberration + Vignette
    const fsSource = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uSampler;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uBloomStrength;
      uniform float uChromaticAberration;
      uniform float uVignette;

      void main() {
        vec2 uv = vTexCoord;

        // 1. Chromatic Aberration (RGB Split)
        vec2 distFromCenter = uv - 0.5;
        vec2 rOffset = distFromCenter * (uChromaticAberration * 0.02);
        vec2 bOffset = -distFromCenter * (uChromaticAberration * 0.02);

        float r = texture2D(uSampler, uv + rOffset).r;
        float g = texture2D(uSampler, uv).g;
        float b = texture2D(uSampler, uv + bOffset).b;
        float a = texture2D(uSampler, uv).a;

        vec4 baseColor = vec4(r, g, b, a);

        // 2. Multi-sample Glow Bloom
        vec4 bloom = vec4(0.0);
        vec2 pixel = 1.0 / uResolution;

        bloom += texture2D(uSampler, uv + vec2(-3.0, 0.0) * pixel) * 0.05;
        bloom += texture2D(uSampler, uv + vec2(3.0, 0.0) * pixel) * 0.05;
        bloom += texture2D(uSampler, uv + vec2(0.0, -3.0) * pixel) * 0.05;
        bloom += texture2D(uSampler, uv + vec2(0.0, 3.0) * pixel) * 0.05;

        bloom += texture2D(uSampler, uv + vec2(-6.0, 0.0) * pixel) * 0.03;
        bloom += texture2D(uSampler, uv + vec2(6.0, 0.0) * pixel) * 0.03;
        bloom += texture2D(uSampler, uv + vec2(0.0, -6.0) * pixel) * 0.03;
        bloom += texture2D(uSampler, uv + vec2(0.0, 6.0) * pixel) * 0.03;

        vec4 finalColor = baseColor + bloom * uBloomStrength;

        // 3. Subtle Vignette
        if (uVignette > 0.01) {
          float d = length(distFromCenter) * 1.414;
          float vig = smoothstep(0.8, 0.2, d * uVignette);
          finalColor.rgb *= vig;
        }

        gl_FragColor = finalColor;
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Shader link error:', gl.getProgramInfoLog(this.program));
      this.isSupported = false;
    }
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  initBuffers() {
    const gl = this.gl;

    // Full screen quad
    const vertices = new Float32Array([
      // pos    // uv (Y flipped for canvas)
      -1, -1,   0, 1,
       1, -1,   1, 1,
      -1,  1,   0, 0,
      -1,  1,   0, 0,
       1, -1,   1, 1,
       1,  1,   1, 0,
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Create 2D Texture
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  render(sourceCanvas, params = {}) {
    if (!this.isSupported) return;

    const gl = this.gl;
    const w = this.canvas.width;
    const h = this.canvas.height;

    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    // Update texture from source 2D canvas
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);

    // Set uniforms
    const uSampler = gl.getUniformLocation(this.program, 'uSampler');
    const uResolution = gl.getUniformLocation(this.program, 'uResolution');
    const uTime = gl.getUniformLocation(this.program, 'uTime');
    const uBloomStrength = gl.getUniformLocation(this.program, 'uBloomStrength');
    const uChromatic = gl.getUniformLocation(this.program, 'uChromaticAberration');
    const uVignette = gl.getUniformLocation(this.program, 'uVignette');

    gl.uniform1i(uSampler, 0);
    gl.uniform2f(uResolution, w, h);
    gl.uniform1f(uTime, performance.now() / 1000);
    gl.uniform1f(uBloomStrength, params.bloomStrength || 1.2);
    gl.uniform1f(uChromatic, params.chromaticAberration || 0.3);
    gl.uniform1f(uVignette, params.vignette || 0.5);

    // Set attributes
    const aPosition = gl.getAttribLocation(this.program, 'aPosition');
    const aTexCoord = gl.getAttribLocation(this.program, 'aTexCoord');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

// A few lines of WebGL2: context, program, fullscreen triangle, uniforms (reference/shaders/README).

export const FULLSCREEN_VERT =
  '#version 300 es\nin vec2 aPos; void main(){ gl_Position = vec4(aPos, 0., 1.); }'

export function createGL(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
  return canvas.getContext('webgl2', {
    alpha: false,
    antialias: false, // the shaders antialias their own lines with fwidth
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  })
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('createShader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    const log = gl.getShaderInfoLog(shader) ?? ''
    gl.deleteShader(shader)
    throw new Error(`shader compile failed: ${log}`)
  }
  return shader
}

/** Links a program, binds the fullscreen triangle to attribute 0 (`aPos`) and makes it current. */
export function program(gl: WebGL2RenderingContext, frag: string, vert = FULLSCREEN_VERT): WebGLProgram {
  const p = gl.createProgram()
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vert))
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag))
  gl.bindAttribLocation(p, 0, 'aPos')
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) {
    throw new Error(`program link failed: ${gl.getProgramInfoLog(p) ?? ''}`)
  }
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook (D-110)
  gl.useProgram(p)
  return p
}

type UniformValue = number | readonly number[]

/** Sets float uniforms by name (1–4 components). Unknown names are ignored, as GL does. */
export function setUniforms(
  gl: WebGL2RenderingContext,
  p: WebGLProgram,
  values: Readonly<Record<string, UniformValue>>,
) {
  for (const [name, v] of Object.entries(values)) {
    const loc = gl.getUniformLocation(p, name)
    if (!loc) continue
    const a = typeof v === 'number' ? [v] : v
    const [x = 0, y = 0, z = 0, w = 0] = a
    if (a.length === 1) gl.uniform1f(loc, x)
    else if (a.length === 2) gl.uniform2f(loc, x, y)
    else if (a.length === 3) gl.uniform3f(loc, x, y, z)
    else gl.uniform4f(loc, x, y, z, w)
  }
}

export function drawFullscreen(gl: WebGL2RenderingContext) {
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

"use strict";

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function main() {
  // Get A WebGL context
  var canvas = document.querySelector("#c");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // look up uniform locations
  // u_resolution이라는 uniform을 추가했기 때문에 uniform의 위치를 찾는 작업을 진행해야 한다.
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  // u_color라는 uniform을 fragment shader에 추가했기 때문에 uniform의 위치를 찾는 작업을 진행
  var colorUniformLocation = gl.getUniformLocation(program, "u_color");

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // uniform으로 해상도 설정
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // 임의의 색상으로 임의의 사각형 50개 그리기
  for (var ii = 0; ii < 50; ++ii) {
    // 임의의 사각형 설정
    // 초기화 과정에서 수행했던 gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // ARRAY_BUFFER 바인드 포인트에 마지막으로 바인딩한 것이므로 `positionBuffer`에 작성된다. 
    setRectangle(
        gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

    // Set a random color.
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    // 6번 호출
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

// 0부터 -1사이의 임의의 정수 반환.
function randomInt(range) {
  //Math.floor() : 소수점 이하를 버림한다.
  return Math.floor(Math.random() * range);
}

// 사각형을 정의한 값들로 버퍼 채우기
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  // 참고: gl.bufferData(gl.ARRAY_BUFFER, ...)는 `ARRAY_BUFFER` 바인드 포인트에 바인딩된 버퍼에 영향을 준다.
  // 버퍼가 두 개 이상이라면 원하는 버퍼를 `ARRAY_BUFFER`에 먼저 바인딩해야 한다.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

main();
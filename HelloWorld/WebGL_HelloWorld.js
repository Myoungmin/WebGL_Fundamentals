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

//prgram에 shader 연결하는 함수
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

  // Get the strings for our GLSL shaders
  var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  // 생성된 program의 attribute 위치를 찾는다.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put three 2d clip space points in it
  // attribute는 buffer에서 데이터를 가져오기 때문에 buffer를 생성한다.
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  // 생성한 buffer를 바인드 포인트를 통해 리소스를 참조한다.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  //자바스크립트 배열인 positions
  // 2D 포인트 3개
  var positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
  ];
  //gl.bufferData는 데이터를 GPU의 positionBuffer로 복사한다. 
  //자바스크립트와 다르게 WebGL은 강력한 타입을 가지는 데이터가 필요하므로, 새로운 32비트 부동 소수점 배열을 생성
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // code above this line is initialization code.
  // code below this line is rendering code.

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  // gl_Position으로 설정할 클립 공간 값을 어떻게 화면 공간으로 변환하는지 WebGL에 알려준다.
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  // Canvas를 투명하게 지운다.
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  // 실행할 shader program을 WebGL에 알려준다.
  gl.useProgram(program);

  // Turn on the attribute
  // gl.getAttribLocation로 찾았던 attribute를 활성화한다.
  gl.enableVertexAttribArray(positionAttributeLocation);

  // 데이터를 어떻게 꺼낼지 설정한다.
  
  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // attribute는 positionBuffer에 바인딩된다.
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer

  //활성화한 attribute를 파라미터로 넘긴다.
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // draw
  // primitiveType을 gl.TRIANGLES로 설정했기 때문에, 정점 셰이더가 3번 실행될 때마다, WebGL은 gl_Position에 설정한 3개의 값을 기반으로 삼각형을 그린다.
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  // vertex shader를 3번 실행한다.
  var count = 3;

  // WebGL은 이제 삼각형을 렌더링한다.
  // 그리려는 모든 픽셀에 대해 WebGL은 fragment shader를 호출한다.
  // vertex shader가 데이터를 직접 전달하는 것 외에는 아무것도 하지 않는다. 위치 데이터가 이미 클립 공간에 있으므로 할 일이 없다.
  gl.drawArrays(primitiveType, offset, count);
}

main();
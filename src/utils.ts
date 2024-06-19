import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";

let detector, video;
let amountStraightEvents = 0;
const VIDEO_SIZE = 500;
let positionXLeftIris;
let positionYLeftIris;
let event;

const normalize = (val, max, min) =>
  Math.max(0, Math.min(1, (val - min) / (max - min)));

const isFaceRotated = (landmarks) => {
  const leftCheek = landmarks.leftCheek;
  const rightCheek = landmarks.rightCheek;
  const midwayBetweenEyes = landmarks.midwayBetweenEyes;

  const xPositionLeftCheek = video.width - leftCheek[0][0];
  const xPositionRightCheek = video.width - rightCheek[0][0];
  const xPositionMidwayBetweenEyes = video.width - midwayBetweenEyes[0][0];

  const widthLeftSideFace = xPositionMidwayBetweenEyes - xPositionLeftCheek;
  const widthRightSideFace = xPositionRightCheek - xPositionMidwayBetweenEyes;

  const difference = widthRightSideFace - widthLeftSideFace;

  if (widthLeftSideFace < widthRightSideFace && Math.abs(difference) > 5) {
    return true;
  } else if (
    widthLeftSideFace > widthRightSideFace &&
    Math.abs(difference) > 5
  ) {
    return true;
  }
  return false;
};

async function renderPrediction() {
  console.log(video);
  const predictions = await detector.estimateFaces(video, {
    flipHorizontal: false,
  });

  console.log(predictions);
  const irisies = predictions[0].keypoints.filter(
    (point) => point.name === "leftIris"
  );

  if (irisies.length > 0) {
    const faceBottomLeftX = predictions[0].box.xMin; // face is flipped horizontally so bottom right is actually bottom left.
    const faceBottomLeftY = predictions[0].box.yMin;

    const faceTopRightX = predictions[0].box.xMax; // face is flipped horizontally so top left is actually top right.
    const faceTopRightY = predictions[0].box.yMax;

    positionXLeftIris = irisies[1].x - faceBottomLeftX;
    positionYLeftIris = irisies[1].y - faceBottomLeftY;

    const normalizedXIrisPosition = normalize(
      positionXLeftIris,
      faceTopRightX,
      faceBottomLeftX
    );

    if (normalizedXIrisPosition > 0.355) {
      event = "RIGHT";
    } else if (normalizedXIrisPosition < 0.315) {
      event = "LEFT";
    } else {
      amountStraightEvents++;
      if (amountStraightEvents > 8) {
        event = "STRAIGHT";
        amountStraightEvents = 0;
      }
    }

    const normalizedYIrisPosition =
      (irisies[1].y - predictions[0].box.yMin) / predictions[0].box.height;

    if (normalizedYIrisPosition < 0.26) {
      event = "TOP";
    }
  }

  return event;
}

const loadModel = async () => {
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: "mediapipe", // or 'tfjs'
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
    refineLandmarks: true,
  };
  // @ts-ignore
  detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
};

const setUpCamera = async (videoElement, webcamId = undefined) => {
  video = videoElement;
  const mediaDevices = await navigator.mediaDevices.enumerateDevices();

  const defaultWebcam = mediaDevices.find(
    (device) =>
      device.kind === "videoinput" && device.label.includes("Built-in")
  );

  const cameraId = defaultWebcam ? defaultWebcam.deviceId : webcamId;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      deviceId: cameraId,
      width: VIDEO_SIZE,
      height: VIDEO_SIZE,
    },
  });

  video.srcObject = stream;
  video.play();
  video.width = 500;
  video.height = 500;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
};

const gaze = {
  loadModel: loadModel,
  setUpCamera: setUpCamera,
  getGazePrediction: renderPrediction,
};

export default gaze;

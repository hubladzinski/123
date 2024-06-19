import ChromeDinoGame from "react-chrome-dino";
import "./App.css";
import gaze from "./utils";

function jump() {
  var e = new Event("keydown");
  e.keyCode = 38; // keyCode for the Arrow Up key is 38
  document.dispatchEvent(e);
}

const App = () => {
  const setup = async () => {
    const videoElement = document.querySelector("#video");
    await gaze.loadModel();
    await gaze.setUpCamera(videoElement);
  };

  const predict = async () => {
    const event = await gaze.getGazePrediction();
    console.log(event, event === "TOP");

    if (event === "TOP") {
      console.log("EXECUTE");
      jump();
    }

    requestAnimationFrame(predict);
  };

  return (
    <div>
      <video
        id="video"
        style={{
          transform: "scaleX(-1)",
          visibility: "hidden",
          width: "auto",
          height: "auto",
          display: "auto",
        }}
      ></video>
      <button onClick={setup}>Setup all</button>
      <button onClick={predict}>Start prediction</button>
      <button onClick={jump}>JUMP</button>
      <div style={{ width: "600px", height: "600px" }}>
        <ChromeDinoGame />
      </div>
    </div>
  );
};

export default App;

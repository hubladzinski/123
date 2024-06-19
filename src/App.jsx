import ChromeDinoGame from "react-chrome-dino";
import "./App.css";
import gaze from "./utils";
import { useState, useEffect } from "react";

function jump() {
  var e = new Event("keydown");
  e.keyCode = 38; // keyCode for the Arrow Up key is 38
  document.dispatchEvent(e);
}

const App = () => {
  const [initialized, setInitialized] = useState(false);
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

  useEffect(() => {
    const handleSetup = async () => {
      await setup();
      predict();
    };
    if (!initialized) {
      handleSetup();
      setInitialized(false);
    }
  }, []);

  return (
    <div>
      <video
        id="video"
        style={{
          transform: "scaleX(-1)",
          visibility: "hidden",
          width: "0",
          height: "0",
          display: "none",
        }}
      ></video>
      <div style={{ width: "600px", height: "600px" }}>
        <ChromeDinoGame />
      </div>
    </div>
  );
};

export default App;

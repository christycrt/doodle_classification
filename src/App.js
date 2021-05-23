import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { useSvgDrawing } from "react-hooks-svgdrawing";
import axios from "axios";
import Swal from "sweetalert2"

const Drawing = ({ onPredict, onClear, renderRef }) => {
  return (
    <>
      <div id="capture" ref={renderRef} className="box" />
      <div className="d-flex justify-content-between">
        <button className="btn btn-danger" onClick={() => onClear()}>
          Clear
        </button>
        <button className="btn btn-success" onClick={() => onPredict()}>Predict</button>
      </div>
    </>
  );
};

function App() {
  const [doodleClass, setDoodleClass] = useState(null)
  const [doodleClasses, setDoodleClasses] = useState(null)
  const [loading, setLoading] = useState(false)
  const [renderRef, action] = useSvgDrawing({
    penWidth: 5, // pen width
    penColor: "white", // pen color
    width: 300, // drawing area width
    height: 300, // drawing area height
  });
  let api = process.env.REACT_APP_API

  useEffect(() => {
    fetchDoodleClasses()
  }, [])

  const fetchDoodleClasses = async () => {
    await axios.get(`${api}/doodle-classes`).then((res) => {
      setDoodleClasses(res.data.doodle_classes)
      randomDoodleClass(res.data.doodle_classes)
    })
  }

  const randomDoodleClass = (doodle_classes) => {
    let classes = null
    if (!doodleClasses) {
      classes = doodle_classes
    } else {
      classes = doodleClasses
    }
    let class1 = classes[Math.floor(Math.random() * classes.length)]
    let class2 = classes[Math.floor(Math.random() * classes.length)]
    while (true) {
      if (class1 !== class2) {
        break;
      }
      class2 = classes[Math.floor(Math.random() * classes.length)]
    }
    setDoodleClass([class1, class2])
  }

  const onClear = () => {
    action.clear();
  };

  const onPredict = () => {
    if (!loading) {
      setLoading(true)
      const text = document.getElementById("capture")
      html2canvas(text, { width: 400, height: 400 }).then(async (canvas) => {
        const imgData = canvas.toDataURL("image/jpeg", 1.0)
        let file = dataURLtoFile(imgData, "test.png")
        let data = new FormData()
        data.append("file", file)
        await axios.post(`${api}/predict?doodle_class1=${doodleClass[0]}&doodle_class2=${doodleClass[1]}`, data).then(res => {
          if (res.data.result) {
            Swal.fire({
              icon: 'success',
              title: 'Your picture is correct',
              text: 'It is ' + res.data.result_predict.predict_class + ' ' + (res.data.result_predict.accuracy * 100) + '%',
            }).then(() => {
              randomDoodleClass()
              onClear()
              setLoading(false)
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Your picture is wrong',
              text: 'It is not ' + doodleClass[0] + ' or ' + doodleClass[1],
            }).then(() => {
              setLoading(false)
            })
          }
        })
      })
    }
  }

  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  return (
    <>
      <div className="topic-quickdraw">Doodle classifier</div>
      {doodleClass && (
        <>
          <div className="text-center">
            <div className="d-inline-block">
              <h1 className="d-flex justify-content-between">
                <span>Draw</span>
                <button onClick={() => randomDoodleClass()} type="button" class="btn btn-info">Reset</button>
              </h1>
              <h2 className="d-flex justify-content-between">
                <span>{doodleClass[0]}</span>
                <span>or</span>
                <span>{doodleClass[1]}</span>
              </h2>
              <Drawing onPredict={onPredict} onClear={onClear} renderRef={renderRef} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
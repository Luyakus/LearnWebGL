import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { LessonTemplate } from "./LessonTemplate";
import { lessonTwoMain } from "./lesson/two/lesson-two";
import { lessonOneMain } from "./lesson/one/lesson-one";
import { lessonThreeMain } from "./lesson/three/lesson-three";
import { lessonFourMain } from "./lesson/four/lesson-four";
import { lessonFiveMain } from "./lesson/five/lesson-five";

function LessonOverview() {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex flex-row flex-wrap gap-4 content-start">
      {/* <div
        className="w-[500px] h-[282px]"
        onClick={() => {
          navigate("/lesson-one");
        }}
      >
        <LessonTemplate render={lessonOneMain} desc="简单使用 webgl2" />
      </div>
      <div
        className="w-[500px] h-[282px]"
        onClick={() => {
          navigate("/lesson-two");
        }}
      >
        <LessonTemplate render={lessonTwoMain} desc="加载纹理" />
      </div>
      <div
        className="w-[500px] h-[282px]"
        onClick={() => {
          navigate("/lesson-three");
        }}
      >
        <LessonTemplate render={lessonThreeMain} desc="滤镜" />
      </div>
      <div
        className="w-[500px] h-[282px]"
        onClick={() => {
          navigate("/lesson-four");
        }}
      >
        <LessonTemplate render={lessonFourMain} desc="多个纹理" />
      </div> */}
      <div
        className="w-[500px] h-[282px]"
        onClick={() => {
          navigate("/lesson-five");
        }}
      >
        <LessonTemplate render={lessonFiveMain} desc="三维立方体" />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="h-screen w-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LessonOverview />} />
          <Route
            path="/lesson-one"
            element={<LessonTemplate render={lessonOneMain} />}
          />
          <Route
            path="/lesson-two"
            element={<LessonTemplate render={lessonTwoMain} />}
          />
          <Route
            path="/lesson-three"
            element={<LessonTemplate render={lessonThreeMain} />}
          />
          <Route
            path="/lesson-four"
            element={<LessonTemplate render={lessonFourMain} />}
          />
          <Route
            path="/lesson-five"
            element={<LessonTemplate render={lessonFiveMain} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

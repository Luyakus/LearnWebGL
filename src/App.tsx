import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { LessonTemplate } from "./LessonTemplate";
import { lessonTwoMain } from "./lesson/two/lesson-two";
import { lessonOneMain } from "./lesson/one/lesson-one";
import { lessonThreeMain } from "./lesson/three/lesson-three";
import { lessonFourMain } from "./lesson/four/lesson-four";
import { lessonFiveMain } from "./lesson/five/lesson-five";
import { lessonSixMain } from "./lesson/six/lesson-six";
import { lessonSevenMain } from "./lesson/seven/lesson-seven";
import { lessonEightMain } from "./lesson/eight/lesson-eight";
import { lessonNineMain } from "./lesson/nine/lesson-nine";
import { lessonTenMain } from "./lesson/ten/lesson-ten";
import { lessonElevenMain } from "./lesson/eleven/lesson-eleven";
import { lessonTwelveMain } from "./lesson/twelve/lesson-twelve";
import { lessonThirteenMain } from "./lesson/thirteen/lesson-thirteen";

interface RouteItem {
  render: (canvas: HTMLCanvasElement) => void;
  path: string;
  title: string;
}

const routes: RouteItem[] = [
  {
    render: lessonOneMain,
    path: "/lesson-one",
    title: "简单使用 webgl2",
  },
  {
    render: lessonTwoMain,
    path: "/lesson-two",
    title: "加载纹理",
  },
  {
    render: lessonThreeMain,
    path: "/lesson-three",
    title: "滤镜",
  },
  {
    render: lessonFourMain,
    path: "/lesson-four",
    title: "多个纹理",
  },
  {
    render: lessonFiveMain,
    path: "/lesson-five",
    title: "多个 program 使用多个纹理",
  },
  {
    render: lessonSixMain,
    path: "/lesson-six",
    title: "摄像机",
  },
  {
    render: lessonSevenMain,
    path: "/lesson-seven",
    title: "简单的光照场景",
  },
  {
    render: lessonEightMain,
    path: "/lesson-eight",
    title: "光照+材质",
  },
  {
    render: lessonNineMain,
    path: "/lesson-nine",
    title: "光照贴图",
  },
  {
    render: lessonTenMain,
    path: "/lesson-ten",
    title: "投光物-平行光-多物体",
  },
  {
    render: lessonElevenMain,
    path: "/lesson-eleven",
    title: "投光物-点光源衰减-多物体",
  },
  {
    render: lessonTwelveMain,
    path: "/lesson-twelve",
    title: "手电筒",
  },
  {
    render: lessonThirteenMain,
    path: "/lesson-thirteen",
    title: "光照综合demo",
  },
];

function LessonOverview() {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex flex-row flex-wrap justify-between">
      {routes.map((route) => {
        return (
          <div
            key={route.path}
            style={{"width":"32%"}}
            className="h-[282px] mb-[20px]"
            onClick={() => {
              navigate(route.path);
            }}
          >
            <LessonTemplate render={route.render} desc={route.title} />
          </div>
        );
      })}
    </div>
  );
}

function App() {
  return (
    <div className="h-screen w-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LessonOverview />} />
          {...routes.map((route) => (
            <Route
              path={route.path}
              element={<LessonTemplate render={route.render} />}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

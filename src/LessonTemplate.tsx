import { useEffect, useRef } from "react";

export function LessonTemplate(props: {
  render: (canvas: HTMLCanvasElement) => void;
  desc?: string;
}) {
  let ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) {
      props.render(ref.current);
    } else {
      console.log("获取canvas 失败");
    }
  }, [ref]);

  return (
    <div className="w-full h-full relative block">
      <canvas
        className="w-full h-full border border-sky-300"
        ref={ref}
      ></canvas>
      <p className="absolute top-[20px] left-[20px] text-red-500 ">{props.desc}</p>
    </div>
  );
}

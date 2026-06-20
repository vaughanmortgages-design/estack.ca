import { Composition } from "remotion";
import { PrimeDayPromo } from "./PrimeDayPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PrimeDayPromo"
        component={PrimeDayPromo}
        durationInFrames={450}   // 15s × 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

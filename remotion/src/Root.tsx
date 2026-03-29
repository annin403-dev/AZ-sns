import { Composition } from "remotion";
import { MoleDollVideo } from "./compositions/MoleDollVideo";

// Instagram Short: 1080x1920 (9:16)
const FPS = 30;
const DURATION_SECONDS = 25;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MoleDollVideo"
        component={MoleDollVideo}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

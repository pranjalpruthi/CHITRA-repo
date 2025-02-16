import {
  ICraftPlayer,
  ICraftPlayerInstance,
  CameraBar
} from "@icraft/player-react";
import React, { useRef } from "react";

const style = {
  width: "100%",
  height: "100%",
  position: "relative" as const,
  overflow: "hidden" as const,
};

const cameraBarStyle = {
  left: "initial",
  transform: "translateX(0%)",
  bottom: "10px",
  right: "10px",
  background: "rgba(0, 0, 0, 0.2)",
  borderRadius: "8px",
  padding: "4px",
};

export const WorkflowAnimation = () => {
  const playerRef = useRef<ICraftPlayerInstance>(null);

  return (
    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/20">
      <ICraftPlayer
        src="/assets/logos/workflow/chitra.iplayer"
        ref={playerRef}
        addons={
          <CameraBar 
            style={cameraBarStyle}
          />
        }
      />
    </div>
  );
}; 
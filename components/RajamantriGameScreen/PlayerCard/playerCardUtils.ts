import { PlayerImageData } from "./types";

export const getImageSource = (imageData: PlayerImageData) => {
  return imageData.type === "local" ? imageData.src : { uri: imageData.src };
};

export type WindowId =
  | "about"
  | "projects"
  | "terminal"
  | "resume"
  | "contact"
  | "lab";

export type DesktopWindow = {
  id: WindowId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  closed: boolean;
  closing: boolean;
};

export type WindowAction = {
  type: "close" | "minimize" | "maximize" | "focus";
  id: WindowId;
};

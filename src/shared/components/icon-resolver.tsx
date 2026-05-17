import {
  LucideBusFront,
  LucideCableCar,
  LucideCircleQuestionMark,
  LucidePlane,
  LucideShip,
  LucideSquareM,
  LucideTrainFront,
  LucideTramFront,
} from "lucide-react";
import { VehicleType } from "../constants/enums";

interface IconResolverProps {
  type: VehicleType;
  color?: string;
  size?: number;
}

export default function IconResolver({ type, color, size }: IconResolverProps) {
  switch (type) {
    case "AIRPLANE":
      return (
        <LucidePlane
          size={size ?? 20}
          className={color ? color : "text-background"}
        />
      );
    case "BUS":
      return (
        <LucideBusFront
          size={size ?? 20}
          className={color ? color : "text-background"}
        />
      );
    case "CABLE_CAR":
      return (
        <LucideCableCar
          size={size ?? 20}
          className={color ? color : "text-background"}
        />
      );
    case "METRO":
      return (
        <LucideSquareM
          size={size ?? 20}
          className={color ? color : "text-background"}
        />
      );
    case "SHIP":
      return (
        <LucideShip
          size={size ?? 20}
          className={color ? color : "text-background"}
        />
      );
    case "TRAIN":
      return (
        <LucideTrainFront
          size={size ?? 20}
          className={color ? color : "text-background"}
        />
      );
    case "TRAM":
      return (
        <LucideTramFront
          size={size ?? 20}
          className={color ? color : "text-background"}
        />
      );
    case "TROLLEYBUS":
      return (
        <LucideBusFront
          size={size ?? 20}
          className={color ? color : "text-background"}
        />
      );
    default:
      return <LucideCircleQuestionMark />;
  }
}

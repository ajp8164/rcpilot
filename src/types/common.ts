export type DurationString = string;
export type ISODateString = string;

export enum ScanCodeSize {
  Large = 'Large',
  Small = 'Small',
  None = 'None',
};

export type IconProps = {
  name: string;
  color?: string;
  size?: number;
  // @ts-ignore: should be typed StyleProp<TextStyle>
  style?: any;
  Component?: JSX.Element;
} | null;

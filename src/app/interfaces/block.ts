import { FsBlockComponent } from '../components/block/block.component';
import { BlockType } from '../enums';

export interface Block {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  rotate?: number;
  //horizontalAlign?: 'left' | 'right' | 'center' | 'justify';
  //verticalAlign?: 'top' | 'center' | 'bottom';
  horizontalAlign?: string;
  verticalAlign?: string;
  borderColor?: string;
  borderWidth?: number;
  fontColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  keepRatio?: boolean;
  backgroundColor?: string;
  shapeRadius?: number;
  lineHeight?: number;
  shapeTopRight?: string;
  shapeTopLeft?: string;
  shapeBottomRight?: string;
  shapeBottomLeft?: string;
  padding?: number;
  paddingTop?: number;
  paddingLeft?: number;
  paddingBottom?: number;
  paddingRight?: number;
  content?: string;
  blockComponent?: FsBlockComponent;
  index?: number;
  tabIndex?: number;
  imageUrl?: string;
  clipPath?: {
    type: string,
    values: number[],
  };
  readonly?: boolean;
  name?: string;
  format?: string;
  required?: boolean;
  label?: string;
  description?: string;
  default?: string;
  groupLabel?: string;
  groupDescription?: string;
  guid?: string;
  type?: BlockType;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowSpread?: number;
  shadowOpacity?: number;
  imageOpacity?: number;
  fontFamily?: string;
  formula?: string;
  data?: any;
  clippable?: boolean;
  lock?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
  scalable?: boolean;
}

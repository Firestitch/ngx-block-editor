import { BlockType } from '../enums';

export const BlockTypes = [
  { value: BlockType.Rectangle, name: 'Rectangle', icon: 'crop_5_4' },
  { value: BlockType.ShortText, name: 'Short Text', icon: 'short_text' },
  { value: BlockType.LongText, name: 'Long Text', icon: 'subject' },
  { value: BlockType.RadioButton, name: 'Radio Button', icon: 'radio_button_checked' },
  { value: BlockType.Checkbox, name: 'Checkbox', icon: 'check_box' },
  { value: BlockType.Date, name: 'Date', icon: 'calendar_today' },
  { value: BlockType.Signature, name: 'Signature', icon: 'draw' },
  { value: BlockType.Image, name: 'Image', icon: 'image', accept: 'image/*' },
  { value: BlockType.Pdf, name: 'Pdf', icon: 'picture_as_pdf', accept: 'application/pdf' },
];

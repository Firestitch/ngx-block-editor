import { BlockType } from '../enums';

export const BlockTypes = [
  { value: BlockType.Rectangle, name: 'Rectangle', icon: 'crop_5_4', type: 'draw' },
  { value: BlockType.ShortText, name: 'Short Text', icon: 'short_text', type: 'form' },
  { value: BlockType.LongText, name: 'Long Text', icon: 'subject', type: 'form' },
  { value: BlockType.RadioButton, name: 'Radio Button', icon: 'radio_button_checked', type: 'form' },
  { value: BlockType.Checkbox, name: 'Checkbox', icon: 'check_box', type: 'form' },
  { value: BlockType.Date, name: 'Date', icon: 'calendar_today', type: 'form' },
  { value: BlockType.Signature, name: 'Signature', icon: 'draw', type: 'form' },
  { value: BlockType.Image, name: 'Image', icon: 'image', accept: 'image/*', type: 'draw' },
  { value: BlockType.Pdf, name: 'Pdf', icon: 'picture_as_pdf', accept: 'application/pdf', type: 'draw' },
];

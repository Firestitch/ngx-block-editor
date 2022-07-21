import { BlockFormat, BlockType } from '../enums';

export const BlockFormats = [
  { value: BlockFormat.Number, name: 'Number', blockTypes: [BlockType.ShortText, BlockType.LongText]  },
  { value: BlockFormat.Currency, name: 'Currency', blockTypes: [BlockType.ShortText, BlockType.LongText]  },
  { value: BlockFormat.Date, name: 'Date', blockTypes: [BlockType.Date]  },
  { value: BlockFormat.YYYYMMDD, name: 'YYYY/MM/DD', blockTypes: [BlockType.Date] },
];

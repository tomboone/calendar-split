/**
 * Local Calendar Configuration
 *
 * Copy this file to calendars.local.ts and fill in your calendar details.
 * The calendars.local.ts file is gitignored and won't be committed.
 *
 * To set up:
 * 1. Copy this file: cp calendars.local.example.ts calendars.local.ts
 * 2. Edit calendars.local.ts with your actual calendar IDs
 */

import type { ColumnConfig } from './calendar.config';

const columns: ColumnConfig[] = [
  {
    name: 'Tom',
    calendars: [
      {
        id: 'tom@gmail.com',        // Your primary Google Calendar
        name: 'Personal',
        color: '#4285f4'            // Blue
      },
      {
        id: 'tom.work@company.com', // Work calendar
        name: 'Work',
        color: '#34a853'            // Green
      },
    ],
  },
  {
    name: 'Wife',
    calendars: [
      {
        id: 'wife@gmail.com',
        name: 'Personal',
        color: '#9c27b0'            // Purple
      },
      {
        id: 'wife.personal@gmail.com',
        name: 'Secondary',
        color: '#e91e63'            // Pink
      },
    ],
  },
  // Add more people as needed:
  // {
  //   name: 'Kids',
  //   calendars: [
  //     { id: 'family@gmail.com', name: 'Family', color: '#ff9800' },
  //   ],
  // },
];

export default { columns };

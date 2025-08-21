// Three sample tile maps for the demo. Each uses the same tileset indices.
export const maps = [
  {
    name: 'Border',
    columns: 8,
    rows: 6,
    tiles: [
      1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,1,
      1,0,2,2,2,2,0,1,
      1,0,2,3,3,2,0,1,
      1,0,0,0,0,0,0,1,
      1,1,1,1,1,1,1,1,
    ],
  },
  {
    name: 'Diagonal',
    columns: 8,
    rows: 6,
    tiles: [
      0,0,0,0,0,0,0,0,
      0,1,0,0,0,0,0,0,
      0,0,1,0,0,0,0,0,
      0,0,0,1,0,0,0,0,
      0,0,0,0,1,0,0,0,
      0,0,0,0,0,1,0,0,
    ],
  },
  {
    name: 'Checker',
    columns: 8,
    rows: 6,
    tiles: [
      0,1,0,1,0,1,0,1,
      1,0,1,0,1,0,1,0,
      0,1,0,1,0,1,0,1,
      1,0,1,0,1,0,1,0,
      0,1,0,1,0,1,0,1,
      1,0,1,0,1,0,1,0,
    ],
  },
];

const fs = require('fs');
const content = fs.readFileSync('d:\\MyWorks\\SpaccaTests\\SpaccaPos20260416_0\\SpaccaPos\\artifacts\\spacca-pos\\src\\pages\\cashier.tsx', 'utf8');
const lines = content.split(/\r?\n/);
const line551 = lines[551]; // 0-indexed
console.log('Line 552 content:', JSON.stringify(line551));

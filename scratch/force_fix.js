const fs = require('fs');
const path = 'd:\\MyWorks\\SpaccaTests\\SpaccaPos20260416_0\\SpaccaPos\\artifacts\\spacca-pos\\src\\pages\\cashier.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/parseFloat\(heroOrder\.discount \|\| \"0\"\)/g, '(heroOrder.discount as any)');
content = content.replace(/parseFloat\(order\.discount \|\| \"0\"\)/g, '(order.discount as any)');
fs.writeFileSync(path, content);
console.log('Replacement complete');

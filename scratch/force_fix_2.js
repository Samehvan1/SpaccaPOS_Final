const fs = require('fs');
const path = 'd:\\MyWorks\\SpaccaTests\\SpaccaPos20260416_0\\SpaccaPos\\artifacts\\spacca-pos\\src\\pages\\cashier.tsx';
let content = fs.readFileSync(path, 'utf8');
// Fix discountValue parseFloat as well
content = content.replace(/parseFloat\(heroOrder\.discountValue\)/g, 'Number(heroOrder.discountValue)');
content = content.replace(/parseFloat\(order\.discountValue\)/g, 'Number(order.discountValue)');
fs.writeFileSync(path, content);
console.log('Discount value replacement complete');

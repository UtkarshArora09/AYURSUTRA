const fs = require('fs');
const path = require('path');

const targetUrl = 'https://ayursutra-qhp0.onrender.com';
const newUrl = 'https://ayursutra-tox3.onrender.com';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(targetUrl)) {
        content = content.split(targetUrl).join(newUrl);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory('./src');
console.log('Replacement complete.');

const fs = require('fs');
const path = require('path');

// Directories to scan
const dirsToScan = [
    path.join(__dirname, 'client', 'src'),
    path.join(__dirname, 'server')
];

// Directories and files to ignore
const excludeDirs = ['node_modules', 'dist', '.git', 'uploads', '.next', 'build'];
// Desired file extensions
const includeExts = ['.ts', '.tsx', '.js', '.jsx', '.css'];

let reportContent = 'PROJECT SOURCE CODE COMPILATION FOR PLAGIARISM CHECK\n========================================================\n';

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                walkDir(fullPath);
            }
        } else {
            const ext = path.extname(file);
            if (includeExts.includes(ext)) {
                // Read file
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');

                    reportContent += `\n\n\n/*******************************************************************************\n`;
                    reportContent += ` * FILE: ${relativePath}\n`;
                    reportContent += ` *******************************************************************************/\n\n`;
                    reportContent += content;
                } catch (e) {
                    console.error(`Could not read file: ${fullPath}`, e.message);
                }
            }
        }
    }
}

// Start traversing
dirsToScan.forEach(dir => walkDir(dir));

// Write to output file
const outputPath = path.join(__dirname, 'plagiarism_source_code.txt');
fs.writeFileSync(outputPath, reportContent);

console.log(`Successfully generated the source code compilation at:\n${outputPath}`);

#!/usr/bin/env node
/**
 * Image Optimization Script for KDIH Website
 * 
 * This script optimizes images by:
 * 1. Converting PNG/JPG to WebP format
 * 2. Resizing large images
 * 3. Compressing images
 * 
 * Usage: npm run optimize-images
 * Requires: sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.log('⚠️  Sharp not installed. Run: npm install sharp');
    console.log('\nAlternatively, optimize images manually using:\n');
    console.log('Online tools:');
    console.log('  - https://squoosh.app/ (WebP conversion)');
    console.log('  - https://tinypng.com/ (PNG/JPG compression)');
    console.log('  - https://imageoptim.com/online (General optimization)\n');

    // List images that need optimization
    listLargeImages();
    process.exit(0);
}

const IMAGES_DIR = path.join(__dirname, 'public/images');
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_WIDTH = 1200;  // Max width for images
const QUALITY = 80;      // WebP quality (0-100)

async function optimizeImage(inputPath, outputPath) {
    const stats = fs.statSync(inputPath);
    const sizeKB = stats.size / 1024;

    if (sizeKB < 100) {
        console.log(`  ⏭️  Skipping ${path.basename(inputPath)} (already small: ${sizeKB.toFixed(1)}KB)`);
        return;
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    let pipeline = image;

    // Resize if too wide
    if (metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH);
    }

    // Convert to WebP
    const webpPath = outputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

    await pipeline.webp({ quality: QUALITY }).toFile(webpPath);

    const newStats = fs.statSync(webpPath);
    const newSizeKB = newStats.size / 1024;
    const savings = ((sizeKB - newSizeKB) / sizeKB * 100).toFixed(1);

    console.log(`  ✅ ${path.basename(inputPath)}: ${sizeKB.toFixed(1)}KB → ${newSizeKB.toFixed(1)}KB (${savings}% saved)`);
}

async function processDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`Directory not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            await processDirectory(filePath);
        } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
            await optimizeImage(filePath, filePath);
        }
    }
}

function listLargeImages() {
    console.log('\n📸 Large Images Found:\n');

    const dirs = [
        path.join(__dirname, 'public'),
        path.join(__dirname, 'public/images'),
        path.join(__dirname, 'public/images/gallery')
    ];

    let totalSize = 0;
    let count = 0;

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (!/\.(png|jpg|jpeg)$/i.test(file)) continue;

            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            const sizeKB = stats.size / 1024;

            if (sizeKB > 100) {
                console.log(`  📁 ${file}: ${sizeKB.toFixed(0)}KB`);
                totalSize += sizeKB;
                count++;
            }
        }
    }

    if (count > 0) {
        console.log(`\n📊 Total: ${count} images, ${(totalSize / 1024).toFixed(2)}MB`);
        console.log(`💡 Potential savings: ~${(totalSize * 0.85 / 1024).toFixed(2)}MB with WebP conversion`);
    }
}

async function main() {
    console.log('\n🖼️  KDIH Image Optimization\n');
    console.log('Processing public directory...\n');

    // Process main public directory (founder.jpg, logo, etc.)
    const publicFiles = fs.readdirSync(PUBLIC_DIR);
    for (const file of publicFiles) {
        const filePath = path.join(PUBLIC_DIR, file);
        if (fs.statSync(filePath).isFile() && /\.(png|jpg|jpeg)$/i.test(file)) {
            await optimizeImage(filePath, filePath);
        }
    }

    console.log('\nProcessing images directory...\n');
    await processDirectory(IMAGES_DIR);

    console.log('\n✨ Optimization complete!\n');
    console.log('Next steps:');
    console.log('  1. Update HTML to use .webp images');
    console.log('  2. Add <picture> tags for fallback support');
    console.log('  3. Consider deleting original large files\n');
}

main().catch(console.error);

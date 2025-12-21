const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const SOURCE_ICON = 'C:/Users/Admin/.gemini/antigravity/brain/59de158a-c56c-4be7-bfb7-2c35b7989e19/app_icon_v1_1766058383282.png';
const ANDROID_RES_DIR = path.join(__dirname, 'android/app/src/main/res');
const PUBLIC_DIR = path.join(__dirname, 'public');

const iconSizes = [
    { name: 'mipmap-mdpi', size: 48 },
    { name: 'mipmap-hdpi', size: 72 },
    { name: 'mipmap-xhdpi', size: 96 },
    { name: 'mipmap-xxhdpi', size: 144 },
    { name: 'mipmap-xxxhdpi', size: 192 }
];

async function updateIcons() {
    try {
        console.log('🖼️  Reading source icon from:', SOURCE_ICON);
        const image = await Jimp.read(SOURCE_ICON);

        // 1. Update Android Icons
        console.log('🤖 Updating Android icons...');
        for (const config of iconSizes) {
            const targetDir = path.join(ANDROID_RES_DIR, config.name);
            if (fs.existsSync(targetDir)) {
                // Resize and Save Rectangular Icon
                const resized = image.clone().resize(config.size, config.size);
                await resized.writeAsync(path.join(targetDir, 'ic_launcher.png'));

                // Save Foreground Icon (For Adaptive Icons)
                // We use the same image as foreground to ensure it changes on Android 8+
                await resized.writeAsync(path.join(targetDir, 'ic_launcher_foreground.png'));

                // Save Round Icon
                // Jimp doesn't have native circle crop easy, but we can do a simple mask if needed.
                // For now just using the square one is fine as Android usually handles masking, 
                // BUT for "round" icon usually it expects a circular transparent png.
                // Let's just create a circle mask manually or skip circle for now and just put the square one 
                // (it will look square on some launchers).
                // Actually, let's try to make it round.
                const round = resized.clone();
                round.circle();
                await round.writeAsync(path.join(targetDir, 'ic_launcher_round.png'));

                console.log(`   ✓ Updated ${config.name} (Launcher, Foreground, Round)`);
            } else {
                console.log(`   ⚠️ Skipped ${config.name} (directory not found)`);
            }
        }

        // 2. Update Web Favicon/Icon
        console.log('🌐 Updating Web icons...');
        // Standard favicon
        await image.clone().resize(64, 64).writeAsync(path.join(PUBLIC_DIR, 'favicon.ico'));

        // PWA Icons (if manifest exists, otherwise good to have)
        await image.clone().resize(192, 192).writeAsync(path.join(PUBLIC_DIR, 'pwa-192x192.png'));
        await image.clone().resize(512, 512).writeAsync(path.join(PUBLIC_DIR, 'pwa-512x512.png'));

        // Vite SVG (Override with png for now or just ignore?)
        // Let's overwrite vite.svg with the png but keep the name... no that breaks mime types.
        // Let's just leave vite.svg alone or safe to ignore.

        console.log('✨ All icons updated successfully!');

    } catch (error) {
        console.error('❌ Error updating icons:', error);
    }
}

updateIcons();

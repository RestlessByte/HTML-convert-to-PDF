import { launch } from 'puppeteer';
import { URL } from 'url';

// Проверка аргументов командной строки
if (process.argv.length < 3) {
    console.error("Usage: bun run convert.ts <url> [output.pdf]");
    process.exit(1);
}

const inputUrl = process.argv[2];
const outputFile = process.argv[3] || 'index.pdf';

// Валидация URL
try {
    new URL(inputUrl);
} catch (error) {
    console.error("Invalid URL:", inputUrl);
    process.exit(1);
}

(async () => {
    try {
        // Запуск headless браузера
        const browser = await launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security'
            ]
        });

        const page = await browser.newPage();

        // Настройки эмуляции
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2
        });

        // Переход на страницу
        console.log(`Loading: ${inputUrl}`);
        await page.goto(inputUrl, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Дополнительное ожидание для контента
        await page.waitForSelector('body', { timeout: 30000 });
        await page.evaluate(() => {
            return new Promise(resolve => {
                requestAnimationFrame(() => setTimeout(resolve, 2000));
            });
        });

        // Генерация PDF
        console.log("Generating PDF...");
        await page.pdf({
            path: outputFile,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false,
            margin: {
                top: '1cm',
                bottom: '1cm',
                left: '1cm',
                right: '1cm'
            }
        });

        // Завершение
        await browser.close();
        console.log(`Success! PDF saved to: ${outputFile}`);
    } catch (error) {
        console.error("Conversion failed:", error);
        process.exit(1);
    }
})();
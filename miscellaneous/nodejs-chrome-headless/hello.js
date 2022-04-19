const puppeteer = require('puppeteer');
var url = require('url');
module.exports = async function (context) {
    var url_parts = url.parse(context.request.url, true);
    var query = url_parts.query;
    const browser = await puppeteer.launch({
        executablePath: process.env.CHROMIUM_PATH,
        args: ['--no-sandbox']
    })
    const page = await browser.newPage();
    await page.goto(`https://google.com`);
    const title = await page.content();
    return {
        status: 200,
        body: title
    }
}

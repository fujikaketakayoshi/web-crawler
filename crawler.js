const Datastore = require('nedb');
const db = new Datastore({
    filename: 'links.db',
    autoload: true
});
const puppeteer = require('puppeteer');

//日付から文字列に変換する関数
function getYmdHis() {
    let date = new Date();
    date.setTime(date.getTime() + (9*60*60*1000));
    let str_date = date.toISOString().replace('T', ' ').substr(0, 19);
    return str_date;
};    



(async () => {
    const targetUrl = 'https://fujikaketakayoshi.github.io/react_portfolio/';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(targetUrl, {
        waitUntil: 'networkidle0'
    });
    
    
    
    
    const postUrls = await page.evaluate(() => {
        const title = document.title ?? '';
        const desc = document.querySelector('meta[name="description"]').content ?? '';
        const links = document.querySelectorAll('a') ?? [];
        let urls = [];
        for( let link of links ) {
            let href = link.getAttribute('href');
            if ( href === '/') continue;
            urls.push(href);
        }
        return {
            title: title,
            desc: desc,
            urls: urls
        };
    });
    
    let obj = postUrls;
    await db.insert({
        url: targetUrl,
        title: obj.title,
        desc: obj.desc,
        updated_at: getYmdHis()
    });
    for ( let url of obj.urls ) {
        await db.insert({url: url});
    }
    
    console.log(obj.urls);
    await browser.close();
})();


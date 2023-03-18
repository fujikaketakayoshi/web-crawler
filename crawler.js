const Datastore = require('nedb');
const db = new Datastore({
    filename: 'links.db',
    autoload: true
});
const puppeteer = require('puppeteer');

//日付から文字列に変換する関数
function getYmdHis() {
    let date = new Date();
    let year_str = date.getFullYear();
    //月だけ+1すること
    let month_str = 1 + date.getMonth();
    let day_str = date.getDate();
    let hour_str = date.getHours();
    let minute_str = date.getMinutes();
    let second_str = date.getSeconds();
    
    month_str = ('0' + month_str).slice(-2);
    day_str = ('0' + day_str).slice(-2);
    hour_str = ('0' + hour_str).slice(-2);
    minute_str = ('0' + minute_str).slice(-2);
    second_str = ('0' + second_str).slice(-2);
    
    format_str = 'YYYY-MM-DD hh:mm:ss';
    format_str = format_str.replace(/YYYY/g, year_str);
    format_str = format_str.replace(/MM/g, month_str);
    format_str = format_str.replace(/DD/g, day_str);
    format_str = format_str.replace(/hh/g, hour_str);
    format_str = format_str.replace(/mm/g, minute_str);
    format_str = format_str.replace(/ss/g, second_str);
    
    return format_str;
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


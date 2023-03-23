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
    const targetUrl = process.argv[2];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(targetUrl, {
        waitUntil: 'networkidle0'
    });
    
    const postUrls = await page.evaluate(() => {
        const document_url = new URL(document.URL);
        const targetDomain = document_url.protocol + '//' + document_url.host;
        
        const title = document.title ?? '';
        const desc = document.querySelector('meta[name="description"]').content ?? '';
        const links = document.querySelectorAll('a') ?? [];
        let urls = [];
        for( let link of links ) {
            let href = link.getAttribute('href');
            let href_top = href.substr(0,1);
            if ( href === '' ) continue;
            if ( href_top === '/' || href_top === '#' ) {
                 href = targetDomain + href;
            }
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
        checked_at: getYmdHis()
    });
    for ( let url of obj.urls ) {
        await db.find({ url: url }, (error, docs) => {
            if ( docs.length === 0 ) {
              db.insert({
                    url: url,
                    checked_at: null
                });
            }
        });
    }
    
    console.log(obj.urls);
    await browser.close();
})();


const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:720,height:1280},deviceScaleFactor:1.5});
await p.goto('file:///home/user/arabic-neon-web/overlay/overlay.html',{waitUntil:'networkidle'}).catch(()=>{});
await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:'overlay-1080x1920.png',omitBackground:true});
await b.close();})();

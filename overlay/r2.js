const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:720,height:1280},deviceScaleFactor:1});
await p.goto('file:///home/user/arabic-neon-web/overlay/overlay-nologo.html',{waitUntil:'networkidle'}).catch(()=>{});
await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:'/tmp/claude-0/-home-user-arabic-neon-web/c660c017-eac5-5793-badc-36b3e11dbb41/scratchpad/ov720.png',omitBackground:true});
await b.close();})();

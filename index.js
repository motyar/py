const chromium = require('chrome-aws-lambda');
const sharp = require('sharp');

module.exports.screenshot = async (event, context, request) => {
  
   if(event.requestContext.http.method!="POST"){
        return {
        statusCode: 200,
        headers: {
                'Content-type': 'application/json',
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "*" 
            },
        body: JSON.stringify({ message: 'Only POST methos is allowed', e: event })
        }
    }
    let watermark = JSON.parse(event.body).watermark;
    let html = JSON.parse(event.body).html;
    const data = JSON.parse(event.body).data;
    const webp = JSON.parse(event.body).webp;
    const width = JSON.parse(event.body).width;
    const height = JSON.parse(event.body).height;
    let element = JSON.parse(event.body).element;
    
    if(!element){
        element = 'body';
    }

    if (!html) return {
        statusCode: 400,
        headers: {
                'Content-type': 'application/json',
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "*"
            },
        body: JSON.stringify({ message: 'html is missing' })
    }
     
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: null,
        executablePath: await chromium.executablePath,
        headless: false
    });
    
    const page = await browser.newPage();
    
    if(data){
        const Mustache =  require('mustache');
        html = Mustache.render(html, data);
    }
    
    await page.setContent("<style>body {width: fit-content; height: fit-content;}</style><div class=\"watermark\"></div><style>.watermark{z-index:1000;opacity:"+Number(!watermark)+";height:100%;width:100%;position:fixed;top:0;left:0;background-image: url(\"data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' version=\'1.1\' height=\'200px\' width=\'200px\'><text transform=\'translate(8, 100) rotate(-45)\' fill=\'rgba(255,255,255,0.2)\' font-size=\'20\'>BRUZU.COM</text><text transform=\'translate(8, 200) rotate(-45)\' fill=\'rgba(0,0,0,0.1)\' font-size=\'20\'>BRUZU.COM</text></svg>\");}\n</style>"+html, { waitUntil: 'networkidle0' });
    
    const elem = await page.$(element);
    const boundingBox = await elem.boundingBox();
    
    page.setViewport({ height: Math.ceil(boundingBox.height), width:Math.ceil(boundingBox.width), deviceScaleFactor: 2});

    let screenshot = await elem.screenshot({encoding: 'binary' });  
  
    
  
   if(height || width ){
     
          const size = {fit: sharp.fit.cover, position: sharp.strategy.entropy};
     
          if(height)
            size.height = Number(height);
     
          if(width)
            size.width = Number(width);
     
          screenshot = await sharp(screenshot).resize(size).toBuffer();
   }
  
  if(webp){
        screenshot = await sharp(screenshot).webp({ lossless: true }).toBuffer();
    }
  
    await browser.close();

    return {
        statusCode: 200,
        headers: {
            'Content-type': 'application/json',
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Methods": "*" 
           
        },
        body: JSON.stringify({ 
            image: Buffer.from(screenshot, 'binary').toString('base64')
        })
    }
}

# wee

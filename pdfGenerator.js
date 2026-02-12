const puppeteer = require('puppeteer');

async function createPDF(data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial; padding: 50px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Document</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Date:</strong> ${data.date}</p>
      </body>
    </html>
  `;
  
  await page.setContent(htmlContent);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  
  return pdf;
}

module.exports = { createPDF };
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
require('dotenv').config();
const directories = ['ferro1', 'ferro2', 'raw', 'steel'];
const getData = require('./getData');
function addValue(main, mainValue, sub, subValue, document) {
    let valueElement = document.createElement("div");
    valueElement.classList.add("item-values-frame");
    let childElementMain = document.createElement("div");
    childElementMain.classList.add(main);
    childElementMain.textContent = mainValue;
    let childElementSub = document.createElement("div");
    childElementSub.classList.add(sub);
    childElementSub.textContent = subValue + '%';
    valueElement.appendChild(childElementMain);
    valueElement.appendChild(childElementSub);
    return valueElement;
}
function addSkip(document) {
    let skipELement = document.createElement("div");
    skipELement.classList.add(skip);
    skipELement.textContent = "-";
    return skipELement;
}
const posMain = "item-value-text-positive-main";
const posSub = "item-value-text-positive-sub";
const negMain = "item-value-text-negative-main";
const negSub = "item-value-text-negative-sub";
const skip = "item-value-text-skip";
async function makeSummary() {
    let recivedData = await getData.makeMaterialRequests();
    if (!recivedData)
        return false;
    for (const directory of directories) {
        let data = fs.readFileSync(`./templates/${directory}/index.html`, 'utf-8');
        var dom = new JSDOM(data);
        var document = dom.window.document;
        let values = recivedData[directory];
        for (let i = 0; i < values.length; i++) {
            //adds current price
            let valueElement = document.createElement("div");
            valueElement.classList.add("item-values-frame");
            let valueElementChildMain = document.createElement("div");
            valueElementChildMain.classList.add("item-value-text-neutral-main");
            valueElementChildMain.textContent = values[i].current_price;
            let valueElementChildSub = document.createElement("div");
            valueElementChildSub.classList.add("item-value-text-neutral-sub");
            valueElementChildSub.textContent = values[i].unit;
            let currentElement = document.getElementById(i);
            valueElement.appendChild(valueElementChildMain);
            valueElement.appendChild(valueElementChildSub);
            currentElement.appendChild(valueElement);
            //adds changes
            if (values[i].daily_changes > 0) {
                let value = '+' + values[i].daily_changes;
                let valuePerc = '+' + values[i].daily_changes_percent;
                currentElement.appendChild(addValue(posMain, value, posSub, valuePerc, document));
            }
            if (values[i].daily_changes < 0) {
                currentElement.appendChild(addValue(negMain, values[i].daily_changes, negSub, values[i].daily_changes_percent, document));
            }
            if (values[i].daily_changes === 0) {
                currentElement.appendChild(addSkip(document));
            }
            if (values[i].weekly_changes > 0) {
                let value = '+' + values[i].weekly_changes;
                let valuePerc = '+' + values[i].weekly_changes_percent;
                currentElement.appendChild(addValue(posMain, value, posSub, valuePerc, document));
            } if (values[i].weekly_changes < 0) {
                currentElement.appendChild(addValue(negMain, values[i].weekly_changes, negSub, values[i].weekly_changes_percent, document));
            } if (values[i].weekly_changes === 0) {
                currentElement.appendChild(addSkip(document));
            }
            if (values[i].monthly_changes > 0) {
                let value = '+' + values[i].monthly_changes;
                let valuePerc = '+' + values[i].monthly_changes_percent;
                currentElement.appendChild(addValue(posMain, value, posSub, valuePerc, document));

            } if (values[i].monthly_changes < 0) {
                currentElement.appendChild(addValue(negMain, values[i].monthly_changes, negSub, values[i].monthly_changes_percent, document));
            } if (values[i].monthly_changes === 0) {
                currentElement.appendChild(addSkip(document));
            }
        }
        let currentDate = new Date().toLocaleDateString('ru-RU');
        document.getElementById('time').textContent = currentDate;
        fs.writeFileSync(`./templates/${directory}/temp.html`, document.documentElement.innerHTML);

        const puppeteer = require('puppeteer');
        await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new' }).then(async (browser) => {
            const page = await browser.newPage();
            await page.setViewport({ width: 1140, height: 1140 });
            const htmlPath = path.join(process.cwd(), 'templates', directory, 'temp.html');
            const fileUrl = url.format({
                protocol: 'file',
                slashes: true,
                pathname: path.resolve(htmlPath)
            });
            await page.goto(fileUrl);
            await page.screenshot({ path: `./reports/${directory}_${currentDate}.png` });
            await browser.close();
            fs.unlinkSync(`./templates/${directory}/temp.html`);
            console.log(`Report for ${directory} generated!`);
        });
    };
    return true;
}

module.exports = makeSummary;

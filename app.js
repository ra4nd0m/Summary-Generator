const fs = require('fs');
const jsdom = require("jsdom");
const path = require('path');
const url = require('url');
const { JSDOM } = jsdom;
require('dotenv').config();
const directories = ['ferro1', 'ferro2', 'raw', 'steel'];
const getData = require('./getData');
const path = require('path');
const url = require('url');
const path = require('path');
const url = require('url');
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
function replaceDotWithComma(input) {
    let output = input.toString().replace('.', ',');
    return output;
}

function rounderFunction(input) {
    let output = input;
    if (((input < 1) && (input > 0))||((input > -1)&&(input < 0))) {
        output = input.toFixed(2);
    }
    if (input >= 1 || input <= -1) {
        output = input.toFixed(1);
    }
    return output;
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
                //add rounding
                let value = replaceDotWithComma('+' + values[i].daily_changes.toFixed(0));
                let valuePerc = replaceDotWithComma('+' + rounderFunction(values[i].daily_changes_percent));
                currentElement.appendChild(addValue(posMain, value, posSub, valuePerc, document));
            }
            if (values[i].daily_changes < 0) {
                currentElement.appendChild(addValue(negMain, replaceDotWithComma(rounderFunction(values[i].daily_changes)), negSub,
                    replaceDotWithComma(rounderFunction(values[i].daily_changes_percent)), document));
            }
            if (values[i].daily_changes === 0) {
                currentElement.appendChild(addSkip(document));
            }
            if (values[i].weekly_changes > 0) {
                let value = replaceDotWithComma('+' + rounderFunction(values[i].weekly_changes));
                let valuePerc = replaceDotWithComma('+' + rounderFunction(values[i].weekly_changes_percent));
                currentElement.appendChild(addValue(posMain, value, posSub, valuePerc, document));
            } if (values[i].weekly_changes < 0) {
                currentElement.appendChild(addValue(negMain, replaceDotWithComma(rounderFunction(values[i].weekly_changes)), negSub,
                    replaceDotWithComma(rounderFunction(values[i].weekly_changes_percent)), document));
            } if (values[i].weekly_changes === 0) {
                currentElement.appendChild(addSkip(document));
            }
            if (values[i].monthly_changes > 0) {
                let value = replaceDotWithComma('+' + rounderFunction(values[i].monthly_changes));
                let valuePerc = replaceDotWithComma('+' + rounderFunction(values[i].monthly_changes_percent));
                currentElement.appendChild(addValue(posMain, value, posSub, valuePerc, document));

            } if (values[i].monthly_changes < 0) {
                currentElement.appendChild(addValue(negMain, replaceDotWithComma(rounderFunction(values[i].monthly_changes)), negSub,
                    replaceDotWithComma(rounderFunction(values[i].monthly_changes_percent)), document));
            } if (values[i].monthly_changes === 0) {
                currentElement.appendChild(addSkip(document));
            }
        }
        // add custom date
        let currentDate = new Date();
        let formattedDate = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(currentDate);
        document.getElementById('time').textContent = `${formattedDate} г`;
        fs.writeFileSync(`./templates/${directory}/temp.html`, document.documentElement.innerHTML);
        const puppeteer = require('puppeteer');
        await puppeteer.launch({ executablePath: `${process.cwd()}/chromium-win/chrome.exe`, headless: 'old' }).then(async (browser) => {
            const page = await browser.newPage();
            await page.setViewport({ width: 1140, height: 1140 });
            const htmlPath = path.join(process.cwd(), 'templates', directory, 'temp.html');
            const fileUrl = url.format({
                protocol: 'file',
                slashes: true,
                pathname: path.resolve(htmlPath)
            });
            await page.goto(fileUrl);
            await page.screenshot({ path: `./reports/${directory}_${formattedDate}.png` });
            await browser.close();
            fs.unlinkSync(`./templates/${directory}/temp.html`);
            console.log(`Report for ${directory} generated!`);
        });
    };
    return true;
}

module.exports = makeSummary;

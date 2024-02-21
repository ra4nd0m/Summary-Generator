const fs = require('fs');
const jsdom = require("jsdom");
const path = require('path');
const url = require('url');
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
function replaceDotWithComma(input) {
    let output = input.toString().replace('.', ',');
    return output;
}

function rounderFunction(input, unit) {
    //if no changes, return
    if (input === 0) {
        return input;
    }
    //conditional rounding
    let output = input;
    switch (unit) {
        case "¥/т":
            output = output.toFixed();
            break;
        case "$/т":
            output = output.toFixed()
            break;
        case '₽/т':
            output = output.toFixed();
            break;
        case "percent":
            output = output.toFixed(1);
            break;
        case "$/1% Mn смт":
            output = output.toFixed(2);
            break;
        case '¢/фунт Cr':
            output = output.toFixed(1);
            break;
        default:
            break;
    }
    output = output.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    output = replaceDotWithComma(output);
    return output;
}

function stringRounder(input, unit) {
    let processed = input.replace(/ /g, '');
    let output = rounderFunction(Number(processed), unit);
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
            let currentPrice = stringRounder(values[i].current_price, values[i].unit);
            valueElementChildMain.textContent = currentPrice;
            let valueElementChildSub = document.createElement("div");
            valueElementChildSub.classList.add("item-value-text-neutral-sub");
            valueElementChildSub.textContent = values[i].unit;
            let currentElement = document.getElementById(i);
            valueElement.appendChild(valueElementChildMain);
            valueElement.appendChild(valueElementChildSub);
            currentElement.appendChild(valueElement);
            let daily = rounderFunction(values[i].daily_changes, values[i].unit);
            let dailyPerc = rounderFunction(values[i].daily_changes_percent, "percent");
            let weekly = rounderFunction(values[i].weekly_changes, values[i].unit);
            let weeklyPerc = rounderFunction(values[i].weekly_changes_percent, "percent");
            let monthly = rounderFunction(values[i].monthly_changes, values[i].unit);
            let monthlyPerc = rounderFunction(values[i].monthly_changes_percent, "percent");
            //adds changes
            if (daily > "0,0") {
                let value = '+' + daily;
                let valuePerc = '+' + dailyPerc;
                currentElement.appendChild(addValue(posMain, value, posSub, valuePerc, document));
            }
            if (daily < "0,0") {
                currentElement.appendChild(addValue(negMain, daily, negSub, dailyPerc, document));
            }
            if (daily == 0) {
                currentElement.appendChild(addSkip(document));
            }
            if (weekly > "0,0") {
                let value = '+' + weekly;
                let valuePerc = '+' + weeklyPerc;
                currentElement.appendChild(addValue(posMain, value, posSub, valuePerc, document));
            }
            if (weekly < "0,0") {
                currentElement.appendChild(addValue(negMain, weekly, negSub, weeklyPerc, document));
            }
            if (weekly == 0) {
                currentElement.appendChild(addSkip(document));
            }
            if (monthly > "0,0") {
                let value = '+' + monthly;
                let valuePerc = '+' + monthlyPerc;
                currentElement.appendChild(addValue(posMain, value, posSub, valuePerc, document));
            }
            if (monthly < "0,0") {
                currentElement.appendChild(addValue(negMain, monthly, negSub, monthlyPerc, document));
            }
            if (monthly == 0) {
                currentElement.appendChild(addSkip(document));
            }
        }
        // add custom date
        let currentDate = new Date();
        let formattedDate = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(currentDate);
        document.getElementById('time').textContent = `${formattedDate} г`;
        fs.writeFileSync(`./templates/${directory}/temp.html`, document.documentElement.innerHTML);

        const puppeteer = require('puppeteer');
        await puppeteer.launch({ headless: 'old' }).then(async (browser) => {
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

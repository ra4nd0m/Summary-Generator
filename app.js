const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
require('dotenv').config();
const directories = ['ferro1', 'ferro2', 'raw', 'steel'];
function addValue(main, mainValue, sub, subValue, element) {
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
function addSkip() {
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
for (const directory of directories) {
    let data = fs.readFileSync(`./templates/${directory}/index.html`, 'utf-8');
    var dom = new JSDOM(data);
    var document = dom.window.document;
    let values = [{
        "current_price": 17500,
        "daily_changes": -300,
        "daily_changes_percent": -5,
        "delivery_type": "FOB",
        "market": "Урал (Россия)",
        "material_name": "Лом 3А",
        "monthly_changes": -100,
        "monthly_changes_percent": -3.85,
        "unit": "₽/т",
        "weekly_changes": 100,
        "weekly_changes_percent": 2
    }, {
        "current_price": 17500,
        "daily_changes": -300,
        "daily_changes_percent": -5,
        "delivery_type": "FOB",
        "market": "Урал (Россия)",
        "material_name": "Лом 3А",
        "monthly_changes": -100,
        "monthly_changes_percent": -3.85,
        "unit": "₽/т",
        "weekly_changes": 100,
        "weekly_changes_percent": 2
    }];

    for (let i = 0; i < 2; i++) {
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
            currentElement.appendChild(addValue(posMain, value, posSub, valuePerc));
        }
        if (values[i].daily_changes < 0) {
            currentElement.appendChild(addValue(negMain, values[i].daily_changes, negSub, values[i].daily_changes_percent));
        }
        if (values[i].daily_changes === 0) {
            currentElement.appendChild(addSkip());
        }
        if (values[i].weekly_changes > 0) {
            let value = '+' + values[i].weekly_changes;
            let valuePerc = '+' + values[i].weekly_changes_percent;
            currentElement.appendChild(addValue(posMain, value, posSub, valuePerc));
        } if (values[i].weekly_changes < 0) {
            currentElement.appendChild(addValue(negMain, values[i].weekly_changes, negSub, values[i].weekly_changes_percent));
        } if (values[i].weekly_changes === 0) {
            currentElement.appendChild(addSkip());
        }
        if (values[i].monthly_changes > 0) {
            let value = '+' + values[i].monthly_changes;
            let valuePerc = '+' + values[i].monthly_changes_percent;
            currentElement.appendChild(addValue(posMain, value, posSub, valuePerc));

        } if (values[i].monthly_changes < 0) {
            currentElement.appendChild(addValue(negMain, values[i].monthly_changes, negSub, values[i].monthly_changes_percent));
        } if (values[i].monthly_changes === 0) {
            currentElement.appendChild(addSkip());
        }
    }
    let currentDate = new Date().toLocaleDateString('ru-RU');
    document.getElementById('time').textContent = currentDate;
    fs.writeFileSync(`./templates/${directory}/temp.html`, document.documentElement.innerHTML);

    const puppeteer = require('puppeteer');
    puppeteer.launch({ headless: 'new' }).then(async (browser) => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1140, height: 1140 })
        await page.goto(`file://${process.env.TEMP_PATH}/${directory}/temp.html`);
        await page.screenshot({ path: `./reports/${directory}_${currentDate}.png` });
        await browser.close();
    })
}
console.log("Reports generated!");
//console.log(document.documentElement.innerHTML);
//console.log(dom.window.document.documentElement.innerHTML);

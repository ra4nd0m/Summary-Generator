require('dotenv').config();
const materialGroups = {
    ferro1: [],
    ferro2: [],
    steel: [],
    raw: []
};

const materialIds = {
    ferro1: [72,
        73,
        18,
        74,
        75,
        76,
        77,
        19,
        17,
        22],
    ferro2: [78,
        79,
        80,
        81,
        20,
        82,
        21,
        83,
        23],
    steel: [9, 44, 12, 70, 15, 13, 71, 16, 10, 14],
    raw: [2,
        6,
        8,
        4,
        1,
        69,
        5,
        66]
};
async function makeMaterialRequests() {
    let isError = false;
    let today = new Date().toJSON().slice(0, 10);
    for (const group in materialGroups) {
        const ids = materialIds[group];
        for (const id of ids) {
            try {
                const requestBody = {
                    "date": today,
                    "material_id": id,
                    "property_id": 1
                };
                const data = await makeRequest(requestBody);
                materialGroups[group].push(data);
            } catch (err) {
                console.error(err);
                isError = true;
                continue;
            }
        }
    }
    if (isError) {
        return false;
    } else {
        return materialGroups;
    }
}

// Function to make the request
async function makeRequest(requestBody) {
    const response = await fetch(`${process.env.API_URL}/getChangeSummary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.DB_TOKEN}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}\nRequest body: ${JSON.stringify(requestBody)}`);
    }

    const data = await response.json();
    return data.value;
}

module.exports = { makeMaterialRequests }

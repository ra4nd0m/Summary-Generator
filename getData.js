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
    steel: [],
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
    let today = new Date().toJSON().slice(0,10);
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
                continue;
            }
        }
    }
    return materialGroups;
}

// Function to make the request
async function makeRequest(requestBody) {
    const response = await fetch('http://base.metallplace.ru:8080/getChangeSummary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImVrX3Rlc3RpbmciLCJleHAiOjkyMjMzNzIwMzY4NTQ3NzU4MDd9.klvYnKco5Y2AdSmXDcNhLYYUBCjsMO_M2Ubmdm1Uv3M"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.value;
}

module.exports={makeMaterialRequests}

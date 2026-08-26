const monthSelect =
document.getElementById("monthSelector");

const totalProduction =
document.getElementById("totalProduction");

const selectedPeriod =
document.getElementById("selectedPeriod");

// ======================================================
// OVERVIEW ELEMENTS
// ======================================================

const renewableValue =
document.getElementById("renewableValue");

const renewableGwh =
document.getElementById("renewableGwh");

const overviewNuclearValue =
document.getElementById("overviewNuclearValue");

const overviewNuclearGwh =
document.getElementById("overviewNuclearGwh");

const nonRenewableValue =
document.getElementById("nonRenewableValue");

const nonRenewableGwh =
document.getElementById("nonRenewableGwh");

// ======================================================
// ENERGY CARD ELEMENTS
// ======================================================

const hydroValue =
document.getElementById("hydroValue");

const hydroGwh =
document.getElementById("hydroGwh");

const nuclearValue =
document.getElementById("nuclearValue");

const nuclearGwh =
document.getElementById("nuclearGwh");

const windValue =
document.getElementById("windValue");

const windGwh =
document.getElementById("windGwh");

const solarValue =
document.getElementById("solarValue");

const solarGwh =
document.getElementById("solarGwh");

const thermalNonRenewableValue =
document.getElementById(
"thermalNonRenewableValue"
);

const thermalNonRenewableGwh =
document.getElementById(
"thermalNonRenewableGwh"
);

const thermalRenewableValue =
document.getElementById(
"thermalRenewableValue"
);

const thermalRenewableGwh =
document.getElementById(
"thermalRenewableGwh"
);

// ======================================================
// CHART ELEMENTS
// ======================================================

const productionCanvas =
document.getElementById(
"productionChart"
);

const historyCanvas =
document.getElementById(
"historyChart"
);

let productionChart = null;
let historyChart = null;

let allRows = [];

// ======================================================
// LOAD CSV
// ======================================================

fetch("./data/electricity-production.csv")

```
.then(response => {

    if (!response.ok) {
        throw new Error(
            "HTTP " + response.status
        );
    }

    return response.text();

})

.then(csv => {

    allRows = parseCSV(csv);

    if (!allRows.length) {
        throw new Error(
            "CSV contains no data"
        );
    }

    setupMonthSelector(
        allRows
    );

    updateDashboard();

    updateHistoryChart();

})

.catch(error => {

    console.error(
        "Could not load electricity data:",
        error
    );

    if (monthSelect) {

        monthSelect.innerHTML =
            "<option>Could not load data</option>";

    }

});
```

// ======================================================
// CSV PARSER
// ======================================================

function parseCSV(csv) {

```
const lines =
    csv
        .trim()
        .split(/\r?\n/);


if (lines.length < 2) {
    return [];
}


return lines

    .slice(1)

    .map(line => {

        const parts =
            line.split(",");


        const month =
            parts[0]
                ?.replace(/"/g, "")
                .trim();


        const type =
            parts[1]
                ?.replace(/"/g, "")
                .trim();


        const rawValue =
            parts[2]
                ?.replace(/"/g, "")
                .trim();


        let gwh = null;


        if (
            rawValue !== undefined &&
            rawValue !== ""
        ) {

            const number =
                Number(rawValue);


            if (!Number.isNaN(number)) {
                gwh = number;
            }

        }


        return {
            month,
            type,
            gwh
        };

    })

    .filter(row =>
        row.month &&
        row.type
    );
```

}

// ======================================================
// MONTH SELECTOR
// ======================================================

function setupMonthSelector(rows) {

```
const months = [

    ...new Set(
        rows.map(row => row.month)
    )

];


monthSelect.innerHTML = "";


months.forEach(month => {

    const option =
        document.createElement(
            "option"
        );


    option.value = month;

    option.textContent =
        formatMonth(month);


    monthSelect.appendChild(
        option
    );

});


// Latest month

monthSelect.value =
    months[months.length - 1];


monthSelect.addEventListener(
    "change",
    updateDashboard
);
```

}

// ======================================================
// UPDATE DASHBOARD
// ======================================================

function updateDashboard() {

```
const selectedMonth =
    monthSelect.value;


const values =
    getMonthValues(
        selectedMonth
    );


const total =
    values.Total ?? 0;


const hydro =
    values.Vattenkraft ?? 0;


const nuclear =
    values.Karnkraft ?? 0;


const wind =
    values.Vindkraft ?? 0;


const solar =
    values.Solkraft ?? 0;


const thermalNonRenewable =
    values.VarmekrEjF ?? 0;


const thermalRenewable =
    values.VarmekrF ?? 0;


// ==================================================
// CALCULATED CATEGORIES
// ==================================================

const renewable =
    hydro +
    wind +
    solar +
    thermalRenewable;


const nonRenewable =
    thermalNonRenewable;


// ==================================================
// TOTAL
// ==================================================

setValue(
    totalProduction,
    formatNumber(total)
);


setValue(
    selectedPeriod,
    formatMonth(selectedMonth)
);


// ==================================================
// OVERVIEW
// ==================================================

setValue(
    renewableValue,
    percentage(
        renewable,
        total
    )
);


setValue(
    renewableGwh,
    formatNumber(renewable) +
    " GWh"
);


setValue(
    overviewNuclearValue,
    percentage(
        nuclear,
        total
    )
);


setValue(
    overviewNuclearGwh,
    formatNumber(nuclear) +
    " GWh"
);


setValue(
    nonRenewableValue,
    percentage(
        nonRenewable,
        total
    )
);


setValue(
    nonRenewableGwh,
    formatNumber(nonRenewable) +
    " GWh"
);


// ==================================================
// HYDRO
// ==================================================

setValue(
    hydroValue,
    percentage(
        hydro,
        total
    )
);


setValue(
    hydroGwh,
    formatNumber(hydro)
);


// ==================================================
// NUCLEAR
// ==================================================

setValue(
    nuclearValue,
    percentage(
        nuclear,
        total
    )
);


setValue(
    nuclearGwh,
    formatNumber(nuclear)
);


// ==================================================
// WIND
// ==================================================

setValue(
    windValue,
    percentage(
        wind,
        total
    )
);


setValue(
    windGwh,
    formatNumber(wind)
);


// ==================================================
// SOLAR
// ==================================================

setValue(
    solarValue,
    percentage(
        solar,
        total
    )
);


setValue(
    solarGwh,
    formatNumber(solar)
);


// ==================================================
// NON-RENEWABLE THERMAL
// ==================================================

setValue(
    thermalNonRenewableValue,
    percentage(
        thermalNonRenewable,
        total
    )
);


setValue(
    thermalNonRenewableGwh,
    formatNumber(
        thermalNonRenewable
    )
);


// ==================================================
// RENEWABLE THERMAL
// ==================================================

setValue(
    thermalRenewableValue,
    percentage(
        thermalRenewable,
        total
    )
);


setValue(
    thermalRenewableGwh,
    formatNumber(
        thermalRenewable
    )
);


// ==================================================
// CURRENT MONTH CHART
// ==================================================

updateProductionChart(
    selectedMonth,
    values
);
```

}

// ======================================================
// GET MONTH VALUES
// ======================================================

function getMonthValues(month) {

```
const values = {};


allRows

    .filter(row =>
        row.month === month
    )

    .forEach(row => {

        values[row.type] =
            row.gwh;

    });


return values;
```

}

// ======================================================
// SET VALUE SAFELY
// ======================================================

function setValue(
element,
value
) {

```
if (!element) {
    return;
}


element.textContent =
    value;
```

}

// ======================================================
// PERCENTAGE
// ======================================================

function percentage(
value,
total
) {

```
if (
    total <= 0 ||
    value === null ||
    value === undefined ||
    Number.isNaN(value)
) {

    return "—";

}


return (

    (value / total) * 100

).toFixed(1) + "%";
```

}

// ======================================================
// NUMBER FORMAT
// ======================================================

function formatNumber(value) {

```
if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
) {

    return "—";

}


return Number(value)
    .toLocaleString("en-US");
```

}

// ======================================================
// FORMAT MONTH
// ======================================================

function formatMonth(month) {

```
if (!month) {
    return "—";
}


const parts =
    month.split("M");


const year =
    parts[0];


const monthNumber =
    Number(parts[1]);


const monthNames = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];


return (

    monthNames[
        monthNumber - 1
    ] +

    " " +

    year

);
```

}

// ======================================================
// CURRENT MONTH CHART
// ======================================================

function updateProductionChart(
month,
values
) {

```
if (!productionCanvas) {
    return;
}


const labels = [

    "Hydropower",
    "Nuclear",
    "Wind",
    "Solar",
    "Non-renewable thermal",
    "Renewable thermal"

];


const data = [

    values.Vattenkraft ?? 0,
    values.Karnkraft ?? 0,
    values.Vindkraft ?? 0,
    values.Solkraft ?? 0,
    values.VarmekrEjF ?? 0,
    values.VarmekrF ?? 0

];


if (productionChart) {

    productionChart.data.labels =
        labels;


    productionChart.data.datasets[0].data =
        data;


    productionChart.data.datasets[0].label =
        formatMonth(month);


    productionChart.update();

    return;

}


productionChart =
    new Chart(
        productionCanvas,
        {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {

                        label:
                            formatMonth(month),

                        data,

                        borderWidth: 1

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false

                },

                plugins: {

                    legend: {

                        display: false

                    },

                    tooltip: {

                        callbacks: {

                            label:
                                function(context) {

                                    return (

                                        " " +

                                        formatNumber(
                                            context.raw
                                        ) +

                                        " GWh"

                                    );

                                }

                        }

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        title: {

                            display: true,

                            text: "GWh"

                        }

                    }

                }

            }

        }
    );
```

}

// ======================================================
// HISTORY CHART
// ======================================================

function updateHistoryChart() {

```
if (!historyCanvas) {
    return;
}


const months = [

    ...new Set(
        allRows.map(
            row => row.month
        )
    )

];


const hydroData = [];
const nuclearData = [];
const windData = [];
const solarData = [];
const thermalNonRenewableData = [];
const thermalRenewableData = [];


months.forEach(month => {

    const values =
        getMonthValues(month);


    hydroData.push(
        values.Vattenkraft ?? 0
    );


    nuclearData.push(
        values.Karnkraft ?? 0
    );


    windData.push(
        values.Vindkraft ?? 0
    );


    solarData.push(
        values.Solkraft ?? 0
    );


    thermalNonRenewableData.push(
        values.VarmekrEjF ?? 0
    );


    thermalRenewableData.push(
        values.VarmekrF ?? 0
    );

});


const labels =
    months.map(formatMonth);


historyChart =
    new Chart(
        historyCanvas,
        {

            type: "line",

            data: {

                labels,

                datasets: [

                    {

                        label: "Hydro",

                        data: hydroData,

                        tension: 0.25,

                        borderWidth: 2,

                        pointRadius: 0

                    },

                    {

                        label: "Nuclear",

                        data: nuclearData,

                        tension: 0.25,

                        borderWidth: 2,

                        pointRadius: 0

                    },

                    {

                        label: "Wind",

                        data: windData,

                        tension: 0.25,

                        borderWidth: 2,

                        pointRadius: 0

                    },

                    {

                        label: "Solar",

                        data: solarData,

                        tension: 0.25,

                        borderWidth: 2,

                        pointRadius: 0

                    },

                    {

                        label:
                            "Non-renewable thermal",

                        data:
                            thermalNonRenewableData,

                        tension: 0.25,

                        borderWidth: 2,

                        pointRadius: 0

                    },

                    {

                        label:
                            "Renewable thermal",

                        data:
                            thermalRenewableData,

                        tension: 0.25,

                        borderWidth: 2,

                        pointRadius: 0

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false

                },

                plugins: {

                    tooltip: {

                        callbacks: {

                            label:
                                function(context) {

                                    return (

                                        " " +

                                        context.dataset.label +

                                        ": " +

                                        formatNumber(
                                            context.raw
                                        ) +

                                        " GWh"

                                    );

                                }

                        }

                    }

                },

                scales: {

                    x: {

                        ticks: {

                            maxTicksLimit: 12

                        }

                    },

                    y: {

                        beginAtZero: true,

                        title: {

                            display: true,

                            text: "GWh"

                        }

                    }

                }

            }

        }
    );
```

}

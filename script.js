// ======================================================
// ELEMENTS
// ======================================================

const monthSelect = document.getElementById("monthSelector");

const totalProduction = document.getElementById("totalProduction");
const selectedPeriod = document.getElementById("selectedPeriod");

const renewableValue = document.getElementById("renewableValue");
const renewableGwh = document.getElementById("renewableGwh");

const overviewNuclearValue =
    document.getElementById("overviewNuclearValue");

const overviewNuclearGwh =
    document.getElementById("overviewNuclearGwh");

const nonRenewableValue =
    document.getElementById("nonRenewableValue");

const nonRenewableGwh =
    document.getElementById("nonRenewableGwh");

const hydroValue = document.getElementById("hydroValue");
const hydroGwh = document.getElementById("hydroGwh");

const nuclearValue = document.getElementById("nuclearValue");
const nuclearGwh = document.getElementById("nuclearGwh");

const windValue = document.getElementById("windValue");
const windGwh = document.getElementById("windGwh");

const solarValue = document.getElementById("solarValue");
const solarGwh = document.getElementById("solarGwh");

const thermalNonRenewableValue =
    document.getElementById("thermalNonRenewableValue");

const thermalNonRenewableGwh =
    document.getElementById("thermalNonRenewableGwh");

const thermalRenewableValue =
    document.getElementById("thermalRenewableValue");

const thermalRenewableGwh =
    document.getElementById("thermalRenewableGwh");

const productionCanvas =
    document.getElementById("productionChart");

const historyCanvas =
    document.getElementById("historyChart");

const renewableCanvas =
    document.getElementById("renewableChart");


// ======================================================
// VARIABLES
// ======================================================

let allRows = [];

let productionChart = null;
let historyChart = null;
let renewableChart = null;


// ======================================================
// CONSTANTS
// ======================================================

const MONTH_NAMES = [
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

const SHORT_MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

const SOURCE_TYPES = {
    hydro: "Vattenkraft",
    nuclear: "Karnkraft",
    wind: "Vindkraft",
    solar: "Solkraft",
    thermalNonRenewable: "VarmekrEjF",
    thermalRenewable: "VarmekrF",
    total: "Total"
};


// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeNavigation();
    initializeScrollReveal();
    initializeDetailsModal();

    loadElectricityData();

});


// ======================================================
// LOAD CSV
// ======================================================

async function loadElectricityData() {

    try {

        const response = await fetch(
            "./data/electricity-production.csv"
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const csv = await response.text();

        allRows = parseCSV(csv);

        if (!allRows.length) {

            throw new Error(
                "CSV contains no valid data"
            );

        }

        setupMonthSelector();

        updateDashboard();

        updateHistoryChart();

        updateRenewableChart();

        updateKeyFindings();

    } catch (error) {

        console.error(
            "Could not load electricity data:",
            error
        );

        if (monthSelect) {

            monthSelect.innerHTML = "";

            const option =
                document.createElement("option");

            option.textContent =
                "Could not load data";

            monthSelect.appendChild(option);

        }

    }

}


// ======================================================
// CSV PARSER
// ======================================================

function parseCSV(csv) {

    if (!csv || !csv.trim()) {
        return [];
    }

    const lines =
        csv.trim().split(/\r?\n/);

    if (lines.length < 2) {
        return [];
    }

    return lines
        .slice(1)
        .map(line => {

            const parts =
                parseCSVLine(line);

            const month =
                cleanCSVValue(parts[0]);

            const type =
                cleanCSVValue(parts[1]);

            const rawValue =
                cleanCSVValue(parts[2]);

            let gwh = null;

            if (
                rawValue !== undefined &&
                rawValue !== ""
            ) {

                const number =
                    Number(
                        rawValue
                            .replace(",", ".")
                    );

                if (Number.isFinite(number)) {

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

}


// ======================================================
// CSV LINE PARSER
// ======================================================

function parseCSVLine(line) {

    const result = [];

    let current = "";

    let insideQuotes = false;

    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const char = line[i];

        if (char === '"') {

            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {

                current += '"';

                i++;

            } else {

                insideQuotes =
                    !insideQuotes;

            }

        } else if (
            char === "," &&
            !insideQuotes
        ) {

            result.push(current);

            current = "";

        } else {

            current += char;

        }

    }

    result.push(current);

    return result;

}


// ======================================================
// CLEAN CSV VALUE
// ======================================================

function cleanCSVValue(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return String(value)
        .replace(/^"|"$/g, "")
        .trim();

}


// ======================================================
// MONTH HELPERS
// ======================================================

function getYearFromMonth(month) {

    if (!month) {
        return null;
    }

    const match =
        String(month).match(/^(\d{4})/);

    return match
        ? Number(match[1])
        : null;

}


function getMonthNumber(month) {

    if (!month) {
        return null;
    }

    /*
        Supports:

        2026M06
        2026-06
        2026/06
    */

    const match =
        String(month).match(
            /^(\d{4})(?:M|-|\/)(\d{2})$/
        );

    if (!match) {
        return null;
    }

    const number =
        Number(match[2]);

    if (
        number < 1 ||
        number > 12
    ) {

        return null;

    }

    return number;

}


function getMonthDate(month) {

    const year =
        getYearFromMonth(month);

    const monthNumber =
        getMonthNumber(month);

    if (
        year === null ||
        monthNumber === null
    ) {

        return 0;

    }

    return new Date(
        year,
        monthNumber - 1,
        1
    ).getTime();

}


// ======================================================
// FORMAT MONTH
// ======================================================

function formatMonth(month) {

    if (!month) {
        return "—";
    }

    const year =
        getYearFromMonth(month);

    const monthNumber =
        getMonthNumber(month);

    if (
        year === null ||
        monthNumber === null
    ) {

        return String(month);

    }

    return (
        MONTH_NAMES[monthNumber - 1] +
        " " +
        year
    );

}


// ======================================================
// AVAILABLE MONTHS
// ======================================================

function getAvailableMonths() {

    return [
        ...new Set(
            allRows
                .map(row => row.month)
                .filter(Boolean)
        )
    ].sort(
        (a, b) =>
            getMonthDate(a) -
            getMonthDate(b)
    );

}


// ======================================================
// AVAILABLE YEARS
// ======================================================

function getAvailableYears(months) {

    return [
        ...new Set(
            months
                .map(getYearFromMonth)
                .filter(year =>
                    Number.isFinite(year)
                )
        )
    ].sort(
        (a, b) => a - b
    );

}


// ======================================================
// FIND REAL CSV MONTH
// ======================================================

function findMonth(
    months,
    year,
    monthNumber
) {

    return months.find(month =>

        getYearFromMonth(month) === year &&

        getMonthNumber(month) === monthNumber

    );

}


// ======================================================
// MONTH SELECTOR
// ======================================================

function setupMonthSelector() {

    if (!monthSelect) {
        return;
    }

    const months =
        getAvailableMonths();

    if (!months.length) {
        return;
    }

    monthSelect.innerHTML = "";

    months.forEach(month => {

        const option =
            document.createElement("option");

        option.value = month;

        option.textContent =
            formatMonth(month);

        monthSelect.appendChild(option);

    });

    const latestMonth =
        months[months.length - 1];

    monthSelect.value =
        latestMonth;


    // ==================================================
    // CUSTOM PICKER
    // ==================================================

    const picker =
        document.querySelector(".month-picker");

    const pickerButton =
        document.getElementById(
            "monthPickerButton"
        );

    const pickerValue =
        document.getElementById(
            "monthPickerValue"
        );

    const pickerMenu =
        document.getElementById(
            "monthPickerMenu"
        );

    const pickerYear =
        document.getElementById(
            "pickerYear"
        );

    const monthGrid =
        document.getElementById(
            "monthGrid"
        );

    const previousYear =
        document.getElementById(
            "previousYear"
        );

    const nextYear =
        document.getElementById(
            "nextYear"
        );


    // ==================================================
    // FALLBACK
    // ==================================================

    if (
        !picker ||
        !pickerButton ||
        !pickerValue ||
        !pickerMenu ||
        !pickerYear ||
        !monthGrid
    ) {

        monthSelect.addEventListener(
            "change",
            updateDashboard
        );

        return;

    }


    // ==================================================
    // YEARS
    // ==================================================

    const availableYears =
        getAvailableYears(months);

    let currentYear =
        getYearFromMonth(
            monthSelect.value
        );

    if (
        currentYear === null &&
        availableYears.length
    ) {

        currentYear =
            availableYears[
                availableYears.length - 1
            ];

    }


    // ==================================================
    // UPDATE PICKER VALUE
    // ==================================================

    function updatePickerValue(month) {

        pickerValue.textContent =
            month
                ? formatMonth(month)
                : "Select month";

    }


    // ==================================================
    // CLOSE PICKER
    // ==================================================

    function closePicker() {

        picker.classList.remove("open");

        pickerButton.classList.remove(
            "active"
        );

        pickerMenu.classList.remove(
            "open"
        );

        pickerButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    // ==================================================
    // OPEN PICKER
    // ==================================================

    function openPicker() {

        picker.classList.add("open");

        pickerButton.classList.add(
            "active"
        );

        pickerMenu.classList.add(
            "open"
        );

        pickerButton.setAttribute(
            "aria-expanded",
            "true"
        );

        renderMonths();

    }


    // ==================================================
    // RENDER MONTHS
    // ==================================================

    function renderMonths() {

        monthGrid.innerHTML = "";

        pickerYear.textContent =
            currentYear;

        for (
            let monthNumber = 1;
            monthNumber <= 12;
            monthNumber++
        ) {

            const matchingMonth =
                findMonth(
                    months,
                    currentYear,
                    monthNumber
                );

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "month-option";

            button.textContent =
                SHORT_MONTH_NAMES[
                    monthNumber - 1
                ];


            // ------------------------------------------
            // DISABLED MONTH
            // ------------------------------------------

            if (!matchingMonth) {

                button.disabled = true;

                button.classList.add(
                    "month-disabled"
                );

            } else {

                button.disabled = false;

                button.classList.remove(
                    "month-disabled"
                );

            }


            // ------------------------------------------
            // SELECTED MONTH
            // ------------------------------------------

            if (
                matchingMonth &&
                matchingMonth ===
                    monthSelect.value
            ) {

                button.classList.add(
                    "selected"
                );

            }


            // ------------------------------------------
            // CLICK
            // ------------------------------------------

            if (matchingMonth) {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();

                        monthSelect.value =
                            matchingMonth;

                        currentYear =
                            getYearFromMonth(
                                matchingMonth
                            );

                        updatePickerValue(
                            matchingMonth
                        );

                        monthSelect.dispatchEvent(
                            new Event(
                                "change",
                                {
                                    bubbles: true
                                }
                            )
                        );

                        renderMonths();

                        closePicker();

                    }
                );

            }

            monthGrid.appendChild(
                button
            );

        }

    }


    // ==================================================
    // PICKER BUTTON
    // ==================================================

    pickerButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            if (
                picker.classList.contains(
                    "open"
                )
            ) {

                closePicker();

            } else {

                currentYear =
                    getYearFromMonth(
                        monthSelect.value
                    );

                openPicker();

            }

        }
    );


    // ==================================================
    // PREVIOUS YEAR
    // ==================================================

    if (previousYear) {

        previousYear.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                const currentIndex =
                    availableYears.indexOf(
                        currentYear
                    );

                if (currentIndex > 0) {

                    currentYear =
                        availableYears[
                            currentIndex - 1
                        ];

                    renderMonths();

                }

            }
        );

    }


    // ==================================================
    // NEXT YEAR
    // ==================================================

    if (nextYear) {

        nextYear.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                const currentIndex =
                    availableYears.indexOf(
                        currentYear
                    );

                if (
                    currentIndex !== -1 &&
                    currentIndex <
                        availableYears.length - 1
                ) {

                    currentYear =
                        availableYears[
                            currentIndex + 1
                        ];

                    renderMonths();

                }

            }
        );

    }


    // ==================================================
    // CLOSE OUTSIDE
    // ==================================================

    document.addEventListener(
        "click",
        event => {

            if (
                !picker.contains(
                    event.target
                )
            ) {

                closePicker();

            }

        }
    );


    // ==================================================
    // SELECT CHANGE
    // ==================================================

    monthSelect.addEventListener(
        "change",
        () => {

            const selected =
                monthSelect.value;

            if (selected) {

                currentYear =
                    getYearFromMonth(
                        selected
                    );

                updatePickerValue(
                    selected
                );

            }

            updateDashboard();

        }
    );


    // ==================================================
    // INITIAL VALUE
    // ==================================================

    updatePickerValue(
        latestMonth
    );

    renderMonths();

}


// ======================================================
// GET MONTH VALUES
// ======================================================

function getMonthValues(month) {

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

}


// ======================================================
// SAFE NUMBER
// ======================================================

function getValue(
    values,
    key
) {

    const value =
        values[key];

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(value)
    ) {

        return 0;

    }

    return Number(value);

}


// ======================================================
// GET TOTAL
// ======================================================

function getTotalForMonth(values) {

    const csvTotal =
        values[SOURCE_TYPES.total];

    if (
        csvTotal !== undefined &&
        csvTotal !== null &&
        Number.isFinite(
            Number(csvTotal)
        )
    ) {

        return Number(csvTotal);

    }

    return (
        getValue(
            values,
            SOURCE_TYPES.hydro
        ) +

        getValue(
            values,
            SOURCE_TYPES.nuclear
        ) +

        getValue(
            values,
            SOURCE_TYPES.wind
        ) +

        getValue(
            values,
            SOURCE_TYPES.solar
        ) +

        getValue(
            values,
            SOURCE_TYPES.thermalNonRenewable
        ) +

        getValue(
            values,
            SOURCE_TYPES.thermalRenewable
        )
    );

}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

    if (!monthSelect) {
        return;
    }

    const selectedMonth =
        monthSelect.value;

    if (!selectedMonth) {
        return;
    }

    const values =
        getMonthValues(
            selectedMonth
        );


    // ==================================================
    // SOURCE VALUES
    // ==================================================

    const hydro =
        getValue(
            values,
            SOURCE_TYPES.hydro
        );

    const nuclear =
        getValue(
            values,
            SOURCE_TYPES.nuclear
        );

    const wind =
        getValue(
            values,
            SOURCE_TYPES.wind
        );

    const solar =
        getValue(
            values,
            SOURCE_TYPES.solar
        );

    const thermalNonRenewable =
        getValue(
            values,
            SOURCE_TYPES.thermalNonRenewable
        );

    const thermalRenewable =
        getValue(
            values,
            SOURCE_TYPES.thermalRenewable
        );


    // ==================================================
    // TOTAL
    // ==================================================

    const total =
        getTotalForMonth(values);


    // ==================================================
    // RENEWABLE
    // ==================================================

    const renewable =
        hydro +
        wind +
        solar +
        thermalRenewable;


    // ==================================================
    // NON-RENEWABLE
    // Nuclear + non-renewable thermal
    // ==================================================

    const nonRenewable =
        nuclear +
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

}


// ======================================================
// SET VALUE
// ======================================================

function setValue(
    element,
    value
) {

    if (!element) {
        return;
    }

    element.textContent = value;

    element.classList.remove(
        "value-updated"
    );

    void element.offsetWidth;

    element.classList.add(
        "value-updated"
    );

}


// ======================================================
// PERCENTAGE
// ======================================================

function percentage(
    value,
    total
) {

    if (
        total <= 0 ||
        value === null ||
        value === undefined ||
        Number.isNaN(value)
    ) {

        return "—";

    }

    return (
        (
            value /
            total
        ) *
        100
    ).toFixed(1) + "%";

}


// ======================================================
// NUMBER FORMAT
// ======================================================

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(value)
    ) {

        return "—";

    }

    return Number(value)
        .toLocaleString("en-US");

}


// ======================================================
// CURRENT MONTH CHART
// ======================================================

function updateProductionChart(
    month,
    values
) {

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

        getValue(
            values,
            SOURCE_TYPES.hydro
        ),

        getValue(
            values,
            SOURCE_TYPES.nuclear
        ),

        getValue(
            values,
            SOURCE_TYPES.wind
        ),

        getValue(
            values,
            SOURCE_TYPES.solar
        ),

        getValue(
            values,
            SOURCE_TYPES.thermalNonRenewable
        ),

        getValue(
            values,
            SOURCE_TYPES.thermalRenewable
        )

    ];


    // ==================================================
    // UPDATE EXISTING CHART
    // ==================================================

    if (productionChart) {

        productionChart.data.labels =
            labels;

        productionChart.data.datasets[0].data =
            data;

        productionChart.data.datasets[0].label =
            formatMonth(month);

        productionChart.update("active");

        return;

    }


    // ==================================================
    // CREATE CHART
    // ==================================================

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

                            borderWidth: 0,

                            borderRadius: 6,

                            borderSkipped: false

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

                            backgroundColor:
                                "#111827",

                            padding: 12,

                            callbacks: {

                                label:
                                    context =>
                                        " " +
                                        formatNumber(
                                            context.raw
                                        ) +
                                        " GWh"

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {

                                display: false

                            },

                            ticks: {

                                color:
                                    "#64748b",

                                font: {

                                    size: 12

                                }

                            }

                        },

                        y: {

                            beginAtZero: true,

                            grid: {

                                color:
                                    "#e5e7eb"

                            },

                            ticks: {

                                color:
                                    "#64748b"

                            },

                            title: {

                                display: true,

                                text: "GWh",

                                color:
                                    "#64748b"

                            }

                        }

                    }

                }

            }
        );

}


// ======================================================
// HISTORY CHART
// ======================================================

function updateHistoryChart() {

    if (!historyCanvas) {
        return;
    }

    const months =
        getAvailableMonths();


    // ==================================================
    // DATA ARRAYS
    // ==================================================

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
            getValue(
                values,
                SOURCE_TYPES.hydro
            )
        );

        nuclearData.push(
            getValue(
                values,
                SOURCE_TYPES.nuclear
            )
        );

        windData.push(
            getValue(
                values,
                SOURCE_TYPES.wind
            )
        );

        solarData.push(
            getValue(
                values,
                SOURCE_TYPES.solar
            )
        );

        thermalNonRenewableData.push(
            getValue(
                values,
                SOURCE_TYPES.thermalNonRenewable
            )
        );

        thermalRenewableData.push(
            getValue(
                values,
                SOURCE_TYPES.thermalRenewable
            )
        );

    });


    // ==================================================
    // DESTROY PREVIOUS CHART
    // ==================================================

    if (historyChart) {

        historyChart.destroy();

    }


    // ==================================================
    // CREATE CHART
    // ==================================================

    historyChart =
        new Chart(
            historyCanvas,
            {

                type: "line",

                data: {

                    labels:
                        months.map(formatMonth),

                    datasets: [

                        {

                            label:
                                "Hydropower",

                            data:
                                hydroData,

                            tension: 0.25,

                            borderWidth: 2,

                            pointRadius: 0

                        },

                        {

                            label:
                                "Nuclear",

                            data:
                                nuclearData,

                            tension: 0.25,

                            borderWidth: 2,

                            pointRadius: 0

                        },

                        {

                            label:
                                "Wind",

                            data:
                                windData,

                            tension: 0.25,

                            borderWidth: 2,

                            pointRadius: 0

                        },

                        {

                            label:
                                "Solar",

                            data:
                                solarData,

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

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                usePointStyle:
                                    true,

                                pointStyle:
                                    "line",

                                padding: 20,

                                color:
                                    "#475569"

                            }

                        },

                        tooltip: {

                            backgroundColor:
                                "#111827",

                            padding: 12,

                            callbacks: {

                                label:
                                    context =>
                                        " " +
                                        context.dataset.label +
                                        ": " +
                                        formatNumber(
                                            context.raw
                                        ) +
                                        " GWh"

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {

                                display: false

                            },

                            ticks: {

                                color:
                                    "#64748b",

                                maxRotation: 0,

                                autoSkip: true,

                                callback:
                                    function(value) {

                                        const label =
                                            this.getLabelForValue(
                                                value
                                            );

                                        if (
                                            label.includes(
                                                "January"
                                            )
                                        ) {

                                            return label.split(
                                                " "
                                            )[1];

                                        }

                                        return "";

                                    }

                            }

                        },

                        y: {

                            beginAtZero: true,

                            grid: {

                                color:
                                    "#e5e7eb"

                            },

                            ticks: {

                                color:
                                    "#64748b"

                            },

                            title: {

                                display: true,

                                text: "GWh",

                                color:
                                    "#64748b"

                            }

                        }

                    }

                }

            }
        );

}


// ======================================================
// RENEWABLE CHART
// ======================================================

function updateRenewableChart() {

    if (!renewableCanvas) {
        return;
    }

    const months =
        getAvailableMonths();

    const renewableData = [];


    // ==================================================
    // CALCULATE RENEWABLE SHARE
    // ==================================================

    months.forEach(month => {

        const values =
            getMonthValues(month);

        const hydro =
            getValue(
                values,
                SOURCE_TYPES.hydro
            );

        const wind =
            getValue(
                values,
                SOURCE_TYPES.wind
            );

        const solar =
            getValue(
                values,
                SOURCE_TYPES.solar
            );

        const thermalRenewable =
            getValue(
                values,
                SOURCE_TYPES.thermalRenewable
            );

        const total =
            getTotalForMonth(values);

        const renewable =
            hydro +
            wind +
            solar +
            thermalRenewable;

        const share =
            total > 0
                ? (
                    renewable /
                    total
                ) * 100
                : 0;

        renewableData.push(
            Number(
                share.toFixed(1)
            )
        );

    });


    // ==================================================
    // DESTROY OLD CHART
    // ==================================================

    if (renewableChart) {

        renewableChart.destroy();

    }


    // ==================================================
    // CREATE CHART
    // ==================================================

    renewableChart =
        new Chart(
            renewableCanvas,
            {

                type: "line",

                data: {

                    labels:
                        months.map(formatMonth),

                    datasets: [

                        {

                            label:
                                "Renewable electricity share",

                            data:
                                renewableData,

                            tension: 0.25,

                            borderWidth: 3,

                            pointRadius: 0,

                            fill: false

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

                            backgroundColor:
                                "#111827",

                            padding: 12,

                            callbacks: {

                                label:
                                    context =>
                                        " Renewable electricity: " +
                                        context.raw +
                                        "%"

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {

                                display: false

                            },

                            ticks: {

                                color:
                                    "#64748b",

                                maxRotation: 0,

                                autoSkip: true,

                                callback:
                                    function(value) {

                                        const label =
                                            this.getLabelForValue(
                                                value
                                            );

                                        if (
                                            label.includes(
                                                "January"
                                            )
                                        ) {

                                            return label.split(
                                                " "
                                            )[1];

                                        }

                                        return "";

                                    }

                            }

                        },

                        y: {

                            beginAtZero: true,

                            max: 100,

                            grid: {

                                color:
                                    "#e5e7eb"

                            },

                            ticks: {

                                color:
                                    "#64748b",

                                callback:
                                    value =>
                                        value + "%"

                            },

                            title: {

                                display: true,

                                text:
                                    "Renewable share",

                                color:
                                    "#64748b"

                            }

                        }

                    }

                }

            }
        );

}


// ======================================================
// KEY FINDINGS
// ======================================================

function updateKeyFindings() {

    const months =
        getAvailableMonths();

    if (months.length < 2) {
        return;
    }

    const firstMonth =
        months[0];

    const lastMonth =
        months[
            months.length - 1
        ];


    const firstValues =
        getMonthValues(
            firstMonth
        );

    const lastValues =
        getMonthValues(
            lastMonth
        );


    // ==================================================
    // FIRST MONTH
    // ==================================================

    const firstHydro =
        getValue(
            firstValues,
            SOURCE_TYPES.hydro
        );

    const firstWind =
        getValue(
            firstValues,
            SOURCE_TYPES.wind
        );

    const firstSolar =
        getValue(
            firstValues,
            SOURCE_TYPES.solar
        );

    const firstThermalRenewable =
        getValue(
            firstValues,
            SOURCE_TYPES.thermalRenewable
        );

    const renewableFirst =
        firstHydro +
        firstWind +
        firstSolar +
        firstThermalRenewable;


    // ==================================================
    // LAST MONTH
    // ==================================================

    const lastHydro =
        getValue(
            lastValues,
            SOURCE_TYPES.hydro
        );

    const lastNuclear =
        getValue(
            lastValues,
            SOURCE_TYPES.nuclear
        );

    const lastWind =
        getValue(
            lastValues,
            SOURCE_TYPES.wind
        );

    const lastSolar =
        getValue(
            lastValues,
            SOURCE_TYPES.solar
        );

    const lastThermalNonRenewable =
        getValue(
            lastValues,
            SOURCE_TYPES.thermalNonRenewable
        );

    const lastThermalRenewable =
        getValue(
            lastValues,
            SOURCE_TYPES.thermalRenewable
        );

    const renewableLast =
        lastHydro +
        lastWind +
        lastSolar +
        lastThermalRenewable;


    // ==================================================
    // TOTALS
    // ==================================================

    const firstTotal =
        getTotalForMonth(
            firstValues
        );

    const lastTotal =
        getTotalForMonth(
            lastValues
        );


    // ==================================================
    // SHARES
    // ==================================================

    const firstShare =
        firstTotal > 0
            ? (
                renewableFirst /
                firstTotal
            ) * 100
            : 0;

    const lastShare =
        lastTotal > 0
            ? (
                renewableLast /
                lastTotal
            ) * 100
            : 0;


    // ==================================================
    // CHANGE
    // ==================================================

    const change =
        lastShare -
        firstShare;

    const changeText =
        change >= 0
            ? "+" +
              change.toFixed(1) +
              " percentage points"
            : change.toFixed(1) +
              " percentage points";


    // ==================================================
    // LARGEST SOURCE
    // ==================================================

    const sources = {

        "Hydropower":
            lastHydro,

        "Nuclear power":
            lastNuclear,

        "Wind power":
            lastWind,

        "Solar power":
            lastSolar,

        "Non-renewable thermal":
            lastThermalNonRenewable,

        "Renewable thermal":
            lastThermalRenewable

    };


    const largestSource =
        Object.entries(sources)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];


    // ==================================================
    // UPDATE DOM
    // ==================================================

    setValue(
        document.getElementById(
            "findingRenewable"
        ),
        lastShare.toFixed(1) + "%"
    );

    setValue(
        document.getElementById(
            "findingRenewableText"
        ),
        "Renewable electricity in " +
        formatMonth(lastMonth)
    );


    setValue(
        document.getElementById(
            "findingChange"
        ),
        changeText
    );

    setValue(
        document.getElementById(
            "findingChangeText"
        ),
        "Change from " +
        formatMonth(firstMonth) +
        " to " +
        formatMonth(lastMonth)
    );


    setValue(
        document.getElementById(
            "findingLargest"
        ),
        largestSource[0]
    );

    setValue(
        document.getElementById(
            "findingLargestText"
        ),
        formatNumber(
            largestSource[1]
        ) +
        " GWh in " +
        formatMonth(lastMonth)
    );

}


// ======================================================
// DETAILS MODAL
// ======================================================

function initializeDetailsModal() {

    const detailsModal =
        document.getElementById(
            "detailsModal"
        );

    const closeDetails =
        document.getElementById(
            "closeDetails"
        );

    const detailsIcon =
        document.getElementById(
            "detailsIcon"
        );

    const detailsCategory =
        document.getElementById(
            "detailsCategory"
        );

    const detailsTitle =
        document.getElementById(
            "detailsTitle"
        );

    const detailsDescription =
        document.getElementById(
            "detailsDescription"
        );

    const detailsGwh =
        document.getElementById(
            "detailsGwh"
        );

    const detailsPercentage =
        document.getElementById(
            "detailsPercentage"
        );

    const detailsPeriod =
        document.getElementById(
            "detailsPeriod"
        );


    if (
        !detailsModal ||
        !closeDetails
    ) {

        return;

    }


    // ==================================================
    // SOURCE INFORMATION
    // ==================================================

    const sourceDetails = {

        Vattenkraft: {

            title:
                "Hydropower",

            icon:
                "💧",

            category:
                "Renewable",

            description:
                "Electricity generated from hydropower."

        },

        Karnkraft: {

            title:
                "Nuclear power",

            icon:
                "☢️",

            category:
                "Low carbon",

            description:
                "Electricity generated by nuclear power."

        },

        Vindkraft: {

            title:
                "Wind power",

            icon:
                "🌬️",

            category:
                "Renewable",

            description:
                "Electricity generated by wind power."

        },

        Solkraft: {

            title:
                "Solar power",

            icon:
                "☀️",

            category:
                "Renewable",

            description:
                "Electricity generated by solar power."

        },

        VarmekrEjF: {

            title:
                "Non-renewable thermal",

            icon:
                "🔥",

            category:
                "Non-renewable",

            description:
                "Electricity generated from non-renewable thermal sources."

        },

        VarmekrF: {

            title:
                "Renewable thermal",

            icon:
                "♻️",

            category:
                "Renewable",

            description:
                "Electricity generated from renewable thermal sources."

        }

    };


    // ==================================================
    // OPEN DETAILS
    // ==================================================

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".details-button"
                );

            if (!button) {
                return;
            }

            if (!monthSelect) {
                return;
            }

            const source =
                button.dataset.source;

            const values =
                getMonthValues(
                    monthSelect.value
                );

            const value =
                getValue(
                    values,
                    source
                );

            const total =
                getTotalForMonth(
                    values
                );

            const info =
                sourceDetails[source];

            if (!info) {
                return;
            }


            if (detailsIcon) {

                detailsIcon.textContent =
                    info.icon;

            }

            if (detailsCategory) {

                detailsCategory.textContent =
                    info.category;

            }

            if (detailsTitle) {

                detailsTitle.textContent =
                    info.title;

            }

            if (detailsDescription) {

                detailsDescription.textContent =
                    info.description;

            }

            if (detailsGwh) {

                detailsGwh.textContent =
                    formatNumber(value) +
                    " GWh";

            }

            if (detailsPercentage) {

                detailsPercentage.textContent =
                    percentage(
                        value,
                        total
                    );

            }

            if (detailsPeriod) {

                detailsPeriod.textContent =
                    formatMonth(
                        monthSelect.value
                    );

            }


            detailsModal.classList.add(
                "open"
            );

            document.body.style.overflow =
                "hidden";

        }
    );


    // ==================================================
    // CLOSE MODAL
    // ==================================================

    function closeDetailsModal() {

        detailsModal.classList.remove(
            "open"
        );

        document.body.style.overflow =
            "";

    }


    // ==================================================
    // CLOSE BUTTON
    // ==================================================

    closeDetails.addEventListener(
        "click",
        closeDetailsModal
    );


    // ==================================================
    // CLICK OUTSIDE
    // ==================================================

    detailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                detailsModal
            ) {

                closeDetailsModal();

            }

        }
    );


    // ==================================================
    // ESC
    // ==================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                detailsModal.classList.contains(
                    "open"
                )
            ) {

                closeDetailsModal();

            }

        }
    );

}


// ======================================================
// NAVIGATION
// ======================================================

function initializeNavigation() {

    const buttons =
        document.querySelectorAll(
            ".dashboard-nav button"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const targetId =
                    button.dataset.target;

                const target =
                    document.getElementById(
                        targetId
                    );

                if (!target) {
                    return;
                }

                target.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });


                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });

                button.classList.add(
                    "active"
                );

            }
        );

    });

}


// ======================================================
// SCROLL REVEAL
// ======================================================

function initializeScrollReveal() {

    const sections =
        document.querySelectorAll(
            "main > section"
        );


    sections.forEach(section => {

        section.classList.add(
            "reveal-section"
        );

    });


    if (
        "IntersectionObserver"
        in window
    ) {

        const observer =
            new IntersectionObserver(

                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },

                {

                    threshold:
                        0.08,

                    rootMargin:
                        "0px 0px -40px 0px"

                }

            );


        sections.forEach(section => {

            observer.observe(
                section
            );

        });

    } else {

        // Fallback for older browsers

        sections.forEach(section => {

            section.classList.add(
                "visible"
            );

        });

    }

}
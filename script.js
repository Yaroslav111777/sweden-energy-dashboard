// ======================================================
// ELEMENTS
// ======================================================

const monthSelect =
    document.getElementById("monthSelector");

const totalProduction =
    document.getElementById("totalProduction");

const selectedPeriod =
    document.getElementById("selectedPeriod");

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
// LOAD CSV
// ======================================================

fetch("./data/electricity-production.csv")

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

        setupMonthSelector(allRows);

        updateDashboard();
        updateHistoryChart();
        updateRenewableChart();
        updateKeyFindings();

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


// ======================================================
// CSV PARSER
// ======================================================

function parseCSV(csv) {

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

}


// ======================================================
// MONTH SELECTOR — PREMIUM CUSTOM PICKER
// ======================================================

function setupMonthSelector(rows) {

    if (!monthSelect) {
        return;
    }


    // ==================================================
    // AVAILABLE MONTHS
    // ==================================================

    const months = [
        ...new Set(
            rows
                .map(row => row.month)
                .filter(Boolean)
        )
    ];


    if (!months.length) {
        return;
    }


    // ==================================================
    // SORT MONTHS CHRONOLOGICALLY
    // ==================================================

    months.sort((a, b) => {

        return getMonthDate(a) - getMonthDate(b);

    });


    // ==================================================
    // ORIGINAL SELECT
    // Keep it for dashboard compatibility
    // ==================================================

    monthSelect.innerHTML = "";

    months.forEach(month => {

        const option =
            document.createElement("option");

        option.value = month;

        option.textContent =
            formatMonth(month);

        monthSelect.appendChild(option);

    });


    // ==================================================
    // LATEST AVAILABLE MONTH
    // ==================================================

    const latestMonth =
        months[months.length - 1];

    monthSelect.value =
        latestMonth;


    // ==================================================
    // CUSTOM PICKER ELEMENTS
    // ==================================================

    const picker =
        document.querySelector(
            ".month-picker"
        );

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
    // IF CUSTOM PICKER HTML DOES NOT EXIST
    // Use normal select instead
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
    // YEAR FUNCTION
    // Works with:
    // 2026M06
    // 2026-06
    // 2026/06
    // ==================================================

    function getYear(month) {

        if (!month) {
            return null;
        }

        const match =
            String(month).match(
                /^(\d{4})/
            );

        if (!match) {
            return null;
        }

        return Number(match[1]);

    }


    // ==================================================
    // MONTH NUMBER
    // ==================================================

    function getMonthNumber(month) {

        if (!month) {
            return null;
        }


        const value =
            String(month);


        // 2026M06
        let match =
            value.match(
                /^\d{4}M(\d{2})/
            );

        if (match) {
            return Number(match[1]);
        }


        // 2026-06
        match =
            value.match(
                /^\d{4}-(\d{2})/
            );

        if (match) {
            return Number(match[1]);
        }


        // 2026/06
        match =
            value.match(
                /^\d{4}\/(\d{2})/
            );

        if (match) {
            return Number(match[1]);
        }


        return null;

    }


    // ==================================================
    // DATE FOR SORTING
    // ==================================================

    function getMonthDate(month) {

        const year =
            getYear(month);

        const monthNumber =
            getMonthNumber(month);

        if (
            !year ||
            !monthNumber
        ) {
            return 0;
        }

        return new Date(
            year,
            monthNumber - 1,
            1
        ).getTime();

    }


    // ==================================================
    // AVAILABLE YEARS
    // ==================================================

    const availableYears = [

        ...new Set(

            months

                .map(month =>
                    getYear(month)
                )

                .filter(year =>
                    Number.isFinite(year)
                )

        )

    ].sort(
        (a, b) => a - b
    );


    // ==================================================
    // CURRENT YEAR
    // ==================================================

    let selectedMonth =
        monthSelect.value;

    let currentYear =
        getYear(selectedMonth);


    if (
        !currentYear &&
        availableYears.length
    ) {

        currentYear =
            availableYears[
                availableYears.length - 1
            ];

    }


    // ==================================================
    // MONTH NAMES
    // ==================================================

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


    const shortMonthNames = [

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


    // ==================================================
    // FIND REAL CSV MONTH
    //
    // IMPORTANT:
    // We do NOT construct "2026-06".
    // We find the actual value from the CSV.
    // This fixes the disabled-month problem.
    // ==================================================

    function findMonth(
        year,
        monthNumber
    ) {

        return months.find(month => {

            return (
                getYear(month) === year &&
                getMonthNumber(month) === monthNumber
            );

        });

    }


    // ==================================================
    // UPDATE VISIBLE VALUE
    // ==================================================

    function updatePickerValue(month) {

        if (!month) {

            pickerValue.textContent =
                "Select month";

            return;

        }

        pickerValue.textContent =
            formatMonth(month);

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
    // RENDER MONTHS
    // ==================================================

    function renderMonths() {

        monthGrid.innerHTML = "";

        pickerYear.textContent =
            currentYear;


        for (
            let monthIndex = 1;
            monthIndex <= 12;
            monthIndex++
        ) {

            const matchingMonth =
                findMonth(
                    currentYear,
                    monthIndex
                );


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "month-option";


            button.textContent =
                shortMonthNames[
                    monthIndex - 1
                ];


            // ==================================================
            // MONTH EXISTS
            // ==================================================

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


            // ==================================================
            // CURRENTLY SELECTED
            // ==================================================

            if (
                matchingMonth &&
                matchingMonth ===
                    monthSelect.value
            ) {

                button.classList.add(
                    "selected"
                );

            }


            // ==================================================
            // CLICK MONTH
            // ==================================================

            if (matchingMonth) {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();


                        selectedMonth =
                            matchingMonth;


                        monthSelect.value =
                            matchingMonth;


                        updatePickerValue(
                            matchingMonth
                        );


                        // Trigger dashboard update
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
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            if (
                picker.classList.contains(
                    "open"
                )
            ) {

                closePicker();

            } else {

                // Always open on selected year

                currentYear =
                    getYear(
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
            function(event) {

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
            function(event) {

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
    // CLOSE WHEN CLICKING OUTSIDE
    // ==================================================

    document.addEventListener(
        "click",
        function(event) {

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
    // NORMAL SELECT FALLBACK
    // ==================================================

    monthSelect.addEventListener(
        "change",
        function() {

            const selected =
                monthSelect.value;

            if (selected) {

                currentYear =
                    getYear(selected);

                updatePickerValue(
                    selected
                );

                renderMonths();

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
// DASHBOARD
// ======================================================

function updateDashboard() {

    if (!monthSelect) {
        return;
    }


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
// SET VALUE
// ======================================================

function setValue(
    element,
    value
) {

    if (!element) {
        return;
    }

    element.textContent =
        value;

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
        (value / total) *
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
        .toLocaleString(
            "en-US"
        );

}


// ======================================================
// FORMAT MONTH
// ======================================================

function formatMonth(month) {

    if (!month) {
        return "—";
    }


    const value =
        String(month);


    let year = null;
    let monthNumber = null;


    // ==================================================
    // 2026M06
    // ==================================================

    let match =
        value.match(
            /^(\d{4})M(\d{2})$/
        );


    if (match) {

        year =
            Number(match[1]);

        monthNumber =
            Number(match[2]);

    }


    // ==================================================
    // 2026-06
    // ==================================================

    if (!match) {

        match =
            value.match(
                /^(\d{4})-(\d{2})$/
            );

        if (match) {

            year =
                Number(match[1]);

            monthNumber =
                Number(match[2]);

        }

    }


    // ==================================================
    // 2026/06
    // ==================================================

    if (!match) {

        match =
            value.match(
                /^(\d{4})\/(\d{2})$/
            );

        if (match) {

            year =
                Number(match[1]);

            monthNumber =
                Number(match[2]);

        }

    }


    if (
        !year ||
        !monthNumber ||
        monthNumber < 1 ||
        monthNumber > 12
    ) {

        return value;

    }


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

        productionChart.update("active");

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


    const months = [

        ...new Set(
            allRows.map(
                row => row.month
            )
        )

    ];


    months.sort(
        (a, b) =>
            new Date(
                getYearFromMonth(a),
                getMonthFromMonth(a) - 1
            ) -
            new Date(
                getYearFromMonth(b),
                getMonthFromMonth(b) - 1
            )
    );


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


    historyChart =
        new Chart(
            historyCanvas,
            {

                type: "line",

                data: {

                    labels:
                        months.map(
                            formatMonth
                        ),

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

                            grid: {
                                display: false
                            },

                            ticks: {

                                color:
                                    "#64748b",

                                maxRotation: 0,

                                autoSkip: false,

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

                                text:
                                    "GWh",

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
// MONTH HELPERS FOR CHART
// ======================================================

function getYearFromMonth(month) {

    const match =
        String(month).match(
            /^(\d{4})/
        );

    return match
        ? Number(match[1])
        : 0;

}


function getMonthFromMonth(month) {

    let match =
        String(month).match(
            /^\d{4}M(\d{2})/
        );

    if (match) {
        return Number(match[1]);
    }


    match =
        String(month).match(
            /^\d{4}-(\d{2})/
        );

    if (match) {
        return Number(match[1]);
    }


    return 1;

}


// ======================================================
// RENEWABLE CHART
// ======================================================

function updateRenewableChart() {

    if (!renewableCanvas) {
        return;
    }


    const months = [

        ...new Set(
            allRows.map(
                row => row.month
            )
        )

    ];


    months.sort(
        (a, b) =>
            getMonthDateForChart(a) -
            getMonthDateForChart(b)
    );


    const renewableData = [];


    months.forEach(month => {

        const values =
            getMonthValues(month);


        const total =
            values.Total ?? 0;


        const renewable =

            (values.Vattenkraft ?? 0) +

            (values.Vindkraft ?? 0) +

            (values.Solkraft ?? 0) +

            (values.VarmekrF ?? 0);


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


    renewableChart =
        new Chart(
            renewableCanvas,
            {

                type: "line",

                data: {

                    labels:
                        months.map(
                            formatMonth
                        ),

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
                                    function(context) {

                                        return (
                                            " Renewable electricity: " +
                                            context.raw +
                                            "%"
                                        );

                                    }

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

                                autoSkip: false,

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
                                    function(value) {

                                        return (
                                            value +
                                            "%"
                                        );

                                    }

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
// DATE HELPER
// ======================================================

function getMonthDateForChart(month) {

    const year =
        getYearFromMonth(month);

    const monthNumber =
        getMonthFromMonth(month);

    return new Date(
        year,
        monthNumber - 1,
        1
    ).getTime();

}


// ======================================================
// KEY FINDINGS
// ======================================================

function updateKeyFindings() {

    const months = [

        ...new Set(
            allRows.map(
                row => row.month
            )
        )

    ];


    months.sort(
        (a, b) =>
            getMonthDateForChart(a) -
            getMonthDateForChart(b)
    );


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


    const renewableFirst =

        (firstValues.Vattenkraft ?? 0) +

        (firstValues.Vindkraft ?? 0) +

        (firstValues.Solkraft ?? 0) +

        (firstValues.VarmekrF ?? 0);


    const renewableLast =

        (lastValues.Vattenkraft ?? 0) +

        (lastValues.Vindkraft ?? 0) +

        (lastValues.Solkraft ?? 0) +

        (lastValues.VarmekrF ?? 0);


    const firstTotal =
        firstValues.Total ?? 0;

    const lastTotal =
        lastValues.Total ?? 0;


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


    const sources = {

        "Hydropower":
            lastValues.Vattenkraft ?? 0,

        "Nuclear power":
            lastValues.Karnkraft ?? 0,

        "Wind power":
            lastValues.Vindkraft ?? 0,

        "Solar power":
            lastValues.Solkraft ?? 0,

        "Non-renewable thermal":
            lastValues.VarmekrEjF ?? 0,

        "Renewable thermal":
            lastValues.VarmekrF ?? 0

    };


    const largestSource =

        Object.entries(sources)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];


    setValue(

        document.getElementById(
            "findingRenewable"
        ),

        lastShare.toFixed(1) +
        "%"

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
// NAVIGATION BUTTONS
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const buttons =
            document.querySelectorAll(
                ".dashboard-nav button"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                function() {

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


                    buttons.forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );

                }
            );

        });

    }
);


// ======================================================
// SCROLL REVEAL
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

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

                        threshold: 0.08,

                        rootMargin:
                            "0px 0px -40px 0px"

                    }

                );


            sections.forEach(section => {

                observer.observe(
                    section
                );

            });

        }

    }
);


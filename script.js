const ctx = document.getElementById("productionChart");

const productionData = {
    labels: ["2015", "2017", "2019", "2021", "2023"],
    datasets: [
        {
            label: "Electricity production (TWh)",
            data: [158, 162, 165, 170, 175],
            borderWidth: 2
        }
    ]
};

new Chart(ctx, {
    type: "line",
    data: productionData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});
document.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard() {

    try {

        const response = await fetch("/api/esg");

        const data = await response.json();

        renderKPIs(data);
        renderCertifications(data);
        renderCharts(data);

    } catch (error) {

        console.error("Dashboard Load Error:", error);

    }
}

function renderKPIs(data) {

    const monthly = data.monthly_data;

    const ghgTotal = monthly.reduce(
        (sum, item) => sum + item.ghg_emissions,
        0
    );

    const energyTotal = monthly.reduce(
        (sum, item) => sum + item.energy_kwh,
        0
    );

    const waterTotal = monthly.reduce(
        (sum, item) => sum + item.water_kl,
        0
    );

    const wasteTotal = monthly.reduce(
        (sum, item) => sum + item.waste_kg,
        0
    );

    updateCard(
        "ghg",
        ghgTotal.toFixed(1),
        data.targets.ghg_annual_tco2e
    );

    updateCard(
        "energy",
        energyTotal.toLocaleString(),
        data.targets.energy_annual_kwh
    );

    updateCard(
        "water",
        waterTotal.toLocaleString(),
        data.targets.water_annual_kl
    );

    updateCard(
        "waste",
        wasteTotal.toLocaleString(),
        data.targets.waste_annual_kg
    );
}

function updateCard(prefix, current, target) {

    document.getElementById(`${prefix}-total`).innerText =
        current;

    const percentage =
        (parseFloat(current.toString().replace(/,/g, "")) /
            target) *
        100;

    document.getElementById(
        `${prefix}-percent`
    ).innerText = `${percentage.toFixed(1)}%`;

    document.getElementById(
        `${prefix}-progress`
    ).style.width = `${Math.min(percentage, 100)}%`;
}

function renderCertifications(data) {

    const container =
        document.getElementById("certification-list");

    container.innerHTML = "";

    data.certifications.forEach(cert => {

        const badge = document.createElement("span");

        badge.classList.add("badge");

        badge.innerText = cert;

        container.appendChild(badge);
    });
}

function renderCharts(data) {

    const monthly = data.monthly_data;

    const months = monthly.map(item => item.month);

    //-----------------------------------
    // GHG Trend
    //-----------------------------------

    new Chart(
        document.getElementById("ghgChart"),
        {
            type: "line",
            data: {
                labels: months,
                datasets: [{
                    label: "GHG Emissions (tCO₂e)",
                    data: monthly.map(
                        item => item.ghg_emissions
                    ),
                    tension: 0.3
                }]
            }
        }
    );

    //-----------------------------------
    // Energy + Water
    //-----------------------------------

    new Chart(
        document.getElementById("energyWaterChart"),
        {
            type: "bar",
            data: {
                labels: months,
                datasets: [
                    {
                        label: "Energy (kWh)",
                        data: monthly.map(
                            item => item.energy_kwh
                        )
                    },
                    {
                        label: "Water (kL)",
                        data: monthly.map(
                            item => item.water_kl
                        )
                    }
                ]
            }
        }
    );

    //-----------------------------------
    // Scope Breakdown
    //-----------------------------------

    new Chart(
        document.getElementById("scopeChart"),
        {
            type: "doughnut",
            data: {
                labels: [
                    "Scope 1",
                    "Scope 2",
                    "Scope 3"
                ],
                datasets: [{
                    data: [
                        data.scope_breakdown.scope1_percent,
                        data.scope_breakdown.scope2_percent,
                        data.scope_breakdown.scope3_percent
                    ]
                }]
            }
        }
    );
}
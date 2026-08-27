# Sweden Energy Transition Dashboard

An interactive dashboard for exploring Sweden's electricity production and renewable energy transition.

## Overview

The Sweden Energy Transition Dashboard visualizes monthly electricity production in Sweden and shows how different energy sources contribute to the electricity system over time.

The dashboard focuses on:

* Hydropower
* Nuclear power
* Wind power
* Solar power
* Renewable thermal generation
* Non-renewable thermal generation

The project is designed as an educational and analytical visualization of Sweden's energy transition.

## Key Features

### Monthly exploration

Select any available month from January 2017 to June 2026 and explore the electricity production mix for that period.

### Energy system overview

Production is grouped into:

* Renewable
* Nuclear
* Non-renewable

### Electricity mix

The dashboard displays both GWh production and percentage shares for each electricity source.

### Historical trends

Interactive charts show monthly electricity production by energy source over time.

### Renewable transition

A dedicated chart tracks the share of renewable electricity production throughout the available period.

### Key findings

The dashboard automatically calculates selected observations from the underlying data, including:

* Renewable electricity share
* Change in renewable share over the available period
* Largest electricity production source

## Data

The electricity production data comes from **Statistics Sweden (SCB)**.

Source table:

**TAB5644 — Electricity production by production type and time**

The current dataset covers:

**January 2017 – June 2026**

Production values are presented in **GWh**.

## Methodology

Renewable electricity is calculated as the combined production from:

* Hydropower
* Wind power
* Solar power
* Renewable thermal generation

Non-renewable electricity in the dashboard is represented by non-renewable thermal generation.

Renewable electricity share is calculated as:

**Renewable production / Total electricity production × 100**

Percentage-point changes are used when comparing renewable shares between periods.

## Technologies

The project is built using:

* HTML
* CSS
* JavaScript
* Chart.js
* PowerShell
* Git / GitHub

## Project Structure

```text
sweden-energy-dashboard/
│
├── index.html
├── style.css
├── script.js
│
├── data/
│   └── electricity-production.csv
│
├── download-scb-data.ps1
│
└── README.md
```

## Running the Dashboard

Clone or download the repository and open the project using a local development server.

For example, with Visual Studio Code and Live Server:

1. Open the project folder.
2. Start the local server.
3. Open the dashboard in your browser.

The dashboard loads the electricity dataset from:

```text
data/electricity-production.csv
```

## Updating the Data

The PowerShell downloader retrieves electricity production data from the SCB API and generates the CSV dataset used by the dashboard.

The downloader can be used to update the dataset when new SCB data becomes available.

## Purpose

This project explores how data visualization can be used to understand energy systems and the transition toward renewable electricity.

It combines public energy data with interactive visualization to make changes in Sweden's electricity system easier to explore and interpret.

## Author

Yaroslav

Energy Transition, Sustainability and Leadership

Uppsala University — Campus Gotland

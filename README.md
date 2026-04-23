# Petrol Bunk Calculator

A simple static web app for daily petrol bunk nozzle calculations.

## Features

- Closing minus opening minus testing litre calculation
- Per-nozzle rate and amount calculation
- Grand total, gross reading, testing litres, and net sold summary
- Example data loader
- Share/copy and print support
- Works as plain static HTML, CSS, and JavaScript

## Formula

```text
sold litres = closing reading - opening reading - testing litres
amount = sold litres x rate per litre
```

## Run locally

Open `index.html` in a browser.

## Host on GitHub Pages

After pushing this folder to GitHub:

1. Open the repository on GitHub.
2. Go to Settings > Pages.
3. Under Build and deployment, choose `Deploy from a branch`.
4. Select the `main` branch and `/ (root)` folder.
5. Save. GitHub will publish the website after a short build.

class Currency {
    constructor(code, name) {
        // Constructor
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        // Constructor
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    getCurrencies() {
        // Obtener la lista de monedas
        return fetch(`${this.apiUrl}/currencies`)
            .then(response => response.json())
            .then(data => {
                for (const code in data) {
                    this.currencies.push(new Currency(code, data[code]));
                }
            })
    }

    convertCurrency(amount, fromCurrency, toCurrency) {
        // Retorna el monto si corresponde
        if (fromCurrency.code === toCurrency.code) {
            return Promise.resolve(amount);
        }
        // Petición a la API
        return fetch(
            `${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`
        )
            .then(response => response.json())
            .then(data => data.rates[toCurrency.code])
            
            
    }
    getExchangeRateDifference() {
        const yesterday = new Date(Date.now() - 864e5).toISOString().split('T')[0];
    
        return fetch(`${this.apiUrl}/${yesterday}..`)
            .then(response => response.json())
            .then(data => {
                const rates = data.rates;
                const yesterdayRates = rates[Object.keys(rates)[0]];
                const todayRates = rates[Object.keys(rates)[1]];
    
                let difference = {};
    
                for (const currencyCode in yesterdayRates) {
                    const yesterdayRate = yesterdayRates[currencyCode];
                    const todayRate = todayRates[currencyCode];
                    difference[currencyCode] = todayRate - yesterdayRate;
                }
    
                return difference;
            })
            
    }
    
    
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const differencesDiv = document.getElementById("difference");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");
    
    const converter = new CurrencyConverter("https://api.frankfurter.app");

    // Obtener lista de monedas
    converter.getCurrencies().then(() => {
        populateCurrencies(fromCurrencySelect, converter.currencies);
        populateCurrencies(toCurrencySelect, converter.currencies);
    });

    // Manejar la conversion de moneda al enviar
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); 

        const amount = document.getElementById("amount").value; 
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value 
        );

        
        const convertedAmount = await converter.convertCurrency(amount, fromCurrency, toCurrency);

        // Mostrar resultado
        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${fromCurrency.code} equivale a ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }

        // Diferencias de tasa de cambio en nuevo div
        const differences = await converter.getExchangeRateDifference();
        if (differences !== null) {
            let result = [];
            for (const currencyCode in differences) {
                result.push(`${currencyCode}: ${differences[currencyCode]}<br>`);
            }
            differencesDiv.innerHTML = result.join(''); 
        } else {
            differencesDiv.textContent = "Error al obtener las diferencias de tasa de cambio.";
        }
    });

 
    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});

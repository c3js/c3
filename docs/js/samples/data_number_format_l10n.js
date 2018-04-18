// Locale for Russian (ru_RU)
var d3locale = d3.locale({
    "decimal": ",",
    "thousands": "\u00A0",
    "grouping": [3],
    "currency": ["", " руб."],
    "dateTime": "%A, %e %B %Y г. %X",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
    "shortDays": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
    "months": ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    "shortMonths": ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
});
// More about locale settings: https://github.com/mbostock/d3/wiki/Localization
var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30000, 20000, 10000, 40000, 15000, 250000],
            ['data2', 100.5, 1200.46, 100.1, 40.12, 150.1, 250]
        ],
        axes: {
            data2: 'y2'
        }
    },
    axis : {
        y : {
            tick: {
                format: d3locale.numberFormat(",")
            }
        },
        y2: {
            show: true,
            tick: {
                format: d3locale.numberFormat(",")
            }
        }
    }
});

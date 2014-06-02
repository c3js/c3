var chart;
function refresh() {
    if (suspendRefresh)
        return;
    chart.load({
        columns: [
            ["Value"].concat(zoom(column, currentZoom, "t=>Math.round(t.avg())".toLambda())),
            ["xColumn"].concat(zoom(xColumn, currentZoom, "t=>t[0]".toLambda())),
        ]
    });
}

function getChart() {
    return chart;
}
function main() {
    var last = 0;
    var max = 10000;
    var column = Array.generate(max, function (i) {
        return last += Math.randomInt(-10, 10);
    });
    var xColumn = Array.generateNumbers(0, max);
    var options = {
        bindto: "#divChart",
        data: {
            columns: [
                ["Value"].concat(column),
                ["x"].concat(xColumn),
            ],
            type: "line",
            x: "x"
        },
        zoom2: { 
            enabled: true, 
        }
    };
    chart = c3ext.generate(options);

    window.setInterval(refreshStatus, 1000);

    function refreshStatus() {
        var zoomInfo = chart.zoom2.getZoom();
        var info = {
            reduced:chart.zoom2.maxItems(), 
            actual:(zoomInfo.currentZoom[1]-zoomInfo.currentZoom[0]),
            range:zoomInfo.currentZoom[0] + "-" + zoomInfo.currentZoom[1],
            total: zoomInfo.totalItems
        };
        $("#status").text(JSON.stringify(info, null, " "));
    }

};



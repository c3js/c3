///<reference path="http://localhost/cockpit/js/playground/utils.js"></script>



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
        //transition: { duration: 0 },
        data: {
            columns: [
                ["Value"].concat(column),
                ["x"].concat(xColumn),
            ],//column
            type: "line",
            x: "x"
        },
        zoom2: { 
            enabled: true, 
            //reducers: { 
            //    col: "t=>Math.round(t.avg())".toLambda(), 
            //    xColumns: "t=>t[0]".toLambda() 
            //} 
        }
    };
    chart = c3ext.generate(options);


    var deltaY = 0;
    var leftRatio = 0;
    var el = $("#divChart");
    var timer = new Timer(doZoom);
    el.mousewheel(function (e) {
        deltaY += e.deltaY;
        leftRatio = (e.offsetX - 70) / (e.currentTarget.offsetWidth - 70);
        console.log({ "e.offsetX": e.offsetX, "e.currentTarget.offsetWidth": e.currentTarget.offsetWidth, leftRatio: leftRatio });
        timer.set(150);
        e.preventDefault();
        //if(e.deltaY>0)
        //    chart.zoom2.zoomIn();
        //else if(e.deltaY<0)
        //    chart.zoom2.zoomOut();
        //console.log(e.deltaX, e.deltaY, e.deltaFactor);
    });

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
    function doZoom() {
        if (deltaY != 0) {
            var maxDelta = 10;
            var multiply = (maxDelta + deltaY) / maxDelta;
            //var factor = chart.zoom2.factor()*multiply;
            //factor= Math.ceil(factor*100) / 100;
            console.log({ deltaY: deltaY, multiply: multiply });
            chart.zoom2.zoomAndPanByRatio(multiply, leftRatio);//0.5);//leftRatio);
            deltaY = 0;
        }
    }

};



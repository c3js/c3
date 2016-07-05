c3_chart_fn.pie = function (){};
c3_chart_fn.pie.explodeRadius = function (radius) {
    var $$ = this.internal, config = $$.config

    if(radius === undefined){
        return config.pie_explodeRadius;
    }

    config.pie_explodeRadius = radius;

    this.flush();
};
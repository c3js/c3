	c3.generate = function(config) {
	    return new Chart(config);
	};

	c3.chart = {
	    fn: Chart.prototype,
	    internal: {
	        fn: ChartInternal.prototype,
	        axis: {
	            fn: Axis.prototype
	        }
	    }
	};

	return c3;

}));
var __bindto = 'bindto',
    __size_width = 'size_width',
    __size_height = 'size_height',
    __padding_left = 'padding_left',
    __padding_right = 'padding_right',
    __padding_top = 'padding_top',
    __padding_bottom = 'padding_bottom',
    __zoom_enabled = 'zoom_enabled',
    __zoom_extent = 'zoom_extent',
    __zoom_privileged = 'zoom_privileged',
    __zoom_onzoom = 'zoom_onzoom',
    __interaction_enabled = 'interaction_enabled',
    __onmouseover = 'onmouseover',
    __onmouseout = 'onmouseout',
    __onresize = 'onresize',
    __onresized = 'onresized',
    __transition_duration = 'transition_duration',
    __data_x = 'data_x',
    __data_xs = 'data_xs',
    __data_x_format = 'data_x_format',
    __data_x_localtime = 'data_x_localtime',
    __data_id_converter = 'data_id_converter',
    __data_names = 'data_names',
    __data_classes = 'data_classes',
    __data_groups = 'data_groups',
    __data_axes = 'data_axes',
    __data_type = 'data_type',
    __data_types = 'data_types',
    __data_labels = 'data_labels',
    __data_order = 'data_order',
    __data_regions = 'data_regions',
    __data_color = 'data_color',
    __data_colors = 'data_colors',
    __data_hide = 'data_hide',
    __data_filter = 'data_filter',
    __data_selection_enabled = 'data_selection_enabled',
    __data_selection_grouped = 'data_selection_grouped',
    __data_selection_isselectable = 'data_selection_isselectable',
    __data_selection_multiple = 'data_selection_multiple',
    __data_onclick = 'data_onclick',
    __data_onmouseover = 'data_onmouseover',
    __data_onmouseout = 'data_onmouseout',
    __data_onselected = 'data_onselected',
    __data_onunselected = 'data_onunselected',
    __data_ondragstart = 'data_ondragstart',
    __data_ondragend = 'data_ondragend',
    __data_url = 'data_url',
    __data_json = 'data_json',
    __data_rows = 'data_rows',
    __data_columns = 'data_columns',
    __data_mimeType = 'data_mimeType',
    __data_keys = 'data_keys',
    __data_empty_label_text = 'data_empty_label_text',
    __subchart_show = 'subchart_show',
    __subchart_size_height = 'subchart_size_height',
    __subchart_onbrush = 'subchart_onbrush',
    __color_pattern = 'color_pattern',
    __color_threshold  = 'color_threshold',
    __legend_show = 'legend_show',
    __legend_position = 'legend_position',
    __legend_inset_anchor = 'legend_inset_anchor',
    __legend_inset_x = 'legend_inset_x',
    __legend_inset_y = 'legend_inset_y',
    __legend_inset_step = 'legend_inset_step',
    __legend_item_onclick = 'legend_item_onclick',
    __legend_item_onmouseover = 'legend_item_onmouseover',
    __legend_item_onmouseout = 'legend_item_onmouseout',
    __legend_equally = 'legend_equally',
    __axis_rotated = 'axis_rotated',
    __axis_x_show = 'axis_x_show',
    __axis_x_type = 'axis_x_type',
    __axis_x_localtime = 'axis_x_localtime',
    __axis_x_categories = 'axis_x_categories',
    __axis_x_tick_centered = 'axis_x_tick_centered',
    __axis_x_tick_format = 'axis_x_tick_format',
    __axis_x_tick_culling = 'axis_x_tick_culling',
    __axis_x_tick_culling_max = 'axis_x_tick_culling_max',
    __axis_x_tick_count = 'axis_x_tick_count',
    __axis_x_tick_fit = 'axis_x_tick_fit',
    __axis_x_tick_values = 'axis_x_tick_values',
    __axis_x_tick_rotate = 'axis_x_tick_rotate',
    __axis_x_tick_outer = 'axis_x_tick_outer',
    __axis_x_max = 'axis_x_max',
    __axis_x_min = 'axis_x_min',
    __axis_x_padding = 'axis_x_padding',
    __axis_x_height = 'axis_x_height',
    __axis_x_default = 'axis_x_default',
    __axis_x_label = 'axis_x_label',
    __axis_y_show = 'axis_y_show',
    __axis_y_max = 'axis_y_max',
    __axis_y_min = 'axis_y_min',
    __axis_y_center = 'axis_y_center',
    __axis_y_label = 'axis_y_label',
    __axis_y_tick_format = 'axis_y_tick_format',
    __axis_y_tick_outer = 'axis_y_tick_outer',
    __axis_y_padding = 'axis_y_padding',
    __axis_y_ticks = 'axis_y_ticks',
    __axis_y2_show = 'axis_y2_show',
    __axis_y2_max = 'axis_y2_max',
    __axis_y2_min = 'axis_y2_min',
    __axis_y2_center = 'axis_y2_center',
    __axis_y2_label = 'axis_y2_label',
    __axis_y2_tick_format = 'axis_y2_tick_format',
    __axis_y2_tick_outer = 'axis_y2_tick_outer',
    __axis_y2_padding = 'axis_y2_padding',
    __axis_y2_ticks = 'axis_y2_ticks',
    __grid_x_show = 'grid_x_show',
    __grid_x_type = 'grid_x_type',
    __grid_x_lines = 'grid_x_lines',
    __grid_y_show = 'grid_y_show',
    __grid_y_lines = 'grid_y_lines',
    __grid_y_ticks = 'grid_y_ticks',
    __grid_focus_show = 'grid_focus_show',
    __point_show = 'point_show',
    __point_r = 'point_r',
    __point_focus_expand_enabled = 'point_focus_expand_enabled',
    __point_focus_expand_r = 'point_focus_expand_r',
    __point_select_r = 'point_select_r',
    __line_connect_null = 'line_connect_null',
    __bar_width = 'bar_width',
    __bar_width_ratio = 'bar_width_ratio',
    __bar_width_max = 'bar_width_max',
    __bar_zerobased = 'bar_zerobased',
    __area_zerobased = 'area_zerobased',
    __pie_label_show = 'pie_label_show',
    __pie_label_format = 'pie_label_format',
    __pie_label_threshold = 'pie_label_threshold',
    __pie_sort = 'pie_sort',
    __pie_expand = 'pie_expand',
    __gauge_label_show = 'gauge_label_show',
    __gauge_label_format = 'gauge_label_format',
    __gauge_expand = 'gauge_expand',
    __gauge_min = 'gauge_min',
    __gauge_max = 'gauge_max',
    __gauge_units = 'gauge_units',
    __gauge_width = 'gauge_width',
    __donut_label_show = 'donut_label_show',
    __donut_label_format = 'donut_label_format',
    __donut_label_threshold = 'donut_label_threshold',
    __donut_width = 'donut_width',
    __donut_sort = 'donut_sort',
    __donut_expand = 'donut_expand',
    __donut_title = 'donut_title',
    __regions = 'regions',
    __tooltip_show = 'tooltip_show',
    __tooltip_grouped = 'tooltip_grouped',
    __tooltip_format_title = 'tooltip_format_title',
    __tooltip_format_name = 'tooltip_format_name',
    __tooltip_format_value = 'tooltip_format_value',
    __tooltip_contents = 'tooltip_contents',
    __tooltip_init_show = 'tooltip_init_show',
    __tooltip_init_x = 'tooltip_init_x',
    __tooltip_init_position = 'tooltip_init_position';

var config = c3_chart_internal_fn.config = {};
config[__bindto] = '#chart';
config[__size_width] = undefined;
config[__size_height] = undefined;
config[__padding_left] = undefined;
config[__padding_right] = undefined;
config[__padding_top] = undefined;
config[__padding_bottom] = undefined;
config[__zoom_enabled] = false;
config[__zoom_extent] = undefined;
config[__zoom_privileged] = false;
config[__zoom_onzoom] = function () {};
config[__interaction_enabled] = true;
config[__onmouseover] = function () {};
config[__onmouseout] = function () {};
config[__onresize] = function () {};
config[__onresized] = function () {};
config[__transition_duration] = 350;
config[__data_x] = undefined;
config[__data_xs] = {};
config[__data_x_format] = '%Y-%m-%d';
config[__data_x_localtime] = true;
config[__data_id_converter] = function (id) { return id; };
config[__data_names] = {};
config[__data_classes] = {};
config[__data_groups] = [];
config[__data_axes] = {};
config[__data_type] = undefined;
config[__data_types] = {};
config[__data_labels] = {};
config[__data_order] = 'desc';
config[__data_regions] = {};
config[__data_color] = undefined;
config[__data_colors] = {};
config[__data_hide] = false;
config[__data_filter] = undefined;
config[__data_selection_enabled] = false;
config[__data_selection_grouped] = false;
config[__data_selection_isselectable] = function () { return true; };
config[__data_selection_multiple] = true;
config[__data_onclick] = function () {};
config[__data_onmouseover] = function () {};
config[__data_onmouseout] = function () {};
config[__data_onselected] = function () {};
config[__data_onunselected] = function () {};
config[__data_ondragstart] = function () {};
config[__data_ondragend] = function () {};
config[__data_url] = undefined;
config[__data_json] = undefined;
config[__data_rows] = undefined;
config[__data_columns] = undefined;
config[__data_mimeType] = undefined;
config[__data_keys] = undefined;
// configuration for no plot-able data supplied.
config[__data_empty_label_text] = "";
// subchart
config[__subchart_show] = false;
config[__subchart_size_height] = 60;
config[__subchart_onbrush] = function () {};
// color
config[__color_pattern] = [];
config[__color_threshold] = {};
// legend
config[__legend_show] = true;
config[__legend_position] = 'bottom';
config[__legend_inset_anchor] = 'top-left';
config[__legend_inset_x] = 10;
config[__legend_inset_y] = 0;
config[__legend_inset_step] = undefined;
config[__legend_item_onclick] = undefined;
config[__legend_item_onmouseover] = undefined;
config[__legend_item_onmouseout] = undefined;
config[__legend_equally] = false;
// axis
config[__axis_rotated] = false;
config[__axis_x_show] = true;
config[__axis_x_type] = 'indexed';
config[__axis_x_localtime] = true;
config[__axis_x_categories] = [];
config[__axis_x_tick_centered] = false;
config[__axis_x_tick_format] = undefined;
config[__axis_x_tick_culling] = {};
config[__axis_x_tick_culling_max] = 10;
config[__axis_x_tick_count] = undefined;
config[__axis_x_tick_fit] = true;
config[__axis_x_tick_values] = null;
config[__axis_x_tick_rotate] = undefined;
config[__axis_x_tick_outer] = true;
config[__axis_x_max] = null;
config[__axis_x_min] = null;
config[__axis_x_padding] = {};
config[__axis_x_height] = undefined;
config[__axis_x_default] = undefined;
config[__axis_x_label] = {};
config[__axis_y_show] = true;
config[__axis_y_max] = undefined;
config[__axis_y_min] = undefined;
config[__axis_y_center] = undefined;
config[__axis_y_label] = {};
config[__axis_y_tick_format] = undefined;
config[__axis_y_tick_outer] = true;
config[__axis_y_padding] = undefined;
config[__axis_y_ticks] = 10;
config[__axis_y2_show] = false;
config[__axis_y2_max] = undefined;
config[__axis_y2_min] = undefined;
config[__axis_y2_center] = undefined;
config[__axis_y2_label] = {};
config[__axis_y2_tick_format] = undefined;
config[__axis_y2_tick_outer] = true;
config[__axis_y2_padding] = undefined;
config[__axis_y2_ticks] = 10;
// grid
config[__grid_x_show] = false;
config[__grid_x_type] = 'tick';
config[__grid_x_lines] = [];
config[__grid_y_show] = false;
// not used
// grid_y_type: {}, 'tick'),
config[__grid_y_lines] = [];
config[__grid_y_ticks] = 10;
config[__grid_focus_show] = true;
// point - point of each data
config[__point_show] = true;
config[__point_r] = 2.5;
config[__point_focus_expand_enabled] = true;
config[__point_focus_expand_r] = undefined;
config[__point_select_r] = undefined;
config[__line_connect_null] = false;
// bar
config[__bar_width] = undefined;
config[__bar_width_ratio] = 0.6;
config[__bar_width_max] = undefined;
config[__bar_zerobased] = true;
// area
config[__area_zerobased] = true;
// pie
config[__pie_label_show] = true;
config[__pie_label_format] = undefined;
config[__pie_label_threshold] = 0.05;
config[__pie_sort] = true;
config[__pie_expand] = true;
// gauge
config[__gauge_label_show] = true;
config[__gauge_label_format] = undefined;
config[__gauge_expand] = true;
config[__gauge_min] = 0;
config[__gauge_max] = 100;
config[__gauge_units] = undefined;
config[__gauge_width] = undefined;
// donut
config[__donut_label_show] = true;
config[__donut_label_format] = undefined;
config[__donut_label_threshold] = 0.05;
config[__donut_width] = undefined;
config[__donut_sort] = true;
config[__donut_expand] = true;
config[__donut_title] = "";
// region - region to change style
config[__regions] = [];
// tooltip - show when mouseover on each data
config[__tooltip_show] = true;
config[__tooltip_grouped] = true;
config[__tooltip_format_title] = undefined;
config[__tooltip_format_name] = undefined;
config[__tooltip_format_value] = undefined;
config[__tooltip_contents] = function (d, defaultTitleFormat, defaultValueFormat, color) {
    return this.getTooltipContent ? this.getTooltipContent(d, defaultValueFormat, defaultValueFormat, color) : '';
},
config[__tooltip_init_show] = false;
config[__tooltip_init_x] = 0;
config[__tooltip_init_position] = {top: '0px', left: '50px'};

c3_chart_internal_fn.loadConfig = function (config) {
    var this_config = this.config, target, keys, read;
    function find() {
        var key = keys.shift();
//            console.log("key =>", key, ", target =>", target);
        if (key && target && key in target) {
            target = target[key];
            return find();
        }
        else if (!key) {
            return target;
        }
        else {
            return undefined;
        }
    }
    Object.keys(this_config).forEach(function (key) {
        target = config;
        keys = key.split('_');
        read = find();
//                console.log("CONFIG : ", key, read);
        if (isDefined(read)) {
            this_config[key] = read;
        }
    });
};

<?php 
/**
* Simple PHP script for exporting a c3 chart using phantomjs
*
*/

// Basic Configuration
$phantom = '/path/to/phantomjs';
$output  = 'test.png'; // other supported formats: PNG, PDF, JPEG, GIF
$height  = 320;
$width   = 800;
$dimensions = "{$width}x{$height}";

// C3 Chart Options
$options = array(
	"data" => array(
		"columns" => array(
			array("data1", 30, 150, 100, 400, 150, 250),
            array('data2', 50, 20, 10, 40, 15, 25)
		),
		"type"    => "spline"
	),
	"padding" => array(
		"top" => 10,
		"bottom" => 10,
		"right" => 15,
		"left" => 15
	),
	"size" => array(
		"width"  => $width,
		"height" => $height
	)
);
$options  = json_encode($options);

$command = "$phantom c3-export.js $output '$options' $dimensions";
echo("Executing Command:\n$command\n---------------------\n");
exec($command);
?>
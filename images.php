<?php
header('Content-Type: application/json');
require 'vendor/autoload.php';
use Medoo\Medoo;

$database = new Medoo([
    'database_type' => 'sqlite',
    'database_file' => 'db/data'
]);

$images = $database->select("images", "*");

foreach($images as $key => $image) {
    $images[$key]["filename"] = '/images/' . $image["filename"];
}

echo json_encode($images);
?>

<?php
header('Content-Type: application/json');
error_reporting(E_ALL & ~E_WARNING);
require 'vendor/autoload.php';
use Intervention\Image\ImageManager;
use Intervention\Image\Exception\NotReadableException;
use Medoo\Medoo;

$database = new Medoo([
    'database_type' => 'sqlite',
    'database_file' => 'db/data'
]);

$imageManager = new ImageManager();

if (!empty($_FILES)) {
    if ($_FILES['file']['error'] == 0 && is_uploaded_file($_FILES['file']['tmp_name'])) {
        
        if ($_FILES["file"]["type"] !== "text/plain") {
            // File must be .txt!
            $response = [
                "error" => "Invalid file",
                "errorText" => "File must be .txt!"
            ];
            
            http_response_code(406);
            echo json_encode($response);
            exit;
        };
            
        $urls = file($_FILES['file']['tmp_name'], FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach($urls as $url) {
            // check file is not in db already
            $found = $database->count("images",["url" => $url]);
            
            if ($found > 0) {
                continue;
            }
            
            // check file exists on remote server
            $image = file_get_contents($url);
            if (http_response_code() == 200 ) {
                
                // make image         
                try 
                {
                    $image = $imageManager->make($image);
                }
                catch(NotReadableException $e)
                {
                    // If error, stop and continue looping to next iteration
                    continue;
                }
                
                $image = $image->resize(null, 200, function ($constraint) {
                    $constraint->aspectRatio();
                });
                
                if (!file_exists('images')) {
                    mkdir('images', 0777, true);
                }
                
                $image->insert('watermark.png')->save('images/' . urldecode(basename($url)));
                
                $affected_rows = $database->insert("images", [
                    "filename" => basename($url),
                    "url" => $url
                ]);
                
                if (!$affected_rows) { 
                    echo 'Error saving to database: ' . $database->error();
                    //exit;
                }
                
            } else {
                // send error message
                echo "status is not 200";
            }
        }
        
        echo json_encode(["The file ". basename($_FILES["file"]["name"]). " has been uploaded."]);
        
    } else {
        throw new \Exception('Error uploading file!');
    }
} else {
    throw new \Exception('File is not uploaded!');
}

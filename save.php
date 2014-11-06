<?php
/**
 * Created by PhpStorm.
 * User: Yuxin Su
 * Date: 2014/11/5
 * Time: 22:31
 */
if(!file_exists("data/")){
    mkdir("data/");
}
if(!empty($_POST)) {
    $title = $_POST['title'];
    $content = $_POST['content'];
    $file_handle = fopen("data/{$title}.txt", "w+");
    if(fwrite($file_handle, $content) == FALSE) {
        echo "Cannot write to file {$title}";
    }
    fclose($file_handle);
}


?>
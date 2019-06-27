<?php

header('content-type: application/xml');
//http://api.worldbank.org/countries?per_page=10&incomeLevel=LIC
$c= $_GET['a'];
    if($c=="pjm"){
        $url = 'http://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2015:2015&page=4';
    }else{
        $url = 'http://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2015:2015&page=4';
    }
    $handle = fopen($url,"r");
    if($handle){
        while(!feof($handle)){
            $buffer = fgets($handle,4096);
            echo $buffer;
        }
        fclose($handle);
        echo "teste: "+$c;
    }
?>
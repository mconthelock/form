<?php
	defined('BASEPATH') OR exit('No direct script access allowed');
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<style type="text/css">
		#container{
            font-family: Angsana New;
			background-color: #fff;
			/* margin: 0px 15px; */
			font-size: 22px;
			color: #333;
			/* border: 1px solid #D0D0D0; */
		}		
        .l-text{
            margin-left: 10px;
        }
        .order-text{
            margin: 0px 20px !important;
            font-family: Consolas, Monaco, Courier New, Courier, monospace !important;
            font-size: 12px;
        }
		</style>
	</head>
	<body>
		<div id="container">		
			<div style="margin: 15px 0px;">
				<?php
					// echo $SUBJECT;
                    if(isset($BODY)){
                        foreach($BODY as $data){
                            echo '<div class="order-text">';
                            echo $data;
                            echo '</div>';
                        }
                    } 
                ?>
			</div>
		</div>
	</body>
</html>
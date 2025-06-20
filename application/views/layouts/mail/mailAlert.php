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
			margin: 0px;
			font-size: 22px;
			color: #333;
			/* border: 1px solid #D0D0D0; */
		}		
		.logo span {
			font-size: 42px; 
			font-weight: bold; 
			margin: 5px;
		}
        .footer{
            /* border-top: 1px solid #D0D0D0; */
            font-size: 18px !important;
        }
        .l-text{
            /* margin-left: 10px; */
            margin: 5px;

        }
        .order-text{
            /* margin: 0px 20px !important; */
            margin: 5px;
            font-family: Consolas, Monaco, Courier New, Courier, monospace !important;
            font-size: 16px;
        }
		</style>
	</head>
	<body>
		<div id="container">
			<div class="logo">
                <span style="color:#174cb4;">WEBFLOW</span>
                <span style="color:#000;">SYSTEM</span>
            </div>
            <hr>
			<div>
				<?php
                    if(isset($BODY)){
                        foreach($BODY as $data){
                            echo '<div class="order-text">';
                            echo $data;
                            echo '</div>';
                        }
                    } 
                ?>
			</div>
            <div class="footer">
                <hr>
                <div class="l-text">
                    <a href="#"><?php echo base_url(); ?></a>
                </div> 
                <div class="l-text">
                    <?php echo 'Date:'.date("Y-m-d H:i:s").' Server:'.gethostname().' Path:'.strtolower($this->uri->uri_string()); ?>
                </div>
            </div>
		</div>
	</body>
</html>
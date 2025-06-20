<?php
use GuzzleHttp\Client;
require_once APPPATH.'controllers/_file.php';
require_once APPPATH.'controllers/_form.php';
class Authen extends MY_Controller {
    use _File, _Form;

    protected $client;
    public function __construct(){
        parent::__construct();
        $this->client = new Client(['verify' => false]);
    }

    public function index($id = 1){
        if(!isset($_SESSION['user'])) {
            $data =  array('pageid' => 'login', 'id' => $id);
            $this->views('auth/login', $data);
            die();
        }

        // Already logged in
        if(isset($_SESSION['user']) && $id != 1){
            /*$app = $this->application($id);
            if($app['status']){
                $data = $app['message'][0];
                $val = array(
                    'id' => $data['APP_ID'],
                    'auth' => $data['APP_LOGIN']
                );
                $this->views('auth/move', $val);
            }else{
                unset($_SESSION['user']);
                unset($_SESSION['profile-img']);
                redirect('/');
                die();
            }*/
            redirect('/authen/movepage/' . $id);
            die();
        }

        // Logging to web flow
        if(isset($_SESSION['user'])){
            redirect('home');
        }
    }

    public function movepage($id){
        $this->views('auth/move', array('id' => $id));
    }
    public function accessdinied(){
        $this->views('auth/notPermission');
    }

    public function setSession(){
        $url = "http://webflow/images/emp/{$_POST['info']['SEMPNO']}.jpg";
        $headers = get_headers($url);
        $chk = substr($headers[0], 9, 3);
        if($chk != "200"){
            if(substr($_SESSION['user']->SEMPPRE , 0,2) =='MR'){
                $url = "http://webflow/images/emp/no-img-male.jpg";
            }else{
                $url = "http://webflow/images/emp/no-img-female.jpg";
            }
        }
        $data = 'data:image/jpg;base64,' . base64_encode(file_get_contents($url));
        $_SESSION['profile-img'] = $data;
        $_SESSION['user'] = (object)$_POST['info'];
        echo json_encode(array('status' => true));
    }

    public function logout(){
        unset($_SESSION['user']);
		unset($_SESSION['profile-img']);
		redirect('/');
    }

	public function pass_logout($id){
		// unset($_SESSION['user']);
		// unset($_SESSION['profile-img']);
		// redirect("/authen/index/{$id}");
        redirect('/home');
	}

    public function test(){
        $app = $this->application(12);
        if($app['status']){
            $data = $app['message'][0];
            $logged = $this->directLogon($data['APP_ID'], $data['APP_LOGIN']);
            $url = $_ENV['APP_HOST'] . "/{$data['APP_LOCATION']}/authen/directlogin/";
            $this->sendSession($logged['message'], $url);
            redirect($_ENV['APP_HOST'] . "/{$data['APP_LOCATION']}");
        }else{
            echo json_encode($app['message']);
        }
    }

    private function application($id){
        try{
            $response = $this->client->post("{$_ENV['APP_API']}/docinv/amecweb/application/", [
                'json' => ["id" => $id]
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(Exception $e){
            return array('status' => false, 'message' => 'Application not found');
        }
    }

    private function directLogon($program, $auth){
        try{
            $response = $this->client->post("{$_ENV['APP_API']}/api/authentication/directlogin/", [
                'json' => [
                    'username' => md5($_SESSION['user']->SEMPNO),
                    'program'  => $program,
                    'auth'     => $auth,
                    'client'   => $_SERVER['REMOTE_ADDR']
                ]
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(Exception $e){
            return array('status' => false, 'message' => $e->getMessage());
        }
    }

    private function sendSession($data, $url){
        $response = $this->client->post($url, [
            'json' => $data
        ]);
        return json_decode($response->getBody(), true);
    }

    public function test2(){
        $this->views('auth/test');
    }

    public function setMD5() {
        echo json_encode(md5(substr('00000'.(($_POST['id']/4)-92), -5)));
    }
}
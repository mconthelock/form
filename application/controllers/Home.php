<?php
class Home extends MY_Controller {
    public function __construct(){
        parent::__construct();
        //if(!isset($_SESSION['user'])) redirect('/');
    }

    public function index(){
        $data['links'] = $this->setLinks();
        $this->views('home/index', $data);
    }

    private function setLinks(){
        return array(
            'electronic' => array(
                'id' => 'amecweb_system',
                'text' => 'Electronic Work Flow',
                'img'  => '3.jpg',
            ),
            'design' => array(
                'id' => 'design_system',
                'text' => 'Design System',
                'img'  => '1.jpg',
            ),
            'utility' => array(
                'id' => 'utility_system',
                'text' => 'Utilities System',
                'img'  => '4.jpg',
            ),
            'other' => array(
                'id' => 'other_system',
                'text' => 'Other System',
                'img'  => '14.jpg',
            )
        );
    }
}
<?php
class Notification extends MY_Controller {
    public function __construct(){
        parent::__construct();
        $this->load->library('Notify');
        $this->load->model('Notification_model', 'noti');
    }

    function subscribe(){
        $data = json_decode(file_get_contents('php://input'), true);
        $val = array(
            'ENDPOINT'  => $data['endpoint'],
            'PUBLIC_KEY' => $data['keys']['p256dh'],
            'AUTH_TOKEN' => $data['keys']['auth']
        );
        $this->noti->saveSubscription($val);
    }

    function test(){
        $subscription = $this->noti->getSubscription();
        $payload = json_encode([
            'title' => 'New Notification',
            'body' => 'You have a new message!',
        ]);
        $this->notify->send($subscription, $payload);
    }
}
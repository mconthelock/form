<?php
class Notification_model extends CI_Model {
    public function __construct() {
        parent::__construct();
        $this->db = $this->load->database('default',true);
    }

    // function saveSubscription($data) {
    //     return $this->db->insert('SUBSCRIPTIONS', $data);
    // }

    // function getSubscription() {
    //     $query = $this->db->get('SUBSCRIPTIONS');
    //     return $query->result();
    // }
}
<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Psid_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        // Implement your data retrieval logic here
        // For example:
        $this->db->select('*')
            ->from('PSID_FORM pf')
            ->join('PSID_DETAIL pd', 'pf.CYEAR2 = pd.CYEAR2 AND pf.NRUNNO = pd.NRUNNO')
            ->join('AMECUSERALL a', 'a.SEMPNO = pf.EMP_CHECK', 'left')
            ->where('pf.NFRMNO', $nfrmno)
            ->where('pf.VORGNO', $vorgno)
            ->where('pf.CYEAR', $cyear)
            ->where('pf.CYEAR2', $cyear2)
            ->where('pf.NRUNNO', $nrunno);
        $query = $this->db->get();
        return $query->result();
    }

    // Add your model methods here
}
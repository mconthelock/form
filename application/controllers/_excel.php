<?php
/**
 * Form management.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-08-07
 * @note   PHP Version 7.1.30
 * @note   Apache, Set run by user iswin
 */
defined('BASEPATH') or exit('No direct script access allowed');
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\{Border, Fill, Alignment};
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
trait _excel{
    // บันทึกเป็นไฟล์ Excel
    private function downLoadExcel($spreadsheet, $fileName){
        $fileName = $this->checkExtensionExcel($fileName);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="'.$fileName.'"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
    }

    // ไว้บันทึกลง Drive
    private function saveExcel($spreadsheet, $fileName, $path){
        $fileName = $this->checkExtensionExcel($fileName);
        $writer = new Xlsx($spreadsheet);
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }
        $writer->save($path.'/'.$fileName);
    }

    // ไว้ใช้ส่งเมล
    private function sendExcel($spreadsheet, $fileName){
        $fileName = $this->checkExtensionExcel($fileName);
        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $excelContent = ob_get_contents(); // ได้ binary data
        ob_end_clean();

        $dFile = array(
            'content'  => $excelContent,
            'filename' => $fileName, 
        );
        return $dFile;
    }

       // ตรวจสอบนามสกุลไฟล์ ถ้าไม่มี .xlsx ให้เติม
    private function checkExtensionExcel($fileName){
        if (pathinfo($fileName, PATHINFO_EXTENSION) !== 'xlsx') {
            $fileName .= '.xlsx';
        }
        return $fileName;
    }

     private $styleHeader = [
        'font' => [
            'bold' => true
        ],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => [
                'rgb' => 'bfbdbd' 
            ]
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => '000000']
            ]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER,
        ]
    ];
    
    private $stylebody = [
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => '000000']
            ]
        ],
    ];
}

?>
DPM Versi 7 NODEJS

Daftar level pada aplikasi dpmOnline
    - staff
    - site logistic
    - site engineer
    - site hse
    - site manager
    - project manager
    - cost controll
    - hse officer
    - purchasing
    - director
    - po
    - finance
    - payment
    - logistic
    - admin

Dalam JSON berbentuk seperti ini
    const arrayLevel = ['staff','site logistic','site engineer','site hse','site manager','project manager','cost controll','hse officer','purchasing','director','po','finance','payment','logistic','admin']

Kondisional data ADMIN/USER aplikasi
    Kolom admin_status
        0 = inactive
        1 = active
        2 = banned

Kondisional data DPM
    control bernilai 0, 1, 2, 3, 4
        0 = Pengajuan
        1 = REJECT by SM
        2 = APPROVE by SM
        3 = REJECT by PM
        4 = APPROVE by PM
    ho bernilai 0, 1, 2, 3, 4, 5, 6, 7
        0 = Pending
        1 = REJECT by CC
        2 = APPROVE by CC
        3 = Process Apple
            Check Kondisional data apple
        4 = APPROVE by director
        5 = PO terbit
            Check Kondisional data po_detail
        6 = Item sedang dalam pengiriman
        7 = Item sudah sampai

Kondisional data APPLE
    status bernilai 0, 1, 3, 4
    dir_acc bernilai null atau integer
    - Jika dir_acc bernilai null Check Status bernilai :
        10 = Menunggu approval CC
        1 = Menunggu approval CC
        0 = Revisi
        else maka check error pada alur akibat perubahan update terdahulu
    - Jika dir_acc bernilai int (bernilai id dari ID supplier terpilih) dan status bernilai :
        1 = Menunggu approval BOD
        2 = error (akibat update terdahulu)
        3 = Item tersedia untuk dasar pembuatan PO //Jika dihapus check status dalam PO, jika bisa dihapus sekalian hapus data dalam DPM
        4 = Item sudah dibuat PO (hilang dr dasar pembuatan PO)
    - Else = error

Kondisional data PO_DETAIL
    Kolom bod_approve bernilai int
        0 = error
        1 = PO dalam pengajuan
        2 = PO dalam revisi
        3 = PO Approve
    Jika po_status
        0 = item berada dalam daftar PO
        1 = item dikeluarkan dari daftar PO //Lebih baik hapus item dari PO dan kembalikan ke apple2apple approve

Daftar verivication pada aplikasi dpmOnline
    - 0 (pengajuan)
    - 1 (reject)
    - 2 (approve)

Dalam JSON berbentuk seperti ini
    const arrayStatusVerification = ['pengajuan','reject','approve']

Data Mandor merujuk ke mandor_hp, jika mandor_hp sudah terdaftar maka tidak dapat digunakan lagi.
Fungsi untuk mencegah duplikasi nama mandor.

//Database baru
Database chatting
    CREATE TABLE chat (
        chat_id int(11) AUTO_INCREMENT PRIMARY KEY,
        chat_sender text NOT NULL,
        chat_sender_id int(11) NOT NULL,
        chat_room text NOT NULL,
        chat_message text NOT NULL,
        chat_time text NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=UTF8 AUTO_INCREMENT=1

//Migrasi Database
SET collation_connection = 'utf8_general_ci';
ALTER DATABASE dpm CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE absensi CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `admin` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE apple CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE assets CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE chat CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE developer CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE dpm CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE gallery CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE item CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE logistic CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE mandor CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE opname CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE po_detail CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE po_pembayaran CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE project CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE spk CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE spk_data CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE spk_transaksi CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE supplier CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE template CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE test_upload CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE unit CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE user_project CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE verification CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;

/**********************************************************************************
*********************************** PENTING ***************************************
**********************************************************************************/

1. Buat Status Debug untuk aplikasi
2. Migrasi gagal, drop column yang tidak terpakai
3. Check value of Date tiap row
4. Buat status project (active/inactive)
5. Penambahan fitur pada halaman dpm per number & id untuk level logistic mengubah status item sedang dalam pengiriman
6. Penambahan fitur pada halaman dpm per number & id untuk level site logistic mengubah status item sudah terkirim atau belum# dpm_rgs

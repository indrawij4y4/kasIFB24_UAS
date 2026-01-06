<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            ['nim' => '240602028', 'nama' => 'ADITIA FIRMANSYAH', 'role' => 'user'],
            ['nim' => '240602029', 'nama' => 'AHMAD SHAOQI RABBANY', 'role' => 'user'],
            ['nim' => '240602030', 'nama' => 'AISYA RAHMANI', 'role' => 'user'],
            ['nim' => '240602031', 'nama' => 'ARMAN MAULANA', 'role' => 'user'],
            ['nim' => '240602032', 'nama' => 'BAIQ SAPRIANA', 'role' => 'user'],
            ['nim' => '240602033', 'nama' => 'DEVI ANTIKA', 'role' => 'user'],
            ['nim' => '240602034', 'nama' => 'FIDYANUL KHOLIS', 'role' => 'user'],
            ['nim' => '240602035', 'nama' => 'HANNIATI DWI LESTARI', 'role' => 'admin'], // Admin (Bendahara)
            ['nim' => '240602036', 'nama' => 'INDRA WIJAYA', 'role' => 'admin'], // Admin (Bendahara)
            ['nim' => '240602037', 'nama' => 'KHAERUL HAFIZIN', 'role' => 'user'],
            ['nim' => '240602038', 'nama' => 'KHAERUL UMMAH', 'role' => 'user'],
            ['nim' => '240602039', 'nama' => 'LALU MUHAMMAD IRSYAD ZAKI', 'role' => 'user'],
            ['nim' => '240602040', 'nama' => 'M MAJID SAID AL-WATHANI', 'role' => 'user'],
            ['nim' => '240602041', 'nama' => 'M. RAMADHANI ILAHI', 'role' => 'user'],
            ['nim' => '240602042', 'nama' => 'MASYANI SHOLIHATUN', 'role' => 'user'],
            ['nim' => '240602043', 'nama' => 'MOH. DIMAS ZUHRIANATA', 'role' => 'user'],
            ['nim' => '240602044', 'nama' => 'MUHAMMAD ALI SHOBRI', 'role' => 'user'],
            ['nim' => '240602045', 'nama' => 'MUHAMMAD LINO BINTANG', 'role' => 'user'],
            ['nim' => '240602046', 'nama' => 'MUHAMMAD SUHERMAN', 'role' => 'user'],
            ['nim' => '240602047', 'nama' => 'NAELY KHAIRO', 'role' => 'user'],
            ['nim' => '240602048', 'nama' => 'NUR FITRIA AKBAR', 'role' => 'user'],
            ['nim' => '240602049', 'nama' => 'RAHMAT HIDAYAT', 'role' => 'user'],
            ['nim' => '240602050', 'nama' => 'ROVIZA\'UL HAWARI AMRI', 'role' => 'user'],
            ['nim' => '240602051', 'nama' => 'RU\'YATUL HIDAYATI', 'role' => 'user'],
            ['nim' => '240602052', 'nama' => 'SITI FATIMAH', 'role' => 'user'],
            ['nim' => '240602053', 'nama' => 'SULISTIAWATI', 'role' => 'user'],
            ['nim' => '240602054', 'nama' => 'ZAINUL MUTTAKIM', 'role' => 'user'],
        ];

        foreach ($users as $userData) {
            User::create([
                'nim' => $userData['nim'],
                'nama' => $userData['nama'],
                'password' => Hash::make($userData['nim']), // Default password = NIM
                'status_password' => false, // Belum ganti password
                'role' => $userData['role'],
            ]);
        }
    }
}

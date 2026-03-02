# **LEMBAR KERJA PESERTA DIDIK (LKPD)**

# **STS Praktik – Membangun Aplikasi Al-Qur’an Mobile**

Mata Pelajaran: Pemrograman Perangkat Lunak  
Kelas: XI RPL  
Durasi: 2 x 8 Jam Pembelajaran

## **A. Tujuan Pembelajaran**

Peserta didik mampu mengembangkan aplikasi Al-Qur’an berbasis React Native menggunakan Expo Router dan TypeScript dengan menampilkan navigasi multi-halaman, daftar surah dari API, detail surah, serta daftar ayat yang berfungsi dengan baik tanpa error sesuai spesifikasi yang diberikan.

**B. Alat dan Bahan**

1. Laptop (Node.js & VS Code).  
2. Smartphone dengan aplikasi Expo Go.  
3. API Al-Qur’an yang telah ditentukan guru.

## **C. Instruksi Proyek: “Al-Qur’an Mobile App”**

Bangunlah aplikasi Al-Qur’an dengan struktur dan tampilan sesuai referensi desain yang telah diberikan guru. Semua asset logo dan lain lain dapat kalian lihat di C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel

1. **Splash Screen**  
   Ubah splash screen dengan gambar yang berbeda, di dalam contoh berikut ini adalah gambar yang dapat kalian gunakan.   
   C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\logo\logo.png
     
     
     
     
2. **Halaman Beranda**  

   C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\home-page.jpeg

- Menampilkan header dengan tanggal hijriyah, lokasi user dan icon notifikasi  
- Menampilkan 5 bottom navigasi ( beranda, al-quran, artikel, pengaturan dan AI )  
- Menampilkan 8 menu sesuai yang ada di contoh desain  
- Menampilkan card ramadan mubarak  
- Menampilkan section buat doa  
- Layout sesuai desain  
- Tidak ada error

3. **Halaman Al-Quran**  
   C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\alquran.jpeg

- Mengambil data surah dari API (tidak hardcode)  
- Menampilkan minimal:  
  - Nama surah  
  - Nomor surah  
  - Jumlah ayat  
- Menggunakan TypeScript untuk tipe data  
- Klik surah → masuk ke halaman detail

4. **Detail Surah**  
   C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\detail-surah.jpeg

- Menerima parameter dari halaman sebelumnya  
- Menampilkan informasi surah yang dipilih  
- Data sesuai surah yang diklik  
- Tidak menampilkan data statis
    
    
5. **Halaman Artikel**  
   C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\artikel.jpeg

- Layout sesuai desain  
- Navigasi berfungsi  
- Tidak error

6. **Halaman Pengaturan**  
   C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\pengaturan.jpeg

- Menampilkan menu pengaturan  
- Navigasi aktif  
- Tidak error

7. **Halaman AI**  

   C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\asisten-islami-ai.jpeg

- Layout sesuai desain  
- Navigasi berfungsi  
- Tidak error

8. **Halaman Menu di Beranda**  
   - Doa harian C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\doa-harian.jpeg
   - Dzikir C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\dzikir.jpeg
   - Hadist C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\hadist.jpeg
   - Arah Kiblat C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\arah-kiblat.jpeg
   - Dukung Developer C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\dukung-developer.jpeg
   - Asmaul Husna C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\asmaul-husna.jpeg
   - Lainnnya C:\Users\User\Documents\Sattr\Tarteel\assets\tarteel\Tampilan Aplikasi\lainnya.jpeg


 setiap halaman diatas ada menggunakan API public yang dapat kalian lihat listnya sebagai berikut : 

- [https://quran-api.santrikoding.com/api/surah](https://quran-api.santrikoding.com/api/surah) ( Daftar surat Al-Quran )  
- [https://quran-api.santrikoding.com/api/surah/{nomor](https://quran-api.santrikoding.com/api/surah/{nomor)} ( Detail Surat )  
- [https://open-api.my.id/api/doa](https://open-api.my.id/api/doa) ( Daftar doa )  
- [https://open-api.my.id/api/doa/{id](https://open-api.my.id/api/doa/{id)} ( Detail doa )  
- [https://muslim-api-three.vercel.app/v1/hadits](https://muslim-api-three.vercel.app/v1/hadits) ( Daftar hadist )  
- [https://muslim-api-three.vercel.app/v1/dzikir](https://muslim-api-three.vercel.app/v1/dzikir) ( Daftar dzikir )  
- [https://asmaul-husna-api.vercel.app/api/all](https://asmaul-husna-api.vercel.app/api/all) ( Daftar asmaul husna )  
- [https://api.rss2json.com/v1/api.json?rss\_url=https://republika.co.id/rss/khazanah](https://api.rss2json.com/v1/api.json?rss_url=https://republika.co.id/rss/khazanah) ( API Artikel )  
- [https://qiblafinder.withgoogle.com/](https://qiblafinder.withgoogle.com/) ( Penentuan qiblat dengan kamera menggunakan webview )  
- API untuk chat dengan AI \*tidak wajib jika ingin digunakan pakai saja ini   
  - NEXT\_PUBLIC\_HF\_TOKEN=hf\_gjgSpnTztEmDSigBaBcXsFYXOuMsJZbBRu  
  - EXPO\_PUBLIC\_ISLAMIC\_AI\_PROVIDER=together  
  - EXPO\_PUBLIC\_TOGETHER\_API\_KEY=tgp\_v1\_vDjlv1dhu0ls34rsWmxNOGm36\_eMCmdEWc723uYn9RU  
  - EXPO\_PUBLIC\_TOGETHER\_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo

9. **Rubrik Penilaian**

| No | Aspek Penilaian | Bobot | Skor | Kriteria | Penjelasan |
| :---: | ----- | :---: | ----- | ----- | ----- |
| 1 | Navigasi Multi Halaman | 20% | 1 | Navigasi tidak berfungsi | Beberapa halaman tidak dapat diakses atau terjadi error saat berpindah halaman |
|  |  |  | 3 | Navigasi cukup berfungsi | Semua halaman ada namun terdapat 1 halaman error atau tidak stabil |
|  |  |  | 5 | Navigasi lengkap dan stabil | Semua halaman dapat diakses dan tidak error |
| 2 | List Surah dari API | 30% | 1 | Data tidak sesuai | Data tidak berasal dari API atau sebagian besar hardcode |
|  |  |  | 3 | Data sebagian sesuai | Data dari API tetapi ada field yang tidak tampil atau tidak konsisten |
|  |  |  | 5 | Data sesuai API | Data 100% berasal dari API dan sesuai dengan struktur yang ditentukan |
| 3 | Halaman Detail & Parameter | 20% | 1 | Detail tidak sesuai | Parameter tidak dikirim atau detail menampilkan data statis |
|  |  |  | 3 | Detail cukup sesuai | Parameter terkirim namun data tidak selalu sesuai item yang dipilih |
|  |  |  | 5 | Detail sesuai item | Parameter terkirim dan detail sesuai surah yang dipilih |
| 4 | Struktur & TypeScript | 5% | 1 | Tidak sesuai | Tidak menggunakan TypeScript dengan benar atau banyak error |
|  |  |  | 3 | Cukup sesuai | Menggunakan TypeScript namun masih ada penggunaan any atau warning |
|  |  |  | 5 | Sesuai dan konsisten | Menggunakan TypeScript dengan benar tanpa error |
| 5 | List Dzikir/Doa/Asmaul Husna dari API | 20% | 1 | Data tidak sesuai | Data tidak berasal dari API atau sebagian besar hardcode |
|  |  |  | 3 | Data sebagian sesuai | Data dari API tetapi ada field yang tidak tampil atau tidak lengkap |
|  |  |  | 5 | Data sesuai API | Data 100% dari API dan sesuai dengan struktur yang ditentukan |
| 6 | Pengumpulan | 5% | 1 | Tidak sesuai ketentuan | Tidak mengumpulkan di GCR atau Drive Sekolah Pesat |
|  |  |  | 3 | Pengumpulan sebagian | Mengumpulkan di salah satu platform saja |
|  |  |  | 5 | Pengumpulan lengkap | Pengumpulan di GCR dan Drive Sekolah Pesat sesuai instruksi |

10. ###  **Petunjuk Pengumpulan**

- Kumpulkan di google classroom screenshot aplikasi (4 layar) pengumpulan dengan word/pdf sertakan link github  
- Sebutkan nama dan kelas pada file pengiriman.


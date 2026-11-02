# ARGENT — Silver Atelier

Gümüş takı markası için hazırlanan, HTML/CSS/JavaScript ile çalışan premium vitrin ve katalog demosu.

## Çalıştırma

`index.html` dosyasını tarayıcıda açın. Yerel sunucu kullanmak için proje klasöründe:

```sh
python3 -m http.server 8000
```

Ardından `http://localhost:8000` adresine gidin. Derleme veya bağımlılık kurulumu gerekmez.

## İnteraktif giriş

İlk ziyarette tam ekran bir giriş açılır. Metalik ARGENT yazısı ve arka plandaki ışık, fare hareketine tepki verir. `Keşfe başla` dairesinin üzerinde 1,2 saniye kalınca ilerleme halkası tamamlanır ve perde animasyonuyla ana site açılır. İmleci uzaklaştırmak beklemeyi iptal eder.

Düğmeye tıklayarak, dokunarak veya klavyede Enter/Space ile de giriş yapılabilir. `Girişi geç` düğmesi ve Escape tuşu aynı geçişi başlatır. Azaltılmış hareket tercihinde fareyle otomatik giriş ve animasyon kapatılır; tıklama ile anında geçilir.

Giriş aynı sekmede bir kez gösterilir. Ürün ve bölüm bağlantıları doğrudan açılır. Alt menüdeki `Girişi yeniden deneyimle` düğmesi giriş ekranını tekrar açar. JavaScript veya native dialog desteği yoksa normal site erişilebilir kalır.

## Tasarım ve işlevler

- Kırık beyaz, koyu yeşil ve gümüş tonları; yerel Cormorant Garamond ve Manrope fontları.
- Büyük tipografili açılış, asimetrik kategori vitrini, ürün kataloğu, marka hikâyesi ve iletişim bölümü.
- Mobil, tablet ve masaüstü düzenleri; sabit üst menü ve mobil navigasyon.
- Türkçe arama, birlikte çalışan kategori ve taş filtreleri, sıralama ve filtre sıfırlama.
- Tarayıcıda saklanan favoriler ve favorilere özel katalog görünümü. Depolama kapalıysa favoriler oturum boyunca çalışır.
- Ürün detay penceresi, kopyalanabilir doğrudan ürün bağlantıları (`#urun-gms-1001`) ve ürün bilgilerini içeren iletişim bağlantısı.
- Klavye ile kullanım, odak göstergeleri, erişilebilir kontrol etiketleri, boş sonuç durumları ve azaltılmış hareket tercihi desteği.
- Fontlar ve görseller proje içinde tutulur; temel görünüm için harici servis bağlantısı gerekmez.

## Gerçek içerikle yapılandırma

`assets/js/main.js` içindeki `products` dizisi örnektir; gerçek katalogla veya API verisiyle değiştirilebilir. Ürün isimleri, görselleri, ayar bilgileri ve gramajlar temsilidir.

Aynı dosyada `WHATSAPP_NUMBER` değişkenini ülke koduyla, `+` veya boşluk olmadan doldurun (`905XXXXXXXXX`). Dolu olduğunda ürün iletişim düğmesi WhatsApp açar. Boş olduğunda `CONTACT_EMAIL` kullanılır.

Varsayılan `info@example.com` örnek adrestir. Gerçek e-postayı hem JavaScript'te hem `index.html` iletişim bölümünde güncelleyin. Marka adı da örnektir.

Backend, ödeme, sepet, hesap ve yönetim paneli bu frontend kapsamına dahil değildir.

## Dosyalar

- `index.html`: sayfa içeriği, navigasyon, katalog ve ürün penceresi.
- `assets/css/style.css`: tasarım, animasyonlar ve ekran boyutlarına göre düzenler.
- `assets/css/entry.css`: tam ekran giriş, ışık etkileri ve perde animasyonu.
- `assets/js/entry.js`: mouse-over ilerlemesi, mobil/klavye girişi ve oturum davranışı.
- `assets/js/main.js`: katalog verileri, filtreler, arama, favoriler ve ürün etkileşimleri.
- `assets/images/`: yerel Unsplash örnek fotoğrafları ve SVG favicon.
- `assets/fonts/`: font dosyaları ve SIL Open Font lisansları.

## Doğrulama

JavaScript sözdizimi, CSS ayrıştırması, yerel varlıklar ve sayfa bağlantıları kontrol edildi. Geçici bir DOM ortamında arama, filtreler, sıralama, favoriler, depolama hataları, mobil menü, ürün detayları ve paylaşım dahil 29 kontrol geçti. Giriş ekranında hover süresi ve iptali, tıklama/dokunma, Escape, oturum kaydı, yeniden oynatma, doğrudan bağlantılar ve azaltılmış hareket dahil 21 ek kontrol geçti. Gerçek tarayıcıda görsel ve responsive doğrulama, bu oturumda tarayıcı bulunmadığı için yapılamadı.

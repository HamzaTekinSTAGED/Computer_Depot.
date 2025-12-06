# Computer Depot

Computer Depot, ikinci el teknoloji ekipmanları için geliştirilmiş modern bir e-ticaret platformudur. Kullanıcılar ürün satabilir, satın alabilir, yorum yapabilir ve favori ürünlerini kaydedebilir.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: Email/şifre ve Google OAuth ile giriş
- **Ürün Yönetimi**: Ürün ekleme, düzenleme, silme ve listeleme
- **Kategori Sistemi**: Ürünleri kategorilere göre organize etme
- **Alışveriş Sepeti**: Ürünleri sepete ekleme ve satın alma
- **Favoriler**: Beğenilen ürünleri kaydetme
- **Yorum Sistemi**: Ürünlere yorum yapma, yanıt verme ve beğenme
- **Filtreleme ve Arama**: Kategori, fiyat, tarih ve metin bazlı arama
- **Satış Geçmişi**: Alış ve satış işlemlerini takip etme
- **Admin Paneli**: Kullanıcı, ürün ve kategori yönetimi
- **Profil Yönetimi**: Kullanıcı profil bilgilerini düzenleme

## 🛠️ Teknoloji Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (Pages Router)
- **Dil**: TypeScript
- **Veritabanı**: MySQL (Prisma ORM)
- **Kimlik Doğrulama**: NextAuth.js
- **Stil**: Tailwind CSS
- **Görsel Yükleme**: Cloudinary
- **UI Kütüphaneleri**: 
  - Headless UI
  - Heroicons
  - Framer Motion
  - Lucide React

## 📋 Gereksinimler

- Node.js 18+ 
- MySQL 8.0+
- npm, yarn, pnpm veya bun

## 🔧 Kurulum

1. **Projeyi klonlayın**
   ```bash
   git clone https://github.com/yourusername/computer-depot.git
   cd computer-depot
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   # veya
   yarn install
   # veya
   pnpm install
   ```

3. **Ortam değişkenlerini ayarlayın**
   
   `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değerleri doldurun:
   ```bash
   cp .env.example .env
   ```

   `.env` dosyasında şu değişkenleri ayarlayın:
   - `DATABASE_URL`: MySQL veritabanı bağlantı string'i
   - `NEXTAUTH_SECRET`: NextAuth için gizli anahtar (oluşturmak için: `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: Uygulamanın URL'i (geliştirme için: `http://localhost:3000`)
   - `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET`: Google OAuth için (opsiyonel)
   - Cloudinary bilgileri: Görsel yükleme için

4. **Veritabanını hazırlayın**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   # veya
   yarn dev
   # veya
   pnpm dev
   ```

6. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## 📁 Proje Yapısı

```
myapp/
├── prisma/              # Prisma şema ve migration dosyaları
├── public/              # Statik dosyalar (görseller, ikonlar)
├── src/
│   ├── components/      # React bileşenleri
│   ├── functions/       # Yardımcı fonksiyonlar
│   ├── lib/            # Kütüphane konfigürasyonları (auth, db, cloudinary)
│   ├── pages/          # Next.js sayfaları ve API route'ları
│   │   ├── api/        # API endpoint'leri
│   │   ├── admin/      # Admin panel sayfaları
│   │   ├── Authentication/ # Giriş/kayıt sayfaları
│   │   ├── buying/     # Alışveriş sayfaları
│   │   └── selling/    # Satış sayfaları
│   ├── styles/         # Global CSS dosyaları
│   ├── types/          # TypeScript tip tanımlamaları
│   └── utils/          # Yardımcı fonksiyonlar
├── .env.example        # Ortam değişkenleri şablonu
└── package.json        # Proje bağımlılıkları
```

## 🔐 Ortam Değişkenleri

Gerekli ortam değişkenleri için `.env.example` dosyasına bakın. Aşağıdaki değişkenler zorunludur:

- `DATABASE_URL`: MySQL veritabanı bağlantı string'i
- `NEXTAUTH_SECRET`: NextAuth için gizli anahtar
- `NEXTAUTH_URL`: Uygulama URL'i

Opsiyonel değişkenler:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth için
- Cloudinary değişkenleri: Görsel yükleme için

## 📝 Veritabanı Şeması

Proje aşağıdaki ana modelleri içerir:
- **User**: Kullanıcı bilgileri ve rolleri
- **Product**: Ürün bilgileri
- **Category**: Ürün kategorileri
- **Cart**: Alışveriş sepeti
- **TradeHistory**: Satış geçmişi
- **Comment**: Ürün yorumları
- **Reply**: Yorum yanıtları
- **Like**: Yorum beğenileri
- **Favorite**: Favori ürünler

Detaylı şema için `prisma/schema.prisma` dosyasına bakın.

## 🚀 Production Build

Production için build almak:

```bash
npm run build
npm start
```

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## 👥 Yazar

- **HamzaTekinSTAGED** - [GitHub](https://github.com/HamzaTekinSTAGED)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) ekibine
- [Prisma](https://www.prisma.io/) ekibine
- [NextAuth.js](https://next-auth.js.org/) ekibine
- Tüm açık kaynak topluluğuna

## 📞 İletişim

Sorularınız veya önerileriniz için issue açabilirsiniz.

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

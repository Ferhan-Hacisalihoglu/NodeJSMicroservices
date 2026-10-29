# Node.js Microservices

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-4.3.1-231F20?logo=apachekafka&logoColor=white)
![MinIO](https://img.shields.io/badge/MinIO-S3%20Compatible-C72E49?logo=minio&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1?logo=zod&logoColor=white)


Görev yönetimi, kimlik doğrulama, dosya ekleri ve görev iş akışlarını ayrı servisler
olarak sunan TypeScript tabanlı bir mikroservis projesidir. İstemciler servislerle
doğrudan değil, API Gateway üzerinden iletişim kurar.

## Mimari

```text
İstemci
   |
   v
API Gateway (:3000)
   |-- Auth Service     (:3001)
   |-- Task Service     (:3002)
   |-- Media Service    (:3003)
   `-- Workflow Service (:3004)

Altyapı:
  PostgreSQL   : veritabanı
  MinIO       : görev görselleri için S3 uyumlu nesne depolama
  Apache Kafka : servisler arası olay iletişimi
```

### Servisler

| Servis | Sorumluluk |
| --- | --- |
| `api-gateway` | Tek giriş noktası, yönlendirme, CORS, Helmet ve rate limit |
| `auth-service` | Kullanıcı kaydı, giriş ve JWT tabanlı kimlik doğrulama |
| `task-service` | Görev oluşturma, listeleme, detay görüntüleme ve silme |
| `media-service` | Görevlere görsel ekleme ve ekleri listeleme |
| `workflow-service` | Görev iş akışı olaylarını listeleme |
| `shared` | Ortak veritabanı havuzu, JWT, Kafka, logger, hata ve doğrulama yardımcıları |

## Gereksinimler

- Node.js 20 veya üzeri
- npm
- Docker Desktop ve Docker Compose

## Kurulum

```bash
npm install
```

Kök dizinde `.env` dosyası oluşturun. Depodaki `.env` dosyasını paylaşmayın ve
üretim ortamında örnek parolaları veya secret değerlerini kullanmayın.

Minimum olarak aşağıdaki değişkenler tanımlanmalıdır:

```dotenv
PORT=3000
AUTH_PORT=3001
TASK_PORT=3002
MEDIA_PORT=3003
WORKFLOW_PORT=3004

AUTH_SERVICE_URL=http://localhost:3001
TASK_SERVICE_URL=http://localhost:3002
MEDIA_SERVICE_URL=http://localhost:3003
WORKFLOW_SERVICE_URL=http://localhost:3004

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=microservices
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/microservices

JWT_SECRET=change-this-in-development
JWT_EXPIRES_IN=1d
GATEWAY_SECRET=change-this-in-development

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=change-this-in-development
S3_BUCKET=task-media
MINIO_HOST=localhost
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_URL=http://localhost:9000
MINIO_REGION=us-east-1

KAFKA_BROKER=localhost:9092
LOG_LEVEL=info
```

Cloudinary değişkenleri yalnızca Cloudinary kullanılarak yapılandırılmış bir
depolama stratejisi tercih edilirse gereklidir.

## Altyapıyı başlatma

PostgreSQL ve MinIO:

```bash
docker compose up -d
```

Kafka:

```bash
npm run kafka:up
npm run kafka:topics
```

Kafka loglarını izlemek ve Kafka'yı durdurmak için:

```bash
npm run kafka:logs
npm run kafka:down
```

PostgreSQL ve MinIO için durum kontrolü:

```bash
docker compose ps
```

MinIO API'si `http://localhost:9000`, yönetim arayüzü ise
`http://localhost:9001` adresindedir. Bucket, `minio-init` servisi tarafından
`.env` içindeki `S3_BUCKET` değeri kullanılarak oluşturulur.

## Veritabanı migration'ları

Migration dosyaları sırayla çalıştırılmalıdır:

```bash
npm run db:migrate -- sql/001-users.sql
npm run db:migrate -- sql/002-tasks.sql
npm run db:migrate -- sql/003-attachments.sql
npm run db:migrate -- sql/004-workflow.sql
npm run db:migrate -- sql/005-sample-data.sql
```

Son migration örnek kullanıcıları ve görevleri ekler:

| Rol | E-posta | Şifre |
| --- | --- | --- |
| Admin | `admin@example.com` | `password` |
| Kullanıcı | `user@example.com` | `password` |

Bu bilgiler yalnızca geliştirme/test içindir; üretim ortamında kullanılmamalıdır.

## Uygulamayı çalıştırma

Tüm servisleri, Kafka'yı ve Kafka topic'lerini başlatmak için:

```bash
npm run dev:all
```

Servisleri ayrı ayrı çalıştırmak için:

```bash
npm run dev:api-gateway
npm run dev:auth
npm run dev:task
npm run dev:media
npm run dev:workflow
```

Gateway varsayılan olarak `http://localhost:3000` adresinde çalışır. Geliştirme
modunda TypeScript dosyaları `tsx watch` ile izlenir.

## API

Tüm istemci istekleri için önerilen adres `http://localhost:3000`'dir.
Gateway, backend servislerine gerekli servis kimliği başlıklarını kendisi ekler.

### Kimlik doğrulama

| Method | Endpoint | Açıklama |
| --- | --- | --- |
| `POST` | `/auth/register` | Kullanıcı kaydı (`name`, `email`, `password`) |
| `POST` | `/auth/login` | Giriş yapar ve JWT döndürür (`email`, `password`) |
| `GET` | `/auth/me` | Oturum açmış kullanıcının bilgilerini döndürür |

Korumalı endpoint'lerde JWT şu başlıkla gönderilmelidir:

```http
Authorization: Bearer <token>
```

### Görevler

| Method | Endpoint | Açıklama |
| --- | --- | --- |
| `POST` | `/tasks` | Görev oluşturur (`title`, en az 5 karakter) |
| `GET` | `/tasks` | Kullanıcının görevlerini listeler |
| `GET` | `/tasks/:id` | Görev detayını döndürür |
| `DELETE` | `/tasks/:id` | Görevi siler |

Örnek görev oluşturma:

```bash
curl -X POST http://localhost:3000/tasks ^
  -H "Authorization: Bearer <token>" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Review authentication flow\"}"
```

### Medya ekleri

| Method | Endpoint | Açıklama |
| --- | --- | --- |
| `POST` | `/tasks/:taskId/attachments` | `image` alanında görsel yükler |
| `GET` | `/tasks/:taskId/attachments` | Göreve ait görselleri listeler |

Yüklenen dosya görsel türünde olmalı ve 5 MB'ı geçmemelidir.

### İş akışı

| Method | Endpoint | Açıklama |
| --- | --- | --- |
| `GET` | `http://localhost:3004/api/workflow/:taskId` | Workflow servisinden görevin iş akışı olaylarını listeler |

Gateway'deki workflow yönlendirmesi `/workflows` yolu üzerinden yapılandırılmıştır.
Gateway üzerinden kullanırken istek yolunun ilgili gateway kuralıyla eşleştiğini
doğrulayın; repository'deki Postman örnekleri `/tasks/:taskId/workflow` yolunu
referans olarak içerir.

### Sağlık kontrolleri

```text
GET /health
```

Gateway yanıtı `api-gateway`, servislerin doğrudan sağlık endpoint'leri ise ilgili
servis adını bildirir. Servislerin doğrudan endpoint'leri sırasıyla
`http://localhost:3001/health`, `:3002/health`, `:3003/health` ve `:3004/health`
adreslerindedir.

## Postman

Hazır istekler `postman/collections` altında bulunur:

- `authenctication`: kayıt, giriş ve mevcut kullanıcı istekleri
- `tasks`: görev, medya eki ve iş akışı istekleri

İstekleri Postman'e aktarın, önce kayıt/giriş isteğiyle token alın ve korumalı
isteklerde bu token'ı kullanın.

## Proje yapısı

```text
apps/
  api-gateway/
  auth-service/
  media-service/
  task-service/
  workflow-service/
packages/
  shared/
sql/
docker/
postman/
scripts/
```

## Geliştirme notları

- Backend servisleri yalnızca `x-gateway-secret` başlığı ile gelen gateway
  isteklerini kabul eder.
- Gateway'de 15 dakikalık pencerede istemci başına 100 istek rate limit'i vardır.
- Task ve media servisleri Kafka producer olarak, workflow servisi Kafka consumer
  olarak çalışır.
- `docker compose down -v` PostgreSQL ve MinIO volume'larını da siler; bu komut
  geliştirme verilerini kalıcı olarak kaldırır.

## Lisans

Bu proje için henüz bir lisans dosyası tanımlanmamıştır.

# SnapShare: Photo App Scaling

## 1. Assumptions

- SnapShare has 10 million registered users.
- 10% of registered users are active each day.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Each original photo is 2 MB.
- Each photo thumbnail is 50 KB.
- One day has 86,400 seconds.
- One year has 365 days.
- Peak feed traffic is 5 times the average traffic.
- All active users are assumed to upload one photo every day.
- These estimates exclude photo deletions, storage overhead, backups, and replicas.

### Daily active users

Daily active users = Registered users × Percentage active

= 10,000,000 × 10%

= **1,000,000 daily active users**

## 2. Traffic Estimates

### A. Photo uploads per second

There are 1,000,000 daily active users, and each uploads 1 photo per day.

Uploads per day = 1,000,000 × 1

= 1,000,000 uploads per day

Average uploads per second = Uploads per day ÷ Seconds per day

= 1,000,000 ÷ 86,400

= 11.57 uploads per second

Therefore, SnapShare must handle approximately **12 photo uploads per second on average**.

### B. Feed views per second

Each daily active user views 50 feed pages per day.

Feed views per day = 1,000,000 × 50

= 50,000,000 feed views per day

Average feed views per second = 50,000,000 ÷ 86,400

= 578.70 feed views per second

Therefore, SnapShare handles approximately **579 feed views per second on average**.

### C. Peak feed traffic

Peak traffic is assumed to be 5 times the average traffic.

Peak feed views per second = 578.70 × 5

= 2,893.5 feed views per second

Therefore, SnapShare should be designed to handle approximately **2,900 feed views per second during peak periods**.

## 3. Storage Estimates Per Year

### A. Original photo storage

SnapShare receives 1,000,000 photos per day. Each original photo is 2 MB.

Daily original photo storage = 1,000,000 × 2 MB

= 2,000,000 MB = 2 TB per day

Yearly original photo storage = 2 TB × 365 days

= **730 TB per year**

### B. Thumbnail storage

Each photo also has a thumbnail of 50 KB.

Daily thumbnail storage = 1,000,000 × 50 KB

= 50,000,000 KB = 50 GB per day

Yearly thumbnail storage = 50 GB × 365 days

= **18.25 TB per year**

### C. Total storage per year

Total yearly storage = Original photo storage + Thumbnail storage

= 730 TB + 18.25 TB

= **748.25 TB per year**

This estimate uses decimal storage units and excludes backups, replicas, storage overhead, and deleted photos. Actual storage needs may be higher.

## 4. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users view 50 feed pages per day but upload only 1 photo per day. That means the system handles about 50 feed views for every photo upload.

The design should therefore prioritize fast reads by using a CDN to deliver photos, a cache to reduce repeated database queries, and a database read replica to handle feed-reading requests. Uploads and thumbnail creation should also be scalable so they do not slow down users.

## 5. System Architecture Diagram

```text
                       USERS
                         |
                         v
                        CDN
                  (cached images)
                         |
                         v
                   LOAD BALANCER
                         |
                         v
                    APP SERVERS
                    /    |     \
                   /     |      \
                  v      v       v
               CACHE  PRIMARY   OBJECT STORAGE
                       DATABASE  (original photos
                          |       and thumbnails)
                          v             ^
                    READ REPLICA         |
                                        |
APP SERVERS --> QUEUE --> THUMBNAIL WORKER
                              |
                              v
                       OBJECT STORAGE
```

### What Each Component Does

1. **CDN (Content Delivery Network):** Delivers cached photos and thumbnails from locations closer to users, reducing loading time and server traffic.
2. **Load balancer:** Distributes incoming requests across app servers so that one server does not become overloaded.
3. **App servers:** Handle application logic, authenticate users, process requests, and coordinate database and storage operations.
4. **Cache:** Keeps frequently requested feed data in fast memory, reducing repeated database queries.
5. **Primary database:** Stores structured information such as user accounts, photo metadata, captions, and object storage keys.
6. **Database read replica:** Handles many feed-reading queries so the primary database can focus on writes.
7. **Object storage:** Stores the original photo files and thumbnails separately from the database.
8. **Queue:** Holds thumbnail-generation jobs so photo uploads do not need to wait for thumbnail processing to finish.
9. **Thumbnail worker:** Takes jobs from the queue, creates smaller versions of uploaded photos, and saves the thumbnails in object storage.

## 6. Step-by-Step Photo Upload Flow

1. **User selects a photo:** The user chooses a photo to upload in the SnapShare app.
2. **Request reaches the app:** The request passes through the load balancer to an available app server.
3. **User is verified:** The app server checks that the user is authenticated and allowed to upload.
4. **Photo is uploaded:** The app server provides a secure, temporary upload URL, allowing the user's device to upload the original photo directly to object storage.
5. **Metadata is saved:** The app server records the photo's information, such as its owner, caption, and storage key, in the primary database.
6. **Thumbnail job is queued:** The app server adds a thumbnail-generation job to the queue.
7. **Worker processes the job:** A thumbnail worker takes the job, reads the original photo from object storage, and creates a smaller thumbnail.
8. **Thumbnail is saved:** The worker stores the thumbnail in object storage and updates the photo metadata if necessary.
9. **Photo is displayed:** When someone views a feed, the app retrieves the required feed data, and the CDN delivers the photo or thumbnail.

Thumbnail generation happens in the background, so users do not have to wait for it before their original photo upload can finish.

## 7. Design Trade-Offs

### Trade-off 1: Object storage and CDN

**Advantage:** Object storage handles large photo files efficiently, while the CDN delivers frequently viewed images quickly and reduces load on the app servers.

**Disadvantage:** These services add cost and make the system more complex to configure and maintain.

### Trade-off 2: Asynchronous thumbnail generation

**Advantage:** Using a queue and background worker makes uploads faster because users do not wait for thumbnail creation.

**Disadvantage:** A thumbnail might not be ready immediately after upload, so the app must handle that delay.

### Trade-off 3: Database read replicas

**Advantage:** A read replica can handle many feed-reading queries and reduce the workload on the primary database.

**Disadvantage:** Changes may take time to appear on the replica, so users might briefly see stale information.

### Trade-off 4: Caching

**Advantage:** Caching frequently requested feed data improves response times and reduces database load.

**Disadvantage:** Cached data can become outdated, so the application needs a strategy for refreshing or invalidating it.
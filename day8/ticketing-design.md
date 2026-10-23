# TicketHub System Design

## 1. Requirements

TicketHub is a website where people can discover concerts and events, select seats, pay for tickets, and view their purchased tickets.

### Functional Requirements

1. Users can register, log in, and view their accounts.
2. Users can browse and search for events.
3. Users can view event details and seat availability.
4. Users can temporarily hold available seats while completing checkout.
5. Users can pay for tickets and receive order confirmation.
6. Users can view their purchased tickets and order history.
7. The system releases seats when temporary holds expire.
8. The system prevents two users from buying the same seat.

### Non-Functional Requirements

- **Speed:** Event pages should load within 2 seconds under normal conditions.
- **Correctness:** A seat must never be sold to two different users for the same event.
- **Fairness:** A virtual waiting room should manage high-demand sales fairly and communicate users' queue positions.
- **Availability:** The website should remain usable during traffic spikes.
- **Scalability:** The system should handle more users by adding application servers.
- **Security:** User information and payments must be protected using authentication, authorization, and HTTPS.
- **Reliability:** Confirmed orders must be saved safely, even if an application server fails.

## 2. Traffic and Capacity Estimates

TicketHub has 2 million registered users.

### Normal Traffic

- Daily visitors: 50,000.
- Pages viewed per visitor: 10.
- Tickets sold per day: 5,000.

Calculations:

- Daily page views = 50,000 × 10 = 500,000 page views.
- Average requests per second = 500,000 ÷ 86,400 = approximately 6 requests per second.
- Average ticket sales per second = 5,000 ÷ 86,400 = approximately 0.06 tickets per second.

For planning, assume normal peak traffic is ten times the daily average, or about 60 requests per second.

### Popular Concert Sale

- People trying to buy tickets: 200,000.
- Available seats: 20,000.
- Sale period: 10 minutes, or 600 seconds.

Calculations:

- Average buying attempts per second = 200,000 ÷ 600 = approximately 333 attempts per second.
- Demand per seat = 200,000 ÷ 20,000 = 10 people per seat.

Assume each buyer generates five requests during browsing and checkout.

- Estimated sale traffic = 333 × 5 = approximately 1,667 requests per second.

This is a planning estimate. Actual traffic may arrive in sudden bursts.

### Comparison

| Measure | Normal Traffic | Popular Sale |
|---|---|---|
| Visitors or buyers | 50,000 per day | 200,000 in 10 minutes |
| Page views | 500,000 per day | Depends on browsing behaviour |
| Estimated requests per second | 6 average | 1,667 average under our assumption |
| Ticket demand | 5,000 tickets per day | 20,000 seats available |
| Main risk | Normal website load | Overload and double-booking |

The estimated popular-sale request rate is about 278 times the normal daily average. TicketHub must use caching, a waiting room, load balancing, and controlled access to checkout to handle this traffic safely.


## 3. API Design

TicketHub uses an HTTPS API that sends and receives JSON data.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/events` | Browse and search events. |
| GET | `/api/events/{eventId}` | View details of a specific event. |
| GET | `/api/events/{eventId}/seats` | View seats and their availability. |
| POST | `/api/events/{eventId}/holds` | Temporarily hold available seats. |
| DELETE | `/api/holds/{holdId}` | Release a seat hold. |
| POST | `/api/orders` | Create an order for held seats. |
| POST | `/api/orders/{orderId}/payment` | Start payment through a payment provider. |
| GET | `/api/orders/{orderId}` | View order status and details. |
| GET | `/api/me/tickets` | View the logged-in user's tickets. |

### Important API Rules

- Browsing events and viewing seats should be available to visitors, while holding seats, paying, and viewing personal tickets require authentication.
- A successful seat hold returns a hold ID and an expiry time, such as five minutes from creation.
- If a seat is already held or sold, the API returns HTTP `409 Conflict`.
- Payment and order requests use idempotency keys so retries do not create duplicate orders or charges.
- The server verifies payment confirmation with the payment provider.
- Cached seat availability is only for display. The database must verify availability when a user holds or purchases a seat.


## 4. Data Model

TicketHub uses a relational database such as PostgreSQL. The database stores users, events, seats, orders, and the seats included in each order.

### Table 1: Users

| Column | Description |
|---|---|
| `user_id` | Primary key identifying each user |
| `name` | User's name |
| `email` | Unique email address |
| `password_hash` | Securely hashed password |
| `created_at` | Account creation date |

### Table 2: Events

| Column | Description |
|---|---|
| `event_id` | Primary key identifying each event |
| `title` | Event name |
| `venue` | Venue name |
| `event_date` | Date and time of the event |
| `status` | Event status, such as published or cancelled |

### Table 3: Seats

Each row represents one seat for one event.

| Column | Description |
|---|---|
| `seat_id` | Primary key identifying each seat |
| `event_id` | Foreign key referencing Events |
| `seat_label` | Seat number, such as A12 |
| `price` | Ticket price |
| `status` | Available, held, or sold |
| `hold_id` | Identifier for the current hold, if any |
| `hold_expires_at` | Time when the hold expires |

A unique constraint on `(event_id, seat_label)` prevents the same seat from being entered more than once for an event.

### Table 4: Orders

| Column | Description |
|---|---|
| `order_id` | Primary key identifying each order |
| `user_id` | Foreign key referencing Users |
| `status` | Pending, confirmed, failed, or cancelled |
| `total_amount` | Total order price |
| `idempotency_key` | Unique key to prevent duplicate orders on retries |
| `created_at` | Order creation time |

### Table 5: OrderItems

This table connects orders to the seats being purchased.

| Column | Description |
|---|---|
| `order_item_id` | Primary key identifying each order item |
| `order_id` | Foreign key referencing Orders |
| `seat_id` | Foreign key referencing Seats |
| `price_paid` | Price recorded when the ticket is purchased |

Relationships Between Tables

One user can have many orders.

One event can have many seats.

One order can contain many order items.

Each order item refers to one seat.

Each seat belongs to one event.

### Relationship Diagram

The diagram below shows how the five database tables connect through primary keys and foreign keys.

```text
Users (1) -------- (*) Orders
                         |
                         | One order has many items
                         v
                    OrderItems
                         |
                         | Each item references one seat
                         v
                       Seats
                         |
                         | Many seats belong to one event
                         v
                       Events
```

## 5. Preventing Double-Booking

TicketHub must ensure that two users cannot buy the same seat for the same event. It achieves this through database transactions, row locks, unique constraints, and temporary seat holds.

### Step 1: A user requests a seat

When a user selects a seat, the application checks its current status in the database. If the seat is available, the system attempts to create a temporary hold.

### Step 2: Start a database transaction

The application starts a database transaction and locks the requested seat row. This prevents another transaction from changing the same seat at the same time.

Alternatively, the system can use an atomic conditional update that only succeeds if the seat is still available.

### Step 3: Create a temporary hold

If the seat is available, the database records the hold ID, expiry time, and held status. The transaction commits only after the seat has been successfully held.

If another user has already held or purchased the seat, the request fails and the user must select another seat.

### Step 4: Process payment

The user completes payment before the hold expires. TicketHub verifies the payment result with the payment provider and checks that the hold still belongs to the order.

### Step 5: Confirm the order

In a database transaction, TicketHub records the confirmed sale and marks the seat as sold. The order and seat changes are committed together so that they cannot become inconsistent.

If payment fails, the order is marked as failed and the seat can be released safely. If payment succeeds but the seat can no longer be fulfilled, the system must arrange a refund or void the charge.

### Database Protection

TicketHub uses several protections:

- **Transactions:** Related order and seat changes succeed or fail together.
- **Row locks or atomic updates:** Only one competing request can successfully claim a seat.
- **Unique constraints:** The database prevents duplicate seat labels for an event.
- **Temporary holds:** Seats are released when holds expire, allowing other users to purchase them.
- **Idempotency keys:** Repeated requests do not create duplicate orders or charges.
- **Unique confirmed sale:** Enforce a database constraint so each seat can be linked to only one confirmed ticket sale, preventing two orders from selling the same seat.

The database is the final authority on seat ownership. The website must never rely only on a cached seat map or a browser message saying that a seat is available.
## 6. Architecture and Handling the Big Sale

### Architecture Diagram

```text
                  CUSTOMERS
                      |
                      v
              CDN / STATIC CACHE
                      |
                      v
           VIRTUAL WAITING ROOM
                      |
                      v
                LOAD BALANCER
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       APP SERVER  APP SERVER  APP SERVER
          |           |           |
          +-----------+-----------+
                      |
             +--------+--------+
             |                 |
             v                 v
         CACHE LAYER       MESSAGE QUEUE
             |                 |
             v                 v
      PRIMARY DATABASE   BACKGROUND WORKERS
             |
             v
        READ REPLICAS

      APP SERVERS -----> PAYMENT PROVIDER
```

### Explanation of Each Component

1. **Customers:** People browsing events and purchasing tickets through the website.
2. **CDN and static cache:** Delivers images, stylesheets, scripts, and other static content quickly, reducing the load on application servers.
3. **Virtual waiting room:** Controls the number of people entering checkout during a popular sale and applies a transparent queue policy to improve fairness.
4. **Load balancer:** Distributes requests across healthy application servers so that one server does not handle all the traffic.
5. **Application servers:** Handle event browsing, seat holds, orders, authentication, and ticket retrieval. Multiple servers can operate at the same time.
6. **Cache layer:** Stores frequently requested event information to speed up browsing. Cached seat availability is advisory only; the database must verify seats before a hold or purchase.
7. **Primary database:** Stores authoritative seat availability, holds, orders, and confirmed sales. Transactions and constraints protect against double-booking.
8. **Read replicas:** Handle suitable read-heavy requests, such as event browsing, reducing the load on the primary database. Purchase decisions must use authoritative database operations.
9. **Message queue:** Holds background tasks such as sending ticket emails and notifications so they do not delay checkout.
10. **Background workers:** Process queued tasks and retry temporary failures safely.
11. **Payment provider:** Processes payments securely. TicketHub verifies payment results and does not store raw card details.

### How the Architecture Handles a Popular Sale

- Cache event pages and static files before tickets go on sale.
- Open the virtual waiting room before the sale begins.
- Admit users at a controlled rate to protect the database and checkout process.
- Add application servers when traffic increases.
- Use rate limiting to reduce excessive requests and automated abuse.
- Use database transactions and constraints for every seat hold and purchase.
- Send emails and other non-essential work through the message queue.
- Monitor response times, waiting-room length, database load, payment errors, and failed requests.
- If the system becomes overloaded, delay non-essential tasks while preserving correct seat ownership and payment processing.

The system is designed to remain responsive during traffic spikes without sacrificing the correctness of ticket sales.


## 7. Trade-offs

### Trade-off 1: Fairness versus Speed

A virtual waiting room controls traffic and gives users a more orderly buying experience. However, users may have to wait before entering the website's checkout process.

**Decision:** TicketHub will use a transparent queue policy, rate limits, and clear queue information. This protects the system while helping users understand their place in the process.

### Trade-off 2: Strong Consistency versus Read Performance

Using one authoritative database for seat purchases helps prevent double-booking, but the database may become busy during a popular sale. Caches and read replicas improve browsing speed but can show outdated seat availability.

**Decision:** TicketHub will cache event details and use read replicas for suitable browsing requests. All seat holds and purchases will be verified against the authoritative database.

### Trade-off 3: Longer Holds versus Seat Availability

Longer seat holds give users more time to complete payment, but unavailable seats remain blocked for other customers. Shorter holds make seats available sooner but can frustrate users if payment takes longer than expected.

**Decision:** TicketHub will use a clearly communicated temporary hold, such as five minutes, and safely handle expired holds, delayed payment results, and refunds.

### Conclusion

TicketHub combines a virtual waiting room, scalable application servers, caching, background workers, and a relational database to handle normal traffic and popular concert sales. Its most important rule is that the database determines seat ownership. Transactions, temporary holds, and database constraints protect users from double-booking while the waiting room and caching help maintain speed and fairness.









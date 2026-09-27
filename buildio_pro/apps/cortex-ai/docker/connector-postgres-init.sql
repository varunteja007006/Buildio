-- Sample data for testing the connector feature against `connector-postgres`.
-- Runs automatically on a fresh volume via /docker-entrypoint-initdb.d.
-- Applied manually with:
--   docker exec -i cortex_ai_connector_postgres psql -U connector_test -d connector_test < docker/connector-postgres-init.sql

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    city TEXT,
    signed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    status TEXT NOT NULL DEFAULT 'pending',
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

INSERT INTO customers (name, email, city, signed_up_at) VALUES
    ('Ada Lovelace', 'ada@example.com', 'London', '2024-01-15T10:30:00Z'),
    ('Alan Turing', 'alan@example.com', 'London', '2024-02-03T09:00:00Z'),
    ('Grace Hopper', 'grace@example.com', 'New York', '2024-02-20T14:15:00Z'),
    ('Katherine Johnson', 'katherine@example.com', 'Hampton', '2024-03-01T11:45:00Z'),
    ('Edsger Dijkstra', 'edsger@example.com', 'Amsterdam', '2024-03-18T16:20:00Z'),
    ('Barbara Liskov', 'barbara@example.com', 'Boston', '2024-04-05T08:10:00Z'),
    ('Donald Knuth', 'donald@example.com', 'Stanford', '2024-04-22T13:35:00Z'),
    ('Margaret Hamilton', 'margaret@example.com', 'Boston', '2024-05-09T10:05:00Z'),
    ('Linus Torvalds', 'linus@example.com', 'Helsinki', '2024-05-27T12:00:00Z'),
    ('Radia Perlman', 'radia@example.com', 'Seattle', '2024-06-14T15:40:00Z'),
    ('Tim Berners-Lee', 'tim@example.com', 'London', '2024-07-02T09:25:00Z'),
    ('Anita Borg', 'anita@example.com', 'New York', '2024-07-19T17:50:00Z');

INSERT INTO products (name, category, price_cents) VALUES
    ('Mechanical Keyboard', 'electronics', 12999),
    ('Wireless Mouse', 'electronics', 4999),
    ('USB-C Hub', 'electronics', 3499),
    ('Noise-Cancelling Headphones', 'electronics', 24999),
    ('4K Monitor 27"', 'electronics', 39999),
    ('Standing Desk', 'furniture', 59999),
    ('Ergonomic Chair', 'furniture', 44999),
    ('Desk Lamp', 'furniture', 2999),
    ('Monitor Stand', 'furniture', 7999),
    ('Cable Organizer', 'accessories', 999),
    ('Laptop Sleeve 14"', 'accessories', 2499),
    ('Webcam Cover 3-pack', 'accessories', 599),
    ('Notebook A5 Dotted', 'stationery', 1299),
    ('Gel Pen Set', 'stationery', 899),
    ('Whiteboard Marker Pack', 'stationery', 699);

INSERT INTO orders (customer_id, status, total_cents, placed_at)
SELECT
    c.id,
    (ARRAY['pending', 'shipped', 'delivered', 'cancelled'])[1 + floor(random() * 4)::int],
    0,
    NOW() - (random() * interval '180 days')
FROM generate_series(1, 60) AS i
CROSS JOIN LATERAL (
    SELECT id FROM customers ORDER BY random() LIMIT 1
) AS c;

INSERT INTO order_items (order_id, product_id, quantity)
SELECT
    o.id,
    p.id,
    1 + floor(random() * 3)::int
FROM orders o
CROSS JOIN LATERAL (
    SELECT id FROM products ORDER BY random() LIMIT 1 + floor(random() * 2)::int
) AS p;

UPDATE orders o
SET total_cents = sub.amount
FROM (
    SELECT oi.order_id, SUM(p.price_cents * oi.quantity) AS amount
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    GROUP BY oi.order_id
) AS sub
WHERE o.id = sub.order_id;

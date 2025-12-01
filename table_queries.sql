
/* Trips */
CREATE TABLE trips (
    tripid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ownerid uuid NOT NULL
      REFERENCES auth.users (id),
    destination text NOT NULL,
    from_date date NOT NULL,
    to_date date NOT NULL,
    status text NOT NULL
      CHECK (status IN ('Confirmed', 'On trip', 'Planning')),
    description text,
    default_split text NOT NULL
      CHECK (default_split IN ('equal', 'own')),
    auto_add boolean,
    created_at timestamptz NOT NULL DEFAULT now(),
    members numeric NOT NULL,
    trip_header_url text
);

/* User Roles */
CREATE TABLE user_role (
    userroleud uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tripid uuid NOT NULL
      REFERENCES trips (tripid),
    user_id uuid NOT NULL
      REFERENCES auth.users (id),
    role text NOT NULL
      CHECK (role IN ('Guest', 'Participant', 'Owner')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    email_notifications boolean
);

/* Expected Expenses */
CREATE TABLE expected_expenses (
    expense_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id uuid NOT NULL
      REFERENCES trips (tripid),
    owner_id uuid NOT NULL
      REFERENCES auth.users (id),
    name text NOT NULL,
    amount numeric NOT NULL,
    expected_date date,
    default_split boolean,
    expense_status text NOT NULL
      CHECK (expense_status IN ('pending', 'accepted')),
    confirmed boolean,
    confirmed_date date,
    split text NOT NULL
      CHECK (split IN ('shared', 'own')),
    created_at timestamptz NOT NULL DEFAULT now()
);

/* Savings Fund */
CREATE TABLE savings_funds (
    savings_funds_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id uuid NOT NULL
      REFERENCES trips (tripid),
    owner_id uuid NOT NULL
      REFERENCES auth.users (id),
    amount numeric NOT NULL
);

/* Profiles */
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL
      REFERENCES auth.users (id),
    name text NOT NULL,
    email text NOT NULL,
    created_at timestamp default now(),
    email_notifications boolean
);

/* Trip invitations */
create table trip_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id uuid NOT NULL REFERENCES trips(tripid),
    sender_id uuid NOT NULL REFERENCES users(id),
    recipient_email text NOT NULL,
    status text NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at timestamp default now(),
    updated_at timestamp default now()
);

/* Notifications */
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notif_title text NOT NULL,
    notif_desc text NOT NULL,
    read boolean NOT NULL,
    user_id uuid NOT NULL
      REFERENCES auth.users (id),
    created_at timestamp default now()
);

/* Trip Flights */
CREATE TABLE trip_flights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number text NOT NULL,
    flight_date date NOT NULL,
    airport_from text,
    departure_time text,
    airport_to text,
    arrival_time text,
    reservation_code text,
    created_at timestamp default now(),
    trip_id uuid NOT null
      REFERENCES trips (tripid),
    file_url text,
    confirmed boolean
);

/* Trip Hotel */
CREATE TABLE trip_hotel (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id uuid NOT null
      REFERENCES trips (tripid),
    hotel_name text NOT NULL,
    address text,
    date_from date,
    date_to date,
    reservation_website text,
    created_at timestamp default now(),
    file_url text,
    confirmed boolean
);

/* Trip Itinerary */
CREATE TABLE trip_itinerary (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id uuid NOT null
      REFERENCES trips (tripid),
    itinerary_type text NOT NULL,
    itinerary_desc text,
    created_at timestamp default now(),
    file_url text,
    confirmed boolean
);
CREATE TABLE address (
    address_id SERIAL PRIMARY KEY,
    lines VARCHAR,
    city VARCHAR,
    country VARCHAR,
    postcode VARCHAR
);

CREATE TABLE person (
    person_id SERIAL PRIMARY KEY,
    first_name VARCHAR,
    middle_name VARCHAR,
    surname VARCHAR,
    address INTEGER,
    date_of_birth DATE,
    FOREIGN KEY(address) REFERENCES address(address_id)
);

CREATE TABLE verifiedPid (
    pid VARCHAR PRIMARY KEY,
    person INTEGER,
    FOREIGN KEY(person) REFERENCES person(person_id)
);

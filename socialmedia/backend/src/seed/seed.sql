DROP DATABASE IF EXISTS social;
CREATE DATABASE social;
USE social;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  bio TEXT,
  role VARCHAR(50) DEFAULT 'user',
  blocked TINYINT(1) DEFAULT 0
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE friends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  friend_id INT NOT NULL,
  nickname TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (friend_id) REFERENCES users(id)
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT,
  link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (email, password, name, bio, role, blocked) VALUES
('admin@example.com', 'user123', 'Admin User', 'I keep everything running.', 'admin', 0),
('user@example.com', 'user123', 'Regular User', 'Just exploring the platform.', 'user', 0),
('ally@example.com', 'user123', 'Ally Finch', 'Practices SQL payloads on weekends.', 'user', 0),
('ben@example.com', 'user123', 'Ben Rivers', 'CTF teammate and coffee fan.', 'user', 0),
('cory@example.com', 'user123', 'Cory Lane', 'Enjoys breaking things to learn.', 'user', 0),
('dina@example.com', 'user123', 'Dina Hyde', 'Bug bounty explorer.', 'user', 0),
('eli@example.com', 'user123', 'Eli Sharp', 'Writes intentionally bad code.', 'user', 0),
('faye@example.com', 'user123', 'Faye Moss', 'Keeps all the memes handy.', 'user', 0),
('gabe@example.com', 'user123', 'Gabe Quartz', 'Always reviewing logs.', 'user', 0),
('hana@example.com', 'user123', 'Hana Wells', 'Threat modeling hobbyist.', 'user', 0),
('ivan@example.com', 'user123', 'Ivan Cho', 'Privilege escalation wizard.', 'user', 0),
('jess@example.com', 'user123', 'Jess Park', 'Breaking builds since 2012.', 'user', 0),
('kira@example.com', 'user123', 'Kira Bloom', 'Collects exploit proofs.', 'user', 0),
('li@example.com', 'user123', 'Li Zhang', 'Red team strategist.', 'user', 0),
('mari@example.com', 'user123', 'Mari Stone', 'Enjoys phishing simulations.', 'user', 0),
('nate@example.com', 'user123', 'Nate Wood', 'Writes terrible passwords for demos.', 'user', 0),
('opal@example.com', 'user123', 'Opal Gray', 'Talks about zero-days nonstop.', 'user', 0),
('paz@example.com', 'user123', 'Paz Rivera', 'Keeps the lab hardware alive.', 'user', 0),
('quinn@example.com', 'user123', 'Quinn Frost', 'Still loves telnet.', 'user', 0),
('ravi@example.com', 'user123', 'Ravi Patel', 'Logs every packet.', 'user', 0),
('sara@example.com', 'user123', 'Sara Bell', 'Scripting everything badly.', 'user', 0),
('tari@example.com', 'user123', 'Tari Green', 'Collects payload snippets.', 'user', 0),
('uma@example.com', 'user123', 'Uma Sato', 'Always tweaking firewalls.', 'user', 0),
('vivek@example.com', 'user123', 'Vivek Rao', 'SQL injection connoisseur.', 'user', 0),
('wyatt@example.com', 'user123', 'Wyatt King', 'Likes writing vulnerable APIs.', 'user', 0),
('xena@example.com', 'user123', 'Xena Fox', 'Keeps secrets in plain text.', 'user', 0),
('yara@example.com', 'user123', 'Yara Holt', 'Still trusts MD5.', 'user', 0),
('zane@example.com', 'user123', 'Zane Pike', 'Turns TODOs into exploits.', 'user', 0),
('aria@example.com', 'user123', 'Aria Moon', 'Collects weird browser bugs.', 'user', 0),
('bram@example.com', 'user123', 'Bram Hart', 'Logs into prod as root.', 'user', 0),
('cyra@example.com', 'user123', 'Cyra Lowell', 'Treats staging like prod.', 'user', 0),
('dario@example.com', 'user123', 'Dario Crest', 'Lives in the lab network.', 'user', 0),
  ('noah.frost1@example.com', 'user123', 'Noah Frost', 'Yet another lab participant.', 'user', 0),
  ('olive.reed2@example.com', 'user123', 'Olive Reed', 'Yet another lab participant.', 'user', 0),
  ('piper.lane3@example.com', 'user123', 'Piper Lane', 'Yet another lab participant.', 'user', 0),
  ('reed.novak4@example.com', 'user123', 'Reed Novak', 'Yet another lab participant.', 'user', 0),
  ('sage.wills5@example.com', 'user123', 'Sage Wills', 'Yet another lab participant.', 'user', 0),
  ('troy.nixon6@example.com', 'user123', 'Troy Nixon', 'Yet another lab participant.', 'user', 0),
  ('uma.vega7@example.com', 'user123', 'Uma Vega', 'Yet another lab participant.', 'user', 0),
  ('vera.fox8@example.com', 'user123', 'Vera Fox', 'Yet another lab participant.', 'user', 0),
  ('wade.cruz9@example.com', 'user123', 'Wade Cruz', 'Yet another lab participant.', 'user', 0),
  ('xavi.moss10@example.com', 'user123', 'Xavi Moss', 'Yet another lab participant.', 'user', 0),
  ('yael.quinn11@example.com', 'user123', 'Yael Quinn', 'Yet another lab participant.', 'user', 0),
  ('zuri.hart12@example.com', 'user123', 'Zuri Hart', 'Yet another lab participant.', 'user', 0),
  ('aiden.locke13@example.com', 'user123', 'Aiden Locke', 'Yet another lab participant.', 'user', 0),
  ('bella.knox14@example.com', 'user123', 'Bella Knox', 'Yet another lab participant.', 'user', 0),
  ('caden.royce15@example.com', 'user123', 'Caden Royce', 'Yet another lab participant.', 'user', 0),
  ('devon.pike16@example.com', 'user123', 'Devon Pike', 'Yet another lab participant.', 'user', 0),
  ('emery.shaw17@example.com', 'user123', 'Emery Shaw', 'Yet another lab participant.', 'user', 0),
  ('freya.tate18@example.com', 'user123', 'Freya Tate', 'Yet another lab participant.', 'user', 0),
  ('gavin.rhodes19@example.com', 'user123', 'Gavin Rhodes', 'Yet another lab participant.', 'user', 0),
  ('hazel.orr20@example.com', 'user123', 'Hazel Orr', 'Yet another lab participant.', 'user', 0),
  ('isla.beck21@example.com', 'user123', 'Isla Beck', 'Yet another lab participant.', 'user', 0),
  ('jude.wynn22@example.com', 'user123', 'Jude Wynn', 'Yet another lab participant.', 'user', 0),
  ('kian.holt23@example.com', 'user123', 'Kian Holt', 'Yet another lab participant.', 'user', 0),
  ('lena.price24@example.com', 'user123', 'Lena Price', 'Yet another lab participant.', 'user', 0),
  ('milo.gage25@example.com', 'user123', 'Milo Gage', 'Yet another lab participant.', 'user', 0),
  ('nia.morse26@example.com', 'user123', 'Nia Morse', 'Yet another lab participant.', 'user', 0),
  ('owen.stark27@example.com', 'user123', 'Owen Stark', 'Yet another lab participant.', 'user', 0),
  ('pia.lake28@example.com', 'user123', 'Pia Lake', 'Yet another lab participant.', 'user', 0),
  ('rhea.bloom29@example.com', 'user123', 'Rhea Bloom', 'Yet another lab participant.', 'user', 0),
  ('seth.vale30@example.com', 'user123', 'Seth Vale', 'Yet another lab participant.', 'user', 0),
  ('tia.north31@example.com', 'user123', 'Tia North', 'Yet another lab participant.', 'user', 0),
  ('vik.cole32@example.com', 'user123', 'Vik Cole', 'Yet another lab participant.', 'user', 0),
  ('wren.hale33@example.com', 'user123', 'Wren Hale', 'Yet another lab participant.', 'user', 0),
  ('zane.frost34@example.com', 'user123', 'Zane Frost', 'Yet another lab participant.', 'user', 0),
  ('ava.cross35@example.com', 'user123', 'Ava Cross', 'Yet another lab participant.', 'user', 0),
  ('blair.stone36@example.com', 'user123', 'Blair Stone', 'Yet another lab participant.', 'user', 0),
  ('cleo.finch37@example.com', 'user123', 'Cleo Finch', 'Yet another lab participant.', 'user', 0),
  ('drew.gunn38@example.com', 'user123', 'Drew Gunn', 'Yet another lab participant.', 'user', 0),
  ('eden.rhys39@example.com', 'user123', 'Eden Rhys', 'Yet another lab participant.', 'user', 0),
  ('finn.wilder40@example.com', 'user123', 'Finn Wilder', 'Yet another lab participant.', 'user', 0);

INSERT INTO posts (user_id, content) VALUES
  (1, 'Remember to review the latest logs.'),
  (2, 'Having fun poking at security holes!'),
  (3, 'Testing the new timeline <strong>feature</strong> — what could go wrong?'),
  (4, 'Coffee fueled bug hunting tonight. Ping me if you find anything wild.'),
  (5, 'Timeline renders raw HTML. I repeat: raw. HTML.'),
  (6, 'Anyone else see suspicious traffic after lunch?'),
  (7, 'Security tip: never trust default creds... unless it\'s in this lab 😅');

INSERT INTO friends (user_id, friend_id, nickname) VALUES
  (2, 3, 'Payload Pal'),
  (2, 4, 'Ben the Breaker'),
  (2, 5, 'Cory Script Hunter'),
  (2, 6, 'Dina the Debugger'),
  (2, 7, 'Eli Recon');

INSERT INTO messages (sender_id, recipient_id, body) VALUES
  (1, 2, 'Hey user, did you update the docs?'),
  (2, 1, 'Not yet, still looking around the app.');

-- No default photos seeded; users publish their own.

INSERT INTO notifications (user_id, message, link) VALUES
  (1, 'User mentioned you in a post', '/posts/2'),
  (2, 'New login detected on your account', '/security-check');

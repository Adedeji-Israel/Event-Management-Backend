// require("./dnsFix.js");

// const mongoose = require("mongoose");
// const { faker } = require("@faker-js/faker");
// const Event = require("./models/event");
// const Ticket = require("./models/ticket");
// const User = require("./models/user");
// require("dotenv").config();
// const bcrypt = require("bcrypt");

// const MONGO_URI = process.env.MONGO_URL;

// const NUM_NEW_ORGANIZERS = 8;
// const NUM_NEW_USERS = 27;
// const NUM_EVENTS = 35;
// const NUM_TICKETS = 160;

// const seed = async () => {
//   await mongoose.connect(MONGO_URI);
//   console.log("🌱 Connected to DB");

//   /* ================= PASSWORD ================= */
//   const password = "12345678uiopp";
//   const salt = await bcrypt.genSalt(12);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   /* ================= GET EXISTING USERS ================= */
//   const existingOrganizers = await User.find({ role: "organizer" });
//   const existingUsers = await User.find({ role: "user" });

//   console.log(`Existing organizers: ${existingOrganizers.length}`);
//   console.log(`Existing users: ${existingUsers.length}`);

//   /* ================= CREATE NEW ORGANIZERS ================= */
//   const newOrganizers = await Promise.all(
//     Array.from({ length: NUM_NEW_ORGANIZERS }).map(() =>
//       User.create({
//         fullName: faker.person.fullName(),
//         email: faker.internet.email(),
//         password: hashedPassword,
//         role: "organizer",
//         profilePicture: `https://i.pravatar.cc/150?img=${faker.number.int({ min: 1, max: 70 })}`,
//         gender: faker.helpers.arrayElement(["male", "female"]),
//         dateOfBirth: faker.date.birthdate({ min: 20, max: 45, mode: "age" }),
//         userName: faker.internet.username(),
//       })
//     )
//   );

//   console.log(`✅ (${newOrganizers.length}) New organizers created`);

//   /* ================= CREATE NEW USERS ================= */
//   const newUsers = await Promise.all(
//     Array.from({ length: NUM_NEW_USERS }).map(() =>
//       User.create({
//         fullName: faker.person.fullName(),
//         email: faker.internet.email(),
//         password: hashedPassword,
//         role: "user",
//         profilePicture: `https://i.pravatar.cc/150?img=${faker.number.int({ min: 1, max: 70 })}`,
//         gender: faker.helpers.arrayElement(["male", "female"]),
//         dateOfBirth: faker.date.birthdate({ min: 18, max: 60, mode: "age" }),
//         userName: faker.internet.username(),
//       })
//     )
//   );

//   console.log(`✅ (${newUsers.length}) New users created`);

//   /* ================= COMBINE OLD + NEW ================= */
//   const allOrganizers = [...existingOrganizers, ...newOrganizers];
//   const allUsers = [...existingUsers, ...newUsers];

//   /* ================= CREATE EVENTS ================= */
//   const events = [];

//   for (let i = 0; i < NUM_EVENTS; i++) {
//     const organizer = faker.helpers.arrayElement(allOrganizers);

//     const eventDate =
//       Math.random() < 0.4 ? faker.date.past() : faker.date.future();

//     const event = await Event.create({
//       title: faker.company.catchPhrase(),
//       description: faker.lorem.paragraph(),
//       date: eventDate,
//       time: faker.date.soon().toLocaleTimeString(),
//       location: faker.location.city(),
//       image: `https://picsum.photos/seed/event${Date.now()}${i}/600/400`,
//       organizer: organizer._id,
//       totalTicketsSold: 0,
//       totalRevenue: 0,

//       ticketTypes: [
//         {
//           name: "Regular",
//           price: faker.number.int({ min: 3000, max: 10000 }),
//           quantity: faker.number.int({ min: 50, max: 150 }),
//           sold: 0,
//         },
//         {
//           name: "VIP",
//           price: faker.number.int({ min: 15000, max: 40000 }),
//           quantity: faker.number.int({ min: 10, max: 40 }),
//           sold: 0,
//         },
//       ],
//     });

//     events.push(event);
//   }

//   console.log(`✅ (${events.length}) Events created`);

//   /* ================= CREATE TICKETS ================= */
//   let ticketsCreated = 0;

//   while (ticketsCreated < NUM_TICKETS) {
//     const attendee = faker.helpers.arrayElement(allUsers);
//     const event = faker.helpers.arrayElement(events);
//     const ticketType = faker.helpers.arrayElement(event.ticketTypes);

//     if (ticketType.sold >= ticketType.quantity) continue;

//     await Ticket.create({
//       event: event._id,
//       user: attendee._id,
//       email: attendee.email,
//       name: attendee.fullName,
//       paymentReference: faker.string.alphanumeric(12),
//       status: "paid",
//       amount: ticketType.price,
//       ticketType: {
//         name: ticketType.name,
//         price: ticketType.price,
//       },
//     });

//     ticketType.sold += 1;
//     event.totalTicketsSold += 1;
//     event.totalRevenue += ticketType.price;

//     await event.save();

//     ticketsCreated++;
//   }

//   console.log(`🎟️ (${ticketsCreated}) Tickets created`);
//   console.log("🎉 SEEDING COMPLETE");

//   mongoose.disconnect();
// };

// seed();


// Add require('syswide-cas') at the top of your file
// const syswidecas = require('syswide-cas'); //

// The module automatically loads CAs from /etc/ssl/ca-node.pem if it exists.

// Optionally, you can add custom CA files or directories programmatically:
// Add a single file
// syswidecas.addCAs('/my/custom/path/to/cert.pem'); //

// Add a directory (or multiple directories/files in an array)
// syswidecas.addCAs(['/my/custom/path/to/certs/dir1', '/my/other/path/to/certs/dir2']); //

// Your https requests will now use the extended CA list
// const https = require('https');
// https.get('https://my.custom.domain.com/with/self/signed/cert', (res) => {
  // ... handle response
}); //


require("./dnsFix.js");

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Event = require("./models/event");
const Ticket = require("./models/ticket");
const User = require("./models/user");
require("dotenv").config();
const bcrypt = require("bcrypt");

const MONGO_URI = process.env.MONGO_URL;

const NUM_NEW_ORGANIZERS = 5;
const NUM_NEW_USERS = 15;
const NUM_EVENTS = 20;
const NUM_TICKETS = 160;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🌱 Connected to DB");

    /* ================= PASSWORD ================= */
    const password = "12345678uiopp";
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* ================= GET EXISTING USERS ================= */
    const existingOrganizers = await User.find({ role: "organizer" });
    const existingUsers = await User.find({ role: "user" });

    console.log(`Existing organizers: ${existingOrganizers.length}`);
    console.log(`Existing users: ${existingUsers.length}`);

    /* ================= CREATE NEW ORGANIZERS ================= */
    const newOrganizers = await Promise.all(
      Array.from({ length: NUM_NEW_ORGANIZERS }).map(() =>
        User.create({
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPassword,
          role: "organizer",
          profilePicture: `https://i.pravatar.cc/150?img=${faker.number.int({ min: 1, max: 70 })}`,
          gender: faker.helpers.arrayElement(["male", "female"]),
          dateOfBirth: faker.date.birthdate({ min: 20, max: 45, mode: "age" }),
          userName: faker.internet.username(),
        })
      )
    );

    console.log(`✅ (${newOrganizers.length}) New organizers created`);

    /* ================= CREATE NEW USERS ================= */
    const newUsers = await Promise.all(
      Array.from({ length: NUM_NEW_USERS }).map(() =>
        User.create({
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPassword,
          role: "user",
          profilePicture: `https://i.pravatar.cc/150?img=${faker.number.int({ min: 1, max: 70 })}`,
          gender: faker.helpers.arrayElement(["male", "female"]),
          dateOfBirth: faker.date.birthdate({ min: 18, max: 60, mode: "age" }),
          userName: faker.internet.username(),
        })
      )
    );

    console.log(`✅ (${newUsers.length}) New users created`);

    const allOrganizers = [...existingOrganizers, ...newOrganizers];
    const allUsers = [...existingUsers, ...newUsers];

    /* ================= CREATE EVENTS ================= */
    const events = [];

    for (let i = 0; i < NUM_EVENTS; i++) {
      const organizer = faker.helpers.arrayElement(allOrganizers);

      const eventDate =
        Math.random() < 0.4 ? faker.date.past() : faker.date.future();

      const event = await Event.create({
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        date: eventDate,
        time: faker.date.soon().toLocaleTimeString(),
        location: faker.location.city(),
        image: `https://picsum.photos/seed/event${Date.now()}${i}/600/400`,
        organizer: organizer._id,
        totalTicketsSold: 0,
        totalRevenue: 0,
        ticketTypes: [
          {
            name: "Regular",
            price: faker.number.int({ min: 3000, max: 10000 }),
            quantity: faker.number.int({ min: 50, max: 150 }),
            sold: 0,
          },
          {
            name: "VIP",
            price: faker.number.int({ min: 15000, max: 40000 }),
            quantity: faker.number.int({ min: 10, max: 40 }),
            sold: 0,
          },
        ],
      });

      events.push(event);
    }

    console.log(`✅ (${events.length}) Events created`);

    /* ================= DELETE OLD TICKETS ================= */
    console.log("🧹 Deleting all existing tickets...");
    await Ticket.deleteMany({});
    console.log("✅ Old tickets deleted");

    /* ================= CREATE NEW TICKETS (SAFE MODE) ================= */
    const allExistingEvents = await Event.find({});
    const allExistingUsers = await User.find({ role: "user" });

    if (!allExistingEvents.length || !allExistingUsers.length) {
      console.log("❌ No events or users found. Aborting ticket seeding.");
      return mongoose.disconnect();
    }

    let ticketsCreated = 0;

    while (ticketsCreated < NUM_TICKETS) {
      const event = faker.helpers.arrayElement(allExistingEvents);
      const attendee = faker.helpers.arrayElement(allExistingUsers);

      if (!event.ticketTypes || event.ticketTypes.length === 0) continue;

      const selectedType = faker.helpers.arrayElement(event.ticketTypes);

      const quantity = faker.number.int({ min: 1, max: 3 });

      const ticketItems = [
        {
          ticketTypeId: selectedType._id,
          name: selectedType.name,
          price: selectedType.price,
          quantity,
        },
      ];

      const totalAmount = selectedType.price * quantity;

      await Ticket.create({
        event: event._id,
        user: attendee._id,
        email: attendee.email,
        name: attendee.fullName,
        tickets: ticketItems,
        totalQuantity: quantity,
        amount: totalAmount,
        paymentReference: faker.string.alphanumeric(16),
        status: "paid",
      });

      ticketsCreated++;
    }

    console.log(`🎟️ (${ticketsCreated}) Tickets created safely`);
    console.log("🎉 SEEDING COMPLETE");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from DB");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    await mongoose.disconnect();
  }
};

seed();
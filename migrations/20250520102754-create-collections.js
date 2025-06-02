module.exports = {
  async up(db) {
    await db.createCollection("users-timers");
    await db.createCollection("timers");
    await db.createCollection("sessions-users");
  },

  async down(db) {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.includes("users-timers")) {
      await db.collection("users-timers").drop();
    }
    if (collectionNames.includes("timers")) {
      await db.collection("timers").drop();
    }
    if (collectionNames.includes("sessions-users")) {
      await db.collection("sessions-users").drop();
    }
  },
};

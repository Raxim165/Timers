module.exports = {
  async up(db) {
    await db.createCollection("users");
    await db.createCollection("timers");
    await db.createCollection("sessions");
  },

  async down(db) {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.includes("users")) {
      await db.collection("users").drop();
    }
    if (collectionNames.includes("timers")) {
      await db.collection("timers").drop();
    }
    if (collectionNames.includes("sessions")) {
      await db.collection("sessions").drop();
    }
  },
};

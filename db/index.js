const Sequelize = require("sequelize");
const { STRING, UUID, UUIDV4, VIRTUAL, ENUM } = Sequelize;
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_mail_db"
);

const User = conn.define("user", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  firstName: {
    type: STRING(20),
    allowNull: false,
  },
  lastName: {
    type: STRING(20),
    allowNull: false,
  },
  fullName: {
    type: VIRTUAL,
    get: function () {
      return `${this.firstName} ${this.lastName}`;
    },
  },
  userLevel: {
    type: ENUM("POWER", "REGULAR", "RESTRICTED"),
    allowNull: false,
    defaultValue: "REGULAR",
  },
});

User.getPowerUsers = async function () {
  const users = await User.findAll({
    where: {
      userLevel: "POWER",
    },
    include: [
      {model: Message, as: "sent"},
      {model: Message,as: "received"},
    ]
  });

  return users;
};

// User.getPowerUsers = async function () {
//   const users = await User.findAll({
//     where: {
//       userLevel: "POWER",
//     },
//     include: [
//       { model: Message, as: "sent" },
//       { model: Message, as: "received" },
//     ],
//   });
//   return users
// };

const Message = conn.define("message", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  subject: {
    type: STRING(20),
    allowNull: false,
  },
});

Message.belongsTo(User, { as: "from" });
Message.belongsTo(User, { as: "to" });
User.hasMany(Message, { foreignKey: "fromId", as: "sent" });
User.hasMany(Message, { foreignKey: "toId", as: "received" });

const seeder = async () => {
  await conn.sync({ force: true });
  const [moe, larry, lucy, ethyl, hi, bye, hello] = await Promise.all([
    User.create({ firstName: "Moe", lastName: "Green", userLevel: "POWER" }),
    User.create({
      firstName: "Larry",
      lastName: "Lubin",
    }),
    User.create({
      firstName: "Lucy",
      lastName: "Lasser",
      userLevel: "RESTRICTED",
    }),
    User.create({
      firstName: "Ethyl",
      lastName: "Evans",
    }),
    Message.create({ subject: "Hi" }),
    Message.create({ subject: "Bye" }),
    Message.create({ subject: "Hello" }),
  ]);

  hi.fromId = moe.id;
  hi.toId = lucy.id;
  await hi.save();
  bye.fromId = lucy.id;
  bye.toId = moe.id;
  await bye.save();
  hello.fromId = ethyl.id;
  hello.toId = larry.id;
  await hello.save();
};

module.exports = {
  User,
  Message,
  seeder,
};

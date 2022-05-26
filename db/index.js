const Sequelize = require('sequelize')
const {STRING, UUID, UUIDV4, VIRTUAL, ENUM} = Sequelize
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_mail_db')

const User = conn.define('user', {
    id:{
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    firstName: {
        type: STRING(20),
        allowNull: false
    },
    lastName: {
        type: STRING(20),
        allowNull: false
    },
    fullName: {
        type: VIRTUAL,
        get: function(){
            return `${this.firstName} ${this.lastName}`
        }
    },
    userLevel:{
        type: ENUM('POWER', 'REGULAR', 'RESTRICTED'),
        allowNull: false,
        defaultValue: 'REGULAR'
    }
})

const Message = conn.define('message', {
    id:{
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    subject: {
        type: STRING(20),
        allowNull: false
    }
})

const seeder = async () => {
    await conn.sync({force: true})
    const [moe, larry, lucy, ethyl, hi, bye, hello] = await Promise.all([
        User.create({firstName: 'Moe', lastName: 'Green', userLevel: 'POWER'}),
        User.create({firstName: 'Larry', lastName: 'Lubin'}),
        User.create({firstName: 'Lucy', lastName: 'Lasser', userLevel: 'RESTRICTED'}),
        User.create({firstName: 'Ethyl', lastName: 'Evans'}),
        Message.create({subject: 'Hi'}),
        Message.create({subject: 'Bye'}),
        Message.create({subject: 'Hello'}),
    ])
}

module.exports = {
    User,
    Message,
    seeder
}

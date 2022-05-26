const express = require("express");
const app = express();
const { User, Message, seeder } = require("./db");

app.use('/assets', express.static('assets'))

app.get('/', async (req, res, next) => {
    try {
        const [users, messages] = await Promise.all([
            User.findAll(), 
            Message.findAll()
        ])
        res.send(`
            <html>
                <head>
                    <title>Acme Mail</title>
                    <link rel='stylesheet' href='/assets/styles.css'/>
                </head>
                <body>
                    <nav>
                        <a href='/' class='select'>Home</a>
                        <a href='/users'>Users</a>
                        <a href='/messages'>Messages</a>
                    </nav>
                    <p>
                        We have ${users.length} users and we have ${messages.length}!!!
                    </p>
                </body>
            </html>
        `);
    } catch (ex) {
        next(ex)
    }
})

app.get('/users', async (req, res, next) => {
    try {
        const users= await User.findAll();

        res.send(`
            <html>
                <head>
                    <title>Acme Mail</title>
                    <link rel='stylesheet' href='/assets/styles.css'/>
                </head>
                <body>
                    <nav>
                        <a href='/'>Home</a>
                        <a href='/users' class='select'>Users</a>
                        <a href='/messages'>Messages</a>
                    </nav>
                    <ul>
                    ${users.map( user =>   `
                        <li>
                            ${user.fullName} (${user.userLevel})
                        </li>
                    `).join('')}
                    </ul>
                </body>
            </html>
        `);
    } catch (ex) {
        next(ex)
    }
})


app.get('/messages', async (req, res, next) => {
    try {
        const messages= await Message.findAll(
            {
                include: [
                    {
                        model: User,
                        as: 'from'
                    },
                    {
                        model: User,
                        as: 'to'
                    }
                ]
            }
        );
        
        // res.send(messages)

        res.send(`
            <html>
                <head>
                    <title>Acme Mail</title>
                    <link rel='stylesheet' href='/assets/styles.css'/>
                </head>
                <body>
                    <nav>
                        <a href='/'>Home</a>
                        <a href='/users'>Users</a>
                        <a href='/messages' class='select'>Messages</a>
                    </nav>
                    <ul>
                    ${messages.map( message =>   `
                        <li>
                            ${message.subject}: from ${message.from.firstName} to ${message.to.firstName}
                        </li>
                    `).join('')}
                    </ul>
                </body>
            </html>
        `);
    } catch (ex) {
        next(ex)
    }
})

const setupDB = async () => {
  try {
    await seeder();
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  } catch (ex) {
    console.log(ex);
  }
};

setupDB();

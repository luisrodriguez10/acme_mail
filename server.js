const express = require("express");
const app = express();
const { User, Message, seeder } = require("./db");

app.use('/assets', express.static('assets'))
app.use(express.urlencoded({extended: false}))

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
        const users= await User.findAll({
            include: [
                {
                    model: Message,
                    as: 'sent'
                },
                {
                    model: Message,
                    as: 'received'
                }
            ]
        });

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
                    <a href='/users/power'>Filter Power Users</a>
                    <ul>
                    ${users.map( user =>   `
                        <li>
                            ${user.fullName} (${user.userLevel})
                            <div>
                                Sent ${user.sent.length} messages
                                <br/>
                                Received ${user.received.length} messages
                            </div>
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

app.get('/users/power', async (req, res, next) => {
    try {
        // const users= await User.findAll({
        //     include: [
        //         {
        //             model: Message,
        //             as: 'sent'
        //         },
        //         {
        //             model: Message,
        //             as: 'received'
        //         }
        //     ]
            
            
        // });

        const users = await User.getPowerUsers()

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
                    <a href='/users/power'>Filter Power Users</a>
                    <ul>
                    ${users.map( user =>   `
                        <li>
                            ${user.fullName} (${user.userLevel})
                            <div>
                                Sent ${user.sent.length} messages
                                <br/>
                                Received ${user.received.length} messages
                            </div>
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

        const users = await User.findAll()
        
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
                    <form method='POST'>
                        <select name='fromId'>
                        <option>-- From Id</option>
                            ${users.map(user => `
                                <option value='${user.id}'>${user.fullName}</option>
                            `).join('')}
                        </select>
                        <select name='toId'>
                        <option>-- To Id</option>
                            ${users.map(user => `
                                <option value='${user.id}'>${user.fullName}</option>
                            `).join('')}
                        </select>
                        <input type='text' name='subject' placeHolder='Subject'/>
                        <button>Create</button>
                    </from>
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

app.use('/messages', async(req, res, next) => {
    try {
        await Message.create(req.body)
        res.redirect('/messages')
    } catch (ex) {
        next(ex)
    }
})

app.use((err, req, res, next) => {
    res.status(500).send(err.message)
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

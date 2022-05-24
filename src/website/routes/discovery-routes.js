const router = require(`express`).Router();
const SavedGuild = require(`../../database/guilds`);
const SavedUser = require(`../../database/users`);
const client = require("../../bot");

router.get(`/`, async(req, res) => res.render(`discovery/index`, {
    SavedGuild: SavedGuild,
    SavedUser: SavedUser,
    client: client 
}));

router.get(`/guilds/:id`, async (req, res) => {
    try {
        const { id } = req.params;
        if ( !client.guilds.cache.get(id) ) return res.status(400).send(`Guild doesn't exists<br>Or I'm not allowed to access it/not invited to it.`);

        const data = await SavedGuild.findOne({ _id: id }) || SavedGuild.create({ _id: id });
        if ( !data ) return res.status(400).send(`Unexpected error occured!<br>No guild data found!`);

        res.render("discovery/guild", { schema: data, guild: client.guilds.cache.get(id) });
    } catch {
        res.redirect(`/`)
    }
});

router.get(`/users/:id`, async (req, res) => {
    try {
        const { id } = req.params;
        if ( !client.users.cache.get(id) ) return res.status(400).send(`User doesn't exists<br>Or I'm not allowed to accessthis user.`);

        const data = await SavedUser.findOne({ _id: id }) || SavedUser.create({ _id: id });
        if ( !data ) return res.status(400).send(`Unexpected error occured!<br>No user data found!`);

        let customavatar = false;

        let member = client.users.cache.get(id);
        if (!member)
            (await client.users.cache
                .fetch(id)
                .catch(() => {})) || false;
        if (member && member.avatar) {
            customavatar = member.displayAvatarURL({
                dynamic: true,
                size: 4096,
            });
        }

        res.render("discovery/user", { 
            schema: data,
            user: client.users.cache.get(id),
            member: member,
            client
        });
    } catch {
        res.redirect(`/`)
    }
});
module.exports = router;
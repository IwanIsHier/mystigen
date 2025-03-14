require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const typeEmojis = {
    "Electric": "<:Electric:1252436964393746503>", 
    "Fire": "<:Fire:1252436968911147039>",
    "Water": "<:Water:1252436990251765760>",
    "Grass": "<:Grass:1252437061009674251>",
    "Normal": "<:Normal:1252437063350095984>",
    "Flying": "<:Flying:1252437059780476949>",
    "Psychic": "<:Psychic:1252437064251609201>",
    "Bug": "<:Bug:1252436960803426355>",
    "Rock": "<:Rock:1252436986107789402>",
    "Ground": "<:Ground:1252436975428960297>",
    "Ghost": "<:Ghost:1252436972413128784>",
    "Dark": "<:Dark:1252436962087014472>",
    "Steel": "<:Steel:1252437410747383849>",
    "Fairy": "<:Fairy:1252436965677203547>",
    "Dragon": "<:Dragon:1252436963219341322>",
    "Ice": "<:Ice:1252437062171492453>",
    "Fighting": "<:Fighting:1252436968197984286>",
    "Poison": "<:Poison:1252436982810804355>"
};

let fakemonData; 
let spawnedFakemon = null;

// Load the fakemon.json data
fs.readFile('fakemon.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading fakemon.json:', err);
        return;
    }
    try {
        fakemonData = JSON.parse(data);
        console.log('Fakemon data loaded successfully');
    } catch (jsonErr) {
        console.error('Error parsing JSON:', jsonErr);
    }
});

const usersFilePath = './users.json';
let usersData = {};

// Load the users.json data
fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading users.json:', err);
    } else {
        try {
            usersData = JSON.parse(data);
        } catch (jsonErr) {
            console.error('Error parsing users.json:', jsonErr);
        }
    }
});

client.on('ready', () => {
    console.log('Mystigen is ready to serve');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore messages from bots

    console.log('Message received:', message.content);

    // Regular expression to match bot mention and command
    const botMentionRegex = new RegExp(`^<@!?${client.user.id}>\\s+dex`, 'i');
    const shinyCommandRegex = new RegExp(`^<@!?${client.user.id}>\\s+dex\\s+shiny\\s+(.*)`, 'i');
    const normalCommandRegex = new RegExp(`^<@!?${client.user.id}>\\s+dex\\s+(.*)`, 'i');
    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    if (shinyCommandRegex.test(message.content)) {
        console.log('Shiny Dex command recognized');
        const match = message.content.match(shinyCommandRegex);
        const pokemonName = match[1].toLowerCase().trim();

        if (!fakemonData || !fakemonData[pokemonName]) {
            console.log('Could not find Pokémon:', pokemonName);
            return message.channel.send(`Could not find Pokémon: ${pokemonName}`);
        }

        const pokemon = fakemonData[pokemonName];
        let imagePath = path.join(__dirname, pokemon.shiny_image);
        
        // Check if the shiny image exists, if not, use placeholder.png
        if (!fs.existsSync(imagePath)) {
            imagePath = path.join(__dirname, 'images/fakemon/placeholder.png');
        }
        
        const file = new AttachmentBuilder(imagePath);

        const typingWithEmojis = pokemon.typing.map(type => typeEmojis[type] + " " + type).join(` \n`);

        const dexEmbed = new EmbedBuilder()
            .setColor('#FFD700') // Gold color for shiny
            .setTitle(pokemon.shiny_name)
            .setDescription(pokemon.description)
            .setImage(`attachment://${path.basename(imagePath)}`) // Set image using attachment name
            .addFields(
                { name: 'Rarity', value: pokemon.rarity },
                { name: 'Evolution', value: pokemon.evolve_method },
                { name: 'Types', value: typingWithEmojis, inline: true },
                { name: 'Region', value: pokemon.region, inline: true },
                { name: 'Catchable', value: pokemon.catchable, inline: true },
                { name: 'Base Stats', value: `
                    HP: ${pokemon.base_stats.hp}
                    Attack: ${pokemon.base_stats.attack}
                    Defense: ${pokemon.base_stats.defense}
                    Sp. Atk: ${pokemon.base_stats.sp_atk}
                    Sp. Def: ${pokemon.base_stats.sp_def}
                    Speed: ${pokemon.base_stats.speed}
                    Total: ${pokemon.base_stats.total}
                `, inline: true },
                { name: 'Names', value: Object.values(pokemon.names).join(` \n`), inline: true },
                { name: 'Appearance', value: `Height: ${pokemon.appearance.height}, Weight: ${pokemon.appearance.weight}`, inline: true },
                { name: 'Gender Ratio', value: pokemon.gender_ratio, inline: true },
            );

        try {
            await message.channel.send({ embeds: [dexEmbed], files: [file] }); // Send embed with attachment
            console.log('Shiny Embed sent successfully');
        } catch (error) {
            console.error('Failed to send Shiny embed:', error);
        }
    } 
    
    else if (normalCommandRegex.test(message.content)) {
        console.log('Normal Dex command recognized');
        const match = message.content.match(normalCommandRegex);
        const pokemonName = match[1].toLowerCase().trim();

        if (!fakemonData || !fakemonData[pokemonName]) {
            console.log('Could not find Pokémon:', pokemonName);
            return message.channel.send(`Could not find Pokémon: ${pokemonName}`);
        }

        const pokemon = fakemonData[pokemonName];
        let imagePath = path.join(__dirname, pokemon.image);
        
        // Check if the normal image exists, if not, use placeholder.png
        if (!fs.existsSync(imagePath)) {
            imagePath = path.join(__dirname, '/images/fakemon/placeholder.png');
        }

        const file = new AttachmentBuilder(imagePath);

        const typingWithEmojis = pokemon.typing.map(type => typeEmojis[type] + " " + type).join(` \n`);

        const dexEmbed = new EmbedBuilder()
            .setColor('#FFA500') // Orange color for normal
            .setTitle(pokemon.name)
            .setDescription(pokemon.description)
            .setImage(`attachment://${path.basename(imagePath)}`) // Set image using attachment name
            .addFields(
                { name: 'Rarity', value: pokemon.rarity },
                { name: 'Evolution', value: pokemon.evolve_method },
                { name: 'Types', value: typingWithEmojis, inline: true },
                { name: 'Region', value: pokemon.region, inline: true },
                { name: 'Catchable', value: pokemon.catchable, inline: true },
                { name: 'Base Stats', value: `
                    HP: ${pokemon.base_stats.hp}
                    Attack: ${pokemon.base_stats.attack}
                    Defense: ${pokemon.base_stats.defense}
                    Sp. Atk: ${pokemon.base_stats.sp_atk}
                    Sp. Def: ${pokemon.base_stats.sp_def}
                    Speed: ${pokemon.base_stats.speed}
                    Total: ${pokemon.base_stats.total}
                `, inline: true },
                { name: 'Names', value: Object.values(pokemon.names).join(` \n`), inline: true },
                { name: 'Appearance', value: `Height: ${pokemon.appearance.height} \nWeight: ${pokemon.appearance.weight}`, inline: true },
                { name: 'Gender Ratio', value: pokemon.gender_ratio, inline: true },
            );

        try {
            await message.channel.send({ embeds: [dexEmbed], files: [file] }); // Send embed with attachment
            console.log('Normal Embed sent successfully');
        } catch (error) {
            console.error('Failed to send Normal embed:', error);
        }
    }

    //credits
    else if (command === `<@1280609587464114260>` && (args[0] === 'credits' || args[0] === 'credit')) {

        const creditsEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('Bot Credits')
            .setDescription('Special thanks to the amazing contributors who made this bot possible:')
            .addFields(
                { 
                    name: 'Developers', 
                    value: '**Lead Developer**:\n- Sky (<@565805565624975382>)', 
                    inline: false 
                },
                { 
                    name: 'Artists', 
                    value: `**Lead Artist**:\n` +
                    `- Stern (<@175076601753501708>)\n` +
                    `**Pixel Artist**:\n` +
                    `- Finch (<@303356383607259138>)`,
                    inline: false 
                },
                { 
                    name: 'Donators', 
                    value: '- [placeholder]', 
                    inline: false 
                },
                { 
                    name: 'Inspiration', 
                    value: '- Pokétwo (<@716390085896962058>)', 
                    inline: false 
                }
            )
            .setFooter({ text: 'Thank you for using Mystigen!' })
            .setTimestamp(); // Adds a timestamp for professionalism
    
        message.reply({ embeds: [creditsEmbed] });
    }
    
    
    

    // spawning
    else if (command === `<@1280609587464114260>` && (args[0] === 'forceSpawn')) {
        if (!fakemonData) {
            console.log('Fakemon data not loaded.');
            return message.channel.send('Fakemon data is not available.');
        }

        const fakemonNames = Object.keys(fakemonData);
        const randomFakemonName = fakemonNames[Math.floor(Math.random() * fakemonNames.length)];
        const fakemon = fakemonData[randomFakemonName];

        spawnedFakemon = fakemon;

        let imagePath = path.join(__dirname, fakemon.image);

        if (!fs.existsSync(imagePath)) {
            imagePath = path.join(__dirname, 'images/fakemon/placeholder.png');
        }

        const file = new AttachmentBuilder(imagePath);

        const spawnEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('A new wild fakémon has appeared!')
            .setDescription('Guess the fakémon and type `@Mystigen#7770 catch <fakémon>` to catch it!')
            .setImage(`attachment://${path.basename(imagePath)}`);

        try {
            await message.channel.send({ embeds: [spawnEmbed], files: [file] });
            console.log(`Fakemon: ${fakemon.name} spawned`);
        } catch (error) {
            console.error('Failed to send ForceSpawn embed:', error);
        }
    }

    // Catch command
    const mentionCatchRegex = new RegExp(`^<@!?${client.user.id}>\\s+(catch|c)\\s+(.*)`, 'i');
    const match = message.content.match(mentionCatchRegex);

    if (match) {
        if (!spawnedFakemon) {
            return message.reply("No new Fakemon has spawned yet!");
        }

        const enteredName = match[2].trim().toLowerCase();

        // Clean up the Fakemon names by removing any flag emojis and other non-letter characters for proper comparison
        const fakemonNames = Object.values(spawnedFakemon.names).map(name => name.replace(/:.*?:/g, '').toLowerCase().trim());

        // Check if the entered name matches any of the cleaned-up Fakemon names
        if (!fakemonNames.includes(enteredName)) {
            return message.reply("That is the wrong fakémon!!");
        }

        const userId = message.author.id;

        // Initialize user data if it doesn't exist
        if (!usersData[userId]) {
            usersData[userId] = {
                balance: 0,
                badges: [],
                selected: [],
                fakemon: [],
                registered: []
            };
        }

        const user = usersData[userId];
        const fakemonName = spawnedFakemon.name;

        // Calculate the Fakemon ID (incremental per user)
        const newFakemonId = user.fakemon.length + 1;

        // Randomize level between 1 and 80
        const level = Math.floor(Math.random() * 80) + 1;

        // Generate IVs for each stat
        const ivStats = {
            hp: Math.floor(Math.random() * 31) + 1,
            attack: Math.floor(Math.random() * 31) + 1,
            defense: Math.floor(Math.random() * 31) + 1,
            spAtk: Math.floor(Math.random() * 31) + 1,
            spDef: Math.floor(Math.random() * 31) + 1,
            speed: Math.floor(Math.random() * 31) + 1
        };

        // Calculate total IV percentage
        const totalIV = ivStats.hp + ivStats.attack + ivStats.defense + ivStats.spAtk + ivStats.spDef + ivStats.speed;
        const totalIVPercentage = ((100 / 186) * totalIV).toFixed(2); // Total out of 186, rounded to two decimals

        const isRegistered = user.registered.some(name => name.toLowerCase() === fakemonName.toLowerCase());

        if (!isRegistered) {
            user.balance += 35;
            user.registered.push(fakemonName);
            message.reply(`Congratulations! You caught a level ${level} ${fakemonName} (${totalIVPercentage}%)! Added to your Fakédex. You received 35 coins!!`);
        } else {
            message.reply(`Congratulations! You caught a level ${level} ${fakemonName} (${totalIVPercentage}%)!`);
        }

        // Add the caught Fakemon to the user's Fakemon list with all the new data
        user.fakemon.push({
            id: newFakemonId,
            name: fakemonName,
            level: level,
            iv: ivStats,
            totalIVPercentage: totalIVPercentage
        });

        user.selected = [fakemonName]; // Set this Fakemon as the selected one

        // Save updated users data back to the users.json file
        fs.writeFile(usersFilePath, JSON.stringify(usersData, null, 4), (err) => {
            if (err) {
                console.error('Error writing to users.json:', err);
            }
        });

        spawnedFakemon = null;
    }


});

client.login(process.env.DISCORD_BOT_ID);

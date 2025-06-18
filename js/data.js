// Character data structure
var characters = []

// get the character data from the server
fetch("http://localhost:8080/characters")
    .then(response => response.json())
    .then(data => { 
        characters = data
        console.log(data)
     })
    .catch(error => console.log('Error: ', error))


// const characters = [
//     {
//         id: 'thorin',
//         name: 'Thorin Ironbeard',
//         level: 5,
//         race: 'Mountain Dwarf',
//         class: 'Fighter',
//         background: 'Folk Hero',
//         stats: {
//             hp: { current: 45, max: 52 },
//             ac: 18,
//             str: 16
//         },
//         abilityScores: {
//             str: { value: 16, modifier: '+3' },
//             dex: { value: 12, modifier: '+1' },
//             con: { value: 15, modifier: '+2' },
//             int: { value: 10, modifier: '+0' },
//             wis: { value: 13, modifier: '+1' },
//             cha: { value: 14, modifier: '+2' }
//         },
//         skills: [
//             { name: 'Athletics', modifier: '+6' },
//             { name: 'Intimidation', modifier: '+5' },
//             { name: 'Perception', modifier: '+4' },
//             { name: 'Survival', modifier: '+4' },
//             { name: 'History', modifier: '+3' }
//         ],
//         combatStats: {
//             hp: 52,
//             ac: 18,
//             speed: 30
//         },
//         equipment: [
//             { name: 'Warhammer +1', details: '1d8+4 bludgeoning' },
//             { name: 'Chain Mail', details: 'AC 16, Stealth disadvantage' },
//             { name: 'Shield', details: '+2 AC' }
//         ],
//         background: 'A gruff but honorable dwarf warrior from the Ironpeak Mountains. Lost his clan\'s ancestral hammer to orc raiders and has sworn to retrieve it. Known for his unwavering loyalty and fierce determination in battle.'
//     },
//     {
//         id: 'lyralei',
//         name: 'Lyralei Moonwhisper',
//         level: 3,
//         race: 'Wood Elf',
//         class: 'Ranger',
//         background: 'Outlander',
//         stats: {
//             hp: { current: 28, max: 28 },
//             ac: 15,
//             dex: 17
//         }
//     },
//     {
//         id: 'zara',
//         name: 'Zara Nightblade',
//         level: 7,
//         race: 'Half-Elf',
//         class: 'Rogue',
//         background: 'Criminal',
//         stats: {
//             hp: { current: 51, max: 51 },
//             ac: 16,
//             dex: 18
//         }
//     },
//     {
//         id: 'marcus',
//         name: 'Brother Marcus',
//         level: 4,
//         race: 'Human',
//         class: 'Cleric',
//         background: 'Acolyte',
//         stats: {
//             hp: { current: 32, max: 32 },
//             ac: 17,
//             wis: 16
//         }
//     }
// ]; 
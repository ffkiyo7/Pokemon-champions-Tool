#!/usr/bin/env node

async function loadCalc() {
  try {
    return await import('@smogon/calc');
  } catch (error) {
    console.error('Missing @smogon/calc. Run: npm install --no-save @smogon/calc@0.11.0');
    console.error(`Import error: ${error.message}`);
    process.exitCode = 1;
    return null;
  }
}

const calc = await loadCalc();

if (calc) {
  const {calculate, Field, Move, Pokemon} = calc;
  const gen = 9;

  const attacker = new Pokemon(gen, 'Garchomp', {
    level: 50,
    ability: 'Rough Skin',
    item: 'Life Orb',
    nature: 'Jolly',
    evs: {hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252},
    boosts: {hp: 0, atk: 1, def: 0, spa: 0, spd: 0, spe: 0},
  });

  const defender = new Pokemon(gen, 'Pikachu', {
    level: 50,
    ability: 'Static',
    item: 'Light Ball',
    nature: 'Timid',
    evs: {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252},
  });

  const single = calculate(gen, attacker, defender, new Move(gen, 'Earthquake'), new Field());
  const doubles = calculate(
    gen,
    attacker,
    defender,
    new Move(gen, 'Earthquake'),
    new Field({gameType: 'Doubles'})
  );

  const weather = calculate(
    gen,
    new Pokemon(gen, 'Charizard', {level: 50, ability: 'Blaze', nature: 'Modest'}),
    new Pokemon(gen, 'Amoonguss', {level: 50, ability: 'Regenerator'}),
    new Move(gen, 'Weather Ball'),
    new Field({weather: 'Sun'})
  );

  const terrain = calculate(
    gen,
    new Pokemon(gen, 'Rillaboom', {level: 50, ability: 'Grassy Surge'}),
    new Pokemon(gen, 'Tyranitar', {level: 50}),
    new Move(gen, 'Grassy Glide'),
    new Field({terrain: 'Grassy'})
  );

  const megaForm = Pokemon.getForme(gen, 'Kangaskhan', 'Kangaskhanite');

  const hasPublishedChampions = Boolean(calc.calculateChampions);

  console.log(JSON.stringify(
    {
      packageProbe: '@smogon/calc',
      directUse: {
        singlesDamage: single.damage,
        doublesSpreadDamage: doubles.damage,
        weatherDamage: weather.damage,
        terrainDamage: terrain.damage,
        megaForm,
      },
      adapterRequired: [
        'Project data IDs to calc names',
        'Champions Stat Points to IV/EV/Nature mapping',
        'Mega legality and one-Mega-per-battle rule',
        'Result text and data-version traceability',
      ],
      blocked: {
        publishedChampionsMechanics: hasPublishedChampions,
        note: hasPublishedChampions
          ? 'Unexpected: calculateChampions is exported by installed package.'
          : 'Expected for npm 0.11.0: no published Champions-specific calculate API.',
      },
    },
    null,
    2
  ));
}


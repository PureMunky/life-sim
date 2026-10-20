/*
 * The story graph. Data only — the engine decides what it means.
 *
 * Every life starts at "wake": 6:47 a.m., the morning after graduation.
 * Paths branch (city / home / abroad) and converge on shared moments
 * (Sam's wedding, Dad's phone call, the bridge in the rain) that land
 * differently depending on who you've become.
 *
 * Memories unlock when something happens to you, and carry into the next
 * life as déjà vu — new choices you couldn't have known to make before.
 */
(function (root, factory) {
  const story = factory();
  if (typeof module === 'object' && module.exports) module.exports = story;
  else root.LifeStory = story;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const memories = {
    jordan_name: {
      title: 'A name',
      text: 'Jordan. You knew it before they told you.',
    },
    dad_heart: {
      title: 'The 2:13 a.m. call',
      text: 'Dad’s heart. It was never indigestion.',
    },
    sam_call: {
      title: 'The weekend that never came',
      text: 'When Sam calls with that voice, you go. That night.',
    },
    the_sea: {
      title: 'Cold water',
      text: 'Clip in before the wave. Always before.',
    },
    the_bridge: {
      title: 'Flowers on the guardrail',
      text: 'The bridge in the rain. Take the long way.',
    },
    the_body: {
      title: 'A Tuesday diagnosis',
      text: 'Your body keeps score. Listen sooner.',
    },
  };

  const nodes = {
    // ─────────────────────────────── THE MORNING (22) ───────────────────────────────
    wake: {
      chapter: 'The Morning',
      age: 22,
      text: [
        { if: { minLife: 2 }, text: 'You know this light before you open your eyes.' },
        '6:47 a.m. Sun comes through the blinds in thin gold bars. Somewhere down the street a dog is barking at nothing. Yesterday you graduated; today you are twenty-two and nothing has been decided yet.',
        'Your phone buzzes on the nightstand. A missed call from Dad. An unread email: “Offer Letter — Hartwell & Lane.” A text from Sam: “blue kettle at 9?? BIG news”',
        { if: { minLife: 3 }, text: 'The dog. The gold bars. The buzz. You have woken here before — you’re almost sure of it — and every time the morning is exactly the same. Only you are different.' },
      ],
      choices: [
        { text: 'Call Dad back', next: 'call_dad' },
        { text: 'Open the email', next: 'email' },
        { text: 'Pull the blanket over your head', next: 'sleep_in' },
        { text: 'Lace up your shoes and run to the river', next: 'run' },
      ],
    },

    call_dad: {
      age: 22,
      text: [
        'He picks up on the first ring, like he was holding the phone. “There’s the graduate.” He sounds proud, and tired. Behind him you can hear the bell over the door of the store.',
        'He asks if you’ll come by this week. Then, almost as an afterthought: “Don’t tell your aunt, but I’ve had this pressure in my chest. Indigestion. Too much coffee.”',
        { if: { memories: ['dad_heart'] }, text: 'Your hand goes cold around the phone. You know exactly what this is. You know the hour it ends: 2:13 a.m.' },
      ],
      choices: [
        {
          if: { memories: ['dad_heart'] },
          text: '“Dad. Listen to me. See a cardiologist. Today. Promise me.”',
          set: ['dad_checked'],
          stats: { love: 2 },
          log: 'Made Dad see a heart doctor. He grumbled the whole way.',
          next: 'cafe',
        },
        {
          text: 'Promise you’ll come by the store this week',
          set: ['promised_dad'],
          stats: { love: 1 },
          next: 'cafe',
        },
        {
          text: 'Tell him you’re slammed — you’ll call him later',
          stats: { love: -1 },
          next: 'cafe',
        },
      ],
    },

    email: {
      age: 22,
      text: [
        'Junior Analyst, Hartwell & Lane. The city. A salary with more digits than anything you’ve ever been paid, and a start date three weeks from Monday. They’d like an answer by Friday.',
        'You read it three times. It doesn’t get less real.',
      ],
      choices: [
        {
          text: 'Reply before you can talk yourself out of it: “I’m thrilled to accept.”',
          set: ['accepted_offer'],
          stats: { wealth: 1 },
          next: 'cafe',
        },
        { text: 'Star it. Close the laptop. Go meet Sam.', next: 'cafe' },
      ],
    },

    sleep_in: {
      age: 22,
      text: [
        'You dream of water — dark, moving, patient. When you surface it’s 10:40 and the light has gone white and ordinary.',
        'Sam has texted three more times. “??” “hello” “ok guess not lol”',
      ],
      choices: [
        { text: 'Throw on yesterday’s clothes and run to the Blue Kettle', set: ['late'], stats: { health: 1 }, next: 'cafe' },
      ],
    },

    run: {
      age: 22,
      text: [
        'The river path is wrapped in mist. Your lungs burn in the good way. You cross the old Millbrook bridge, footsteps ringing on the grating.',
        'Halfway across you notice a dent in the guardrail, and a bundle of grocery-store flowers zip-tied to it, already browning. Someone didn’t make it home here once.',
        { if: { memories: ['the_bridge'] }, text: 'You stop. You put your palm on the cold dent. You know the sound tires make on this grating in the rain. You know.' },
        { if: { memories: ['the_body'] }, text: 'Your heart is pounding, strong and stupid and young. You make yourself a promise to keep it that way.' },
      ],
      enter: [{ stats: { health: 1 }, set: ['saw_flowers'] }],
      choices: [
        {
          if: { memories: ['the_body'] },
          text: 'Promise yourself: this, every week, for the rest of your life',
          set: ['runner'],
          stats: { health: 2 },
          log: 'Started running. Never really stopped.',
          next: 'cafe',
        },
        { text: 'Jog to the Blue Kettle, sweaty and alive', next: 'cafe' },
      ],
    },

    cafe: {
      age: 22,
      text: [
        { if: { notFlags: ['late'] }, text: 'The Blue Kettle smells like burnt sugar and wet umbrellas. Sam is already in the back booth, bouncing one knee, grinning like they’re about to explode.' },
        { if: { flags: ['late'] }, text: 'The Blue Kettle is half-empty. Sam’s booth is empty except for a napkin with your name on it: “OPENING A RECORD SHOP. HERE. IN MILLBROOK. CALL ME. —S”' },
        'At the table by the window, someone with a sketchbook full of bridges knocks over a full mug. Coffee races toward the drawings.',
        { if: { memories: ['jordan_name'] }, text: 'You know that sketchbook. You know the face that’s about to look up at you.' },
      ],
      choices: [
        {
          if: { memories: ['jordan_name'] },
          text: '“Jordan?” The name leaves your mouth before you can stop it.',
          set: ['jordan_spark'],
          next: 'meet_jordan',
        },
        { text: 'Grab a fistful of napkins and save the drawings', next: 'meet_jordan' },
        { if: { notFlags: ['late'] }, text: 'Slide into the booth across from Sam', next: 'sam_talk' },
        { if: { flags: ['late'] }, text: 'Pocket Sam’s note and walk down to the river', next: 'crossroads' },
      ],
    },

    meet_jordan: {
      age: 22,
      unlock: ['jordan_name'],
      text: [
        { if: { notFlags: ['jordan_spark'] }, text: 'You save all but one. The stranger laughs — a big, surprised laugh — and introduces themself: Jordan. Architecture grad, in Millbrook for exactly one day, catching the 4:10 bus to the city to start at a firm that designs bridges.' },
        { if: { flags: ['jordan_spark'] }, text: 'They stare at you. “Have we… met?” “Not yet,” you say, and it is the truest thing you’ve ever said. Jordan is catching the 4:10 bus to the city. They’re going to design bridges. You already know they’re going to be good at it.' },
        'They tear out the coffee-stained drawing — the Millbrook bridge, from below — and hand it to you.',
      ],
      choices: [
        {
          text: 'Ask for their number',
          set: ['met_jordan', 'jordan_number'],
          stats: { love: 1 },
          log: 'Met Jordan at the Blue Kettle. Kept the stained drawing.',
          next: [{ if: { notFlags: ['late'] }, to: 'sam_talk' }, { to: 'crossroads' }],
        },
        {
          text: 'Wish them luck with the bridges and let them go',
          set: ['met_jordan'],
          next: [{ if: { notFlags: ['late'] }, to: 'sam_talk' }, { to: 'crossroads' }],
        },
      ],
    },

    sam_talk: {
      age: 22,
      text: [
        'Sam’s news comes out in one breath: their grandmother left them a little money, the old shoe-repair storefront on Main is for rent, and they are going to open a record shop. “Second Spin. Get it? I want you in on it. Partners.”',
        'You have known Sam since the third grade. They have never once looked this scared or this happy.',
      ],
      choices: [
        { text: '“I’m in. Probably. Maybe. Let me think.”', set: ['sam_hope'], stats: { love: 1 }, next: 'crossroads' },
        { text: 'Tell Sam about the offer in the city', stats: { purpose: 1 }, next: 'crossroads' },
      ],
    },

    crossroads: {
      age: 22,
      text: [
        'By evening the rain arrives, soft and steady. You sit on the porch steps with your knees pulled up and three futures in your lap.',
        { if: { flags: ['accepted_offer'] }, text: 'Technically you already said yes to the city. Your thumb did, anyway.' },
        { if: { flags: ['jordan_number'] }, text: 'Jordan’s number glows in your phone. A city area code.' },
        { if: { flags: ['promised_dad'] }, text: 'You promised Dad you’d come by the store.' },
        { if: { flags: ['dad_checked'] }, text: 'Dad texts: “Appointment Thursday. Happy now?” You are, actually.' },
        { if: { flags: ['sam_hope'] }, text: 'Sam has already sent you four photos of the empty storefront.' },
      ],
      choices: [
        {
          text: 'Take the job in the city',
          set: ['path_city'],
          stats: { wealth: 2 },
          log: 'Moved to the city for the job at Hartwell & Lane.',
          next: 'city_arrive',
        },
        {
          text: 'Stay in Millbrook. Work the store. Help Sam.',
          set: ['path_home'],
          stats: { love: 1 },
          log: 'Stayed in Millbrook.',
          next: 'home_store',
        },
        {
          text: 'Sell everything you own and buy a one-way ticket',
          set: ['path_travel'],
          stats: { purpose: 1, wealth: -1 },
          log: 'Bought a one-way ticket across the ocean.',
          next: 'travel_start',
        },
      ],
    },

    // ─────────────────────────────── YOUR TWENTIES ───────────────────────────────
    city_arrive: {
      chapter: 'Your Twenties',
      age: 24,
      text: [
        'Your apartment is the size of a parking space and costs more than Dad’s mortgage. The radiator clanks all night. You love it anyway.',
        'At Hartwell & Lane, the ones who get noticed are the ones whose lights are on at midnight.',
      ],
      choices: [
        {
          text: 'Grind. Become indispensable.',
          set: ['grinder'],
          stats: { wealth: 2, health: -1 },
          log: 'Worked eighty-hour weeks and got noticed.',
          next: 'city_offer',
        },
        {
          text: 'Guard your evenings. Take a night class in drawing.',
          set: ['artist'],
          stats: { purpose: 1, health: 1 },
          log: 'Took a drawing class on Tuesday nights.',
          next: 'city_offer',
        },
        { if: { flags: ['jordan_number'] }, text: 'Call Jordan. You’re in the same city now.', next: 'city_jordan' },
      ],
    },

    city_jordan: {
      age: 25,
      text: [
        'Jordan shows you the city from its rooftops and undersides — the steel ribs of bridges, the places where engineers hid little jokes in the rivets. You show them the coffee-stained drawing. They’re embarrassed you kept it.',
        'Somewhere around the third July, you realize you’ve stopped imagining a life that doesn’t have them in it.',
      ],
      choices: [
        {
          text: 'Say it first',
          set: ['jordan_together'],
          stats: { love: 2 },
          log: 'Fell in love with Jordan on a rooftop in July.',
          next: 'city_offer',
        },
      ],
    },

    city_offer: {
      age: 27,
      text: [
        'Marisol, the sharpest person on your floor, corners you by the elevators. She’s leaving to start a company. Logistics software — boring, brilliant, risky. “I need someone who doesn’t blink. Cofounder. Equity, no salary for a year.”',
        'The same week, your boss offers you a promotion and a window.',
      ],
      choices: [
        {
          text: 'Jump with Marisol',
          set: ['startup'],
          stats: { wealth: -1, purpose: 2 },
          log: 'Cofounded a company with Marisol.',
          next: 'wedding',
        },
        {
          text: 'Take the promotion and the window',
          set: ['promoted'],
          stats: { wealth: 2 },
          log: 'Took the promotion. Got the window.',
          next: 'wedding',
        },
      ],
    },

    home_store: {
      chapter: 'Your Twenties',
      age: 24,
      text: [
        'The store smells like sawdust and WD-40 and the coffee Dad burns every morning at 7. He pretends he doesn’t need help. He absolutely needs help.',
        { if: { flags: ['promised_dad'] }, text: 'He doesn’t say anything about your promise. He just hands you an apron with your name already stitched on it.' },
      ],
      choices: [
        {
          text: 'Learn the trade from the ground up',
          set: ['store_heir'],
          stats: { love: 1, purpose: 1 },
          log: 'Learned the store from Dad, bolt by bolt.',
          next: 'home_sam',
        },
        {
          text: 'Do the minimum. Save every dollar. Plan your exit.',
          stats: { wealth: 1, purpose: -1 },
          next: 'home_sam',
        },
      ],
    },

    home_sam: {
      age: 26,
      text: [
        'Second Spin is three doors down from the store. Sam painted the sign themself and spelled “vinyl” wrong and refused to fix it. Business is… a vibe.',
        'Sam is behind on rent. They haven’t asked you for anything. They won’t.',
      ],
      choices: [
        {
          text: 'Put your savings into Second Spin',
          set: ['sam_partner'],
          stats: { wealth: -2, love: 2, purpose: 1 },
          log: 'Became Sam’s partner at Second Spin.',
          next: 'wedding',
        },
        {
          text: 'Work the counter every Saturday for free',
          stats: { love: 1 },
          next: 'wedding',
        },
        {
          text: 'You’re too tired. You skip the anniversary party.',
          set: ['sam_drift'],
          stats: { love: -2 },
          log: 'Started missing Sam’s things.',
          next: 'wedding',
        },
      ],
    },

    travel_start: {
      chapter: 'Your Twenties',
      age: 23,
      text: [
        'A coastal city where yellow trams climb impossible hills. You don’t speak the language. You order the wrong thing every day for a week and it’s always delicious.',
      ],
      choices: [
        {
          text: 'Work the desk at a hostel and stay as long as it lasts',
          set: ['hostel'],
          stats: { purpose: 1, love: 1 },
          next: 'travel_mid',
        },
        {
          text: 'Keep moving. A new country every month.',
          stats: { health: 1, wealth: -1 },
          log: 'Saw nineteen countries before twenty-five.',
          next: 'travel_mid',
        },
      ],
    },

    travel_mid: {
      age: 26,
      text: [
        'The money runs out the way money does: slowly, then all at once. You have two offers and a plane ticket you could still exchange.',
        'A weathered skipper needs crew to sail a 40-foot sloop across open water. A language school needs an English teacher, two-year contract.',
      ],
      choices: [
        { text: 'Sign on to the crossing', set: ['sailor'], next: 'travel_storm' },
        {
          text: 'Teach. Settle. Learn the language properly.',
          set: ['expat'],
          stats: { purpose: 1, love: 1 },
          log: 'Made a home abroad. Dreamed in a second language.',
          next: 'wedding',
        },
        {
          text: 'Go home, broke and full',
          set: ['came_home'],
          stats: { love: 1, wealth: -1 },
          log: 'Came home broke, with a backpack full of stories.',
          next: 'wedding',
        },
      ],
    },

    travel_storm: {
      age: 26,
      text: [
        'Day eleven. The barometer drops like a stone. By midnight the sea is a black mountain range that moves. The jib fouls and starts tearing itself apart.',
        { if: { memories: ['the_sea'] }, text: 'You have been in this water before. You remember how cold. You remember the wave that comes next.' },
      ],
      choices: [
        {
          if: { memories: ['the_sea'] },
          text: 'Clip in before the wave. Then go forward.',
          next: 'storm_hero',
        },
        { text: 'Clip your harness to the jackline and hold on', stats: { health: -1 }, next: 'storm_survive' },
        {
          text: 'Scramble forward to free the jib — no time to clip in',
          next: [{ if: { min: { health: 7 } }, to: 'storm_hero' }, { to: 'death_sea' }],
        },
      ],
    },

    storm_survive: {
      age: 26,
      text: [
        'You hold on for nine hours. When the sun comes up the boat is ragged and the skipper is crying and laughing and you are alive.',
        'You make landfall on an island where the bread is still warm at 5 a.m. You decide that was enough adventure for one life.',
      ],
      choices: [{ text: 'Fly home for Sam’s wedding', set: ['came_home'], log: 'Survived a storm at sea.', next: 'wedding' }],
    },

    storm_hero: {
      age: 26,
      text: [
        'You get the jib down. You don’t remember how. The skipper tells the story in every port for the rest of his life, and it gets bigger every time.',
      ],
      choices: [
        {
          text: 'Fly home for Sam’s wedding, salt still in your hair',
          set: ['hero'],
          stats: { purpose: 2 },
          log: 'Saved the boat in a storm at sea.',
          next: 'wedding',
        },
      ],
    },

    death_sea: {
      age: 26,
      unlock: ['the_sea'],
      ending: { cause: 'Lost at sea in a storm, unclipped, reaching for a sail.' },
      text: [
        'The wave comes over the bow like a wall falling. There is no line to catch you.',
        'The water is so cold it feels like fire, and then it doesn’t feel like anything. The last thing you think of, strangely, is gold light through the blinds.',
      ],
    },

    // ─────────────────────────────── CONVERGENCE: THE WEDDING (29) ───────────────────────────────
    wedding: {
      age: 29,
      text: [
        'Sam marries Alex in the Millbrook VFW hall under a ceiling of paper lanterns. Sam cries through the whole thing. So does Alex. So does the DJ.',
        { if: { flags: ['sam_drift'] }, text: 'You almost didn’t get an invitation. When Sam sees you, something complicated crosses their face, and then they hug you anyway.' },
        { if: { flags: ['expat'] }, text: 'You flew fourteen hours to be here. Your English comes out with an accent now. Sam thinks it’s hilarious.' },
        { if: { flags: ['jordan_together'] }, text: 'Jordan’s hand is in yours. Sam keeps mouthing “I LIKE THEM” at you across the room.' },
        { if: { flags: ['met_jordan'], notFlags: ['jordan_together'] }, text: 'Across the room: the sketchbook. Jordan, from the Blue Kettle. Alex’s cousin, of all the impossible things. They recognize you instantly.' },
        { if: { notFlags: ['met_jordan'] }, text: 'There’s someone at the bar sketching the wedding arch on a cocktail napkin. It’s a very good arch.' },
      ],
      choices: [
        { if: { notFlags: ['sam_drift'] }, text: 'Give the toast you’ve been rewriting for a month', stats: { love: 1 }, log: 'Gave the toast at Sam’s wedding. Everyone cried.', next: 'thirties' },
        { if: { flags: ['sam_drift'] }, text: 'Pull Sam aside. Apologize. Mean it.', unset: ['sam_drift'], stats: { love: 2 }, log: 'Apologized to Sam at their wedding.', next: 'thirties' },
        { if: { flags: ['met_jordan'], notFlags: ['jordan_together'] }, text: 'Ask Jordan to dance', next: 'wedding_dance' },
        { if: { notFlags: ['met_jordan'] }, text: 'Go see what the stranger at the bar is drawing', next: 'wedding_dance' },
        { text: 'Slip out early. There’s work in the morning.', stats: { wealth: 1, love: -1 }, next: 'thirties' },
      ],
    },

    wedding_dance: {
      age: 29,
      unlock: ['jordan_name'],
      text: [
        { if: { notFlags: ['met_jordan'] }, text: 'Their name is Jordan. They design bridges. They’re Alex’s cousin. They are terrible at dancing and do it anyway, which you find unreasonably attractive.' },
        { if: { flags: ['met_jordan'] }, text: '“You kept the drawing, didn’t you,” Jordan says, before you’ve even said hello. You did.' },
        'The DJ plays something slow. Neither of you moves to leave the floor.',
      ],
      choices: [
        {
          text: 'Stay until they stack the chairs',
          set: ['met_jordan', 'jordan_together'],
          stats: { love: 2 },
          log: 'Danced with Jordan at Sam’s wedding until they stacked the chairs.',
          next: 'thirties',
        },
      ],
    },

    // ─────────────────────────────── YOUR THIRTIES ───────────────────────────────
    thirties: {
      chapter: 'Your Thirties',
      exhaustive: true,
      age: 32,
      enter: [
        { if: { flags: ['startup', 'grinder'] }, set: ['startup_rich'], stats: { wealth: 5 }, log: 'Marisol’s company sold. You are, suddenly, rich.' },
        { if: { flags: ['startup'], notFlags: ['grinder'] }, set: ['startup_failed'], stats: { wealth: -2, purpose: 1 }, log: 'The company folded. You learned more than you lost.' },
      ],
      text: [
        { if: { flags: ['startup_rich'] }, text: 'Marisol’s company sells to a firm whose name you’ve seen on trucks your whole life. Your share has a comma in a place commas have never been. You buy Dad a new truck. He keeps driving the old one.' },
        { if: { flags: ['startup_failed'] }, text: 'Marisol’s company runs out of runway on a Tuesday. You both cry in a parking garage, then go get dumplings. You’d do it again. You’re pretty sure.' },
        { if: { flags: ['promoted'] }, text: 'You have a window, a title, and a standing 7 a.m. meeting you dread. It’s a good life. You tell yourself that often.' },
        { if: { flags: ['path_home'] }, text: 'Millbrook gets smaller every year, or you get bigger. Dad lets you do the ordering now. That’s practically a coronation.' },
        { if: { flags: ['path_travel'] }, text: 'The world was big. You’ve seen enough of it to know where you want to stand.' },
        { if: { flags: ['jordan_together'] }, text: 'Jordan is asleep on the couch with a pencil still in their hand. Every so often you catch yourself just watching them breathe.' },
        { if: { notFlags: ['jordan_together'] }, text: 'Your apartment is quiet in the evenings. You’re not sure yet if it’s peaceful or lonely.' },
      ],
      choices: [
        {
          if: { flags: ['jordan_together'] },
          text: 'Propose to Jordan on the Millbrook bridge at dusk',
          set: ['married'],
          stats: { love: 2 },
          log: 'Married Jordan. They designed the cake. It was structurally sound.',
          next: 'thirties_child',
        },
        {
          if: { flags: ['jordan_together'] },
          text: 'Tell Jordan you’re not built for forever',
          unset: ['jordan_together'],
          set: ['left_jordan'],
          stats: { love: -3, purpose: 1 },
          log: 'Let Jordan go.',
          next: 'thirties_child',
        },
        {
          if: { notFlags: ['jordan_together'] },
          text: 'Pour yourself into work. Love can wait.',
          stats: { wealth: 1, purpose: 1, love: -1 },
          next: 'thirties_child',
        },
        {
          if: { notFlags: ['jordan_together'] },
          text: 'Adopt a ridiculous dog. Name it Biscuit.',
          set: ['dog'],
          stats: { love: 1, health: 1 },
          log: 'Adopted Biscuit, the worst and best dog.',
          next: 'thirties_child',
        },
      ],
    },

    thirties_child: {
      age: 33,
      text: [
        'Everyone you know is having babies. Your phone is a slideshow of tiny fists and bad sleep.',
      ],
      choices: [
        {
          if: { flags: ['married'] },
          text: 'Start a family with Jordan',
          set: ['child'],
          stats: { love: 2, wealth: -1, health: -1 },
          log: 'Became a parent. Rosie arrived at 3:12 a.m., furious.',
          next: 'dad_call',
        },
        {
          if: { notFlags: ['married'] },
          text: 'Become a foster parent — just you',
          set: ['child'],
          stats: { love: 2, wealth: -1, purpose: 1 },
          log: 'Took in a foster kid named Rosie. Two years later, just her parent.',
          next: 'dad_call',
        },
        { text: 'Not now. Maybe not ever. And that’s okay.', stats: { wealth: 1 }, next: 'dad_call' },
      ],
    },

    // ─────────────────────────────── CONVERGENCE: DAD (34) ───────────────────────────────
    dad_call: {
      age: 34,
      exhaustive: true,
      text: [
        { if: { notFlags: ['dad_checked'] }, text: 'The phone rings at 2:13 a.m. It’s a nurse from County General. She says your name like a question, and then she says “your father,” and then you stop being able to hear very well.' },
        { if: { flags: ['dad_checked'] }, text: 'The phone rings at 2:13 p.m. It’s Dad, calling to complain that the cardiologist has him eating kale. “Twelve years with this stent and she still won’t let me have bacon.”' },
      ],
      choices: [
        {
          if: { flags: ['dad_checked'] },
          text: 'Let him talk about kale for forty-five minutes',
          set: ['dad_alive'],
          stats: { love: 1 },
          log: 'Dad complained about kale for forty-five minutes. Best call of the year.',
          next: 'sam_call',
        },
        { if: { notFlags: ['dad_checked'], flags: ['path_home'] }, text: 'Run. The store is six blocks away.', next: 'dad_saved' },
        { if: { notFlags: ['dad_checked', 'path_home'] }, text: 'Drive. Four hours through the dark.', next: 'dad_lost' },
      ],
    },

    dad_saved: {
      age: 34,
      text: [
        'You were six blocks away. That turns out to be everything. The paramedics say whoever did the compressions did them right. You did them. You don’t remember learning how.',
        'Two days later, gray and furious about the hospital pudding, Dad grips your hand. “Proud of you,” he says. “Don’t make it weird.”',
      ],
      choices: [
        {
          text: 'Make it a little weird',
          set: ['dad_alive'],
          stats: { love: 2, health: -1 },
          log: 'Did CPR on Dad on the store floor. He lived.',
          next: 'sam_call',
        },
      ],
    },

    dad_lost: {
      age: 34,
      unlock: ['dad_heart'],
      text: [
        'You get there at 6:40. The light is coming through the hospital blinds in thin gold bars. He died at 4:51.',
        'In your pocket, your phone still has a voicemail from last week you never listened to. You listen now. “Hey, kiddo. Nothing important. Just wanted to hear your voice.”',
        'There is a word for what happens to your chest. There isn’t, really. There isn’t a word.',
      ],
      choices: [
        {
          text: 'Keep the store open. Learn it, finally.',
          set: ['store_heir', 'lost_dad'],
          stats: { purpose: 2, wealth: -1, love: -1 },
          log: 'Lost Dad. Kept the store open.',
          next: 'sam_call',
        },
        {
          text: 'Sell the store. You can’t walk in there.',
          set: ['lost_dad'],
          stats: { wealth: 2, love: -2 },
          log: 'Lost Dad. Sold the store.',
          next: 'sam_call',
        },
      ],
    },

    // ─────────────────────────────── CONVERGENCE: SAM (37) ───────────────────────────────
    sam_call: {
      age: 37,
      text: [
        'Sam calls on a Thursday night. Their voice is wrong — too flat, too careful.',
        'Second Spin is closing. Alex moved out in March; Sam didn’t tell anyone. “I’m fine,” Sam says. “I just. I don’t know. I just wanted to call someone.”',
        { if: { memories: ['sam_call'] }, text: 'You know this voice. Last time you said “this weekend,” and the weekend never came.' },
      ],
      choices: [
        {
          if: { memories: ['sam_call'] },
          text: '“I’m already in the car,” you say, before Sam finishes the sentence',
          set: ['sam_saved'],
          stats: { love: 3, purpose: 1 },
          log: 'Drove to Sam before they finished asking.',
          next: 'forties',
        },
        {
          text: 'Get in the car. Now.',
          set: ['sam_saved'],
          stats: { love: 2, health: -1 },
          log: 'Drove all night to sit on Sam’s kitchen floor.',
          next: 'forties',
        },
        { text: '“Oh man. Can we talk this weekend?”', next: 'sam_gone' },
      ],
    },

    sam_gone: {
      age: 37,
      unlock: ['sam_call'],
      text: [
        'The weekend fills up, the way weekends do. Then the next one. By the time you call, Sam’s number is disconnected and Second Spin’s windows are papered over.',
        'You hear, years later, that Sam moved out west and is doing okay. Okay. You hold onto that word like a railing.',
      ],
      choices: [
        { text: 'Keep the last voicemail', set: ['sam_lost'], stats: { love: -2 }, log: 'Lost touch with Sam.', next: 'forties' },
      ],
    },

    // ─────────────────────────────── YOUR FORTIES ───────────────────────────────
    forties: {
      chapter: 'Your Forties',
      age: 44,
      text: [
        'Forty-four. Your knees have opinions now. Your reading glasses live on top of your head where you can never find them.',
        { if: { flags: ['child'] }, text: 'Rosie is eleven. She asks you questions you don’t know the answers to, and she can tell when you’re faking.' },
        { if: { flags: ['married'] }, text: 'Jordan’s firm won the bid for the new Millbrook bridge. They’ve hung the old coffee-stained drawing above their desk.' },
        { if: { flags: ['startup_rich'] }, text: 'Money turns out to solve exactly the problems that money solves, and none of the others.' },
        { if: { flags: ['sam_saved'] }, text: 'Sam rebuilt Second Spin. The new sign still says “vinal.”' },
        { if: { memories: ['the_body'] }, text: 'Somewhere under your ribs, a quiet voice you’ve learned to trust says: now. Start now.' },
      ],
      choices: [
        {
          if: { memories: ['the_body'] },
          text: 'Listen to your body this time. Doctor, sleep, vegetables, the whole boring miracle.',
          set: ['listened'],
          stats: { health: 4 },
          log: 'Took your health seriously before it was too late.',
          next: 'bridge_night',
        },
        {
          text: 'Start running again. Badly, then less badly.',
          set: ['runner'],
          stats: { health: 2 },
          log: 'Ran a half-marathon at forty-six.',
          next: 'bridge_night',
        },
        {
          text: 'One glass to unwind becomes three',
          set: ['drinker'],
          stats: { health: -3, love: -1 },
          next: 'bridge_night',
        },
        {
          text: 'Throw yourself into work. Make it count.',
          stats: { wealth: 2, health: -1, love: -1 },
          next: 'bridge_night',
        },
        {
          text: 'Go back to school for the thing you actually love',
          set: ['student'],
          stats: { purpose: 2, wealth: -1 },
          log: 'Went back to school at forty-five.',
          next: 'bridge_night',
        },
      ],
    },

    // ─────────────────────────────── CONVERGENCE: THE BRIDGE (51) ───────────────────────────────
    bridge_night: {
      chapter: 'Your Fifties',
      age: 51,
      text: [
        'A late dinner across the river runs long. Driving home, the rain comes down so hard the wipers can’t keep up. Ahead: the old Millbrook bridge, slick and black.',
        { if: { flags: ['drinker'] }, text: 'You had three glasses of wine. Maybe four. You feel fine. You always feel fine.' },
        { if: { memories: ['the_bridge'] }, text: 'Your hands go tight on the wheel. The sound of the tires changes as you near the grating, and every hair on your arms stands up.' },
      ],
      choices: [
        {
          if: { memories: ['the_bridge'] },
          text: 'Take the long way around. You don’t know why. You just do.',
          set: ['long_way'],
          stats: { purpose: 1 },
          next: 'bridge_wait',
        },
        {
          text: 'Push through. You’re almost home.',
          next: [{ if: { anyFlags: ['drinker'] }, to: 'death_bridge' }, { if: { max: { health: 2 } }, to: 'death_bridge' }, { to: 'bridge_home' }],
        },
        { text: 'Pull over and wait out the storm', next: 'bridge_wait' },
        { if: { flags: ['married'] }, text: 'Call Jordan to come get you', stats: { love: 1 }, next: 'bridge_wait' },
      ],
    },

    bridge_home: {
      age: 51,
      text: [
        'You make it across. Your heart is pounding for no reason you can name. You sit in the driveway with the engine off for a long time, listening to the rain on the roof.',
      ],
      choices: [{ text: 'Go inside', next: 'fifties' }],
    },

    bridge_wait: {
      age: 51,
      text: [
        'You sit in the dark with the hazards ticking. On the radio: a truck has jackknifed on the Millbrook bridge. No one was on it at the time, thank God. No one at all.',
        'You don’t know why you’re crying. You let yourself anyway.',
      ],
      choices: [{ text: 'Drive home when the rain lets up', stats: { purpose: 1 }, log: 'Didn’t cross the bridge one rainy night. Never knew why.', next: 'fifties' }],
    },

    death_bridge: {
      age: 51,
      unlock: ['the_bridge'],
      ending: { cause: 'Killed on the Millbrook bridge, driving home in the rain.' },
      text: [
        'The headlights come around the bend too fast and too wide. There is a sound like the whole world folding. Then there is quiet.',
        { if: { flags: ['saw_flowers'] }, text: 'In the last stretched second you see the guardrail coming, and the dent in it, and you understand — too late, and all at once — whose flowers those were.' },
        { if: { flags: ['married'] }, text: 'Jordan will tie grocery-store flowers to the rail. They will brown in the sun.' },
      ],
    },

    // ─────────────────────────────── YOUR FIFTIES ───────────────────────────────
    fifties: {
      age: 56,
      text: [
        'Fifty-six. Time has started doing the thing everyone warned you about — years go by like telephone poles from a train.',
        { if: { flags: ['dad_alive'] }, text: 'Dad is eighty-four and still opens the store three mornings a week, “to keep the kids honest.” The kids are you.' },
        { if: { flags: ['lost_dad'] }, text: 'You’re now older than Dad got to be, almost. You think about that more than you’d admit.' },
      ],
      choices: [
        {
          if: { flags: ['child'] },
          text: 'Teach Rosie to drive (not over the bridge)',
          stats: { love: 2 },
          log: 'Taught Rosie to drive. Survived it.',
          next: 'sixties',
        },
        {
          if: { min: { wealth: 7 } },
          text: 'Retire early. Finally sleep in.',
          set: ['retired'],
          stats: { health: 1, purpose: -1 },
          log: 'Retired early.',
          next: 'sixties',
        },
        {
          text: 'Mentor someone who reminds you of yourself at twenty-two',
          set: ['mentor'],
          stats: { purpose: 2 },
          log: 'Mentored a kid named Theo who reminded you of you.',
          next: 'sixties',
        },
        {
          text: 'Write the book you always talked about',
          set: ['author'],
          stats: { purpose: 2, wealth: -1 },
          log: 'Wrote a book. Eleven people read it. It changed one of them.',
          next: 'sixties',
        },
      ],
    },

    // ─────────────────────────────── YOUR SIXTIES ───────────────────────────────
    sixties: {
      chapter: 'Your Sixties',
      age: 66,
      text: [
        'Sixty-six. The doctor’s office knows you by name now.',
        { if: { max: { health: 2 } }, text: 'There’s a heaviness you’ve been ignoring for a year. A tiredness that sleep doesn’t touch.' },
        { if: { flags: ['sam_saved'] }, text: 'Sam calls every Tuesday. Neither of you has missed one in decades.' },
        { if: { flags: ['sam_lost'] }, text: 'Sometimes a song comes on and you reach for your phone to text Sam. You never do.' },
      ],
      choices: [
        {
          if: { notFlags: ['path_home'] },
          text: 'Move back to Millbrook',
          stats: { love: 1 },
          log: 'Moved back to Millbrook.',
          next: [{ if: { max: { health: 1 } }, to: 'death_illness' }, { to: 'twilight' }],
        },
        {
          if: { flags: ['married'] },
          text: 'Take Jordan to see every bridge they ever sketched',
          stats: { love: 2 },
          log: 'Saw every bridge Jordan ever drew.',
          next: [{ if: { max: { health: 1 } }, to: 'death_illness' }, { to: 'twilight' }],
        },
        {
          if: { flags: ['dad_alive'] },
          text: 'Sit with Dad on the porch every Sunday, until there are no more Sundays',
          stats: { love: 2 },
          log: 'Sat with Dad every Sunday until the last one. He went in his sleep at ninety-four.',
          next: [{ if: { max: { health: 1 } }, to: 'death_illness' }, { to: 'twilight' }],
        },
        {
          text: 'Plant a garden. Learn the names of birds.',
          stats: { health: 1, purpose: 1 },
          next: [{ if: { max: { health: 1 } }, to: 'death_illness' }, { to: 'twilight' }],
        },
      ],
    },

    death_illness: {
      age: 67,
      unlock: ['the_body'],
      ending: { cause: 'An illness caught too late, at sixty-seven.' },
      text: [
        'The diagnosis comes on a Tuesday. By the time anyone says the word out loud, it has already been there a long, long while, patient as water.',
        'You have time to say most of the things. Not all of them. Nobody gets all of them.',
      ],
    },

    // ─────────────────────────────── THE LAST MORNING ───────────────────────────────
    twilight: {
      chapter: 'The Last Morning',
      age: 80,
      text: [
        'You wake early. Sun through the blinds in thin gold bars. Somewhere down the street, a dog is barking at nothing.',
        { if: { flags: ['married'] }, text: 'Jordan is asleep beside you, one hand still reaching across the sheets for yours.' },
        { if: { flags: ['child'] }, text: 'Rosie’s kids left a drawing on the fridge: you, enormous, holding the sun.' },
        { if: { flags: ['sam_saved'] }, text: 'There’s a voicemail from Sam: “See you Tuesday, old timer.”' },
        { if: { flags: ['dog'] }, text: 'Biscuit’s great-grand-dog snores at the foot of the bed.' },
        { if: { notFlags: ['married', 'child'], max: { love: 4 } }, text: 'The house is very quiet.' },
        'Your body is light and slow. You know, the way you knew some things before they happened, that this is the last morning.',
      ],
      choices: [
        {
          if: { memories: ['dad_heart', 'sam_call', 'jordan_name'], flags: ['dad_alive', 'sam_saved', 'married'] },
          text: 'Let this be the last morning. You don’t need another.',
          set: ['peace'],
          next: 'ending_peace',
        },
        { text: 'Close your eyes. It was enough.', next: 'death_natural' },
        { text: 'Ask for one more morning', set: ['wanted_more'], next: 'death_natural' },
      ],
    },

    death_natural: {
      ending: { age: 'natural', cause: 'Died in your sleep, of a long life.' },
      text: [
        { if: { flags: ['wanted_more'] }, text: 'You ask. Something, somewhere, hears you.' },
        'The gold bars of light slide slowly across the blanket. You close your eyes, and the dog stops barking, and everything is very still.',
      ],
    },

    ending_peace: {
      ending: { age: 'natural', cause: 'Died at peace, in the morning light, with nothing left undone that mattered.' },
      text: [
        'You think of all the mornings. All the lives. The cold water and the bridge and the hospital at 6:40. All the times you got it wrong, and how each one taught you a name, a voice, an hour.',
        'This time Dad got his bacon-free decades. This time you were in the car before Sam finished the sentence. This time you kept the drawing and the person who drew it.',
        'The light slides off the blanket. For the first time, you don’t feel it pulling you back to 6:47.',
        'You’re free.',
      ],
    },
  };

  // First match wins. The last entry must be unconditional.
  const archetypes = [
    {
      id: 'peace',
      if: { flags: ['peace'] },
      title: 'The One Who Woke Up',
      epitaph: 'Lived it right once. Once was enough.',
    },
    {
      id: 'too_soon',
      if: { maxAge: 39 },
      title: 'Gone Too Soon',
      epitaph: 'All that morning, and so little day.',
    },
    {
      id: 'interrupted',
      if: { maxAge: 59 },
      title: 'The Unfinished',
      epitaph: 'Halfway across, and the view was beautiful.',
    },
    {
      id: 'ghost',
      if: { max: { love: 4 } },
      title: 'A Ghost in Your Own Life',
      epitaph: 'Present for everything. There for very little.',
    },
    {
      id: 'wanderer',
      if: { flags: ['path_travel'], anyFlags: ['expat', 'hero'] },
      title: 'The Wanderer',
      epitaph: 'Home was never a place. It was a direction.',
    },
    {
      id: 'keeper',
      if: { flags: ['store_heir'], min: { purpose: 9 } },
      title: 'Keeper of the Store',
      epitaph: 'Knew the price of every bolt and the value of every neighbor.',
    },
    {
      id: 'beloved',
      if: { min: { love: 10 } },
      title: 'The Beloved',
      epitaph: 'Never once the smartest person in the room. Always the most missed.',
    },
    {
      id: 'builder',
      if: { min: { wealth: 10 } },
      title: 'The Builder',
      epitaph: 'Built a fortune. Hopefully built something else, too.',
    },
    {
      id: 'maker',
      if: { min: { purpose: 10 } },
      title: 'The Maker',
      epitaph: 'Left the world with more in it than they found.',
    },
    {
      id: 'ordinary',
      title: 'An Ordinary Miracle',
      epitaph: 'Nothing special. Everything that mattered.',
    },
  ];

  function naturalAge(s) {
    const f = (x) => s.flags.indexOf(x) !== -1;
    let age = 70 + s.stats.health * 2;
    if (s.stats.love >= 7) age += 3;
    if (f('runner') || f('listened')) age += 2;
    if (f('drinker')) age -= 4;
    return Math.max(71, Math.min(99, age));
  }

  return {
    title: 'The Same Morning',
    start: 'wake',
    startStats: { health: 5, wealth: 5, love: 5, purpose: 5 },
    nodes,
    memories,
    archetypes,
    naturalAge,
  };
});

function getRandomInt(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}
const ACTION = {
  MineBar: "MINE_BAR",
  MineFoo: "MINE_FOO",
  AssembleFooBar: "ASSEMBLE_FOO_BAR",
};

const MAX_ROBOTS = 20;
const MOVE_DELAY = 5000 / 10;
const MINING_FOO_DELAY = 1000 / 10;
const MINING_BAR_DELAY = 1000 / 10;
const ASSEMBLING_FOOBAR_DELAY = 2000 / 10;
let nbRobots = 2;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const move = () => delay(MOVE_DELAY);
const miningBar = () => delay(getRandomInt(0.5, 2) * MINING_BAR_DELAY);
const miningFoo = () => delay(MINING_FOO_DELAY);
const assemblingFoobar = () => delay(ASSEMBLING_FOOBAR_DELAY);

const emojies = new Map([
  ["foo", `💎`],
  ["bar", `🪨`],
  ["fooBar", `🪨💎`],
]);

const emojify = (storeItem) =>
  Object.entries(storeItem).reduce(
    (acc, [key, value]) => ({ ...acc, [emojies.get(key)]: value }),
    {}
  );

const isSuccess = () => {
  return +(Math.random() * 100).toFixed(0) <= 66;
};

class FoobarRobot {
  constructor(id) {
    this.id = id;
    this.lastAction = null;
  }

  getId() {
    return this.id;
  }

  async mineFoo() {
    console.log(`🤖-${this.id} 👟 👟 👟`);
    await move();
    console.log(`🤖-${this.id} ⛏️  💎`);
    return miningFoo().then(() => {
      this.lastAction = ACTION.MineFoo;
      return this;
    });
  }

  async mineBar() {
    console.log(`🤖-${this.id} 👟 👟 👟`);
    await move();
    console.log(`🤖-${this.id} ⛏️  🪨`);
    return miningBar().then(() => {
      this.lastAction = ACTION.MineBar;
      return this;
    });
  }

  async assembleFooBar() {
    console.log(`🤖-${this.id} 👟 👟 👟`);
    await move();
    console.log(`🤖-${this.id} 🛠️  🪨💎`);
    return new Promise(async (resolve, reject) => {
      this.lastAction = ACTION.AssembleFooBar;
      await assemblingFoobar().then(() => {
        if (isSuccess()) {
          resolve(this);
        } else {
          reject(this);
        }
      });
    });
  }
}

const FoobarRobotFactory = {
  makeFoobarRobot: function (id) {
    return new FoobarRobot(id);
  },
};

const Store = {
  foo: 0,
  bar: 0,
  fooBar: 0,
  getItems() {
    return {
      foo: this.foo,
      bar: this.bar,
      fooBar: this.fooBar,
    };
  },
  storeFoo() {
    this.foo++;
  },
  storeBar() {
    this.bar++;
  },
  storeFooBar() {
    if (this.foo >= 1 && this.bar >= 1) {
      this.fooBar++;
      this.removeBar();
      this.removeFoo();
    }
  },
  removeFoo(many = 1) {
    if (this.foo > 0) {
      this.foo = this.foo - many;
    }
  },
  removeBar(many = 1) {
    if (this.bar > 0) {
      this.bar = this.bar - many;
    }
  },
  removeFooBar(many = 1) {
    if (this.fooBar > 0) {
      this.fooBar = this.fooBar - many;
    }
  },
};

const start = (robot) => {
  return new Promise(async (resolve, reject) => {
    while (Store.foo < 6 || Store.fooBar < 3) {
      if (nbRobots === MAX_ROBOTS) {
        reject();
        break;
      }
      console.log(JSON.stringify(emojify(Store.getItems()), null, 2));
      if (Store.fooBar < 3) {
        if (Store.foo >= 1 && Store.bar >= 1) {
          try {
            await robot.assembleFooBar();
            Store.storeFooBar();
          } catch (error) {
            console.log("💥 😢");
            Store.removeFoo();
          }
        } else {
          if (Store.bar === 0) {
            await robot.mineBar();
            Store.storeBar();
          }
          if (Store.foo === 0) {
            await robot.mineFoo();
            Store.storeFoo();
          }
        }
      } else {
        await robot.mineFoo();
        Store.storeFoo();
      }
    }
    Store.removeFooBar(3);
    Store.removeFoo(6);
    resolve(robot);
  });
};

const init = (robots) => {
  for (const robot of robots) {
    start(robot)
      .then(() => {
        nbRobots++;
        console.log(`✨  🤖 - ${nbRobots}  ✨`);
        if (nbRobots === MAX_ROBOTS) {
          return;
        }
        init([robot, FoobarRobotFactory.makeFoobarRobot(nbRobots)]);
      })
      .catch(() => {
        if (nbRobots === MAX_ROBOTS) {
          console.log(`Done ! ${nbRobots} has been built`);
          console.log(`✨ ${new Array(nbRobots).fill(` 🤖`).join(" ")} ✨`);
        }
      });
  }
};

init([
  FoobarRobotFactory.makeFoobarRobot(1),
  FoobarRobotFactory.makeFoobarRobot(2),
]);
